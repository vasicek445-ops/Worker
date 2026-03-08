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
