import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SWISS_LOCATIONS = [
  "zurich", "zürich", "bern", "basel", "geneva", "genève", "lausanne",
  "lucerne", "luzern", "winterthur", "st. gallen", "lugano", "biel",
  "thun", "zug", "switzerland", "schweiz", "suisse", "aarau", "baden",
  "schaffhausen", "chur", "solothurn", "olten", "fribourg", "sion",
  "neuchâtel", "neuchatel", "nyon", "montreux",
]

const CITY_TO_CANTON: Record<string, string> = {
  "zurich": "ZH", "zürich": "ZH", "winterthur": "ZH",
  "bern": "BE", "thun": "BE", "biel": "BE",
  "basel": "BS", "lucerne": "LU", "luzern": "LU",
  "geneva": "GE", "genève": "GE", "lausanne": "VD", "nyon": "VD", "montreux": "VD",
  "lugano": "TI", "zug": "ZG", "st. gallen": "SG",
  "aarau": "AG", "baden": "AG", "schaffhausen": "SH", "chur": "GR",
  "solothurn": "SO", "olten": "SO", "fribourg": "FR",
  "sion": "VS", "neuchâtel": "NE", "neuchatel": "NE",
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "IT / Software": ["software", "developer", "engineer", "devops", "frontend", "backend", "python", "java", "react", "data", "cloud"],
  "Stavebnictví": ["bau", "construct", "maurer", "zimmermann", "schreiner", "maler", "architect"],
  "Gastronomie": ["koch", "cook", "chef", "küche", "gastro", "restaurant", "hotel", "kellner"],
  "Zdravotnictví": ["nurse", "pflege", "arzt", "doctor", "medizin", "pharma", "kranken"],
  "Logistika": ["logist", "lager", "warehouse", "transport", "fahrer", "driver", "chauffeur"],
  "Elektro / Technik": ["elektr", "mechani", "techniker", "monteur", "installat", "sanitär"],
  "Finance": ["financ", "account", "buchhal", "treuhänd", "audit", "bank"],
  "Marketing / Sales": ["market", "sales", "verkauf", "vertrieb", "business develop"],
}

function detectCanton(location: string): string | null {
  const loc = location.toLowerCase()
  for (const [city, canton] of Object.entries(CITY_TO_CANTON)) {
    if (loc.includes(city)) return canton
  }
  return null
}

function detectCategory(title: string): string | null {
  const lower = title.toLowerCase()
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return cat
    }
  }
  return null
}

function cleanHtml(text: string): string {
  if (!text) return ''
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 2000)
}

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let added = 0
    let skipped = 0

    // 1. Fetch from arbeitnow
    try {
      const res = await fetch('https://arbeitnow.com/api/job-board-api', {
        signal: AbortSignal.timeout(30000),
      })
      const data = await res.json()
      const allJobs = data.data || []

      for (const job of allJobs) {
        const location = job.location || ''
        if (!SWISS_LOCATIONS.some(city => location.toLowerCase().includes(city))) continue

        const title = (job.title || '').trim()
        const company = (job.company_name || '').trim()
        if (!title || !company) continue

        const slug = job.slug || `${title}-${company}`.toLowerCase().replace(/\s+/g, '-').substring(0, 100)

        let postedAt = null
        if (job.created_at) {
          try { postedAt = new Date(job.created_at * 1000).toISOString() } catch {}
        }

        try {
          await supabaseAdmin.from('jobs').upsert({
            external_id: slug,
            source: 'arbeitnow',
            title,
            company,
            location,
            canton: detectCanton(location),
            description: cleanHtml(job.description || ''),
            job_type: 'Full-time',
            category: detectCategory(title),
            url: job.url || '',
            tags: (job.tags || []).slice(0, 10),
            remote: job.remote || false,
            posted_at: postedAt,
          }, { onConflict: 'source,external_id' })
          added++
        } catch {
          skipped++
        }
      }
    } catch (err) {
      console.error('Arbeitnow error:', err)
    }

    // 2. Fetch from Jooble (if API key is set)
    const joobleKey = process.env.JOOBLE_API_KEY
    if (joobleKey) {
      const keywords = ['', 'Bauarbeiter', 'Koch', 'Elektriker', 'Software']
      const seen = new Set<string>()

      for (const keyword of keywords) {
        try {
          const res = await fetch(`https://jooble.org/api/${joobleKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keywords: keyword, location: 'Switzerland', page: 1 }),
            signal: AbortSignal.timeout(15000),
          })
          const data = await res.json()

          for (const job of (data.jobs || [])) {
            const link = job.link || ''
            if (seen.has(link)) continue
            seen.add(link)

            const title = (job.title || '').trim()
            const company = (job.company || '').trim()
            if (!title || !company) continue

            const externalId = link.split('/').pop()?.substring(0, 100) || `${title}-${company}`.toLowerCase().replace(/\s+/g, '-').substring(0, 100)

            let postedAt = null
            if (job.updated) {
              try { postedAt = new Date(job.updated).toISOString() } catch {}
            }

            try {
              await supabaseAdmin.from('jobs').upsert({
                external_id: externalId,
                source: 'jooble',
                title,
                company,
                location: job.location || 'Switzerland',
                canton: detectCanton(job.location || ''),
                description: cleanHtml(job.snippet || ''),
                salary_text: job.salary || null,
                job_type: job.type || 'Full-time',
                category: detectCategory(title),
                url: link,
                remote: false,
                posted_at: postedAt,
              }, { onConflict: 'source,external_id' })
              added++
            } catch {
              skipped++
            }
          }
        } catch (err) {
          console.error(`Jooble error for "${keyword}":`, err)
        }
      }
    }

    // 3. Fetch from Michael Page Switzerland
    try {
      const mpStats = await fetchMichaelPage()
      added += mpStats.added
      skipped += mpStats.skipped
      console.log(`Michael Page: +${mpStats.added} jobs`)
    } catch (err) {
      console.error('Michael Page error:', err)
    }

    // 4. Fetch from Robert Half Switzerland
    try {
      const rhStats = await fetchRobertHalf()
      added += rhStats.added
      skipped += rhStats.skipped
      console.log(`Robert Half: +${rhStats.added} jobs`)
    } catch (err) {
      console.error('Robert Half error:', err)
    }

    return NextResponse.json({
      success: true,
      added,
      skipped,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Scrape cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ─── Michael Page Switzerland Scraper ───

async function fetchMichaelPage(): Promise<{ added: number; skipped: number }> {
  let added = 0
  let skipped = 0
  const maxPages = 16 // ~465 jobs / 30 per page

  for (let page = 0; page < maxPages; page++) {
    try {
      const res = await fetch(`https://www.michaelpage.ch/jobs?page=${page}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WokerBot/1.0)',
          'Accept': 'text/html',
        },
        signal: AbortSignal.timeout(15000),
      })

      if (!res.ok) break
      const html = await res.text()

      // Extract job listings from Drupal HTML
      // Pattern: /job-detail/[slug]/ref/[ref-id] with title in surrounding <a> or <h3>
      const jobPattern = /<a[^>]*href="(\/(?:de|fr|en)?\/?\/?job-detail\/[^"]+\/ref\/(jn-[^"]+))"[^>]*>([^<]+)<\/a>/gi
      let match
      const pageJobs: Array<{ title: string; url: string; refId: string }> = []
      const seenRefs = new Set<string>()

      while ((match = jobPattern.exec(html)) !== null) {
        const [, url, refId, title] = match
        const cleanTitle = title.trim()
        if (!cleanTitle || cleanTitle.length < 3 || seenRefs.has(refId)) continue
        seenRefs.add(refId)
        pageJobs.push({ title: cleanTitle, url, refId })
      }

      if (pageJobs.length === 0) break // No more results

      // Extract location info - look for common Swiss locations in surrounding context
      // Also detect job type from "Permanent" or "Interim" badges
      for (const job of pageJobs) {
        // Detect location from URL slug or title
        const location = detectMichaelPageLocation(html, job.url) || 'Switzerland'
        const jobType = html.includes(`${job.refId}`) && html.includes('Interim') ? 'Interim' : 'Permanent'

        try {
          await supabaseAdmin.from('jobs').upsert({
            external_id: job.refId,
            source: 'michaelpage',
            title: job.title,
            company: 'Michael Page',
            location,
            canton: detectCanton(location),
            description: '',
            job_type: jobType === 'Interim' ? 'Temporary' : 'Full-time',
            category: detectCategory(job.title),
            url: `https://www.michaelpage.ch${job.url}`,
            remote: false,
            posted_at: extractDateFromRef(job.refId),
          }, { onConflict: 'source,external_id' })
          added++
        } catch {
          skipped++
        }
      }
    } catch (err) {
      console.error(`Michael Page page ${page} error:`, err)
      break
    }
  }

  return { added, skipped }
}

function detectMichaelPageLocation(html: string, jobUrl: string): string | null {
  // Try to find location from nearby HTML context
  // The URL slug often contains the location, e.g., "sales-manager-saas-immobilien"
  // But we also look in the HTML around the job link
  const urlIndex = html.indexOf(jobUrl)
  if (urlIndex === -1) return null

  // Look in a window around the job URL for Swiss city names
  const context = html.substring(Math.max(0, urlIndex - 500), Math.min(html.length, urlIndex + 1000))

  // Check for common patterns like "Geneva", "Zürich", "Lausanne" etc.
  const locationPatterns = [
    { pattern: /Geneva|Genève|Geneve/i, city: 'Geneva' },
    { pattern: /Zürich|Zurich/i, city: 'Zürich' },
    { pattern: /Lausanne/i, city: 'Lausanne' },
    { pattern: /Bern(?:e)?(?:\s|,|<)/i, city: 'Bern' },
    { pattern: /Basel/i, city: 'Basel' },
    { pattern: /Zug(?:\s|,|<)/i, city: 'Zug' },
    { pattern: /Lugano/i, city: 'Lugano' },
    { pattern: /Nyon/i, city: 'Nyon' },
    { pattern: /Neuchâtel|Neuchatel/i, city: 'Neuchâtel' },
    { pattern: /Vaud/i, city: 'Vaud' },
    { pattern: /Winterthur/i, city: 'Winterthur' },
    { pattern: /Baar/i, city: 'Baar' },
    { pattern: /Fribourg/i, city: 'Fribourg' },
    { pattern: /Yverdon/i, city: 'Yverdon' },
    { pattern: /Vevey/i, city: 'Vevey' },
    { pattern: /Montreux/i, city: 'Montreux' },
    { pattern: /Meyrin/i, city: 'Meyrin' },
    { pattern: /St\.?\s?Gallen/i, city: 'St. Gallen' },
    { pattern: /Solothurn/i, city: 'Solothurn' },
    { pattern: /Luzern|Lucerne/i, city: 'Luzern' },
  ]

  for (const { pattern, city } of locationPatterns) {
    if (pattern.test(context)) return city
  }

  return null
}

function extractDateFromRef(refId: string): string | null {
  // Reference format: jn-MMYYYY-NNNNNNN, e.g., jn-032026-6965331
  const match = refId.match(/jn-(\d{2})(\d{4})-/)
  if (!match) return null
  const [, month, year] = match
  try {
    return new Date(`${year}-${month}-01`).toISOString()
  } catch {
    return null
  }
}

// ─── Robert Half Switzerland Scraper ───

async function fetchRobertHalf(): Promise<{ added: number; skipped: number }> {
  let added = 0
  let skipped = 0

  try {
    const res = await fetch('https://www.roberthalf.com/ch/en/jobs', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WokerBot/1.0)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(20000),
    })

    if (!res.ok) return { added, skipped }
    const html = await res.text()

    // Extract JSON from: initialResults = JSON.parse('...')
    const jsonParseMatch = html.match(/initialResults\s*=\s*JSON\.parse\('(.+?)'\)/)
    if (!jsonParseMatch) {
      console.error('Robert Half: initialResults not found in HTML')
      return { added, skipped }
    }

    try {
      // Decode \xNN and \uNNNN escape sequences
      const raw = jsonParseMatch[1]
      const decoded = raw.replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, '\\')

      const data = JSON.parse(decoded)
      const jobs = data?.data?.jobs || []

      for (const job of jobs) {
        const result = await upsertRobertHalfJob(job)
        if (result) added++; else skipped++
      }
    } catch (parseErr) {
      console.error('Robert Half JSON parse error:', parseErr)
    }
  } catch (err) {
    console.error('Robert Half fetch error:', err)
  }

  return { added, skipped }
}

async function upsertRobertHalfJob(job: any): Promise<boolean> {
  const title = (job.jobtitle || job.title || '').trim()
  const city = (job.city || job.location || '').trim()
  const jobId = job.google_job_id || job.unique_job_number || job.job_id || ''
  if (!title || !jobId) return false

  const empType = (job.emptype || job.employment_type || '').toLowerCase()
  let jobType = 'Full-time'
  if (empType.includes('temp') || empType.includes('contract')) jobType = 'Temporary'

  let postedAt = null
  if (job.date_posted) {
    try { postedAt = new Date(job.date_posted).toISOString() } catch {}
  }

  const salaryMin = job.payrate_min ? parseInt(job.payrate_min) : null
  const salaryMax = job.payrate_max ? parseInt(job.payrate_max) : null

  const description = cleanHtml(job.description || '')
  const url = job.job_detail_url
    ? (job.job_detail_url.startsWith('http') ? job.job_detail_url : `https://www.roberthalf.com${job.job_detail_url}`)
    : ''

  try {
    await supabaseAdmin.from('jobs').upsert({
      external_id: String(jobId),
      source: 'roberthalf',
      title,
      company: 'Robert Half',
      location: city || 'Switzerland',
      canton: detectCanton(city || ''),
      description,
      salary_min: salaryMin && salaryMin > 1000 ? salaryMin : null,
      salary_max: salaryMax && salaryMax > 1000 ? salaryMax : null,
      salary_text: (salaryMin || salaryMax) ? `${job.salary_currency || 'CHF'} ${salaryMin || '?'} - ${salaryMax || '?'}` : null,
      job_type: jobType,
      category: detectCategory(title),
      url,
      remote: (job.remote || '').toLowerCase().includes('remote'),
      posted_at: postedAt,
    }, { onConflict: 'source,external_id' })
    return true
  } catch {
    return false
  }
}
