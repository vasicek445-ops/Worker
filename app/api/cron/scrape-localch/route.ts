import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { scrapeLocalChListing } from '@/lib/scraping/localch'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export const maxDuration = 300 // 5 minutes — Vercel Pro plan

/**
 * Crawl batch of local.ch listings. Designed to be invoked by Vercel Cron.
 * Each invocation crawls ~30 city × branche combinations and inserts
 * scraped companies into the `companies` table.
 *
 * Auth: CRON_SECRET in query string OR Vercel Cron's automatic auth header.
 */
export async function POST(req: NextRequest) {
  const authed = isAuthorized(req)
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Branches to crawl — focus on segments where foreign workers actually land jobs
  // and where SMEs still email-apply rather than use ATS portals.
  const BRANCHES_DE = [
    'restaurant', 'hotel', 'baeckerei', 'metzgerei',
    'spedition', 'transport', 'lager', 'kurier',
    'reinigungsfirma', 'gebaeudereinigung', 'hauswartung',
    'pflegeheim', 'spitex', 'kinderkrippe',
    'sanitaer', 'elektriker', 'maler', 'gartenbau', 'schreinerei',
    'autogarage', 'autohaus',
    'treuhand', 'beratung',
  ]
  const CITIES_DE = [
    'zurich', 'bern', 'basel', 'luzern', 'st-gallen', 'winterthur',
    'thun', 'biel', 'aarau', 'baden', 'zug', 'schaffhausen',
  ]

  const tasks: Array<{ city: string; branche: string }> = []
  for (const branche of BRANCHES_DE) {
    for (const city of CITIES_DE) {
      tasks.push({ city, branche })
    }
  }

  // Spread the load across multiple cron invocations: rotate based on the day-of-year
  // so each daily run hits a different slice. With 12*23=276 combos and ~30/run we
  // cycle through everything in ~9 days.
  const day = Math.floor(Date.now() / 86_400_000)
  const sliceSize = 30
  const start = (day * sliceSize) % tasks.length
  const slice = tasks.slice(start, start + sliceSize)
  if (slice.length < sliceSize) {
    slice.push(...tasks.slice(0, sliceSize - slice.length))
  }

  const startedAt = new Date().toISOString()
  let totalFound = 0
  let totalNew = 0
  const errors: string[] = []

  for (const t of slice) {
    try {
      const { companies, query } = await scrapeLocalChListing(t)
      if (!companies.length) continue
      const rows = companies.map((c) => ({
        source: 'localch',
        external_id: null,
        name: c.name ?? null,
        email: c.email,
        phone: c.phone,
        website: c.website,
        city: c.city,
        canton: null,
        region: 'german',
        branche: c.branche,
        positions: brancheToPositions(t.branche),
        scraped_at: new Date().toISOString(),
      }))

      const { data, error } = await supabaseAdmin
        .from('companies')
        .upsert(rows, { onConflict: 'source,email', ignoreDuplicates: true })
        .select('id')
      if (error) {
        errors.push(`${query}: ${error.message}`)
        continue
      }
      totalFound += companies.length
      totalNew += data?.length ?? 0

      // Be polite — 1.5s between requests
      await new Promise((r) => setTimeout(r, 1500))
    } catch (err) {
      errors.push(`${t.city}/${t.branche}: ${(err as Error).message}`)
    }
  }

  const finishedAt = new Date().toISOString()
  await supabaseAdmin.from('scrape_runs').insert({
    source: 'localch',
    query: `slice ${start}-${start + sliceSize}`,
    rows_found: totalFound,
    rows_new: totalNew,
    started_at: startedAt,
    finished_at: finishedAt,
    error: errors.length ? errors.join(' | ').slice(0, 1000) : null,
  })

  return NextResponse.json({
    ok: true,
    slice: { start, size: slice.length },
    rows_found: totalFound,
    rows_new: totalNew,
    errors_count: errors.length,
  })
}

// Same as POST — Vercel Cron sends GET
export const GET = POST

function isAuthorized(req: NextRequest): boolean {
  // Vercel Cron sets `Authorization: Bearer <CRON_SECRET>` automatically
  const auth = req.headers.get('authorization')
  if (auth && auth === `Bearer ${process.env.CRON_SECRET}`) return true
  // Manual trigger via ?secret=
  const secret = new URL(req.url).searchParams.get('secret')
  if (secret && secret === process.env.CRON_SECRET) return true
  return false
}

const BRANCHE_POSITIONS: Record<string, string[]> = {
  restaurant: ['koch', 'kellner', 'service', 'spueler', 'kuechenhilfe'],
  hotel: ['rezeption', 'housekeeping', 'koch', 'service'],
  baeckerei: ['baecker', 'verkauf', 'konditor'],
  metzgerei: ['metzger', 'verkauf'],
  spedition: ['lkw-fahrer', 'disponent', 'lagerist', 'logistiker'],
  transport: ['fahrer', 'kurier'],
  lager: ['lagerist', 'staplerfahrer', 'logistiker'],
  kurier: ['kurier', 'fahrer'],
  reinigungsfirma: ['reinigung', 'unterhaltsreinigung'],
  gebaeudereinigung: ['gebäudereinigung', 'reinigung'],
  hauswartung: ['hauswart', 'allrounder'],
  pflegeheim: ['pflege', 'fage', 'fabe', 'betreuung'],
  spitex: ['pflege', 'fage'],
  kinderkrippe: ['fabe', 'krippe', 'betreuung'],
  sanitaer: ['sanitärinstallateur', 'sanitärmonteur'],
  elektriker: ['elektriker', 'elektroinstallateur'],
  maler: ['maler', 'gipser'],
  gartenbau: ['gärtner', 'landschaftsgärtner'],
  schreinerei: ['schreiner', 'zimmermann'],
  autogarage: ['mechaniker', 'autospengler'],
  autohaus: ['verkäufer', 'mechaniker'],
  treuhand: ['buchhalter', 'sachbearbeiter'],
  beratung: ['berater', 'sachbearbeiter'],
}

function brancheToPositions(branche: string): string[] {
  return BRANCHE_POSITIONS[branche] ?? []
}
