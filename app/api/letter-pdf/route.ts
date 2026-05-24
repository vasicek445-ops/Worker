import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resolveLetterPdfPath } from '@/lib/cv-pdf'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export const maxDuration = 30

async function getUser(token: string) {
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  return error || !user ? null : user
}

// POST — uloží Letter PDF. Vyžaduje documentId (musí být letter doc uživatele).
// Path: cv-pdfs/{user}/{documentId}.pdf (sdílíme bucket s CV, jména se neperou — DB rozliší type).
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await getUser(authHeader.replace('Bearer ', ''))
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof Blob)) return NextResponse.json({ error: 'no_file' }, { status: 400 })
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'file_too_large' }, { status: 400 })

  const docRaw = form?.get('documentId')
  const documentId = typeof docRaw === 'string' && docRaw.trim() ? docRaw.trim() : null
  if (!documentId) return NextResponse.json({ error: 'documentId_required' }, { status: 400 })

  // Ověř že dokument patří uživateli a je typu letter
  const { data: doc, error: docErr } = await supabaseAdmin
    .from('saved_documents')
    .select('id, user_id, type')
    .eq('id', documentId)
    .maybeSingle()

  if (docErr || !doc) return NextResponse.json({ error: 'document_not_found' }, { status: 404 })
  if (doc.user_id !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  if (doc.type !== 'letter') return NextResponse.json({ error: 'invalid_document_type' }, { status: 400 })

  const path = `${user.id}/${doc.id}.pdf`

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: upErr } = await supabaseAdmin.storage
    .from('cv-pdfs')
    .upload(path, buffer, { contentType: 'application/pdf', upsert: true })
  if (upErr) return NextResponse.json({ error: 'upload_failed', message: upErr.message }, { status: 500 })

  return NextResponse.json({ ok: true, path })
}

// GET — podepsaná URL na Letter PDF. ?path= konkrétní; jinak zvolené/poslední Letter.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await getUser(authHeader.replace('Bearer ', ''))
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let path = req.nextUrl.searchParams.get('path')
  if (path && !path.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  if (!path) path = await resolveLetterPdfPath(supabaseAdmin, user.id)
  if (!path) {
    return NextResponse.json({ error: 'no_letter_pdf', hint: 'Ulož si motivační dopis v Moje dokumenty.' }, { status: 404 })
  }

  const { data, error } = await supabaseAdmin.storage.from('cv-pdfs').createSignedUrl(path, 300)
  if (error || !data) {
    return NextResponse.json({ error: 'no_letter_pdf', hint: 'Letter PDF nenalezeno — ulož si dopis.' }, { status: 404 })
  }
  return NextResponse.json({ url: data.signedUrl })
}
