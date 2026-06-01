import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase-admin'
import { emailUser, btn, BASE } from '../../../lib/community-notify'

async function getUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return null
  const token = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  return user
}

async function isPremium(userId: string) {
  const { data: sub } = await supabaseAdmin.from('subscriptions').select('status').eq('user_id', userId).single()
  return sub?.status === 'active' || sub?.status === 'trialing'
}

const ONLINE_MS = 3 * 60 * 1000

export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const me = user.id
  const { searchParams } = new URL(req.url)

  // Počet nepřečtených (pro badge v sidebaru)
  if (searchParams.get('unread')) {
    const { count } = await supabaseAdmin
      .from('dm_messages')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', me)
      .is('read_at', null)
    return NextResponse.json({ unread: count || 0 })
  }

  // Konverzace přes jednoho partnera
  const withUser = searchParams.get('with')
  if (withUser) {
    const { data: msgs } = await supabaseAdmin
      .from('dm_messages')
      .select('*')
      .or(`and(sender_id.eq.${me},recipient_id.eq.${withUser}),and(sender_id.eq.${withUser},recipient_id.eq.${me})`)
      .order('created_at', { ascending: true })
      .limit(300)
    // Označ příchozí jako přečtené
    await supabaseAdmin.from('dm_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('recipient_id', me).eq('sender_id', withUser).is('read_at', null)
    const { data: prof } = await supabaseAdmin
      .from('profiles').select('id, full_name, avatar_url, last_seen_at').eq('id', withUser).single()
    const partner = prof ? {
      id: prof.id, name: prof.full_name || 'Člen', avatar_url: prof.avatar_url || null,
      online: prof.last_seen_at ? new Date(prof.last_seen_at).getTime() > Date.now() - ONLINE_MS : false,
    } : null
    return NextResponse.json({ messages: msgs || [], partner })
  }

  // Seznam konverzací
  const { data: rows } = await supabaseAdmin
    .from('dm_messages')
    .select('*')
    .or(`sender_id.eq.${me},recipient_id.eq.${me}`)
    .order('created_at', { ascending: false })
    .limit(500)

  const convMap = new Map<string, { other: string; last: { content: string; created_at: string; sender_id: string }; unread: number }>()
  for (const r of rows || []) {
    const other = r.sender_id === me ? r.recipient_id : r.sender_id
    if (!convMap.has(other)) convMap.set(other, { other, last: r, unread: 0 })
    if (r.recipient_id === me && !r.read_at) convMap.get(other)!.unread++
  }
  const otherIds = [...convMap.keys()]
  const profMap: Record<string, { full_name: string | null; avatar_url: string | null; last_seen_at: string | null }> = {}
  if (otherIds.length) {
    const { data: profs } = await supabaseAdmin
      .from('profiles').select('id, full_name, avatar_url, last_seen_at').in('id', otherIds)
    for (const p of profs || []) profMap[p.id] = p
  }
  const conversations = [...convMap.values()]
    .sort((a, b) => new Date(b.last.created_at).getTime() - new Date(a.last.created_at).getTime())
    .map(c => ({
      id: c.other,
      name: profMap[c.other]?.full_name || 'Člen',
      avatar_url: profMap[c.other]?.avatar_url || null,
      online: profMap[c.other]?.last_seen_at ? new Date(profMap[c.other]!.last_seen_at!).getTime() > Date.now() - ONLINE_MS : false,
      last_content: c.last.content,
      last_at: c.last.created_at,
      last_from_me: c.last.sender_id === me,
      unread: c.unread,
    }))
  return NextResponse.json({ conversations })
}

export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await isPremium(user.id))) return NextResponse.json({ error: 'Premium required' }, { status: 403 })

  const { recipient_id, content } = await req.json()
  const text = (content || '').trim()
  if (!recipient_id || !text) return NextResponse.json({ error: 'Prázdná zpráva' }, { status: 400 })
  if (recipient_id === user.id) return NextResponse.json({ error: 'Nelze psát sám sobě' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('dm_messages')
    .insert({ sender_id: user.id, recipient_id, content: text })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // E-mail příjemci, jen když je offline (jinak to vidí v reálném čase)
  const { data: rprof } = await supabaseAdmin.from('profiles').select('last_seen_at').eq('id', recipient_id).single()
  const online = rprof?.last_seen_at && new Date(rprof.last_seen_at).getTime() > Date.now() - ONLINE_MS
  if (!online) {
    const senderName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Někdo z komunity'
    const snippet = text.length > 140 ? text.slice(0, 140) + '…' : text
    emailUser(
      recipient_id, 'notify_dms',
      `${senderName} ti poslal zprávu na Wokeru`,
      `<p style="font-size:15px">Máš novou soukromou zprávu od <strong>${senderName}</strong>:</p>
       <p style="font-size:15px;color:#444;border-left:3px solid #f97316;padding-left:12px;margin:16px 0">${snippet}</p>
       <p style="margin-top:20px">${btn(`${BASE}/zpravy?with=${user.id}`, 'Odpovědět v komunitě')}</p>`,
    )
  }

  return NextResponse.json({ message: data })
}
