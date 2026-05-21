import { NextRequest, NextResponse } from 'next/server'
import { extractEmails } from '@/lib/jobs/extract-email'

// POST/GET /api/admin/source-audit
// Auth: Bearer CRON_SECRET
//
// Otestuje 5-6 CH niche job boardu — kolik % jejich nabidek ma directly
// extractovatelny kontaktni email z detail page. Vysledek = data-driven
// rozhodnuti zda Apify ($/m) nebo vlastni scraper (dev work, 0 cost).
//
// Per source:
//   1. Fetch list page
//   2. Parse first 20 detail page URLs (regex href extraction)
//   3. Pro kazdy: fetch detail HTML, strip tags, extract emails
//   4. Spocti withEmail vs total
//   5. Return sample emails (pro inspekci ze nejde o false positives)
//
// Runtime: ~30-90s celkem (300ms x 20 x 6 sources + list fetches).

export const maxDuration = 300

interface SourceConfig {
  name: string
  listUrl: string
  // Regex pro href extraction z list page. Match group 1 = relative path nebo full URL.
  linkRegex: RegExp
  // Pokud linkRegex vraci relativni path, pridame tento prefix.
  detailUrlPrefix?: string
  // Max kolik detail pages fetchnout. Default 20.
  sampleSize?: number
  description: string
}

const SOURCES: SourceConfig[] = [
  {
    name: 'gastrojob',
    listUrl: 'https://www.gastrojob.ch/de/stellen',
    linkRegex: /href="(\/de\/stellen\/[a-z0-9-]+\/[0-9]+)"/gi,
    detailUrlPrefix: 'https://www.gastrojob.ch',
    sampleSize: 20,
    description: 'Gastronomie + HoReCa CH (cilovka: kuchari, ciselnici, recepcni)',
  },
  {
    name: 'logistik24',
    listUrl: 'https://www.logistik24.ch/stellenmarkt',
    linkRegex: /href="(https?:\/\/(?:www\.)?logistik24\.ch\/job\/[^"]+)"/gi,
    sampleSize: 20,
    description: 'Logistika + sklad CH (cilovka: skladniky, manipulanty, ridici VZV)',
  },
  {
    name: 'lokal',
    listUrl: 'https://www.lokal.ch/de/jobs',
    linkRegex: /href="(\/de\/jobs\/[a-z0-9-]+\/[0-9]+)"/gi,
    detailUrlPrefix: 'https://www.lokal.ch',
    sampleSize: 20,
    description: 'Lokalni nabidky CH (mensi firmy, casto direct email)',
  },
  {
    name: 'ostschweizerjobs',
    listUrl: 'https://www.ostschweizerjobs.ch/jobs',
    linkRegex: /href="(https?:\/\/(?:www\.)?ostschweizerjobs\.ch\/jobs\/[^"]+)"/gi,
    sampleSize: 20,
    description: 'Vychodni Svycarsko (SG, TG, AR, AI, GR)',
  },
  {
    name: 'jobwinner',
    listUrl: 'https://www.jobwinner.ch/de/jobs.html',
    linkRegex: /href="(\/de\/job\/[^"]+\.html)"/gi,
    detailUrlPrefix: 'https://www.jobwinner.ch',
    sampleSize: 20,
    description: 'Generic CH job board s mensim trafficem nez jobs.ch',
  },
  {
    name: 'arbeitsplatz',
    listUrl: 'https://www.arbeitsplatz.ch/de/jobs',
    linkRegex: /href="(\/de\/jobs\/[^"]+)"/gi,
    detailUrlPrefix: 'https://www.arbeitsplatz.ch',
    sampleSize: 20,
    description: 'Generic CH board',
  },
]

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

interface SourceAudit {
  source: string
  description: string
  list_url: string
  list_status: 'ok' | 'fetch_failed' | 'no_links_found'
  total_sampled: number
  with_email: number
  pct: number
  sample_emails: string[]      // prvni 5 nalezenych pro inspekci
  duration_ms: number
  errors: number
  http_status?: number
}

async function auditSource(cfg: SourceConfig): Promise<SourceAudit> {
  const start = Date.now()
  const sampleSize = cfg.sampleSize ?? 20

  const result: SourceAudit = {
    source: cfg.name,
    description: cfg.description,
    list_url: cfg.listUrl,
    list_status: 'ok',
    total_sampled: 0,
    with_email: 0,
    pct: 0,
    sample_emails: [],
    duration_ms: 0,
    errors: 0,
  }

  // 1. Fetch list page
  let listHtml = ''
  try {
    const res = await fetch(cfg.listUrl, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      signal: AbortSignal.timeout(15_000),
    })
    result.http_status = res.status
    if (!res.ok) {
      result.list_status = 'fetch_failed'
      result.duration_ms = Date.now() - start
      return result
    }
    listHtml = await res.text()
  } catch {
    result.list_status = 'fetch_failed'
    result.duration_ms = Date.now() - start
    return result
  }

  // 2. Parse detail URLs
  const urls = new Set<string>()
  let m: RegExpExecArray | null
  cfg.linkRegex.lastIndex = 0
  while ((m = cfg.linkRegex.exec(listHtml)) !== null && urls.size < sampleSize) {
    let url = m[1]
    if (cfg.detailUrlPrefix && url.startsWith('/')) url = cfg.detailUrlPrefix + url
    urls.add(url)
  }

  if (urls.size === 0) {
    result.list_status = 'no_links_found'
    result.duration_ms = Date.now() - start
    return result
  }

  // 3. Fetch detail pages + extract emails
  const foundEmails = new Set<string>()
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) {
        result.errors++
      } else {
        const html = await res.text()
        const text = stripHtml(html)
        const emails = extractEmails(text)
        result.total_sampled++
        if (emails.length > 0) {
          result.with_email++
          for (const e of emails.slice(0, 2)) foundEmails.add(e)
        }
      }
    } catch {
      result.errors++
    }
    // Rate-limit 200ms
    await new Promise((r) => setTimeout(r, 200))
  }

  result.pct = result.total_sampled > 0
    ? Math.round((result.with_email / result.total_sampled) * 1000) / 10
    : 0
  result.sample_emails = Array.from(foundEmails).slice(0, 5)
  result.duration_ms = Date.now() - start
  return result
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const start = Date.now()
  const audits: SourceAudit[] = []

  // Sources prochazime paralelne aby celkem trvalo ~30-60s misto 300s
  const promises = SOURCES.map((s) => auditSource(s).catch((e) => ({
    source: s.name,
    description: s.description,
    list_url: s.listUrl,
    list_status: 'fetch_failed' as const,
    total_sampled: 0,
    with_email: 0,
    pct: 0,
    sample_emails: [],
    duration_ms: 0,
    errors: 1,
    error_message: e instanceof Error ? e.message : 'unknown',
  })))

  const settled = await Promise.allSettled(promises)
  for (const s of settled) {
    if (s.status === 'fulfilled') audits.push(s.value)
  }

  // Sort by pct descending — nejvic mailovi nahore
  audits.sort((a, b) => b.pct - a.pct)

  return NextResponse.json({
    total_duration_ms: Date.now() - start,
    sources_tested: audits.length,
    audits,
    recommendation: pickRecommendation(audits),
    note: 'pct = % nabidek s primym kontaktnim emailem v detail page. >= 30% = stoji za vlastni scraper. >= 50% = silny kandidat na produkci.',
  })
}

function pickRecommendation(audits: SourceAudit[]): string {
  const winners = audits.filter((a) => a.pct >= 30 && a.total_sampled > 0)
  if (winners.length === 0) {
    return 'Zadny ze zdroju nema dostatek emailu (>=30%). Zvaz Apify s rotating IP nebo manualni research jinych zdroju.'
  }
  const top = winners.slice(0, 3).map((w) => `${w.source} (${w.pct}%)`).join(', ')
  return `Top 3 zdroje pro vlastni scraper: ${top}. Postavit detail-page fetch podle vzoru existing jobs.ch fetcheru, ulozit jen jobs s emailem.`
}
