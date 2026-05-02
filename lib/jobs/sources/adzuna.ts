import type { NormalizedJob } from '../types'

const ADZUNA_BASE = 'https://api.adzuna.com/v1/api/jobs'

type AdzunaResponse = {
  count: number
  results: Array<{
    id: string
    title?: string
    description?: string
    redirect_url: string
    company?: { display_name?: string }
    location?: { display_name?: string; area?: string[] }
    salary_min?: number
    salary_max?: number
    salary_is_predicted?: string
    created?: string
  }>
}

/**
 * Map member languages to Adzuna country codes.
 * Border workers in CH typically speak DE (BL/BS/SG/SH border with DE),
 * FR (GE/JU border with FR), IT (TI border with IT). DE jobs (5k+ for
 * logistik) and AT (Vienna 5k+) significantly expand the email-applicable
 * pool because SMEs in DE/AT still email more than CH enterprises.
 */
function countriesForLanguages(langs: string[]): string[] {
  const set = new Set<string>(['ch']) // always include CH
  for (const lang of langs) {
    if (lang === 'de') { set.add('de'); set.add('at') }
    if (lang === 'fr') set.add('fr')
    if (lang === 'it') set.add('it')
    if (lang === 'en') { set.add('gb'); set.add('ie') }
  }
  return Array.from(set)
}

/**
 * Search Adzuna for jobs matching the member's positions × locations,
 * fanning out across all relevant countries based on their spoken languages.
 */
export async function searchAdzuna(params: {
  positions: string[]
  locations: string[]
  languages?: string[]
  resultsPerQuery?: number
  country?: string // optional override
}): Promise<{ jobs: NormalizedJob[]; queries: number; byCountry: Record<string, number> }> {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  if (!appId || !appKey) {
    throw new Error('ADZUNA_APP_ID / ADZUNA_APP_KEY not configured')
  }

  const countries = params.country
    ? [params.country]
    : countriesForLanguages(params.languages ?? ['de'])
  const perPage = Math.min(params.resultsPerQuery ?? 20, 50)
  const positions = params.positions.length ? params.positions : ['']
  // For non-CH countries we don't pass `where` — let Adzuna scan the whole
  // country since the user's CH locations don't translate (e.g. "Luzern"
  // wouldn't match anything in DE).
  const locations = params.locations.length ? params.locations : ['']

  const jobs: NormalizedJob[] = []
  const byCountry: Record<string, number> = {}
  let queries = 0

  for (const country of countries) {
    byCountry[country] = 0
    for (const position of positions) {
      const locsForCountry = country === 'ch' ? locations : ['']
      for (const location of locsForCountry) {
        queries++
        const url = new URL(`${ADZUNA_BASE}/${country}/search/1`)
        url.searchParams.set('app_id', appId)
        url.searchParams.set('app_key', appKey)
        url.searchParams.set('results_per_page', String(perPage))
        url.searchParams.set('content-type', 'application/json')
        if (position) url.searchParams.set('title_only', position)
        if (location) url.searchParams.set('where', location)

        try {
          const res = await fetch(url.toString(), {
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(10_000),
          })
          if (!res.ok) {
            console.warn(`[adzuna:${country}] HTTP ${res.status} for ${position}@${location}`)
            continue
          }
          const data = (await res.json()) as AdzunaResponse
          for (const r of data.results ?? []) {
            jobs.push(normalize(r, country))
          }
          byCountry[country] += data.results?.length ?? 0
        } catch (err) {
          console.warn(`[adzuna:${country}] error ${position}@${location}:`, err)
        }
      }
    }
  }

  return { jobs, queries, byCountry }
}

const CURRENCY_BY_COUNTRY: Record<string, string> = {
  ch: 'CHF', de: 'EUR', at: 'EUR', fr: 'EUR', it: 'EUR', gb: 'GBP', ie: 'EUR',
}

function normalize(r: AdzunaResponse['results'][number], country: string): NormalizedJob {
  const salaryMin = typeof r.salary_min === 'number' ? Math.round(r.salary_min) : null
  const salaryMax = typeof r.salary_max === 'number' ? Math.round(r.salary_max) : null
  const isPredicted = r.salary_is_predicted === '1'
  const currency = CURRENCY_BY_COUNTRY[country] ?? ''
  let salaryText: string | null = null
  if (salaryMin && salaryMax) {
    salaryText = `${salaryMin.toLocaleString('de-CH')} – ${salaryMax.toLocaleString('de-CH')} ${currency}${isPredicted ? ' (geschätzt)' : ''}`
  } else if (salaryMin) {
    salaryText = `ab ${salaryMin.toLocaleString('de-CH')} ${currency}`
  }
  return {
    source: 'adzuna',
    source_id: `${country}-${r.id}`,
    url: r.redirect_url,
    title: r.title?.trim() ?? '',
    company: r.company?.display_name ?? null,
    location: r.location?.display_name ?? null,
    description: stripHtml(r.description ?? '').slice(0, 4000),
    salary_text: salaryText,
    salary_min: salaryMin,
    salary_max: salaryMax,
    posted_at: r.created ?? null,
    language: null,
    raw: r,
  }
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
