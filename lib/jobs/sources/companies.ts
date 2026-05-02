import { createClient } from '@supabase/supabase-js'
import type { NormalizedJob } from '../types'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const LANG_REGION: Record<string, string> = {
  de: 'german',
  fr: 'french',
  it: 'italian',
}

type CompanyRow = {
  id: string
  source: string
  name: string
  email: string
  phone: string | null
  website: string | null
  city: string | null
  canton: string | null
  region: string | null
  branche: string | null
  positions: string[] | null
}

/**
 * Query the local companies index (currently sourced from local.ch + agencies).
 * Match by position keyword against the company's `positions` array OR
 * against branche name. Filter by language→region.
 */
export async function searchCompanies(params: {
  positions: string[]
  locations: string[]
  languages: string[]
  limit?: number
}): Promise<{ jobs: (NormalizedJob & { recipient_email: string })[] }> {
  const { positions, locations, languages, limit = 30 } = params

  let query = supabaseAdmin
    .from('companies')
    .select('id, source, name, email, phone, website, city, canton, region, branche, positions')
    .not('email', 'is', null)

  const regions = languages.map((l) => LANG_REGION[l]).filter(Boolean)
  if (regions.length) query = query.in('region', regions)

  // Match positions: any of the user's terms appears in companies.positions
  // OR in the branche string. Use Postgres array overlap + ilike fallback.
  if (positions.length) {
    const lower = positions.map((p) => p.toLowerCase())
    const ors = [
      `positions.ov.{${lower.map((p) => `"${p}"`).join(',')}}`,
      ...lower.map((p) => `branche.ilike.%${p}%`),
    ].join(',')
    query = query.or(ors)
  }

  if (locations.length) {
    const ors = locations
      .map((loc) => loc.replace(/[%,]/g, '').trim())
      .filter(Boolean)
      .map((l) => `city.ilike.%${l}%,canton.ilike.%${l}%`)
      .join(',')
    if (ors) query = query.or(ors)
  }

  const { data, error } = await query.limit(limit)
  if (error) throw new Error(`companies: ${error.message}`)

  const jobs: (NormalizedJob & { recipient_email: string })[] = (data ?? []).map((c: CompanyRow) =>
    synthesize(c, positions[0] ?? 'Stelle'),
  )
  return { jobs }
}

function synthesize(
  c: CompanyRow,
  position: string,
): NormalizedJob & { recipient_email: string } {
  const locStr = [c.city, c.canton].filter(Boolean).join(', ') || 'Schweiz'
  const description = [
    `${c.name}${c.branche ? ` — ${c.branche}` : ''} in ${locStr}.`,
    `Initiativbewerbung — diese Firma stellt regelmäßig Personen für ${(c.positions ?? []).slice(0, 3).join(', ') || position} an.`,
    `Kontakt: ${c.email}${c.phone ? `, ${c.phone}` : ''}.`,
    c.website ? `Website: ${c.website}` : '',
  ].filter(Boolean).join('\n\n')

  return {
    source: c.source === 'localch' ? 'agencies' : 'agencies', // reuse 'agencies' literal in DB enum-like
    source_id: `company-${c.id}`,
    url: c.website ?? `mailto:${c.email}`,
    title: `Iniciativní přihláška: ${position} u ${c.name}`,
    company: c.name,
    location: locStr,
    description,
    salary_text: null,
    salary_min: null,
    salary_max: null,
    posted_at: null,
    language: regionToLang(c.region),
    raw: c,
    recipient_email: c.email,
  }
}

function regionToLang(region: string | null): string | null {
  if (region === 'german') return 'de'
  if (region === 'french') return 'fr'
  if (region === 'italian') return 'it'
  return null
}
