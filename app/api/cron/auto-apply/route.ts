import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateDraft, type CVData } from '@/lib/matching/draft'
import { extractRecipientEmail } from '@/lib/matching/extract'
import { sendGmailMessage } from '@/lib/gmail'
import { buildMotivationPdf } from '@/lib/motivation-pdf'
import { resolveCvPdfPath, resolveLetterPdfPath } from '@/lib/cv-pdf'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// Smart Apply auto-send: pro uživatele s zapnutým „Auto-send" projde pending
// matche, vygeneruje draft a odešle z jejich Gmailu (s CV v příloze).
// Pojistka: posílá jen matche s e-mailem a verdiktem != 'poor'. Respektuje denní limit.
const TIME_BUDGET_MS = 260_000
const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function bodyToHtml(body: string): string {
  return body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 12px 0; line-height:1.55;">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const start = Date.now()

    // Uživatelé s opt-in auto-sendem a aktivním agentem
    const { data: configs, error: cfgErr } = await supabaseAdmin
      .from('member_agent_config')
      .select('member_id, daily_limit, languages')
      .eq('auto_send', true)
      .eq('active', true)
    if (cfgErr) return NextResponse.json({ error: cfgErr.message }, { status: 500 })

    let usersProcessed = 0
    let sent = 0
    let drafted = 0
    let skipped = 0

    for (const cfg of configs ?? []) {
      if (Date.now() - start > TIME_BUDGET_MS) break
      const userId = cfg.member_id as string
      const dailyLimit = (cfg.daily_limit as number) || 3

      // Gmail tokeny
      const { data: oauth } = await supabaseAdmin
        .from('email_oauth_tokens')
        .select('access_token, refresh_token, email, revoked')
        .eq('member_id', userId)
        .eq('provider', 'gmail')
        .maybeSingle()
      if (!oauth || oauth.revoked) continue

      // CV (strukturované) — pro generování draftu
      const { data: cvDoc } = await supabaseAdmin
        .from('saved_documents')
        .select('document_data')
        .eq('user_id', userId)
        .eq('type', 'cv')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      const cv = cvDoc?.document_data as CVData | undefined
      if (!cv?.personalData?.name) continue

      // CV PDF — zvolené CV pro Smart Apply (povinná příloha)
      const cvPath = await resolveCvPdfPath(supabaseAdmin, userId)
      if (!cvPath) continue
      const { data: pdfBlob } = await supabaseAdmin.storage
        .from('cv-pdfs')
        .download(cvPath)
      if (!pdfBlob) continue
      const cvPdfBase64 = Buffer.from(await pdfBlob.arrayBuffer()).toString('base64')
      const senderName = cv.personalData.name
      const cvFilename = `Lebenslauf_${senderName.replace(/\s+/g, '_')}.pdf`
      const motivationFilename = `Motivationsschreiben_${senderName.replace(/\s+/g, '_')}.pdf`

      // Zvolený motivační dopis (volitelný) — stáhnout jednou pro uživatele
      const letterPath = await resolveLetterPdfPath(supabaseAdmin, userId)
      let chosenLetterBase64: string | null = null
      if (letterPath) {
        const { data: lb } = await supabaseAdmin.storage.from('cv-pdfs').download(letterPath)
        if (lb) chosenLetterBase64 = Buffer.from(await lb.arrayBuffer()).toString('base64')
      }

      // Denní limit — odečti, co se dnes už odeslalo (i ručně)
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const { count: sentToday } = await supabaseAdmin
        .from('email_send_log')
        .select('id', { count: 'exact', head: true })
        .eq('member_id', userId)
        .gte('sent_at', todayStart.toISOString())
      const budget = dailyLimit - (sentToday ?? 0)
      if (budget <= 0) continue

      // Pending matche
      const { data: matches } = await supabaseAdmin
        .from('daily_matches')
        .select('id, position, company, location, description, language, verdict, draft_subject, draft_body, recipient_email')
        .eq('member_id', userId)
        .eq('status', 'pending')
        .order('generated_at', { ascending: true })
        .limit(40)

      let userSent = 0
      for (const m of matches ?? []) {
        if (userSent >= budget) break
        if (Date.now() - start > TIME_BUDGET_MS) break

        let verdict = m.verdict as string | null
        let draftSubject = m.draft_subject as string | null
        let draftBody = m.draft_body as string | null
        let recipient = m.recipient_email as string | null

        // Draft chybí → vygeneruj
        if (!draftBody || !draftSubject) {
          try {
            const d = await generateDraft({
              cv,
              job: {
                position: m.position,
                company: m.company,
                location: m.location,
                description: m.description ?? '',
                language: m.language,
              },
              preferredLanguages: (cfg.languages as string[]) ?? ['de'],
            })
            verdict = d.verdict
            draftSubject = d.draft_subject
            draftBody = d.draft_body
            recipient = extractRecipientEmail(m.description ?? '') ?? m.recipient_email ?? null
            await supabaseAdmin
              .from('daily_matches')
              .update({
                verdict: d.verdict,
                strengths: d.strengths,
                gaps: d.gaps,
                recommendation: d.recommendation,
                draft_subject: d.draft_subject,
                draft_body: d.draft_body,
                language: d.language,
                recipient_email: recipient,
              })
              .eq('id', m.id)
            drafted++
          } catch {
            skipped++
            continue
          }
        }

        // Pojistka: neposílat špatně padnoucí nabídky ani bez e-mailu
        if (verdict === 'poor') {
          skipped++
          continue
        }
        const to = (recipient || '').trim().toLowerCase()
        if (!to || !VALID_EMAIL.test(to)) {
          skipped++
          continue
        }

        // Odeslat z Gmailu uživatele
        try {
          const motivationPdfBase64 =
            chosenLetterBase64 ??
            (await buildMotivationPdf({ senderName, body: draftBody!, language: m.language }))
          const result = await sendGmailMessage({
            accessToken: oauth.access_token ?? '',
            refreshToken: oauth.refresh_token,
            fromName: senderName,
            fromEmail: oauth.email,
            to,
            subject: draftSubject!,
            bodyHtml: bodyToHtml(draftBody!),
            attachments: [
              { filename: cvFilename, mimeType: 'application/pdf', contentBase64: cvPdfBase64 },
              { filename: motivationFilename, mimeType: 'application/pdf', contentBase64: motivationPdfBase64 },
            ],
          })
          const sentAt = new Date().toISOString()
          await supabaseAdmin
            .from('daily_matches')
            .update({ status: 'sent', sent_at: sentAt, recipient_email: to })
            .eq('id', m.id)
          await supabaseAdmin.from('email_send_log').insert({
            member_id: userId,
            match_id: m.id,
            recipient_email: to,
            subject: draftSubject,
            provider: 'gmail',
            message_id: result.id,
            thread_id: result.threadId,
            sent_at: sentAt,
          })
          userSent++
          sent++
        } catch (err) {
          console.error(`auto-apply send failed (user ${userId}, match ${m.id}):`, err)
          skipped++
        }
      }

      if (userSent > 0) {
        await supabaseAdmin
          .from('email_oauth_tokens')
          .update({ last_used_at: new Date().toISOString() })
          .eq('member_id', userId)
          .eq('provider', 'gmail')
      }
      usersProcessed++
    }

    return NextResponse.json({
      success: true,
      usersProcessed,
      sent,
      drafted,
      skipped,
      elapsedMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'unknown error'
    console.error('auto-apply error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
