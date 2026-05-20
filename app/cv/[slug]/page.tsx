import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PublishedCVView from './PublishedCVView'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// 5 minut ISR — slug obsah se moc nemění, ale uživatel může re-publish.
export const revalidate = 300

type PageParams = { params: Promise<{ slug: string }> }

async function fetchPublishedCV(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('saved_documents')
    .select('document_data, template, accent_color, photo, published_at')
    .eq('published_slug', slug)
    .eq('type', 'cv')
    .maybeSingle()
  if (error || !data) return null
  return data
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params
  const row = await fetchPublishedCV(slug)
  if (!row) return { title: 'CV nenalezeno — Woker' }

  const d = (row.document_data as Record<string, unknown>) || {}
  const personalData = d?.personalData as Record<string, unknown> | undefined
  const name: string = (personalData?.name as string) || 'Životopis'
  const profession: string = (d?.field as string) || (d?.position as string) || ''
  const profil: string = ((d?.profil as string) || '').toString().slice(0, 160)

  const title = profession ? `${name} — ${profession} | Woker` : `${name} — Životopis | Woker`
  const description = profil || `Profesionální životopis ${name} — vytvořeno přes Woker.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      siteName: 'Woker',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    robots: { index: true, follow: true },
  }
}

export default async function PublishedCVPage({ params }: PageParams) {
  const { slug } = await params
  const row = await fetchPublishedCV(slug)
  if (!row) notFound()

  return (
    <PublishedCVView
      data={row.document_data}
      photo={(row.photo as string | null) ?? null}
      template={(row.template as string) || 'pro-classic'}
      accentColor={(row.accent_color as string) || '#2c3e50'}
    />
  )
}
