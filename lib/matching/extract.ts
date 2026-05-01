/**
 * Extract a hiring email address from a job description.
 * Prefers HR/jobs/career/bewerbung mailboxes when multiple emails are present.
 */
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

const PREFERRED_LOCAL_PARTS = [
  'bewerbung', 'bewerbungen', 'jobs', 'job', 'karriere', 'career', 'careers',
  'hr', 'recruiting', 'recruitment', 'hiring', 'personal', 'personnel',
  'apply', 'application', 'rekrutierung', 'kontakt',
]

const BLOCKLIST_DOMAINS = [
  'sentry.io', 'gravatar.com', 'wixstudio.com', 'example.com',
  'gmail.com', // ignore generic Gmails in description (often noise)
]

export function extractRecipientEmail(text: string | null | undefined): string | null {
  if (!text) return null
  const matches = text.match(EMAIL_RE)
  if (!matches?.length) return null

  const cleaned = Array.from(new Set(matches.map((e) => e.toLowerCase())))
    .filter((e) => !BLOCKLIST_DOMAINS.some((d) => e.endsWith(`@${d}`)))

  if (!cleaned.length) return null

  // Prefer HR/jobs mailboxes
  for (const e of cleaned) {
    const local = e.split('@')[0]
    if (PREFERRED_LOCAL_PARTS.some((p) => local.includes(p))) return e
  }

  // Fall back to first non-blocked address
  return cleaned[0]
}
