import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { scrapeKarriere } from '@/lib/scraping/karriere'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export const maxDuration = 300

/**
 * For each company that hasn't been karriere-scraped recently, fetch homepage,
 * find /karriere link, fetch it, upgrade companies.email to HR-tier when found,
 * and extract any active job listings into company_jobs.
 *
 * Processes 30 companies per invocation (≈ 4-5 min of fetching).
 */
async function handler(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Pick 30 companies that haven't been karriere-scraped or are stale (> 14 days)
  const cutoff = new Date(Date.now() - 14 * 86_400_000).toISOString()
  const { data: companies, error: pickErr } = await supabaseAdmin
    .from('companies')
    .select('id, name, website, email, email_role')
    .not('website', 'is', null)
    .or(`karriere_scraped_at.is.null,karriere_scraped_at.lt.${cutoff}`)
    .order('karriere_scraped_at', { ascending: true, nullsFirst: true })
    .limit(30)
  if (pickErr) return NextResponse.json({ error: pickErr.message }, { status: 500 })
  if (!companies?.length) return NextResponse.json({ ok: true, message: 'no_pending' })

  const startedAt = new Date().toISOString()
  let upgraded = 0
  let jobsAdded = 0
  let visited = 0
  const errors: string[] = []

  for (const c of companies) {
    visited++
    try {
      const result = await scrapeKarriere(c.website!)

      const updates: Record<string, unknown> = {
        karriere_scraped_at: new Date().toISOString(),
        karriere_url: result.karriere_url,
      }

      // Upgrade email if we found a better-tier one
      if (result.best_email && result.best_email_role) {
        const currentRank = scoreFor((c.email_role as RoleScore) ?? 'unknown')
        const newRank = scoreFor(result.best_email_role as RoleScore)
        if (newRank > currentRank) {
          updates.email = result.best_email
          updates.email_role = result.best_email_role
          upgraded++
        } else if (!c.email_role) {
          updates.email_role = c.email ? classifyRole(c.email) : 'unknown'
        }
      } else if (!c.email_role) {
        updates.email_role = c.email ? classifyRole(c.email) : 'unknown'
      }

      await supabaseAdmin.from('companies').update(updates).eq('id', c.id)

      // Save active jobs
      if (result.jobs.length) {
        const jobRows = result.jobs.slice(0, 20).map((j) => ({
          company_id: c.id,
          title: j.title,
          description: j.description,
          job_url: j.url,
        }))
        const { data: inserted } = await supabaseAdmin
          .from('company_jobs')
          .upsert(jobRows, { onConflict: 'company_id,title', ignoreDuplicates: true })
          .select('id')
        jobsAdded += inserted?.length ?? 0
      }

      // Be polite
      await new Promise((r) => setTimeout(r, 800))
    } catch (err) {
      errors.push(`${c.name}: ${(err as Error).message}`)
    }
  }

  await supabaseAdmin.from('scrape_runs').insert({
    source: 'karriere',
    query: `${visited} companies`,
    rows_found: jobsAdded,
    rows_new: upgraded,
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    error: errors.length ? errors.join(' | ').slice(0, 1000) : null,
  })

  return NextResponse.json({
    ok: true,
    visited,
    emails_upgraded: upgraded,
    jobs_added: jobsAdded,
    errors_count: errors.length,
  })
}

export const POST = handler
export const GET = handler

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  if (auth && auth === `Bearer ${process.env.CRON_SECRET}`) return true
  const secret = new URL(req.url).searchParams.get('secret')
  if (secret && secret === process.env.CRON_SECRET) return true
  return false
}

type RoleScore = 'hr' | 'specific' | 'general' | 'sales' | 'unknown'
function scoreFor(role: RoleScore): number {
  switch (role) {
    case 'hr':       return 100
    case 'specific': return 80
    case 'general':  return 40
    case 'unknown':  return 30
    case 'sales':    return 0
  }
}

function classifyRole(email: string): RoleScore {
  const local = email.split('@')[0].toLowerCase()
  if (['bewerbung','bewerbungen','recruiting','karriere','karrieren','career','careers','jobs','job','stellen','hr','personal','apply'].some((p) => local.includes(p))) return 'hr'
  if (['sales','vertrieb','verkauf','beratung'].some((p) => local === p)) return 'sales'
  if (['info','kontakt','contact','office','mail','hello','admin','support','reception','sekretariat'].includes(local)) return 'general'
  if (/^[a-z]+\.[a-z]+$/.test(local) || /^[a-z]\.[a-z]+$/.test(local)) return 'specific'
  return 'unknown'
}
