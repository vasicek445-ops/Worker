import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractEmails, preferredEmail } from '@/lib/jobs/extract-email'
import { callOpenAI } from '@/lib/openai'

// POST /api/admin/extract-missing-emails?limit=N&source=...
// Auth: Bearer CRON_SECRET
//
// Batch dohleduje kontaktní emaily pro jobs, ktere zatim contact_emails NEMAJI:
//   1. SELECT jobs WHERE contact_emails IS NULL AND url IS NOT NULL LIMIT N
//   2. Per job: fetch URL HTML, strip tags, regex extract emaily
//   3. Pokud regex selze, AI fallback (gpt-4o-mini, max 100 tok)
//   4. Update jobs.contact_emails pri uspechu
//
// Volat opakovane (limit=50 default), kazdy run dohleduje dalsich N. Po
// nekolika spustenich je DB pokryta. Cost: ~$0.0001 per AI fallback.
// On-demand only (memory feedback_no_automated_api_jobs).

export const maxDuration = 300

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

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

interface JobRow {
  id: string
  url: string | null
  title: string
  company: string
  description: string | null
  source: string
}

interface PerJobResult {
  id: string
  source: string
  status: 'regex' | 'ai' | 'failed' | 'no_url' | 'fetch_error'
  email?: string
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const sourceFilter = searchParams.get('source') || ''
  const skipAi = searchParams.get('skip_ai') === '1'

  // Load jobs without contact_emails
  let q = supabaseAdmin
    .from('jobs')
    .select('id, url, title, company, description, source')
    .is('contact_emails', null)
    .not('url', 'is', null)
    .order('posted_at', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (sourceFilter) q = q.eq('source', sourceFilter)

  const { data, error } = await q
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const jobs = (data || []) as JobRow[]
  if (jobs.length === 0) {
    return NextResponse.json({
      processed: 0,
      message: 'Žádné jobs k dohledání (vše má email nebo nemá url).',
    })
  }

  const results: PerJobResult[] = []
  let foundRegex = 0
  let foundAi = 0
  let errors = 0

  const start = Date.now()
  const deadline = start + 270_000 // ~270s, safety pod maxDuration 300s

  for (const job of jobs) {
    if (Date.now() > deadline) break
    if (!job.url) {
      results.push({ id: job.id, source: job.source, status: 'no_url' })
      continue
    }

    let html = ''
    try {
      const res = await fetch(job.url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) {
        results.push({ id: job.id, source: job.source, status: 'fetch_error' })
        errors++
        continue
      }
      html = await res.text()
    } catch {
      results.push({ id: job.id, source: job.source, status: 'fetch_error' })
      errors++
      continue
    }

    const text = stripHtml(html)
    // Combine s description (pokud existuje a neni v html)
    const combined = job.description && !text.includes(job.description.slice(0, 50))
      ? `${text}\n\n${job.description}`
      : text

    // Stage 1: regex
    const regexEmails = extractEmails(combined)
    const regexPref = preferredEmail(regexEmails)
    if (regexPref) {
      await supabaseAdmin
        .from('jobs')
        .update({ contact_emails: [regexPref] })
        .eq('id', job.id)
      results.push({ id: job.id, source: job.source, status: 'regex', email: regexPref })
      foundRegex++
      continue
    }

    if (skipAi) {
      results.push({ id: job.id, source: job.source, status: 'failed' })
      continue
    }

    // Stage 2: AI fallback (gpt-4o-mini, ~$0.0001 per call)
    try {
      const prompt = `Z následujícího HTML stripnutého obsahu pracovního inzerátu najdi VÝHRADNĚ kontaktní e-mail zaměstnavatele nebo HR oddělení.

NIKDY si nevymýšlej. Pokud žádný email nevidíš, vrať null.

Vrať POUZE JSON: {"email": "..."} nebo {"email": null}

Pozice: ${job.title}
Firma: ${job.company}
URL: ${job.url}

HTML obsah (stripnuto):
${combined.slice(0, 8000)}`

      const aiText = await callOpenAI(prompt, {
        model: 'gpt-4o-mini',
        maxTokens: 100,
        temperature: 0.1,
        timeoutMs: 20_000,
      })

      // Parse JSON
      const clean = aiText.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
      const parsed = JSON.parse(clean) as { email: string | null }
      if (parsed.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.email)) {
        const aiEmail = parsed.email.toLowerCase()
        // Validate je rozumny — ne false positive jako sentry.io
        const validated = preferredEmail([aiEmail])
        if (validated) {
          await supabaseAdmin
            .from('jobs')
            .update({ contact_emails: [validated] })
            .eq('id', job.id)
          results.push({ id: job.id, source: job.source, status: 'ai', email: validated })
          foundAi++
          continue
        }
      }
      results.push({ id: job.id, source: job.source, status: 'failed' })
    } catch {
      results.push({ id: job.id, source: job.source, status: 'failed' })
      errors++
    }
  }

  // Stats per source
  const bySource: Record<string, { processed: number; found: number }> = {}
  for (const r of results) {
    if (!bySource[r.source]) bySource[r.source] = { processed: 0, found: 0 }
    bySource[r.source].processed++
    if (r.status === 'regex' || r.status === 'ai') bySource[r.source].found++
  }

  return NextResponse.json({
    processed: results.length,
    found_regex: foundRegex,
    found_ai: foundAi,
    errors,
    duration_ms: Date.now() - start,
    by_source: bySource,
    note: `Cost: ~$${(foundAi * 0.0001).toFixed(4)} (AI fallback calls). Regex je free.`,
    sample_found: results.filter((r) => r.email).slice(0, 10),
  })
}
