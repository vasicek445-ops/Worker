import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/dashboard/activity?range=7d|14d|30d
// Vrati denni time-series pro 3 metriky: Odeslano / Odpovedi / Zamestnavatelu
// Vsechna data 100% accurate (na nasem serveru).

type Range = '7d' | '14d' | '30d'

interface DayPoint {
  date: string         // ISO yyyy-mm-dd
  label: string        // "23. 5." display
  sent: number
  replies: number
  agencies_added: number
}

interface Totals {
  sent: number
  replies: number
  agencies_added: number
  total_agencies: number   // cumulative (current pool)
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
    const { searchParams } = new URL(req.url)
    const range = (searchParams.get('range') || '7d') as Range
    const days = daysInRange(range)

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

    // Build day buckets
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
      buckets[key] = {
        date: key,
        label: csLabel(d),
        sent: 0,
        replies: 0,
        agencies_added: 0,
      }
    }

    const startIso = startDate.toISOString()

    // 1. Sent applications (per user)
    const { data: sentRows } = await supabaseAdmin
      .from('sent_applications')
      .select('sent_at')
      .eq('member_id', user.id)
      .gte('sent_at', startIso)

    for (const row of sentRows || []) {
      const d = isoDate(new Date(row.sent_at))
      if (buckets[d]) buckets[d].sent += 1
    }

    // 2. Replies (per user)
    const { data: replyRows } = await supabaseAdmin
      .from('application_replies')
      .select('received_at')
      .eq('member_id', user.id)
      .gte('received_at', startIso)

    for (const row of replyRows || []) {
      const d = isoDate(new Date(row.received_at))
      if (buckets[d]) buckets[d].replies += 1
    }

    // 3. Agencies added (global pool growth)
    // Try query agencies.created_at — pokud sloupec neexistuje, gracefully degrade na 0.
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
      // agencies.created_at neexistuje — necháme 0s
    }

    // Total agencies pool (current snapshot)
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
