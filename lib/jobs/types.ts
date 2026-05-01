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

export type DiscoverResult = {
  jobs: NormalizedJob[]
  by_source: Record<string, number>
  errors: { source: string; error: string }[]
}
