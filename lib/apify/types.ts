/**
 * Shared JobItem shape returned by every Apify source scraper.
 * Maps 1:1 to the jobs DB table columns (subset).
 */
export interface JobItem {
  external_id: string
  title: string
  company: string
  location: string
  canton: string | null
  description: string
  contact_emails: string[] | null
  url: string
  posted_at: string | null
  category: string | null
  remote: boolean
}
