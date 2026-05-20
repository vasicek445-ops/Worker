import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractRecipientEmail } from '@/lib/matching/extract'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// Stupeň B Smart Apply: dohledá e-mail u nabídek, co ho v inzerátu neměly.
// B1 — shoda firmy proti tabulce `companies` (3000+ firem s e-maily).
// B2 — odhad domény firmy → ověření → scrape Impressum/Kontakt.
const TIME_BUDGET_MS = 250_000
const BATCH = 40
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'

// Legal-form slova + interpunkce pryč → porovnatelný / domény-schopný tvar.
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(ag|gmbh|sa|s[aà]rl|srl|ltd|inc|kg|holding|group|gruppe|co|und)\b/g, ' ')
    .replace(/[^a-z0-9äöü]+/g, '')
    .trim()
}

// Nejdelší výrazné slovo firmy — k ověření, že web patří té firmě.
function distinctiveToken(name: string): string {
  const words = name
    .toLowerCase()
    .replace(/\b(ag|gmbh|sa|s[aà]rl|srl|ltd|inc|kg|holding|group|gruppe|co|und|the|der|die|das)\b/g, ' ')
    .replace(/[^a-z0-9äöü ]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 5)
    .sort((a, b) => b.length - a.length)
  return words[0] ?? ''
}

function decodeEmails(html: string): string {
  return html
    .replace(/&#0*64;/g, '@')
    .replace(/&#x40;/gi, '@')
    .replace(/&amp;/g, '&')
    .replace(/\(at\)/gi, '@')
    .replace(/\s\[at\]\s/gi, '@')
    .replace(/<[^>]+>/g, ' ')
}

// B1 — přesná (normalizovaná) shoda názvu proti companies. Při nejednoznačnosti raději nic.
async function matchCompaniesDb(company: string): Promise<string | null> {
  const norm = normalizeName(company)
  if (norm.length < 4) return null
  const token = distinctiveToken(company)
  if (token.length < 4) return null

  const { data } = await supabaseAdmin
    .from('companies')
    .select('name, email')
    .ilike('name', `%${token}%`)
    .not('email', 'is', null)
    .limit(25)
  if (!data) return null

  const hits = data.filter((c) => normalizeName(c.name || '') === norm)
  if (hits.length === 1) return extractRecipientEmail(String(hits[0].email))
  return null
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

// B2 — odhad domény {slug}.ch, ověření (token firmy je na stránce), pak Impressum/Kontakt.
async function scrapeImpressum(company: string): Promise<string | null> {
  const slug = normalizeName(company)
  const token = distinctiveToken(company)
  if (slug.length < 4 || token.length < 5) return null

  for (const base of [`https://${slug}.ch`, `https://www.${slug}.ch`]) {
    const html = await fetchHtml(base)
    if (!html) continue

    // Ověření, že web patří té firmě — výrazné slovo se musí na stránce vyskytnout.
    const pageText = html.replace(/<[^>]+>/g, ' ').toLowerCase()
    if (!pageText.includes(token)) continue

    // E-mail na homepage?
    const home = extractRecipientEmail(decodeEmails(html))
    if (home) return home

    // Najít odkaz na Impressum / Kontakt.
    const linkMatch = html.match(/href=["']([^"']*(?:impressum|kontakt|contact)[^"']*)["']/i)
    if (linkMatch) {
      try {
        const impUrl = new URL(linkMatch[1], base).toString()
        const impHtml = await fetchHtml(impUrl)
        if (impHtml) {
          const found = extractRecipientEmail(decodeEmails(impHtml))
          if (found) return found
        }
      } catch {}
    }
    return null
  }
  return null
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: jobs, error } = await supabaseAdmin
      .from('jobs')
      .select('id, company')
      .eq('source', 'indeed')
      .is('contact_emails', null)
      .not('company', 'is', null)
      .order('posted_at', { ascending: false })
      .limit(BATCH)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const start = Date.now()
    let checked = 0
    let foundDb = 0
    let foundScrape = 0

    for (const job of jobs ?? []) {
      if (Date.now() - start > TIME_BUDGET_MS) break
      checked++
      const company = String(job.company || '').trim()
      if (!company) continue

      let email: string | null = null
      let via: 'db' | 'scrape' | null = null

      email = await matchCompaniesDb(company)
      if (email) via = 'db'

      if (!email) {
        email = await scrapeImpressum(company)
        if (email) via = 'scrape'
      }

      if (email) {
        await supabaseAdmin
          .from('jobs')
          .update({ contact_emails: [email.toLowerCase()] })
          .eq('id', job.id)
        if (via === 'db') foundDb++
        else foundScrape++
      }
    }

    return NextResponse.json({
      success: true,
      checked,
      foundDb,
      foundScrape,
      stillMissing: checked - foundDb - foundScrape,
      elapsedMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'unknown error'
    console.error('enrich-emails error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
