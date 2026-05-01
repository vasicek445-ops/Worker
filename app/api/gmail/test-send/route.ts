import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendGmailMessage } from '@/lib/gmail'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

/**
 * POST /api/gmail/test-send
 * Sends a test email through the authenticated member's Gmail account.
 * Body: { to: string, subject?: string, body?: string }
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { to, subject = 'Test z Wokeru', body } = await req.json()
  if (!to || typeof to !== 'string') {
    return NextResponse.json({ error: 'Missing recipient `to`' }, { status: 400 })
  }

  const { data: tokenRow } = await supabaseAdmin
    .from('email_oauth_tokens')
    .select('email, access_token, refresh_token, revoked')
    .eq('member_id', user.id)
    .eq('provider', 'gmail')
    .maybeSingle()

  if (!tokenRow || tokenRow.revoked) {
    return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 })
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  const fromName = profile?.full_name || (user.email?.split('@')[0] ?? 'Woker user')
  const html = body || `<p>Tohle je testovací email odeslaný přes <strong>Gmail OAuth</strong> z Wokeru.</p>
    <p>Pokud ho čteš, znamená to že integrace funguje a tvoje aplikace odejdou z tvého emailu (${tokenRow.email}).</p>
    <p>— Woker</p>`

  try {
    const result = await sendGmailMessage({
      accessToken: tokenRow.access_token!,
      refreshToken: tokenRow.refresh_token,
      fromName,
      fromEmail: tokenRow.email,
      to,
      subject,
      bodyHtml: html,
    })
    await supabaseAdmin
      .from('email_oauth_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('member_id', user.id).eq('provider', 'gmail')
    return NextResponse.json({ success: true, message_id: result.id, thread_id: result.threadId })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('Gmail send error', err)
    return NextResponse.json({ error: err?.message || 'send_failed' }, { status: 502 })
  }
}
