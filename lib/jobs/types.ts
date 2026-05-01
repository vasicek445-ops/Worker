/**
 * Common job shape used by all sources after normalization.
 * Each source maps its own response into this format.
 */
export type NormalizedJob = {
  source: 'adzuna' | 'jooble' | 'agencies' | 'manual'
  source_id: string // unique within source
  url: string
  title: string
  company: string | null
  location: string | null
  description: string // plain text, may be truncated
  salary_text: string | null // "60,000 - 80,000 CHF" or null if unknown
  salary_min: number | null // CHF, null if unknown
  salary_max: number | null
  posted_at: string | null // ISO 8601
  language: string | null // 'de' | 'en' | 'fr' | 'it' | null
  raw: unknown // keep raw payload for debugging
}

export type DiscoverConfig = {
  positions: string[]
  locations: string[]
  languages: string[]
  daily_limit: number
  salary_min_chf: number | null
}

export type EnrichedJob = NormalizedJob & { recipient_email: string }

export type DiscoverResult = {
  jobs: EnrichedJob[] // every job has a verified hiring email
  by_source: Record<string, number>
  raw_count: number // how many jobs sources returned before email enrichment
  dropped_no_email: number // how many were dropped because portal-only
  errors: { source: string; error: string }[]
}
