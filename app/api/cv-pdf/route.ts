import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resolveCvPdfPath } from '@/lib/cv-pdf'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export const maxDuration = 30

async function getUser(token: string) {
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  return error || !user ? null : user
}

// POST — uloží CV PDF. S documentId → cv-pdfs/{user}/{documentId}.pdf,
// bez něj → cv-pdfs/{user}/uploads/{ts}.pdf (nahrané z PC). Vrací cestu.
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await getUser(authHeader.replace('Bearer ', ''))
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof Blob)) return NextResponse.json({ error: 'no_file' }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'file_too_large' }, { status: 400 })

  const docRaw = form?.get('documentId')
  const documentId = typeof docRaw === 'string' && docRaw.trim() ? docRaw.trim() : null
  const path = documentId
    ? `${user.id}/${documentId}.pdf`
    : `${user.id}/uploads/${Date.now()}.pdf`

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: upErr } = await supabaseAdmin.storage
    .from('cv-pdfs')
    .upload(path, buffer, { contentType: 'application/pdf', upsert: true })
  if (upErr) return NextResponse.json({ error: 'upload_failed', message: upErr.message }, { status: 500 })

  return NextResponse.json({ ok: true, path })
}

// GET — podepsaná URL na CV PDF. ?path= konkrétní; jinak zvolené/poslední CV.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await getUser(authHeader.replace('Bearer ', ''))
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let path = req.nextUrl.searchParams.get('path')
  if (path && !path.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  if (!path) path = await resolveCvPdfPath(supabaseAdmin, user.id)
  if (!path) {
    return NextResponse.json({ error: 'no_cv_pdf', hint: 'Ulož si CV v Moje dokumenty.' }, { status: 404 })
  }

  const { data, error } = await supabaseAdmin.storage.from('cv-pdfs').createSignedUrl(path, 300)
  if (error || !data) {
    return NextResponse.json({ error: 'no_cv_pdf', hint: 'CV PDF nenalezeno — ulož si CV.' }, { status: 404 })
  }
  return NextResponse.json({ url: data.signedUrl })
}
