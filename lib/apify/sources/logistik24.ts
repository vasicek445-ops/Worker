/**
 * Scraper for logistik24.ch — Swiss logistics, warehouse & transport jobs.
 * URL: https://www.logistik24.ch/
 *
 * TODO: Find or build an Apify actor for logistik24.ch.
 *   Options:
 *   1. Search Apify Store: https://apify.com/store?search=logistik24
 *   2. Build custom actor with Crawlee: https://crawlee.dev/
 *      Target URL: https://www.logistik24.ch/stellenangebote/
 *      Key selectors (inspect in browser):
 *        - Job list item:  .job-item or article.vacancy
 *        - Job title:      .job-title a or h3 a
 *        - Company:        .company-name or .employer
 *        - Location:       .location or .job-location
 *        - Detail link:    a[href*="/stellenangebote/"] or a[href*="/jobs/"]
 *        - Email in detail: mailto: link or text containing '@' in .job-description
 *      Pagination: ?page=2 or rel="next" link
 *   3. Replace 'TODO/logistik24-scraper' below with the real actor ID once published.
 */

import { runApifyActor } from '@/lib/apify/client'
import { type JobItem } from '@/lib/apify/types'
import { extractEmails } from '@/lib/jobs/extract-email'

const ACTOR_ID = 'TODO/logistik24-scraper' // TODO: replace with real Apify actor ID

interface Logistik24RawItem {
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

export async function scrapeLogistik24(): Promise<JobItem[]> {
  const raw = await runApifyActor({
    actorId: ACTOR_ID,
    input: {
      // TODO: adjust input fields to match your actor's schema
      startUrl: 'https://www.logistik24.ch/stellenangebote/',
      maxItems: 200,
    },
    timeoutSec: 120,
  })

  const items: JobItem[] = []

  for (const _item of raw) {
    const item = _item as Logistik24RawItem

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
      company: company || 'logistik24.ch',
      location: location || 'Switzerland',
      canton: detectCanton(location),
      description,
      contact_emails: emails,
      url,
      posted_at: item.postedAt ?? null,
      category: item.category ?? 'Logistika',
      remote: item.remote ?? false,
    })
  }

  return items
}
