import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendGmailMessage } from '@/lib/gmail'

// POST /api/smart-apply/send
// Body: { jobId: string, to: string, subject: string, body: string }
// Sends draft jako email pres user-uv Gmail. Loguje do sent_applications (pokud
// tabulka existuje — jinak silently skip).

interface SendRequest {
  jobId: string
  to: string
  subject: string
  body: string
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
    if (!body || !body.jobId || !body.to || !body.subject || !body.body) {
      return NextResponse.json({ error: 'Missing required fields (jobId, to, subject, body)' }, { status: 400 })
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

    // Plain text body → HTML s line breaks (CH HR ocení plain readability)
    const bodyHtml = `<div style="font-family: -apple-system, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.55; color: #111;">${
      escapeHtml(body.body).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')
    }</div>`.replace('>${', '><p>${').replace(/^<div([^>]*)>([^<])/, '<div$1><p>$2').replace(/([^>])<\/div>$/, '$1</p></div>')

    try {
      const result = await sendGmailMessage({
        accessToken: tokenRow.access_token!,
        refreshToken: tokenRow.refresh_token,
        fromName,
        fromEmail: tokenRow.email,
        to: body.to,
        subject: body.subject,
        bodyHtml,
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
          job_id: body.jobId,
          to_email: body.to,
          subject: body.subject,
          body_preview: body.body.slice(0, 500),
          gmail_message_id: result.id,
          gmail_thread_id: result.threadId,
          sent_at: new Date().toISOString(),
        })
      } catch {
        // sent_applications neni vytvoreno — neha krok, neni kritike
      }

      return NextResponse.json({
        success: true,
        message_id: result.id,
        thread_id: result.threadId,
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
