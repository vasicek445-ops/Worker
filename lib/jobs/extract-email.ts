// Sdileny helper pro extrakci kontaktnich emailu z job description.
// Pouzity ve:
//   - app/api/cron/scrape-jobs/route.ts (pri insertu novych jobs)
//   - app/smart-apply/page.tsx (fallback kdyz contact_emails sloupec chybi)
// DB schema: jobs.contact_emails text[] (migrace 20260518_jobs_contact_emails.sql)

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g

// Recruitment-typical prefixy — preferuj je pred generic info@ apod.
const RECRUITMENT_PREFIXES = [
  'bewerbung', 'bewerbungen', 'hr', 'jobs', 'job', 'karriere', 'recruiting',
  'recruitment', 'recruit', 'application', 'applications', 'apply', 'talent',
  'personal', 'careers', 'career', 'people',
]

const BLOCKED_PREFIXES = ['noreply', 'no-reply', 'donotreply', 'do-not-reply', 'webmaster', 'mailer-daemon', 'postmaster']

const BLOCKED_DOMAINS = ['sentry.io', 'datadoghq.com', 'google-analytics.com']

export function extractEmails(text: string | null | undefined): string[] {
  if (!text) return []
  const matches = text.match(EMAIL_REGEX)
  if (!matches) return []

  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of matches) {
    const email = raw.toLowerCase()
    if (seen.has(email)) continue
    seen.add(email)

    const [prefix, domain] = email.split('@')
    if (!prefix || !domain) continue
    if (BLOCKED_PREFIXES.includes(prefix)) continue
    if (BLOCKED_DOMAINS.some((d) => domain.endsWith(d))) continue

    result.push(email)
  }
  return result
}

// Vrati nejlepsi (recruitment-prefix) email z arrayu, jinak prvni.
export function preferredEmail(emails: string[] | null | undefined): string | null {
  if (!emails || emails.length === 0) return null
  for (const prefix of RECRUITMENT_PREFIXES) {
    const found = emails.find((e) => e.startsWith(prefix + '@') || e.startsWith(prefix + '.'))
    if (found) return found
  }
  return emails[0]
}

// Convenience: text -> preferred email (rovnou)
export function extractRecruitmentEmail(text: string | null | undefined): string | null {
  return preferredEmail(extractEmails(text))
}
