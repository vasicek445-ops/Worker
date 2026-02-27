import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

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

  // Check subscription for posting
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .single()

  if (sub?.status !== 'active') return NextResponse.json({ error: 'Premium required' }, { status: 403 })

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
    await supabaseAdmin.rpc('increment_comments', { post_uuid: post_id }).catch(() => {
      // Fallback: manual update
      supabaseAdmin
        .from('community_posts')
        .update({ comments_count: supabaseAdmin.rpc ? undefined : 0 })
        .eq('id', post_id)
    })

    // Actually just do a simple increment
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

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
