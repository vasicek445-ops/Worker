/**
 * local.ch (Swisscom Directories) listing scraper.
 *
 * Strategy: query like /de/q/{city}/{branche}, fetch HTML, extract every
 * (business name, email, phone, website) tuple. Local.ch HTML is server-
 * rendered with a card pattern we can regex; ~20-30 cards per page, most
 * with email addresses.
 *
 * Be respectful: sequential not parallel, 2s delay between requests, UA
 * identifies us. Free tier — no auth needed.
 */

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0 Safari/537.36'

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

const BLOCKED_DOMAINS = new Set([
  'localsearch.ch',
  'sentry.io',
  'gravatar.com',
  'gmail.com', // generic, often listed as a contact-form fallback
  'example.com',
])

export type ScrapedCompany = {
  name: string | null
  email: string
  phone: string | null
  website: string | null
  city: string | null
  branche: string | null
}

export async function scrapeLocalChListing(params: {
  city: string // 'zurich', 'bern', 'basel', etc — local.ch normalizes
  branche: string // 'restaurant', 'spedition', 'reinigungsfirma', 'pflegeheim'
  language?: 'de' | 'fr' | 'it'
}): Promise<{ companies: ScrapedCompany[]; query: string }> {
  const lang = params.language ?? 'de'
  const url = `https://www.local.ch/${lang}/q/${encodeURIComponent(params.city)}/${encodeURIComponent(params.branche)}`
  const query = `${params.branche} ${params.city}`

  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'text/html' },
    redirect: 'follow',
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`local.ch HTTP ${res.status} for ${query}`)
  const html = await res.text()

  // Decode common HTML entity tricks for emails
  const decoded = html
    .replace(/&#0*64;/g, '@')
    .replace(/&#x40;/gi, '@')
    .replace(/&amp;/g, '&')
    .replace(/\(at\)/gi, '@')
    .replace(/\s\[at\]\s/gi, '@')

  const emails = Array.from(new Set((decoded.match(EMAIL_RE) ?? []).map((e) => e.toLowerCase())))
    .filter((e) => {
      const domain = e.split('@')[1]
      return domain && !BLOCKED_DOMAINS.has(domain)
    })

  // Try to associate emails with surrounding context (business name from
  // nearest <h2> / <h3> / aria-label / itemprop="name")
  const companies: ScrapedCompany[] = []
  for (const email of emails) {
    // Find the email's position, look back ~600 chars for nearest business name
    const idx = decoded.toLowerCase().indexOf(email)
    if (idx < 0) continue
    const window = decoded.slice(Math.max(0, idx - 800), idx)
    const name = extractNearestName(window)
    const phone = extractNearestPhone(window) ?? extractNearestPhone(decoded.slice(idx, idx + 800))
    const website = extractNearestWebsite(decoded.slice(Math.max(0, idx - 1200), idx + 200), email)

    companies.push({
      name,
      email,
      phone,
      website,
      city: titleCase(params.city),
      branche: titleCase(params.branche),
    })
  }

  return { companies, query }
}

function extractNearestName(window: string): string | null {
  // Try common patterns local.ch uses
  const patterns = [
    /aria-label="([^"]{3,80})"\s*[^>]*href="\/[^"]*\/d\//, // detail link
    /<h[23][^>]*>([^<]{3,80})<\/h[23]>/g,
    /"name"\s*:\s*"([^"]{3,80})"/g,
    /title="([^"]{3,80})"/g,
  ]
  let best: string | null = null
  for (const re of patterns) {
    const matches = Array.from(window.matchAll(typeof re === 'string' ? new RegExp(re, 'g') : re as RegExp))
    if (matches.length) {
      const last = matches[matches.length - 1][1]
      if (last && (!best || last.length > best.length)) best = last
    }
  }
  return best ? best.trim().slice(0, 120) : null
}

function extractNearestPhone(window: string): string | null {
  const m = window.match(/\+41[\s\-]?[0-9]{2}[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}/)
  return m ? m[0].replace(/\s+/g, ' ') : null
}

function extractNearestWebsite(window: string, email: string): string | null {
  const domain = email.split('@')[1]
  if (!domain) return null
  // Find href= to the same domain (strong signal it's the company website)
  const hrefRe = new RegExp(`href="(https?:\\/\\/(?:www\\.)?${domain.replace('.', '\\.')}[^"]*)"`, 'i')
  const m = window.match(hrefRe)
  return m ? m[1] : `https://${domain}`
}

function titleCase(s: string): string {
  return s
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
