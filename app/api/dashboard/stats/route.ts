import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/dashboard/stats
// Auth: Bearer token (matching pattern from /api/documents)

const adminAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function getUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return null
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await adminAuth.auth.getUser(token)
  if (error || !user) return null
  return user
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoIso = weekAgo.toISOString()

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
