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

const ALLOWED_STATUSES = new Set(['pending', 'sent', 'skipped', 'edited', 'expired'])

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params

  const body = await req.json()
  const update: Record<string, unknown> = {}
  if (body.status && ALLOWED_STATUSES.has(body.status)) update.status = body.status
  if (typeof body.draft_subject === 'string') update.draft_subject = body.draft_subject
  if (typeof body.draft_body === 'string') update.draft_body = body.draft_body
  if (!Object.keys(update).length) {
    return NextResponse.json({ error: 'no_valid_fields' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('daily_matches')
    .update(update)
    .eq('id', id)
    .eq('member_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ match: data })
}
