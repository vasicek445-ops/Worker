/**
 * Karriere page scraper.
 *
 * Given a company website, find /karriere|/jobs|/stellen page, extract:
 *   1. The best HR-tier email (bewerbung@ > karriere@ > jobs@ > hr@ > personal@)
 *   2. Active open positions (job title + short description)
 *
 * Strategy: 2-step crawl (homepage → karriere link → karriere page).
 * Strict timeouts (8s per fetch) to keep cron under 5 min for 30 companies.
 */

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0 Safari/537.36'

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

const KARRIERE_LINK_RE =
  /href="([^"#?]*(?:karriere|stellen|offene[-_]stellen|jobs?|career|emploi|offres|lavoro)[^"]*)"/gi

const SKIP_DOMAINS = new Set([
  'sentry.io', 'gravatar.com', 'wixstudio.com', 'example.com',
  'gmail.com', 'googlemail.com', 'localsearch.ch', 'jobcloud.ch',
])

const HR_LOCAL_PARTS = [
  'bewerbung', 'bewerbungen', 'recruiting', 'recruitment', 'rekrutierung',
  'karriere', 'karrieren', 'career', 'careers',
  'jobs', 'job', 'stellen', 'stelle', 'offene-stellen',
  'hr', 'humanresources', 'human-resources', 'personal', 'personnel',
  'apply', 'application',
]

const SALES_LOCAL_PARTS = [
  'sales', 'vertrieb', 'verkauf', 'beratung', 'consulting', 'partner',
]

const GENERAL_LOCAL_PARTS = [
  'info', 'kontakt', 'contact', 'office', 'mail', 'hello', 'admin',
  'support', 'reception', 'sekretariat',
]

export type EmailRole = 'hr' | 'specific' | 'general' | 'sales' | 'unknown'

export type ScrapedKarriere = {
  karriere_url: string | null
  best_email: string | null
  best_email_role: EmailRole | null
  jobs: { title: string; description: string | null; url: string | null }[]
}

export async function scrapeKarriere(websiteUrl: string): Promise<ScrapedKarriere> {
  const empty: ScrapedKarriere = {
    karriere_url: null,
    best_email: null,
    best_email_role: null,
    jobs: [],
  }
  if (!websiteUrl) return empty

  let normalized: URL
  try {
    normalized = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`)
  } catch {
    return empty
  }

  // Step 1: fetch homepage to discover karriere link
  let homeHtml = ''
  try {
    const res = await fetch(normalized.toString(), {
      headers: { 'User-Agent': UA, Accept: 'text/html' },
      redirect: 'follow',
      signal: AbortSignal.timeout(8_000),
    })
    if (res.ok) homeHtml = await res.text()
  } catch {
    return empty
  }

  const karriereUrl = findKarriereLink(homeHtml, normalized)

  // Step 2: fetch karriere page if found, else use homepage as the source
  let pageHtml = homeHtml
  let pageUrl = normalized.toString()
  if (karriereUrl) {
    try {
      const res = await fetch(karriereUrl, {
        headers: { 'User-Agent': UA, Accept: 'text/html' },
        redirect: 'follow',
        signal: AbortSignal.timeout(8_000),
      })
      if (res.ok) {
        pageHtml = await res.text()
        pageUrl = res.url
      }
    } catch {
      // fall through to using homepage
    }
  }

  const decoded = decodeEmails(pageHtml)
  const best = pickBestEmail(decoded, normalized.hostname)

  return {
    karriere_url: karriereUrl,
    best_email: best?.email ?? null,
    best_email_role: best?.role ?? null,
    jobs: extractJobs(pageHtml, pageUrl),
  }
}

function findKarriereLink(html: string, base: URL): string | null {
  const matches = Array.from(html.matchAll(KARRIERE_LINK_RE))
  for (const m of matches) {
    const href = m[1]
    if (!href) continue
    try {
      const abs = new URL(href, base).toString()
      // Stay on same host (avoid leaving for ATS portals — those are dead ends for email)
      if (new URL(abs).hostname.replace(/^www\./, '') !== base.hostname.replace(/^www\./, '')) continue
      return abs
    } catch {
      continue
    }
  }
  return null
}

function decodeEmails(html: string): string {
  return html
    .replace(/&#0*64;/g, '@')
    .replace(/&#x40;/gi, '@')
    .replace(/&amp;/g, '&')
    .replace(/\s\(at\)\s/gi, '@')
    .replace(/\s\[at\]\s/gi, '@')
    .replace(/&#46;/g, '.')
}

function pickBestEmail(html: string, hostname: string): { email: string; role: EmailRole } | null {
  const all = Array.from(new Set((html.match(EMAIL_RE) ?? []).map((e) => e.toLowerCase())))
    .filter((e) => {
      const dom = e.split('@')[1]
      return dom && !SKIP_DOMAINS.has(dom) && !dom.endsWith('.png') && !dom.endsWith('.jpg')
    })

  // Strong preference: emails that share the company's domain
  const ownDomain = hostname.replace(/^www\./, '')
  const ownDomainEmails = all.filter((e) => e.endsWith(`@${ownDomain}`) || e.endsWith(`.${ownDomain}`))
  const pool = ownDomainEmails.length ? ownDomainEmails : all
  if (!pool.length) return null

  // Score each by role
  let best: { email: string; role: EmailRole; score: number } | null = null
  for (const email of pool) {
    const local = email.split('@')[0]
    const role = classifyRole(local)
    const score = scoreFor(role)
    if (!best || score > best.score) best = { email, role, score }
  }
  return best ? { email: best.email, role: best.role } : null
}

function classifyRole(local: string): EmailRole {
  const l = local.toLowerCase()
  for (const p of HR_LOCAL_PARTS) if (l.includes(p)) return 'hr'
  for (const p of SALES_LOCAL_PARTS) if (l === p || l.startsWith(`${p}.`)) return 'sales'
  for (const p of GENERAL_LOCAL_PARTS) if (l === p) return 'general'
  // Pattern looks like a person (firstname.lastname or initials)
  if (/^[a-z]+\.[a-z]+$/.test(l) || /^[a-z]\.[a-z]+$/.test(l)) return 'specific'
  return 'unknown'
}

function scoreFor(role: EmailRole): number {
  switch (role) {
    case 'hr':       return 100
    case 'specific': return 80   // person-like, may be HR but uncertain
    case 'general':  return 40
    case 'unknown':  return 30
    case 'sales':    return 0
  }
}

function extractJobs(html: string, baseUrl: string): { title: string; description: string | null; url: string | null }[] {
  const jobs: { title: string; description: string | null; url: string | null }[] = []
  // Heuristic: <h2>/<h3> tags with text length 5-90 followed by some descriptive text
  const titleRe = /<(h[123])[^>]*>([^<]{5,90})<\/\1>/g
  const matches = Array.from(html.matchAll(titleRe))
  for (const m of matches.slice(0, 40)) {
    const raw = m[2].trim().replace(/\s+/g, ' ')
    if (looksLikeJobTitle(raw)) {
      // Pull ~300 chars of context after the heading as a description
      const after = html.slice(m.index! + m[0].length, m.index! + m[0].length + 800)
      const desc = stripTags(after).slice(0, 280).trim() || null
      jobs.push({ title: raw, description: desc, url: baseUrl })
    }
  }
  // Dedupe by title
  const seen = new Set<string>()
  return jobs.filter((j) => {
    const key = j.title.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const JOB_KEYWORDS = [
  'mitarbeiter', 'mitarbeiterin', 'koch', 'köchin', 'fahrer', 'fahrerin',
  'kellner', 'kellnerin', 'service', 'rezeption', 'verkauf', 'verkäufer',
  'verkäuferin', 'logistik', 'logistiker', 'logistikerin', 'lager',
  'lagerist', 'reinigung', 'reinigungskraft', 'pflege', 'pflegerin',
  'hauswart', 'hauswartin', 'monteur', 'mechaniker', 'baecker', 'bäcker',
  'metzger', 'sachbearbeiter', 'buchhalter', 'praktikant',
  'm/w/d', 'm/w', 'w/m', '%', 'lehrstelle', 'lehre', 'apprentice',
  'commerce', 'employé', 'employee',
]

function looksLikeJobTitle(s: string): boolean {
  const lower = s.toLowerCase()
  return JOB_KEYWORDS.some((k) => lower.includes(k))
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
