import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendGmailMessage } from '@/lib/gmail'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function getUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return null
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  return error || !user ? null : user
}

export const maxDuration = 30

const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params

  const body = await req.json().catch(() => ({}))
  const overrideRecipient: string | undefined = body.recipient_email

  // 1. Load match
  const { data: match, error: matchErr } = await supabaseAdmin
    .from('daily_matches')
    .select('id, position, company, draft_subject, draft_body, recipient_email, status')
    .eq('id', id)
    .eq('member_id', user.id)
    .maybeSingle()
  if (matchErr) return NextResponse.json({ error: matchErr.message }, { status: 500 })
  if (!match) return NextResponse.json({ error: 'match_not_found' }, { status: 404 })
  if (!match.draft_body || !match.draft_subject) {
    return NextResponse.json({ error: 'no_draft', hint: 'Vygeneruj nejdřív návrh' }, { status: 400 })
  }
  if (match.status === 'sent') {
    return NextResponse.json({ error: 'already_sent' }, { status: 400 })
  }

  // 2. Validate recipient
  const recipient = (overrideRecipient || match.recipient_email || '').trim().toLowerCase()
  if (!recipient || !VALID_EMAIL.test(recipient)) {
    return NextResponse.json({
      error: 'invalid_recipient',
      hint: 'Doplň email firmy ručně — v inzerátu nebyl rozpoznán',
    }, { status: 400 })
  }

  // 3. Load Gmail OAuth tokens
  const { data: oauth, error: oauthErr } = await supabaseAdmin
    .from('email_oauth_tokens')
    .select('access_token, refresh_token, email, revoked')
    .eq('member_id', user.id)
    .eq('provider', 'gmail')
    .maybeSingle()
  if (oauthErr) return NextResponse.json({ error: oauthErr.message }, { status: 500 })
  if (!oauth || oauth.revoked) {
    return NextResponse.json({
      error: 'gmail_not_connected',
      hint: 'Připoj Gmail v /profil/gmail',
    }, { status: 400 })
  }

  // 4. Pick a sender display name from the user's CV (fallback: email local-part)
  const { data: cvDoc } = await supabaseAdmin
    .from('saved_documents')
    .select('document_data')
    .eq('user_id', user.id)
    .eq('type', 'cv')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const senderName = (cvDoc?.document_data as any)?.personalData?.name || oauth.email.split('@')[0]

  // 5. Plain text body → minimal HTML (preserve paragraphs)
  const bodyHtml = match.draft_body
    .split(/\n{2,}/)
    .map((p: string) => `<p style="margin:0 0 12px 0; line-height:1.55;">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('')

  // 6. Send
  let result
  try {
    result = await sendGmailMessage({
      accessToken: oauth.access_token ?? '',
      refreshToken: oauth.refresh_token,
      fromName: senderName,
      fromEmail: oauth.email,
      to: recipient,
      subject: match.draft_subject,
      bodyHtml,
    })
  } catch (err) {
    console.error('[gmail-send] failed:', err)
    return NextResponse.json({
      error: 'send_failed',
      message: (err as Error).message,
    }, { status: 500 })
  }

  // 7. Persist: mark match sent + log
  const sentAt = new Date().toISOString()
  await supabaseAdmin
    .from('daily_matches')
    .update({ status: 'sent', sent_at: sentAt, recipient_email: recipient })
    .eq('id', id)
    .eq('member_id', user.id)

  await supabaseAdmin.from('email_send_log').insert({
    member_id: user.id,
    match_id: id,
    recipient_email: recipient,
    subject: match.draft_subject,
    provider: 'gmail',
    message_id: result.id,
    thread_id: result.threadId,
    sent_at: sentAt,
  })

  await supabaseAdmin
    .from('email_oauth_tokens')
    .update({ last_used_at: sentAt })
    .eq('member_id', user.id)
    .eq('provider', 'gmail')

  return NextResponse.json({
    ok: true,
    message_id: result.id,
    thread_id: result.threadId,
    recipient,
    sent_at: sentAt,
  })
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
