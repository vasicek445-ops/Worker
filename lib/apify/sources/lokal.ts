/**
 * Scraper for lokal.ch — local Swiss job listings across all regions.
 * URL: https://www.lokal.ch/jobs/
 *
 * TODO: Find or build an Apify actor for lokal.ch.
 *   Options:
 *   1. Search Apify Store: https://apify.com/store?search=lokal.ch
 *   2. Build custom actor with Crawlee: https://crawlee.dev/
 *      Target URL: https://www.lokal.ch/jobs/
 *      Key selectors (inspect in browser):
 *        - Job list:    .job-listing or .result-item
 *        - Job title:   .job-title a or h2.title a
 *        - Company:     .company or .employer-name
 *        - Location:    .location or span.place
 *        - Detail link: a[href*="/jobs/"] or a[href*="/stelle/"]
 *        - Email:       mailto: or text '@' in .description on detail page
 *      Pagination: ?p=2 or rel="next"
 *   3. Replace 'TODO/lokal-scraper' below with the real actor ID once published.
 */

import { runApifyActor } from '@/lib/apify/client'
import { type JobItem } from '@/lib/apify/types'
import { extractEmails } from '@/lib/jobs/extract-email'

const ACTOR_ID = 'TODO/lokal-scraper' // TODO: replace with real Apify actor ID

interface LokalRawItem {
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
    'lausanne': 'VD',
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

export async function scrapeLokal(): Promise<JobItem[]> {
  const raw = await runApifyActor({
    actorId: ACTOR_ID,
    input: {
      // TODO: adjust input fields to match your actor's schema
      startUrl: 'https://www.lokal.ch/jobs/',
      maxItems: 200,
    },
    timeoutSec: 120,
  })

  const items: JobItem[] = []

  for (const _item of raw) {
    const item = _item as LokalRawItem

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
      company: company || 'lokal.ch',
      location: location || 'Switzerland',
      canton: detectCanton(location),
      description,
      contact_emails: emails,
      url,
      posted_at: item.postedAt ?? null,
      category: item.category ?? null,
      remote: item.remote ?? false,
    })
  }

  return items
}
