import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/dashboard/stats
// Real counts pro 4-up stat tiles a hero. Vsechna data 100% accurate.

export async function GET(_req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      },
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoIso = weekAgo.toISOString()

    // Parallel queries
    const [
      sentTotal,
      sentWeek,
      repliesTotal,
      interviews,
      documents,
    ] = await Promise.all([
      supabaseAdmin
        .from('sent_applications')
        .select('id', { count: 'exact', head: true })
        .eq('member_id', user.id),
      supabaseAdmin
        .from('sent_applications')
        .select('id', { count: 'exact', head: true })
        .eq('member_id', user.id)
        .gte('sent_at', weekAgoIso),
      supabaseAdmin
        .from('application_replies')
        .select('id', { count: 'exact', head: true })
        .eq('member_id', user.id),
      supabaseAdmin
        .from('application_replies')
        .select('id', { count: 'exact', head: true })
        .eq('member_id', user.id)
        .eq('classification', 'interview'),
      supabaseAdmin
        .from('saved_documents')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
    ])

    const sentCount = sentTotal.count || 0
    const repliesCount = repliesTotal.count || 0
    const replyRate = sentCount > 0 ? Math.round((repliesCount / sentCount) * 100) : 0

    return NextResponse.json({
      sent_total: sentCount,
      sent_week: sentWeek.count || 0,
      replies_total: repliesCount,
      interviews_total: interviews.count || 0,
      documents_total: documents.count || 0,
      reply_rate_pct: replyRate,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
