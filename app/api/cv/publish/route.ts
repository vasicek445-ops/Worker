import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { makeSlug, ensureUniqueSlug } from '@/lib/cv/slug'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function getUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return null
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return null
  return user
}

function appUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL || 'https://woker.ch'
  return raw.replace(/\/+$/, '')
}

export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { userId?: string; documentId?: string; action?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { userId, documentId, action } = body
  if (!documentId || !action) {
    return NextResponse.json({ error: 'Missing documentId or action' }, { status: 400 })
  }

  // userId v body musí sedět s autentikovaným uživatelem (defense-in-depth).
  if (userId && userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Najít dokument a ověřit ownership + typ.
  const { data: doc, error: fetchErr } = await supabaseAdmin
    .from('saved_documents')
    .select('id, type, document_data, published_slug')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })
  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  if (doc.type !== 'cv') {
    return NextResponse.json({ error: 'Only CV documents can be published' }, { status: 400 })
  }

  if (action === 'unpublish') {
    const { error } = await supabaseAdmin
      .from('saved_documents')
      .update({ published_slug: null, published_at: null })
      .eq('id', documentId)
      .eq('user_id', user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ unpublished: true })
  }

  if (action !== 'publish') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  // Pokud už CV publikované je, vrať existující slug (idempotentní publish).
  if (doc.published_slug) {
    return NextResponse.json({
      slug: doc.published_slug,
      url: `${appUrl()}/cv/${doc.published_slug}`,
      reused: true,
    })
  }

  const data = (doc.document_data as Record<string, unknown>) || {}
  const personalData = data?.personalData as Record<string, unknown> | undefined
  const name: string = (personalData?.name as string) || ''
  const profession: string | undefined = (data?.field as string) || (data?.position as string) || undefined
  const baseSlug = makeSlug(name || 'cv', profession)

  // Najít všechny existující slugy, které kolidují s base nebo s jeho číslovanými variantami.
  // SQL ILIKE matching: `base` nebo `base-N`.
  const { data: collisions } = await supabaseAdmin
    .from('saved_documents')
    .select('published_slug')
    .or(`published_slug.eq.${baseSlug},published_slug.like.${baseSlug}-%`)

  const existing = (collisions || [])
    .map((r) => r.published_slug as string | null)
    .filter((s): s is string => Boolean(s))

  const slug = ensureUniqueSlug(baseSlug, existing)
  const publishedAt = new Date().toISOString()

  const { error: updateErr } = await supabaseAdmin
    .from('saved_documents')
    .update({ published_slug: slug, published_at: publishedAt })
    .eq('id', documentId)
    .eq('user_id', user.id)

  if (updateErr) {
    // Race condition s UNIQUE constraint — vrať 409.
    if (updateErr.code === '23505') {
      return NextResponse.json({ error: 'Slug collision, retry' }, { status: 409 })
    }
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  return NextResponse.json({
    slug,
    url: `${appUrl()}/cv/${slug}`,
    publishedAt,
  })
}
