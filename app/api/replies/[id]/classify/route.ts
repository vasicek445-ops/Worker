import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase-admin'

// PATCH /api/replies/[id]/classify
// Body: { classification: 'interview' | 'rejection' | 'question' | 'auto_reply' | 'positive' | 'neutral' }
// Auth: Bearer token. Updatuje application_replies.user_classification + propaguje
// na sent_applications.reply_classification (first reply).

const ALLOWED = ['interview', 'rejection', 'question', 'auto_reply', 'positive', 'neutral'] as const
type Classification = typeof ALLOWED[number]

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

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await ctx.params
    if (!id) return NextResponse.json({ error: 'Missing reply id' }, { status: 400 })

    const body = await req.json()
    const classification = body.classification as Classification
    if (!ALLOWED.includes(classification)) {
      return NextResponse.json({ error: 'Invalid classification' }, { status: 400 })
    }

    // Najit reply + zkontrolovat ownership
    const { data: reply } = await supabaseAdmin
      .from('application_replies')
      .select('id, application_id, member_id, received_at')
      .eq('id', id)
      .eq('member_id', user.id)
      .maybeSingle()

    if (!reply) return NextResponse.json({ error: 'Reply not found' }, { status: 404 })

    // Update reply: user_classification + finalni classification + source
    const { error: updateErr } = await supabaseAdmin
      .from('application_replies')
      .update({
        user_classification: classification,
        classification,
        classification_source: 'user',
        low_confidence: false,
      })
      .eq('id', id)
      .eq('member_id', user.id)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    // Pokud je to prvni reply pro tu app, update aggregate na sent_applications
    const { data: firstReply } = await supabaseAdmin
      .from('application_replies')
      .select('id')
      .eq('application_id', reply.application_id)
      .order('received_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (firstReply?.id === reply.id) {
      await supabaseAdmin
        .from('sent_applications')
        .update({ reply_classification: classification })
        .eq('id', reply.application_id)
        .eq('member_id', user.id)
    }

    return NextResponse.json({ ok: true, classification })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
