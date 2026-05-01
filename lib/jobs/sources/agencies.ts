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

type AgencyRow = {
  id: number
  company: string
  street: string | null
  zip: string | null
  city: string | null
  canton: string | null
  region: string | null
  telephone: string | null
  email: string
  website: string | null
}

/**
 * Query the local agencies table (1000+ Swiss personnel agencies, 94% with email).
 * For each matching agency, synthesize a "speculative application via agency" job —
 * no scraping needed since emails are already verified during the swissstaffing import.
 */
export async function searchAgencies(params: {
  positions: string[]
  locations: string[]
  languages: string[]
  limit?: number
}): Promise<{ jobs: (NormalizedJob & { recipient_email: string })[] }> {
  const { positions, locations, languages, limit = 30 } = params

  let query = supabaseAdmin
    .from('agencies')
    .select('id, company, street, zip, city, canton, region, telephone, email, website')
    .not('email', 'is', null)

  // Filter by region matching member's spoken languages
  const regions = languages.map((l) => LANG_REGION[l]).filter(Boolean)
  if (regions.length) query = query.in('region', regions)

  // Optional: narrow by canton/city if user listed specific locations
  if (locations.length) {
    const ors = locations
      .map((loc) => {
        const safe = loc.replace(/[%,]/g, '').trim()
        return safe ? `city.ilike.%${safe}%,canton.ilike.%${safe}%` : ''
      })
      .filter(Boolean)
      .join(',')
    if (ors) query = query.or(ors)
  }

  const { data, error } = await query.limit(limit)
  if (error) throw new Error(`agencies: ${error.message}`)

  const focusPositions = positions.length ? positions : ['libovolná']
  const primaryPosition = focusPositions[0]

  const jobs: (NormalizedJob & { recipient_email: string })[] = (data ?? []).map((a: AgencyRow) =>
    synthesize(a, primaryPosition, focusPositions),
  )
  return { jobs }
}

function synthesize(
  a: AgencyRow,
  position: string,
  allPositions: string[],
): NormalizedJob & { recipient_email: string } {
  const locStr = [a.city, a.canton].filter(Boolean).join(', ') || 'Schweiz'
  const positionsList = allPositions.slice(0, 3).join(', ')

  // Deutsch text — agencies expect a CV via email and respond if they have suitable openings.
  // The Haiku draft step will rewrite this in the right tone for the candidate's CV.
  const description = [
    `Personalvermittlung ${a.company} in ${locStr}.`,
    `Initiativbewerbung — keine konkrete Stelle ausgeschrieben, aber die Agentur vermittelt regelmäßig Positionen wie ${positionsList} im Region ${a.canton ?? 'Schweiz'}.`,
    `Senden Sie Lebenslauf + kurzes Anschreiben an ${a.email}.`,
    a.website ? `Website: ${a.website}` : '',
    a.telephone ? `Tel: ${a.telephone}` : '',
  ].filter(Boolean).join('\n\n')

  return {
    source: 'agencies',
    source_id: `agency-${a.id}`,
    url: a.website ?? `mailto:${a.email}`,
    title: `Iniciativní přihláška: ${position} přes ${a.company}`,
    company: a.company,
    location: locStr,
    description,
    salary_text: null,
    salary_min: null,
    salary_max: null,
    posted_at: null,
    language: regionToLang(a.region),
    raw: a,
    recipient_email: a.email,
  }
}

function regionToLang(region: string | null): string | null {
  if (region === 'german') return 'de'
  if (region === 'french') return 'fr'
  if (region === 'italian') return 'it'
  return null
}
