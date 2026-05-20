import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// Apify actor borderline/indeed-scraper — modré límečky z Indeed do feedu Wokeru.
// Cena: $5 / 1 000 nabídek. Apify free = $5/měs. Týdenní běh ~150 nabídek ≈ $3,2/měs.
const ACTOR = 'borderline~indeed-scraper'
const MAX_ROWS_PER_QUERY = 25
const TIME_BUDGET_MS = 230_000

// Německé výrazy pro manuální profese (jádro Wokeru). 1 dotaz = 1 actor run.
const QUERIES = [
  'Lagermitarbeiter',
  'Produktionsmitarbeiter',
  'Bauarbeiter',
  'Küchenhilfe',
  'Reinigungskraft',
  'Servicemitarbeiter',
]

const SWISS_CANTONS = new Set([
  'ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'FR', 'SO', 'BS', 'BL',
  'SH', 'AR', 'AI', 'SG', 'GR', 'AG', 'TG', 'TI', 'VD', 'VS', 'NE', 'GE', 'JU',
])

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Gastronomie': ['koch', 'küche', 'gastro', 'restaurant', 'hotel', 'kellner', 'barista'],
  'Logistika': ['lager', 'logist', 'warehouse', 'transport', 'fahrer', 'chauffeur', 'stapler'],
  'Stavebnictví': ['bau', 'maurer', 'zimmermann', 'schreiner', 'maler', 'gerüst'],
  'Výroba': ['produktion', 'montage', 'monteur', 'fabrik', 'maschinen'],
  'Úklid': ['reinig', 'putz', 'hauswart', 'facility'],
  'Elektro / Technik': ['elektr', 'techniker', 'installat', 'sanitär', 'mechani'],
}

// Indeed adresa "1541 Sévaz, FR" — kanton je poslední část za čárkou.
function detectCanton(formattedAddress: string): string | null {
  const parts = formattedAddress.split(',')
  const tail = parts[parts.length - 1]?.trim().toUpperCase()
  return tail && SWISS_CANTONS.has(tail) ? tail : null
}

function detectCategory(title: string): string | null {
  const lower = title.toLowerCase()
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some((kw) => lower.includes(kw))) return cat
  }
  return null
}

function mapJobType(jobType: unknown): string {
  const raw = Array.isArray(jobType) ? String(jobType[0] || '') : String(jobType || '')
  const l = raw.toLowerCase()
  if (l.includes('part')) return 'Part-time'
  if (l.includes('temp') || l.includes('contract') || l.includes('befrist')) return 'Temporary'
  return 'Full-time'
}

function extractSalary(salary: unknown): string | null {
  if (!salary || typeof salary !== 'object') return null
  const s = salary as Record<string, unknown>
  if (typeof s.salaryText === 'string' && s.salaryText.trim()) return s.salaryText.trim()
  if (s.salaryMin || s.salaryMax) {
    const cur = typeof s.salaryCurrency === 'string' ? s.salaryCurrency : 'CHF'
    return `${cur} ${s.salaryMin || '?'} - ${s.salaryMax || '?'}`
  }
  return null
}

// Kontaktní e-maily, které actor vytáhl z inzerátu. null = Vrstva 2 musí dohledat.
function extractEmails(emails: unknown): string[] | null {
  if (!Array.isArray(emails)) return null
  const clean = [
    ...new Set(
      emails
        .filter((e): e is string => typeof e === 'string')
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.includes('@') && e.length <= 200),
    ),
  ]
  return clean.length ? clean : null
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = process.env.APIFY_TOKEN
    if (!token) {
      return NextResponse.json({ error: 'APIFY_TOKEN not configured' }, { status: 503 })
    }

    // ?limit=N — méně dotazů; ?maxRows=N — méně nabídek na dotaz. Pro levný test.
    const limitParam = Number(req.nextUrl.searchParams.get('limit'))
    const limit = limitParam > 0 ? Math.min(limitParam, QUERIES.length) : QUERIES.length
    const maxRowsParam = Number(req.nextUrl.searchParams.get('maxRows'))
    const maxRows = maxRowsParam > 0 ? Math.min(maxRowsParam, MAX_ROWS_PER_QUERY) : MAX_ROWS_PER_QUERY

    const start = Date.now()
    let added = 0
    let skipped = 0
    let withEmail = 0
    let queriesRun = 0
    const seen = new Set<string>()

    for (const query of QUERIES) {
      if (queriesRun >= limit) break
      if (Date.now() - start > TIME_BUDGET_MS) break
      queriesRun++

      try {
        const res = await fetch(
          `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${token}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query,
              country: 'ch',
              sort: 'date',
              fromDays: '7',
              maxRows,
            }),
            signal: AbortSignal.timeout(140000),
          },
        )

        if (!res.ok) {
          console.error(`indeed/apify "${query}": HTTP ${res.status}`)
          continue
        }

        const items = await res.json()
        if (!Array.isArray(items)) continue

        for (const job of items) {
          if (job.expired) {
            skipped++
            continue
          }
          const externalId = String(job.jobKey || '').trim()
          const title = String(job.title || '').trim()
          const company = String(job.companyName || '').trim()
          if (!externalId || !title || !company) {
            skipped++
            continue
          }
          if (seen.has(externalId)) continue
          seen.add(externalId)

          const loc = (job.location && typeof job.location === 'object' ? job.location : {}) as Record<string, unknown>
          const formatted =
            String(loc.formattedAddressLong || loc.formattedAddressShort || loc.city || '').trim() ||
            'Switzerland'

          let postedAt: string | null = null
          if (job.datePublished) {
            try {
              postedAt = new Date(job.datePublished).toISOString()
            } catch {}
          }

          const contactEmails = extractEmails(job.emails)

          try {
            await supabaseAdmin.from('jobs').upsert(
              {
                external_id: externalId,
                source: 'indeed',
                title,
                company,
                location: formatted,
                canton: detectCanton(formatted),
                description: String(job.descriptionText || '').slice(0, 3000),
                salary_text: extractSalary(job.salary),
                job_type: mapJobType(job.jobType),
                category: detectCategory(title),
                url: String(job.jobUrl || `https://ch.indeed.com/viewjob?jk=${externalId}`),
                remote: !!job.isRemote,
                posted_at: postedAt,
                contact_emails: contactEmails,
              },
              { onConflict: 'source,external_id' },
            )
            added++
            if (contactEmails) withEmail++
          } catch {
            skipped++
          }
        }
      } catch (err) {
        console.error(`indeed/apify "${query}" error:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      source: 'indeed',
      queriesRun,
      added,
      withEmail,
      skipped,
      unique: seen.size,
      elapsedMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'unknown error'
    console.error('scrape-indeed error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
