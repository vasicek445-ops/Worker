import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { callOpenAI } from '@/lib/openai'

// POST /api/inbound-reply
// Webhook od Postmark Inbound (nebo SendGrid). HR posila reply na
// apply+USER_ID+APP_ID@apply.gowoker.com → Postmark to parsuje → POST k nam.
//
// Postmark Inbound JSON shape:
// {
//   "FromName": "Anna Keller",
//   "From": "anna.keller@migros.ch",
//   "To": "apply+user-uuid+123@apply.gowoker.com",
//   "OriginalRecipient": "apply+user-uuid+123@apply.gowoker.com",
//   "Subject": "Re: Bewerbung als Lagermitarbeiter",
//   "TextBody": "Sehr geehrter Herr Kočka, vielen Dank...",
//   "HtmlBody": "<p>Sehr geehrter...</p>",
//   "MessageID": "<...>",
//   "Headers": [{"Name":"Date","Value":"Sat, 24 May 2026..."}, ...]
// }

interface PostmarkInboundPayload {
  FromName?: string
  From: string
  To: string
  OriginalRecipient?: string
  Subject?: string
  TextBody?: string
  HtmlBody?: string
  MessageID?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Headers?: Array<{ Name: string; Value: string }>
}

// Auth: Postmark posila Basic Auth header s username+password z setupu.
// Alternativne pouzivame X-Postmark-Secret header (vlastni).
function validateWebhookAuth(req: NextRequest): boolean {
  const expectedSecret = process.env.POSTMARK_INBOUND_SECRET
  if (!expectedSecret) {
    console.warn('[inbound-reply] POSTMARK_INBOUND_SECRET neni nastaven, autorizace skipnuta')
    return true // dev mode — vse pust
  }
  const provided = req.headers.get('x-postmark-secret') || req.headers.get('authorization')
  return provided === expectedSecret || provided === `Bearer ${expectedSecret}`
}

// Parse "apply+USER_UUID+APP_ID@apply.gowoker.com" → { userId, applicationId }
function parseReplyAddress(addr: string): { userId: string; applicationId: number } | null {
  const match = addr.match(/apply\+([a-f0-9-]+)\+(\d+)@/i)
  if (!match) return null
  return { userId: match[1], applicationId: Number(match[2]) }
}

// AI klasifikace odpovedi
type ReplyClass = 'interview' | 'rejection' | 'question' | 'auto_reply' | 'positive' | 'neutral'

async function classifyReply(subject: string, body: string): Promise<{ classification: ReplyClass; confidence: number }> {
  const trimmed = body.slice(0, 1500)
  const prompt = `Klasifikuj email odpoved od HR/recruitera na pracovni prihlasku.

KATEGORIE:
- interview: pozvani na pohovor (Vorstellungsgesprach, Termin vereinbaren)
- rejection: zamitnuti (leider, bedauern, anderer Kandidat)
- question: HR ma dotazy (weitere Informationen, Unterlagen)
- auto_reply: automaticka odpoved (out of office, abwesend)
- positive: kladna reakce ale bez konkretniho kroku (interessant, melde mich)
- neutral: nelze klasifikovat / general

SUBJECT: "${subject}"
BODY: """
${trimmed}
"""

Vrat POUZE jednoslovny JSON:
{"classification": "interview", "confidence": 0.85}
`

  try {
    const aiText = await callOpenAI(prompt, {
      model: 'gpt-4o-mini',
      maxTokens: 80,
      timeoutMs: 15_000,
      temperature: 0.1,
    })
    const cleaned = aiText.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(cleaned)
    const allowed: ReplyClass[] = ['interview', 'rejection', 'question', 'auto_reply', 'positive', 'neutral']
    const cls = allowed.includes(parsed.classification) ? parsed.classification : 'neutral'
    const conf = typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5
    return { classification: cls, confidence: conf }
  } catch {
    return { classification: 'neutral', confidence: 0.0 }
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!validateWebhookAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = (await req.json()) as PostmarkInboundPayload

    // Najit application z Reply-To aliasu
    const target = payload.OriginalRecipient || payload.To
    const parsed = parseReplyAddress(target)
    if (!parsed) {
      console.warn('[inbound-reply] Nelze parsovat reply address:', target)
      // Vratime 200 aby Postmark neretryl. Spadlo to mimo nas system.
      return NextResponse.json({ ok: true, skipped: 'invalid_address' })
    }

    // Over ze application + user opravdu existuji
    const { data: app } = await supabaseAdmin
      .from('sent_applications')
      .select('id, member_id, to_email, sent_at, reply_count')
      .eq('id', parsed.applicationId)
      .eq('member_id', parsed.userId)
      .maybeSingle()

    if (!app) {
      console.warn('[inbound-reply] Application nenalezena:', parsed)
      return NextResponse.json({ ok: true, skipped: 'app_not_found' })
    }

    const bodyText = payload.TextBody || payload.HtmlBody?.replace(/<[^>]+>/g, ' ') || ''
    const subject = payload.Subject || ''

    // AI klasifikace (best effort — pokud spadne, fallback na neutral)
    const { classification, confidence } = await classifyReply(subject, bodyText)

    // Ulozit reply
    const { error: insertErr } = await supabaseAdmin
      .from('application_replies')
      .insert({
        application_id: app.id,
        member_id: app.member_id,
        from_email: payload.From,
        from_name: payload.FromName || null,
        subject,
        body_text: bodyText,
        body_html: payload.HtmlBody || null,
        raw_headers: payload.Headers || [],
        classification,
        classification_confidence: confidence,
        received_at: new Date().toISOString(),
      })

    if (insertErr) {
      console.error('[inbound-reply] Insert error:', insertErr)
      // Pokud tabulka neexistuje (migrace nebyla spustena), nemame kam ulozit.
      // Vratime 200 aby Postmark neretryl, ale logujeme.
    }

    // Update aggregaty na sent_applications
    const isFirst = (app.reply_count || 0) === 0
    await supabaseAdmin
      .from('sent_applications')
      .update({
        reply_received_at: isFirst ? new Date().toISOString() : undefined,
        reply_count: (app.reply_count || 0) + 1,
        reply_classification: isFirst ? classification : undefined,
        last_reply_preview: bodyText.slice(0, 300),
      })
      .eq('id', app.id)

    // TODO: Forward na user's Gmail (Resend nebo Postmark transactional)
    // TODO: In-app notifikace (Supabase realtime nebo push)

    return NextResponse.json({
      ok: true,
      application_id: app.id,
      classification,
      confidence,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal error'
    console.error('[inbound-reply] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// GET pro health check (Postmark testuje endpoint pri setupu)
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/inbound-reply',
    expects: 'POST with Postmark Inbound JSON payload',
  })
}
