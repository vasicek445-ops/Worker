/**
 * Scraper for gastrojob.ch — Switzerland's hospitality & gastronomy job board.
 * URL: https://www.gastrojob.ch/
 *
 * TODO: Find or build an Apify actor for gastrojob.ch.
 *   Options:
 *   1. Search Apify Store: https://apify.com/store?search=gastrojob
 *   2. Build custom actor with Crawlee: https://crawlee.dev/
 *      Target URL: https://www.gastrojob.ch/Jobs/index.cfm
 *      Key selectors (inspect in browser):
 *        - Job title: .job-title or h2 > a
 *        - Company:   .job-company or .employer-name
 *        - Location:  .job-location or .job-place
 *        - Link:      a[href*="/Jobs/detail.cfm"]
 *        - Email:     any mailto: link or @-containing text in job description page
 *      Pagination: ?Page=2, ?Page=3 …
 *   3. Replace 'TODO/gastrojob-scraper' below with the real actor ID once published.
 */

import { runApifyActor } from '@/lib/apify/client'
import { type JobItem } from '@/lib/apify/types'
import { extractEmails } from '@/lib/jobs/extract-email'

const ACTOR_ID = 'TODO/gastrojob-scraper' // TODO: replace with real Apify actor ID

interface GastrojobRawItem {
  id?: string | number
  title?: string
  company?: string
  location?: string
  description?: string
  url?: string
  postedAt?: string
  category?: string
  remote?: boolean
}

function detectCanton(location: string): string | null {
  const CITY_TO_CANTON: Record<string, string> = {
    'zürich': 'ZH', 'zurich': 'ZH', 'winterthur': 'ZH',
    'bern': 'BE', 'thun': 'BE',
    'basel': 'BS',
    'luzern': 'LU', 'lucerne': 'LU',
    'genève': 'GE', 'geneva': 'GE',
    'lausanne': 'VD', 'nyon': 'VD', 'montreux': 'VD',
    'lugano': 'TI',
    'zug': 'ZG',
    'st. gallen': 'SG',
    'aarau': 'AG', 'baden': 'AG',
    'schaffhausen': 'SH',
    'chur': 'GR',
    'solothurn': 'SO',
    'fribourg': 'FR',
    'sion': 'VS',
    'neuchâtel': 'NE', 'neuchatel': 'NE',
  }
  const loc = location.toLowerCase()
  for (const [city, canton] of Object.entries(CITY_TO_CANTON)) {
    if (loc.includes(city)) return canton
  }
  return null
}

export async function scrapeGastrojob(): Promise<JobItem[]> {
  const raw = await runApifyActor({
    actorId: ACTOR_ID,
    input: {
      // TODO: adjust input fields to match your actor's schema
      startUrl: 'https://www.gastrojob.ch/Jobs/index.cfm',
      maxItems: 200,
    },
    timeoutSec: 120,
  })

  const items: JobItem[] = []

  for (const _item of raw) {
    const item = _item as GastrojobRawItem

    const title = (item.title ?? '').trim()
    const company = (item.company ?? '').trim()
    const location = (item.location ?? '').trim()
    const description = (item.description ?? '').trim()
    const url = (item.url ?? '').trim()
    const externalId = String(item.id ?? url).substring(0, 200)

    if (!title || !externalId) continue

    const emails = extractEmails(description)
    // Skip-no-email filter: only keep jobs where we can email directly
    if (emails.length === 0) continue

    items.push({
      external_id: externalId,
      title,
      company: company || 'gastrojob.ch',
      location: location || 'Switzerland',
      canton: detectCanton(location),
      description,
      contact_emails: emails,
      url,
      posted_at: item.postedAt ?? null,
      category: item.category ?? 'Gastronomie',
      remote: item.remote ?? false,
    })
  }

  return items
}
