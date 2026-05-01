import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('member_agent_config')
    .select('*')
    .eq('member_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ config: data ?? null })
}

export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const positions = Array.isArray(body.positions) ? body.positions.filter(Boolean).slice(0, 10) : []
  const locations = Array.isArray(body.locations) ? body.locations.filter(Boolean).slice(0, 10) : []
  const languages = Array.isArray(body.languages) ? body.languages.filter(Boolean) : ['de']
  const dailyLimit = Math.max(0, Math.min(50, parseInt(body.daily_limit, 10) || 3))
  const salaryMinChf = body.salary_min_chf ? Math.max(0, parseInt(body.salary_min_chf, 10)) : null
  const active = Boolean(body.active ?? true)
  const autoSend = Boolean(body.auto_send ?? false)

  const { data, error } = await supabaseAdmin
    .from('member_agent_config')
    .upsert({
      member_id: user.id,
      positions,
      locations,
      languages,
      daily_limit: dailyLimit,
      salary_min_chf: salaryMinChf,
      active,
      auto_send: autoSend,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'member_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ config: data })
}
