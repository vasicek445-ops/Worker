/**
 * Scraper for ostschweizerjobs.ch — Eastern Switzerland regional job board.
 * URL: https://www.ostschweizerjobs.ch/
 *
 * TODO: Find or build an Apify actor for ostschweizerjobs.ch.
 *   Options:
 *   1. Search Apify Store: https://apify.com/store?search=ostschweizerjobs
 *   2. Build custom actor with Crawlee: https://crawlee.dev/
 *      Target URL: https://www.ostschweizerjobs.ch/jobs/
 *      Key selectors (inspect in browser):
 *        - Job list:    .job-item or .vacancy-list li
 *        - Job title:   .job-title a or h3 a
 *        - Company:     .company or .employer
 *        - Location:    .location or .ort
 *        - Detail link: a[href*="/jobs/"] or a[href*="/stelle/"]
 *        - Email:       mailto: link or text '@' within .job-description on detail page
 *        - Common locations: St. Gallen, Appenzell, Thurgau, Schaffhausen, Glarus, Graubünden
 *      Pagination: ?seite=2 or rel="next"
 *   3. Replace 'TODO/ostschweizerjobs-scraper' below with the real actor ID once published.
 */

import { runApifyActor } from '@/lib/apify/client'
import { type JobItem } from '@/lib/apify/types'
import { extractEmails } from '@/lib/jobs/extract-email'

const ACTOR_ID = 'TODO/ostschweizerjobs-scraper' // TODO: replace with real Apify actor ID

interface OstschweizerjobsRawItem {
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
  // Eastern CH cantons weighted first
  const CITY_TO_CANTON: Record<string, string> = {
    'st. gallen': 'SG', 'st gallen': 'SG', 'rapperswil': 'SG', 'wil': 'SG',
    'appenzell': 'AR',
    'frauenfeld': 'TG', 'kreuzlingen': 'TG', 'arbon': 'TG',
    'schaffhausen': 'SH',
    'glarus': 'GL',
    'chur': 'GR', 'davos': 'GR', 'flims': 'GR',
    'schwyz': 'SZ',
    'altdorf': 'UR',
    'stans': 'NW',
    'sarnen': 'OW',
    // Standard CH cities
    'zürich': 'ZH', 'zurich': 'ZH', 'winterthur': 'ZH',
    'bern': 'BE',
    'basel': 'BS',
    'luzern': 'LU', 'lucerne': 'LU',
    'genève': 'GE', 'geneva': 'GE',
    'lausanne': 'VD',
    'lugano': 'TI',
    'zug': 'ZG',
    'aarau': 'AG', 'baden': 'AG',
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

export async function scrapeOstschweizerjobs(): Promise<JobItem[]> {
  const raw = await runApifyActor({
    actorId: ACTOR_ID,
    input: {
      // TODO: adjust input fields to match your actor's schema
      startUrl: 'https://www.ostschweizerjobs.ch/jobs/',
      maxItems: 200,
    },
    timeoutSec: 120,
  })

  const items: JobItem[] = []

  for (const _item of raw) {
    const item = _item as OstschweizerjobsRawItem

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
      company: company || 'ostschweizerjobs.ch',
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
