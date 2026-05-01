import { searchAdzuna } from './sources/adzuna'
import type { DiscoverConfig, DiscoverResult, NormalizedJob } from './types'

/**
 * Run all enabled sources for a member's config, dedupe by URL, filter by salary.
 * Returns up to ~daily_limit * 5 candidates (scoring will narrow further).
 */
export async function discoverJobs(config: DiscoverConfig): Promise<DiscoverResult> {
  const errors: DiscoverResult['errors'] = []
  const bySource: Record<string, number> = {}
  const all: NormalizedJob[] = []

  // Per-source result cap: enough candidates for scoring without blowing free tier
  const perQuery = Math.min(20, Math.max(5, config.daily_limit * 3))

  // Adzuna (Switzerland primary)
  try {
    const { jobs } = await searchAdzuna({
      positions: config.positions,
      locations: config.locations,
      resultsPerQuery: perQuery,
      country: 'ch',
    })
    bySource.adzuna = jobs.length
    all.push(...jobs)
  } catch (err) {
    errors.push({ source: 'adzuna', error: (err as Error).message })
    bySource.adzuna = 0
  }

  // Dedupe by URL (canonicalized)
  const seen = new Set<string>()
  const deduped: NormalizedJob[] = []
  for (const j of all) {
    const key = canonicalUrl(j.url)
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(j)
  }

  // Filter by salary floor (if set)
  const filtered = config.salary_min_chf
    ? deduped.filter((j) => j.salary_min === null || j.salary_min >= config.salary_min_chf!)
    : deduped

  // Filter by language preference (heuristic: detect from description)
  const langFiltered = filterByLanguage(filtered, config.languages)

  return {
    jobs: langFiltered,
    by_source: bySource,
    errors,
  }
}

function canonicalUrl(url: string): string {
  try {
    const u = new URL(url)
    u.hash = ''
    // Drop common tracking params
    const drop = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid']
    for (const p of drop) u.searchParams.delete(p)
    return u.toString()
  } catch {
    return url
  }
}

/**
 * Lightweight language detection — not perfect but free.
 * Counts common stopwords from each language in the description.
 */
function detectLanguage(text: string): string | null {
  const t = text.toLowerCase().slice(0, 1000)
  const score: Record<string, number> = { de: 0, en: 0, fr: 0, it: 0 }
  const markers: Record<string, RegExp[]> = {
    de: [/\bund\b/g, /\bder\b/g, /\bdie\b/g, /\bdas\b/g, /\bsie\b/g, /\bwir\b/g, /\bsind\b/g, /\bist\b/g, /\bmit\b/g, /\bfür\b/g, /\beinen\b/g],
    en: [/\band\b/g, /\bthe\b/g, /\bwith\b/g, /\bwe\b/g, /\byou\b/g, /\bour\b/g, /\bare\b/g, /\bfor\b/g],
    fr: [/\bet\b/g, /\ble\b/g, /\bla\b/g, /\bvous\b/g, /\bnous\b/g, /\bdes\b/g, /\bune\b/g, /\bavec\b/g, /\bpour\b/g],
    it: [/\be\b/g, /\bil\b/g, /\bla\b/g, /\bdella\b/g, /\bcon\b/g, /\bper\b/g, /\bun\b/g, /\bdei\b/g],
  }
  for (const lang of Object.keys(markers)) {
    for (const re of markers[lang]) {
      const m = t.match(re)
      if (m) score[lang] += m.length
    }
  }
  let best: string | null = null
  let bestScore = 0
  for (const [lang, n] of Object.entries(score)) {
    if (n > bestScore) {
      best = lang
      bestScore = n
    }
  }
  return bestScore >= 3 ? best : null
}

function filterByLanguage(jobs: NormalizedJob[], allowed: string[]): NormalizedJob[] {
  if (!allowed.length) return jobs
  const allowSet = new Set(allowed)
  return jobs
    .map((j) => ({ ...j, language: j.language ?? detectLanguage(j.description) }))
    .filter((j) => !j.language || allowSet.has(j.language))
}
