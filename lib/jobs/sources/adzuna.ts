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
 * Search Adzuna for jobs matching the member's positions × locations.
 * Adzuna allows ~25 results/request, free tier ~1000/month — cap aggressively.
 */
export async function searchAdzuna(params: {
  positions: string[]
  locations: string[]
  resultsPerQuery?: number
  country?: string
}): Promise<{ jobs: NormalizedJob[]; queries: number }> {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  if (!appId || !appKey) {
    throw new Error('ADZUNA_APP_ID / ADZUNA_APP_KEY not configured')
  }

  const country = params.country ?? 'ch'
  const perPage = Math.min(params.resultsPerQuery ?? 20, 50)
  const positions = params.positions.length ? params.positions : ['']
  const locations = params.locations.length ? params.locations : ['']

  const jobs: NormalizedJob[] = []
  let queries = 0

  for (const position of positions) {
    for (const location of locations) {
      queries++
      const url = new URL(`${ADZUNA_BASE}/${country}/search/1`)
      url.searchParams.set('app_id', appId)
      url.searchParams.set('app_key', appKey)
      url.searchParams.set('results_per_page', String(perPage))
      url.searchParams.set('content-type', 'application/json')
      if (position) url.searchParams.set('what', position)
      if (location) url.searchParams.set('where', location)

      try {
        const res = await fetch(url.toString(), {
          headers: { Accept: 'application/json' },
          // 10s timeout via AbortSignal
          signal: AbortSignal.timeout(10_000),
        })
        if (!res.ok) {
          console.warn(`[adzuna] HTTP ${res.status} for ${position}@${location}`)
          continue
        }
        const data = (await res.json()) as AdzunaResponse
        for (const r of data.results ?? []) {
          jobs.push(normalize(r))
        }
      } catch (err) {
        console.warn(`[adzuna] error ${position}@${location}:`, err)
      }
    }
  }

  return { jobs, queries }
}

function normalize(r: AdzunaResponse['results'][number]): NormalizedJob {
  const salaryMin = typeof r.salary_min === 'number' ? Math.round(r.salary_min) : null
  const salaryMax = typeof r.salary_max === 'number' ? Math.round(r.salary_max) : null
  const isPredicted = r.salary_is_predicted === '1'
  let salaryText: string | null = null
  if (salaryMin && salaryMax) {
    salaryText = `${salaryMin.toLocaleString('de-CH')} – ${salaryMax.toLocaleString('de-CH')} CHF${isPredicted ? ' (geschätzt)' : ''}`
  } else if (salaryMin) {
    salaryText = `ab ${salaryMin.toLocaleString('de-CH')} CHF`
  }
  return {
    source: 'adzuna',
    source_id: r.id,
    url: r.redirect_url,
    title: r.title?.trim() ?? '',
    company: r.company?.display_name ?? null,
    location: r.location?.display_name ?? null,
    description: stripHtml(r.description ?? '').slice(0, 4000),
    salary_text: salaryText,
    salary_min: salaryMin,
    salary_max: salaryMax,
    posted_at: r.created ?? null,
    language: null, // Adzuna doesn't return — inferred later from description
    raw: r,
  }
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
