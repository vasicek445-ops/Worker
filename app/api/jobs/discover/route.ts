import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { discoverJobs } from '@/lib/jobs/aggregator'

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

export const maxDuration = 60 // seconds — Adzuna fan-out can take a while

export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Load member's agent config
  const { data: config, error: configErr } = await supabaseAdmin
    .from('member_agent_config')
    .select('*')
    .eq('member_id', user.id)
    .maybeSingle()

  if (configErr) return NextResponse.json({ error: configErr.message }, { status: 500 })
  if (!config) return NextResponse.json({ error: 'config_missing', hint: 'Visit /profil/agent first' }, { status: 400 })
  if (!config.active) return NextResponse.json({ error: 'agent_inactive' }, { status: 400 })
  if (!config.positions?.length) {
    return NextResponse.json({ error: 'no_positions', hint: 'Add at least one position' }, { status: 400 })
  }

  // Run discovery
  const result = await discoverJobs({
    positions: config.positions,
    locations: config.locations ?? [],
    languages: config.languages ?? ['de'],
    daily_limit: config.daily_limit ?? 3,
    salary_min_chf: config.salary_min_chf,
  })

  // Persist as pending matches (dedupe against today's existing rows)
  const today = new Date().toISOString().slice(0, 10)
  const rows = result.jobs.slice(0, Math.max(20, config.daily_limit * 5)).map((j) => ({
    member_id: user.id,
    match_date: today,
    job_url: j.url,
    job_source: j.source,
    job_source_id: j.source_id,
    company: j.company,
    position: j.title,
    location: j.location,
    salary_text: j.salary_text,
    description: j.description.slice(0, 2000),
    language: j.language,
    status: 'pending' as const,
  }))

  let inserted = 0
  if (rows.length) {
    const { data, error } = await supabaseAdmin
      .from('daily_matches')
      .upsert(rows, { onConflict: 'member_id,job_url', ignoreDuplicates: true })
      .select('id')
    if (error) {
      return NextResponse.json({
        error: 'insert_failed',
        message: error.message,
        hint: error.hint,
        by_source: result.by_source,
      }, { status: 500 })
    }
    inserted = data?.length ?? 0
  }

  return NextResponse.json({
    found: result.jobs.length,
    inserted,
    by_source: result.by_source,
    errors: result.errors,
  })
}
