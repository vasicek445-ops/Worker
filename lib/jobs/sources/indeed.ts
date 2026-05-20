import { createClient } from '@supabase/supabase-js'
import { extractRecipientEmail } from '@/lib/matching/extract'
import type { NormalizedJob } from '../types'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

type JobRow = {
  id: string
  external_id: string | null
  title: string
  company: string | null
  location: string | null
  description: string | null
  salary_text: string | null
  salary_min: number | null
  salary_max: number | null
  url: string | null
  posted_at: string | null
  contact_emails: string[] | null
}

/**
 * Postings z tabulky `jobs` (zdroj 'indeed', plněno cronem scrape-indeed),
 * které už nesou kontaktní e-mail. E-mail je přímo v řádku → jdou rovnou
 * do preEnriched cesty, scraping se přeskakuje.
 */
export async function searchJobsTable(params: {
  positions: string[]
  locations: string[]
  limit?: number
}): Promise<{ jobs: (NormalizedJob & { recipient_email: string })[] }> {
  const { positions, locations, limit = 30 } = params

  let query = supabaseAdmin
    .from('jobs')
    .select(
      'id, external_id, title, company, location, description, salary_text, salary_min, salary_max, url, posted_at, contact_emails',
    )
    .eq('source', 'indeed')
    .not('contact_emails', 'is', null)

  if (positions.length) {
    const ors = positions
      .map((p) => p.replace(/[%,]/g, '').trim())
      .filter(Boolean)
      .flatMap((p) => [`title.ilike.%${p}%`, `category.ilike.%${p}%`])
      .join(',')
    if (ors) query = query.or(ors)
  }

  if (locations.length) {
    const ors = locations
      .map((loc) => loc.replace(/[%,]/g, '').trim())
      .filter(Boolean)
      .flatMap((l) => [`location.ilike.%${l}%`, `canton.ilike.%${l}%`])
      .join(',')
    if (ors) query = query.or(ors)
  }

  const { data, error } = await query
    .order('posted_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(`jobs_table: ${error.message}`)

  const jobs: (NormalizedJob & { recipient_email: string })[] = []
  for (const row of (data ?? []) as JobRow[]) {
    const emails = row.contact_emails ?? []
    if (!emails.length || !row.url || !row.title) continue
    const recipient = extractRecipientEmail(emails.join('\n'))
    if (!recipient) continue

    jobs.push({
      source: 'indeed',
      source_id: row.external_id ?? row.id,
      url: row.url,
      title: row.title,
      company: row.company,
      location: row.location,
      description: row.description ?? '',
      salary_text: row.salary_text,
      salary_min: row.salary_min,
      salary_max: row.salary_max,
      posted_at: row.posted_at,
      language: 'de',
      raw: row,
      recipient_email: recipient,
    })
  }
  return { jobs }
}
