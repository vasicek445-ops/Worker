import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildMotivationPdf } from '@/lib/motivation-pdf'
import { resolveLetterPdfPath } from '@/lib/cv-pdf'

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

// Náhled motivačního dopisu jako PDF — stejný dokument, co se přiloží k přihlášce.
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params

  // Zvolený Woker motivační dopis má přednost před AI textem
  const letterPath = await resolveLetterPdfPath(supabaseAdmin, user.id)
  if (letterPath) {
    const { data: letterBlob } = await supabaseAdmin.storage.from('cv-pdfs').download(letterPath)
    if (letterBlob) {
      return new Response(Buffer.from(await letterBlob.arrayBuffer()), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename="Motivationsschreiben.pdf"',
        },
      })
    }
  }

  const { data: match } = await supabaseAdmin
    .from('daily_matches')
    .select('draft_body, language')
    .eq('id', id)
    .eq('member_id', user.id)
    .maybeSingle()
  if (!match?.draft_body) {
    return NextResponse.json({ error: 'no_draft' }, { status: 404 })
  }

  const { data: cvDoc } = await supabaseAdmin
    .from('saved_documents')
    .select('document_data')
    .eq('user_id', user.id)
    .eq('type', 'cv')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const senderName = (cvDoc?.document_data as any)?.personalData?.name || 'Bewerber'

  const base64 = await buildMotivationPdf({
    senderName,
    body: match.draft_body,
    language: match.language,
  })

  return new Response(Buffer.from(base64, 'base64'), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="Motivationsschreiben.pdf"',
    },
  })
}
