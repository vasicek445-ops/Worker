import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/dashboard/activity?range=7d|14d|30d
// Auth: Bearer token (matching pattern from /api/documents)

type Range = '7d' | '14d' | '30d'

interface DayPoint {
  date: string
  label: string
  sent: number
  replies: number
  agencies_added: number
}

interface Totals {
  sent: number
  replies: number
  agencies_added: number
  total_agencies: number
}

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

function daysInRange(r: Range): number {
  return r === '7d' ? 7 : r === '14d' ? 14 : 30
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function csLabel(d: Date): string {
  return `${d.getDate()}. ${d.getMonth() + 1}.`
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const range = (searchParams.get('range') || '7d') as Range
    const days = daysInRange(range)

    const now = new Date()
    const startDate = new Date(now)
    startDate.setHours(0, 0, 0, 0)
    startDate.setDate(startDate.getDate() - (days - 1))

    const buckets: Record<string, DayPoint> = {}
    const orderedDates: string[] = []
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      const key = isoDate(d)
      orderedDates.push(key)
      buckets[key] = { date: key, label: csLabel(d), sent: 0, replies: 0, agencies_added: 0 }
    }

    const startIso = startDate.toISOString()

    const { data: sentRows } = await supabaseAdmin
      .from('sent_applications')
      .select('sent_at')
      .eq('member_id', user.id)
      .gte('sent_at', startIso)

    for (const row of sentRows || []) {
      const d = isoDate(new Date(row.sent_at))
      if (buckets[d]) buckets[d].sent += 1
    }

    const { data: replyRows } = await supabaseAdmin
      .from('application_replies')
      .select('received_at')
      .eq('member_id', user.id)
      .gte('received_at', startIso)

    for (const row of replyRows || []) {
      const d = isoDate(new Date(row.received_at))
      if (buckets[d]) buckets[d].replies += 1
    }

    try {
      const { data: agencyRows, error: agencyErr } = await supabaseAdmin
        .from('agencies')
        .select('created_at')
        .gte('created_at', startIso)
        .not('created_at', 'is', null)

      if (!agencyErr && agencyRows) {
        for (const row of agencyRows) {
          if (!row.created_at) continue
          const d = isoDate(new Date(row.created_at))
          if (buckets[d]) buckets[d].agencies_added += 1
        }
      }
    } catch {
      // agencies.created_at neexistuje
    }

    const { count: totalAgencies } = await supabaseAdmin
      .from('agencies')
      .select('id', { count: 'exact', head: true })

    const data = orderedDates.map((k) => buckets[k])
    const totals: Totals = {
      sent: data.reduce((a, b) => a + b.sent, 0),
      replies: data.reduce((a, b) => a + b.replies, 0),
      agencies_added: data.reduce((a, b) => a + b.agencies_added, 0),
      total_agencies: totalAgencies || 0,
    }

    return NextResponse.json({ range, data, totals })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
