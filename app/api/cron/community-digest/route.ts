import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { emailUser, btn, BASE } from '../../../../lib/community-notify'

const CHANNEL_LABELS: Record<string, string> = {
  general: 'general', spolubydleni: 'spolubydlení', napady: 'nápady', dotazy: 'dotazy', tipy: 'tipy',
}

// Týdenní souhrn aktivity komunity. Žádné LLM volání — jen agregace + Resend.
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Aktivita za posledních 7 dní (bez AI zpráv)
  const { data: msgs } = await supabaseAdmin
    .from('community_messages')
    .select('channel, user_name, content, created_at, is_ai')
    .gte('created_at', weekAgo)
    .eq('is_ai', false)
    .order('created_at', { ascending: false })

  const total = msgs?.length || 0
  if (total === 0) return NextResponse.json({ ok: true, sent: 0, reason: 'no activity' })

  // Počty podle kanálů
  const perChannel: Record<string, number> = {}
  for (const m of msgs!) perChannel[m.channel] = (perChannel[m.channel] || 0) + 1
  const topChannels = Object.entries(perChannel).sort((a, b) => b[1] - a[1])
  const channelRows = topChannels.map(([ch, n]) =>
    `<tr><td style="padding:6px 0;color:#444">#${CHANNEL_LABELS[ch] || ch}</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#f97316">${n}</td></tr>`
  ).join('')

  // Pár nejnovějších ukázek
  const samples = msgs!.slice(0, 3).map(m => {
    const snip = m.content.length > 100 ? m.content.slice(0, 100) + '…' : m.content
    return `<p style="font-size:14px;margin:10px 0;color:#333"><strong>${m.user_name}</strong> <span style="color:#999">v #${CHANNEL_LABELS[m.channel] || m.channel}</span><br/><span style="color:#555">${snip}</span></p>`
  }).join('')

  const html = `
    <p style="font-size:16px;font-weight:700">Tento týden v komunitě Woker 👋</p>
    <p style="font-size:15px;color:#444">Padlo <strong>${total}</strong> ${total < 5 ? 'nových zpráv' : 'nových zpráv'} napříč kanály:</p>
    <table style="width:100%;border-collapse:collapse;margin:8px 0 16px">${channelRows}</table>
    <p style="font-size:13px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:.05em">Nejnovější</p>
    ${samples}
    <p style="margin-top:22px">${btn(`${BASE}/komunita`, 'Otevřít komunitu')}</p>`

  // Příjemci: premium členové s notify_weekly (emailUser respektuje pref)
  const { data: subs } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .in('status', ['active', 'trialing'])

  const recipientIds = [...new Set((subs || []).map(s => s.user_id))]
  let sent = 0
  for (const id of recipientIds) {
    await emailUser(id, 'notify_weekly', 'Tento týden v komunitě Woker', html)
    sent++
  }

  return NextResponse.json({ ok: true, total, channels: perChannel, sent })
}
