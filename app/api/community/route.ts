import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { emailUser, btn, BASE } from '../../../lib/community-notify'

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const AI_SYSTEM_PROMPT = `Jsi AI asistent komunity Woker — platformy pro české pracovníky ve Švýcarsku.

TVŮJ STYL:
- Chirurgicky přesné odpovědi. Žádný balast, žádné obecné rady.
- Konkrétní čísla, termíny, paragrafy, instituce.
- Když nevíš přesně, řekni to — nikdy nevymýšlej.
- Piš česky, švýcarské termíny uváděj v němčině v závorce.
- Krátce a jasně. Max 3-4 odstavce.
- Jsi kalibrovaný expertem na švýcarský pracovní trh s přímou zkušeností.

TVOJE ZNALOSTI:
- Švýcarské pracovní právo (OR, GAV, L-GAV, Arbeitsgesetz)
- Pracovní povolení (L, B, C, G, Meldeverfahren do 90 dnů)
- Mzdy podle oborů a kantonů, 13. plat, přesčasy
- Zdravotní pojištění (KVG, Grundversicherung, Franchise)
- Daně (Quellensteuer, rozdíly mezi kantony)
- Bydlení (Bewerbungsdossier, Kaution 3 měsíce, Nebenkosten)
- Agentury (das team, Adecco, Randstad, Manpower, Temporär vs. Festanstellung)
- Bankovní účty (Neon, Yuh, PostFinance)
- Řidičský průkaz (výměna do 12 měsíců, MFK)
- Praktické tipy pro život ve Švýcarsku

KATEGORIE PŘÍSPĚVKŮ:
- "spolubydleni": Poraď s hledáním, upozorni na obvyklé náklady v regionu, zmíň portály
- "feature": Poděkuj za nápad, řekni že tým to zaregistroval
- "dotaz": Odpověz přímo a přesně. Tady jsi nejužitečnější.
- "tip": Doplň nebo potvrď tip, přidej kontext pokud chybí

Odpovídej VŽDY v češtině. Buď přátelský ale věcný. Žádné emoji spam — max 1-2 relevantní emoji.`

async function generateAIReply(post: { category: string; title: string; content: string; region?: string }) {
  try {
    const regionContext = post.region ? ` (region: ${post.region})` : ''
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: AI_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Nový příspěvek v komunitě Woker:
Kategorie: ${post.category}${regionContext}
Nadpis: ${post.title}
Obsah: ${post.content}

Odpověz jako AI asistent komunity. Buď konkrétní a užitečný.`
      }]
    })
    const textBlock = response.content.find(b => b.type === 'text')
    return textBlock ? textBlock.text : null
  } catch (err) {
    console.error('AI reply error:', err)
    return null
  }
}

// Slash příkazy v komunitním chatu. Každý je AI zkratka s vlastní instrukcí
// šitou na švýcarský trh. Frontend zrcadlí tenhle seznam do "/" menu.
const SLASH_COMMANDS: Record<string, string> = {
  ai: '',
  mzda: 'Uživatel chce vědět obvyklou mzdu. Uveď konkrétní rozpětí (CHF/měsíc i CHF/hod) pro daný obor a kanton, zmíň 13. plat a hlavní faktory. Pokud obor nebo kanton chybí, krátce se doptej.',
  povoleni: 'Uživatel se ptá na pracovní povolení. Vysvětli relevantní typ (L / B / C / G, Meldeverfahren do 90 dnů) — podmínky, dobu platnosti a jak ho získat. Buď konkrétní.',
  byt: 'Uživatel hledá bydlení. Dej praktické tipy: portály (Homegate, Flatfox, ImmoScout24), obvyklé náklady v daném regionu, Bewerbungsdossier, Kaution (3 měsíce) a Nebenkosten.',
}

async function generateChatAIReply(channel: string, question: string, history: { user_name: string; content: string }[], commandInstruction = '') {
  try {
    const ctx = history.slice(-8).map(m => `${m.user_name}: ${m.content}`).join('\n')
    const focus = commandInstruction ? `\nSPECIÁLNÍ INSTRUKCE PRO TENTO DOTAZ:\n${commandInstruction}\n` : ''
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: AI_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Jsi v chat kanálu #${channel} komunity Woker. Nedávná konverzace:
${ctx || '(zatím prázdno)'}
${focus}
Někdo se tě právě zeptal (oslovil tě @AI nebo slash příkazem):
${question}

Odpověz stručně a věcně jako účastník chatu — krátká zpráva, ne esej. Max 2-3 odstavce.`
      }]
    })
    const textBlock = response.content.find(b => b.type === 'text')
    return textBlock ? textBlock.text : null
  } catch (err) {
    console.error('Chat AI reply error:', err)
    return null
  }
}

async function getUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return null
  const token = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  return user
}

export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const postId = searchParams.get('postId')
  const messagesChannel = searchParams.get('messages')

  // Členové komunity + online status (presence). Online = heartbeat < 3 min.
  if (searchParams.get('members')) {
    const { data: profs } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, avatar_url, last_seen_at')
      .not('last_seen_at', 'is', null)
      .order('last_seen_at', { ascending: false })
      .limit(200)
    const cutoff = Date.now() - 3 * 60 * 1000
    const members = (profs || []).map(p => ({
      id: p.id,
      name: p.full_name || 'Člen',
      avatar_url: p.avatar_url || null,
      online: p.last_seen_at ? new Date(p.last_seen_at).getTime() > cutoff : false,
      self: p.id === user.id,
    }))
    return NextResponse.json({ members })
  }

  // Chat: latest messages for a channel (ascending order for display)
  if (messagesChannel) {
    const since = searchParams.get('since')
    let mq = supabaseAdmin
      .from('community_messages')
      .select('*')
      .eq('channel', messagesChannel)
      .order('created_at', { ascending: false })
      .limit(100)
    if (since) mq = mq.gt('created_at', since)
    const { data: msgs } = await mq
    const ordered = (msgs || []).reverse()
    // Dotáhni profilové fotky autorů (vždy aktuální, bez denormalizace do zpráv)
    const ids = [...new Set(ordered.filter(m => !m.is_ai).map(m => m.user_id))]
    const avatars: Record<string, string | null> = {}
    if (ids.length) {
      const { data: profs } = await supabaseAdmin.from('profiles').select('id, avatar_url').in('id', ids)
      for (const p of profs || []) avatars[p.id] = p.avatar_url
    }
    return NextResponse.json({
      messages: ordered.map(m => ({ ...m, avatar_url: m.is_ai ? null : (avatars[m.user_id] || null) })),
    })
  }

  // Single post with comments
  if (postId) {
    const { data: post } = await supabaseAdmin
      .from('community_posts')
      .select('*')
      .eq('id', postId)
      .single()

    const { data: comments } = await supabaseAdmin
      .from('community_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    const { data: userUpvote } = await supabaseAdmin
      .from('community_upvotes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({ post, comments: comments || [], hasUpvoted: !!userUpvote })
  }

  // List posts
  let query = supabaseAdmin
    .from('community_posts')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data: posts } = await query

  // Get user's upvotes
  const { data: userUpvotes } = await supabaseAdmin
    .from('community_upvotes')
    .select('post_id')
    .eq('user_id', user.id)

  const upvotedIds = new Set((userUpvotes || []).map(u => u.post_id))

  return NextResponse.json({
    posts: (posts || []).map(p => ({ ...p, hasUpvoted: upvotedIds.has(p.id) }))
  })
}

export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action } = body

  // Presence heartbeat — lehký zápis, bez subscription kontroly
  if (action === 'ping') {
    await supabaseAdmin.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', user.id)
    return NextResponse.json({ ok: true })
  }

  // Check subscription for posting
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .single()

  if ((sub?.status !== 'active' && sub?.status !== 'trialing')) return NextResponse.json({ error: 'Premium required' }, { status: 403 })

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonym'

  if (action === 'create_post') {
    const { category, title, content, region, budget, move_date, looking_for } = body
    if (!category || !title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Vyplň kategorii, nadpis a obsah' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('community_posts')
      .insert({
        user_id: user.id,
        user_name: userName,
        category,
        title: title.trim(),
        content: content.trim(),
        region: region || null,
        budget: budget || null,
        move_date: move_date || null,
        looking_for: looking_for || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // AI auto-reply (fire and forget - don't block response)
    generateAIReply({ category, title, content, region }).then(async (aiReply) => {
      if (!aiReply || !data) return
      await supabaseAdmin.from('community_comments').insert({
        post_id: data.id,
        user_id: user.id, // uses poster's user_id as placeholder
        user_name: '🤖 Woker AI',
        content: aiReply,
        is_ai: true,
      })
      // Update comments count
      await supabaseAdmin.from('community_posts').update({ comments_count: 1 }).eq('id', data.id)
    })

    return NextResponse.json({ post: data })
  }

  if (action === 'comment') {
    const { post_id, content } = body
    if (!post_id || !content?.trim()) {
      return NextResponse.json({ error: 'Vyplň komentář' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('community_comments')
      .insert({
        post_id,
        user_id: user.id,
        user_name: userName,
        content: content.trim(),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Update comments count
    const { data: post } = await supabaseAdmin.from('community_posts').select('comments_count').eq('id', post_id).single()
    if (post) {
      await supabaseAdmin.from('community_posts').update({ comments_count: (post.comments_count || 0) + 1 }).eq('id', post_id)
    }

    return NextResponse.json({ comment: data })
  }

  if (action === 'upvote') {
    const { post_id } = body
    if (!post_id) return NextResponse.json({ error: 'Missing post_id' }, { status: 400 })

    // Check if already upvoted
    const { data: existing } = await supabaseAdmin
      .from('community_upvotes')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      // Remove upvote
      await supabaseAdmin.from('community_upvotes').delete().eq('id', existing.id)
      const { data: post } = await supabaseAdmin.from('community_posts').select('upvotes').eq('id', post_id).single()
      if (post) await supabaseAdmin.from('community_posts').update({ upvotes: Math.max(0, (post.upvotes || 0) - 1) }).eq('id', post_id)
      return NextResponse.json({ upvoted: false })
    } else {
      // Add upvote
      await supabaseAdmin.from('community_upvotes').insert({ post_id, user_id: user.id })
      const { data: post } = await supabaseAdmin.from('community_posts').select('upvotes').eq('id', post_id).single()
      if (post) await supabaseAdmin.from('community_posts').update({ upvotes: (post.upvotes || 0) + 1 }).eq('id', post_id)
      return NextResponse.json({ upvoted: true })
    }
  }

  if (action === 'send_message') {
    const { channel, content, attachment_url, attachment_type, attachment_name, mentions } = body
    const text = (content || '').trim()
    if (!channel || (!text && !attachment_url)) {
      return NextResponse.json({ error: 'Prázdná zpráva' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('community_messages')
      .insert({
        channel, user_id: user.id, user_name: userName, content: text, is_ai: false,
        attachment_url: attachment_url || null,
        attachment_type: attachment_type || null,
        attachment_name: attachment_name || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // AI reply only when opted-in via @AI or a slash command (/ai, /mzda, /povoleni, /byt)
    const slashMatch = text.match(/^\s*\/(\w+)\b[:,]?\s*/i)
    const cmd = slashMatch?.[1]?.toLowerCase()
    const isAt = /^\s*@ai\b/i.test(text)
    const isSlash = cmd && cmd in SLASH_COMMANDS
    if (isAt || isSlash) {
      const question = isSlash
        ? (text.slice(slashMatch![0].length).trim() || text)
        : (text.replace(/^\s*@ai\b[:,]?\s*/i, '').trim() || text)
      const instruction = isSlash ? SLASH_COMMANDS[cmd!] : ''
      const { data: recent } = await supabaseAdmin
        .from('community_messages')
        .select('user_name, content')
        .eq('channel', channel)
        .order('created_at', { ascending: false })
        .limit(8)
      const history = (recent || []).reverse()
      generateChatAIReply(channel, question, history, instruction).then(async (aiReply) => {
        if (!aiReply) return
        await supabaseAdmin.from('community_messages').insert({
          channel, user_id: user.id, user_name: 'Woker AI', content: aiReply, is_ai: true,
        })
      })
    }

    // E-mail @zmíněným členům (z autocomplete pickeru), respektuje notify_mentions
    if (Array.isArray(mentions) && mentions.length) {
      const snippet = text.length > 160 ? text.slice(0, 160) + '…' : text
      const unique = [...new Set(mentions)].filter((id): id is string => typeof id === 'string' && id !== user.id)
      for (const id of unique) {
        emailUser(
          id, 'notify_mentions',
          `${userName} tě zmínil v komunitě`,
          `<p style="font-size:15px"><strong>${userName}</strong> tě zmínil v kanálu <strong>#${channel}</strong>:</p>
           <p style="font-size:15px;color:#444;border-left:3px solid #f97316;padding-left:12px;margin:16px 0">${snippet}</p>
           <p style="margin-top:20px">${btn(`${BASE}/komunita`, 'Otevřít komunitu')}</p>`,
        )
      }
    }

    const { data: prof } = await supabaseAdmin.from('profiles').select('avatar_url').eq('id', user.id).single()
    return NextResponse.json({ message: { ...data, avatar_url: prof?.avatar_url || null } })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
