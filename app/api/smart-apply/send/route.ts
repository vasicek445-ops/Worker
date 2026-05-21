import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendGmailMessage } from '@/lib/gmail'
import { resolveCvPdfPath, resolveLetterPdfPath } from '@/lib/cv-pdf'
import { buildMotivationPdf } from '@/lib/motivation-pdf'

// POST /api/smart-apply/send
// Body: { jobId: string, to: string, subject: string, body: string }
// Sends draft jako email pres user-uv Gmail. Loguje do sent_applications (pokud
// tabulka existuje — jinak silently skip).

interface SendRequest {
  jobId?: string
  agencyId?: number
  to: string
  subject: string
  body: string
  // User vybral konkretni CV a/nebo motivacni dopis z /dokumenty. Pokud null,
  // pouzije se default: resolveCvPdfPath (nejnovejsi CV) + AI generated letter.
  cv_doc_id?: string | null
  letter_doc_id?: string | null
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.replace(/^Bearer\s+/i, '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as SendRequest
    if (!body || (!body.jobId && !body.agencyId) || !body.to || !body.subject || !body.body) {
      return NextResponse.json({ error: 'Missing required fields (jobId or agencyId, to, subject, body)' }, { status: 400 })
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.to)) {
      return NextResponse.json({ error: 'Neplatný formát e-mailu příjemce' }, { status: 400 })
    }

    // Resolve user's Gmail token
    const { data: tokenRow } = await supabaseAdmin
      .from('email_oauth_tokens')
      .select('email, access_token, refresh_token, revoked')
      .eq('member_id', user.id)
      .eq('provider', 'gmail')
      .maybeSingle()

    if (!tokenRow || tokenRow.revoked) {
      return NextResponse.json({ error: 'Gmail není připojený. Připoj ho v Smart Apply.' }, { status: 400 })
    }

    // Sender display name z profilu
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle()
    const fromName = profile?.full_name || (user.email?.split('@')[0] ?? 'Worker user')
    const safeName = fromName.replace(/\s+/g, '_').replace(/[^A-Za-z0-9_-]/g, '')

    // ============================================================================
    // PDF prilohy (existing infrastructure z /api/matches/[id]/send)
    //   1. CV PDF — povinne. Pokud user nema CV ulozene, vrat error s hintem
    //      "vytvor CV v Moje dokumenty".
    //   2. Motivacni dopis PDF — bud zvoleny letter_pdf_path z member_agent_config,
    //      jinak generujeme on-fly z draft body pres buildMotivationPdf().
    // ============================================================================
    // CV PDF: user-selected nebo default (resolveCvPdfPath)
    let cvPath: string | null = null
    if (body.cv_doc_id) {
      // User vybral konkretni CV — over ze patri jemu + sestav storage path
      const { data: doc } = await supabaseAdmin
        .from('saved_documents')
        .select('id, type, user_id')
        .eq('id', body.cv_doc_id)
        .eq('user_id', user.id)
        .eq('type', 'cv')
        .maybeSingle()
      if (doc) cvPath = `${user.id}/${doc.id}.pdf`
    } else {
      cvPath = await resolveCvPdfPath(supabaseAdmin, user.id)
    }
    if (!cvPath) {
      return NextResponse.json({
        error: 'no_cv_pdf',
        hint: 'Otevři Moje dokumenty → vytvoř a ulož CV. Bez životopisu nelze přihlášku poslat.',
      }, { status: 400 })
    }
    const { data: cvBlob, error: cvErr } = await supabaseAdmin.storage
      .from('cv-pdfs')
      .download(cvPath)
    if (cvErr || !cvBlob) {
      return NextResponse.json({
        error: 'no_cv_pdf',
        hint: 'Vybrané CV neni v Storage. Otevři Moje dokumenty a ulož ho znovu.',
      }, { status: 400 })
    }
    const cvPdfBase64 = Buffer.from(await cvBlob.arrayBuffer()).toString('base64')
    const cvFilename = `Lebenslauf_${safeName || 'Bewerber'}.pdf`

    // Motivacni dopis PDF: user-selected NEBO default (member_agent_config.letter_pdf_path)
    // NEBO fallback AI-generated z draft body
    let letterPath: string | null = null
    if (body.letter_doc_id) {
      const { data: doc } = await supabaseAdmin
        .from('saved_documents')
        .select('id, user_id')
        .eq('id', body.letter_doc_id)
        .eq('user_id', user.id)
        .eq('type', 'letter')
        .maybeSingle()
      if (doc) letterPath = `${user.id}/${doc.id}.pdf`
    } else {
      letterPath = await resolveLetterPdfPath(supabaseAdmin, user.id)
    }
    let motivationPdfBase64: string | null = null
    if (letterPath) {
      const { data: letterBlob } = await supabaseAdmin.storage.from('cv-pdfs').download(letterPath)
      if (letterBlob) motivationPdfBase64 = Buffer.from(await letterBlob.arrayBuffer()).toString('base64')
    }
    if (!motivationPdfBase64) {
      motivationPdfBase64 = await buildMotivationPdf({ senderName: fromName, body: body.body })
    }
    const motivationFilename = `Motivationsschreiben_${safeName || 'Bewerber'}.pdf`

    // Email body HTML (plain → paragraphs)
    const bodyHtml = body.body
      .split(/\n{2,}/)
      .map((p) => `<p style="margin:0 0 12px 0; line-height:1.55; font-family: -apple-system, Helvetica, Arial, sans-serif; font-size:14px; color:#111;">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
      .join('')

    try {
      const result = await sendGmailMessage({
        accessToken: tokenRow.access_token!,
        refreshToken: tokenRow.refresh_token,
        fromName,
        fromEmail: tokenRow.email,
        to: body.to,
        subject: body.subject,
        bodyHtml,
        attachments: [
          { filename: cvFilename, mimeType: 'application/pdf', contentBase64: cvPdfBase64 },
          { filename: motivationFilename, mimeType: 'application/pdf', contentBase64: motivationPdfBase64 },
        ],
      })

      // Update last_used_at na tokenu
      await supabaseAdmin
        .from('email_oauth_tokens')
        .update({ last_used_at: new Date().toISOString() })
        .eq('member_id', user.id)
        .eq('provider', 'gmail')

      // Log do sent_applications pokud tabulka existuje (silently skip if not)
      try {
        await supabaseAdmin.from('sent_applications').insert({
          member_id: user.id,
          job_id: body.jobId || null,
          agency_id: body.agencyId || null,
          to_email: body.to,
          subject: body.subject,
          body_preview: body.body.slice(0, 500),
          gmail_message_id: result.id,
          gmail_thread_id: result.threadId,
          sent_at: new Date().toISOString(),
        })
      } catch {
        // sent_applications neni vytvoreno — nebo nema agency_id sloupec, ne kritike
      }

      return NextResponse.json({
        success: true,
        message_id: result.id,
        thread_id: result.threadId,
        attachments: [cvFilename, motivationFilename],
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'send_failed'
      console.error('Smart Apply send error:', msg)
      return NextResponse.json({ error: msg }, { status: 502 })
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal error'
    console.error('Smart Apply send error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
