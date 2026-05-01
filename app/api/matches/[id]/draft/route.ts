import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateDraft, type CVData } from '@/lib/matching/draft'

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

export const maxDuration = 60

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params

  // 1. Fetch the match (ownership check via member_id eq)
  const { data: match, error: matchErr } = await supabaseAdmin
    .from('daily_matches')
    .select('id, position, company, location, description, language')
    .eq('id', id)
    .eq('member_id', user.id)
    .maybeSingle()

  if (matchErr) return NextResponse.json({ error: matchErr.message }, { status: 500 })
  if (!match) return NextResponse.json({ error: 'match_not_found' }, { status: 404 })

  // 2. Fetch most recent CV
  const { data: cvDoc, error: cvErr } = await supabaseAdmin
    .from('saved_documents')
    .select('document_data, title')
    .eq('user_id', user.id)
    .eq('type', 'cv')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (cvErr) return NextResponse.json({ error: cvErr.message }, { status: 500 })
  if (!cvDoc) {
    return NextResponse.json({
      error: 'no_cv',
      hint: 'Vytvoř nejdřív CV v sekci Moje dokumenty',
    }, { status: 400 })
  }

  // 3. Fetch agent config (for language preferences)
  const { data: cfg } = await supabaseAdmin
    .from('member_agent_config')
    .select('languages')
    .eq('member_id', user.id)
    .maybeSingle()

  const cv = cvDoc.document_data as CVData
  if (!cv?.personalData?.name) {
    return NextResponse.json({ error: 'cv_invalid', hint: 'CV nemá jméno — uprav v Moje dokumenty' }, { status: 400 })
  }

  // 4. Generate draft via Claude Haiku
  let draft
  try {
    draft = await generateDraft({
      cv,
      job: {
        position: match.position,
        company: match.company,
        location: match.location,
        description: match.description ?? '',
        language: match.language,
      },
      preferredLanguages: cfg?.languages ?? ['de'],
    })
  } catch (err) {
    console.error('[draft] generation failed:', err)
    return NextResponse.json({
      error: 'draft_generation_failed',
      message: (err as Error).message,
    }, { status: 500 })
  }

  // 5. Persist draft + structured analysis
  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('daily_matches')
    .update({
      verdict: draft.verdict,
      strengths: draft.strengths,
      gaps: draft.gaps,
      recommendation: draft.recommendation,
      draft_subject: draft.draft_subject,
      draft_body: draft.draft_body,
      language: draft.language,
    })
    .eq('id', id)
    .eq('member_id', user.id)
    .select()
    .single()

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })
  return NextResponse.json({ match: updated })
}
