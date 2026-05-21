import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { scrapeGastrojob } from '@/lib/apify/sources/gastrojob'
import { scrapeLogistik24 } from '@/lib/apify/sources/logistik24'
import { scrapeLokal } from '@/lib/apify/sources/lokal'
import { scrapeOstschweizerjobs } from '@/lib/apify/sources/ostschweizerjobs'
import { type JobItem } from '@/lib/apify/types'

export const maxDuration = 300

const SOURCE_MAP: Record<string, () => Promise<JobItem[]>> = {
  gastrojob: scrapeGastrojob,
  logistik24: scrapeLogistik24,
  lokal: scrapeLokal,
  ostschweizerjobs: scrapeOstschweizerjobs,
}

export async function GET(req: NextRequest) {
  // Auth check — same pattern as other cron routes
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let added = 0
  let skipped = 0
  const errors: string[] = []

  // Run all 4 sources in parallel; individual failures don't abort the rest
  const results = await Promise.allSettled([
    scrapeGastrojob(),
    scrapeLogistik24(),
    scrapeLokal(),
    scrapeOstschweizerjobs(),
  ])

  const sourceNames = Object.keys(SOURCE_MAP)

  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    const sourceName = sourceNames[i]

    if (result.status === 'rejected') {
      const msg = result.reason instanceof Error ? result.reason.message : String(result.reason)
      errors.push(`${sourceName}: ${msg}`)
      console.error(`Apify scrape error [${sourceName}]:`, result.reason)
      continue
    }

    const jobs = result.value
    console.log(`Apify [${sourceName}]: ${jobs.length} jobs with emails`)

    for (const job of jobs) {
      try {
        await supabaseAdmin.from('jobs').upsert({
          external_id: job.external_id,
          source: sourceName,
          title: job.title,
          company: job.company,
          location: job.location,
          canton: job.canton,
          description: job.description,
          category: job.category,
          url: job.url,
          remote: job.remote,
          posted_at: job.posted_at,
          contact_emails: job.contact_emails,
        }, { onConflict: 'source,external_id' })
        added++
      } catch (err) {
        skipped++
        console.error(`Upsert error [${sourceName}] ${job.external_id}:`, err)
      }
    }
  }

  return NextResponse.json({
    success: true,
    added,
    skipped,
    errors,
    timestamp: new Date().toISOString(),
  })
}
