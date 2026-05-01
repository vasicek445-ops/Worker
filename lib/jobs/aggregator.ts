import { searchAdzuna } from './sources/adzuna'
import { searchAgencies } from './sources/agencies'
import { extractRecipientEmail } from '@/lib/matching/extract'
import type { DiscoverConfig, DiscoverResult, EnrichedJob, NormalizedJob } from './types'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

/**
 * Fetch the job's URL, follow redirects, extract a hiring email from HTML.
 * Returns null if no email found (job is portal-only).
 */
async function tryExtractEmail(jobUrl: string): Promise<string | null> {
  try {
    const res = await fetch(jobUrl, {
      headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
      redirect: 'follow',
      signal: AbortSignal.timeout(8_000),
    })
    if (!res.ok) return null
    const html = await res.text()
    const decoded = html
      .replace(/&#0*64;/g, '@')
      .replace(/&#x40;/gi, '@')
      .replace(/&amp;/g, '&')
      .replace(/\(at\)/gi, '@')
      .replace(/\s\[at\]\s/gi, '@')
      .replace(/<[^>]+>/g, ' ')
    return extractRecipientEmail(decoded)
  } catch {
    return null
  }
}

/**
 * Enrich a list of jobs with hiring emails by fetching each redirect URL in
 * parallel (capped concurrency). Jobs without a discoverable email are dropped
 * — Smart Apply can't auto-send to portal-only postings.
 */
async function enrichWithEmails(
  jobs: NormalizedJob[],
  concurrency = 5,
): Promise<{ enriched: (NormalizedJob & { recipient_email: string })[]; dropped: number }> {
  const enriched: (NormalizedJob & { recipient_email: string })[] = []
  let dropped = 0
  let cursor = 0
  const workers = Array.from({ length: Math.min(concurrency, jobs.length) }, async () => {
    while (cursor < jobs.length) {
      const i = cursor++
      const job = jobs[i]
      const email = await tryExtractEmail(job.url)
      if (email) enriched.push({ ...job, recipient_email: email })
      else dropped++
    }
  })
  await Promise.all(workers)
  return { enriched, dropped }
}

/**
 * Run all enabled sources for a member's config, dedupe by URL, filter by salary.
 * Returns up to ~daily_limit * 5 candidates (scoring will narrow further).
 */
export async function discoverJobs(config: DiscoverConfig): Promise<DiscoverResult> {
  const errors: DiscoverResult['errors'] = []
  const bySource: Record<string, number> = {}
  const all: NormalizedJob[] = []
  // Jobs that already have a verified email (e.g. our agencies DB) skip the
  // expensive scrape-and-enrich step.
  const preEnriched: EnrichedJob[] = []

  // Per-source result cap: enough candidates for scoring without blowing free tier
  const perQuery = Math.min(20, Math.max(5, config.daily_limit * 3))

  // Adzuna (Switzerland — broad job board, mostly portal-only, will need enrichment)
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

  // Agencies (local DB, 1000+ Swiss personnel agencies — emails pre-verified)
  try {
    const { jobs } = await searchAgencies({
      positions: config.positions,
      locations: config.locations,
      languages: config.languages,
      limit: Math.max(15, config.daily_limit * 5),
    })
    bySource.agencies = jobs.length
    preEnriched.push(...jobs)
  } catch (err) {
    errors.push({ source: 'agencies', error: (err as Error).message })
    bySource.agencies = 0
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

  // Enrich Adzuna-style jobs with hiring emails — drop portal-only postings.
  const { enriched, dropped } = await enrichWithEmails(langFiltered, 6)

  // Combine: agency jobs (pre-verified emails) + scraped/enriched job-board jobs.
  // Dedupe again by recipient_email to avoid double-applying to same agency.
  const combined: EnrichedJob[] = [...preEnriched, ...enriched]
  const seenEmails = new Set<string>()
  const finalJobs: EnrichedJob[] = []
  for (const j of combined) {
    const k = j.recipient_email.toLowerCase()
    if (seenEmails.has(k)) continue
    seenEmails.add(k)
    finalJobs.push(j)
  }

  return {
    jobs: finalJobs,
    by_source: bySource,
    raw_count: langFiltered.length + preEnriched.length,
    dropped_no_email: dropped,
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
