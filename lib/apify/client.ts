/**
 * Apify HTTP API wrapper.
 * Requires APIFY_TOKEN env var — set in Vercel dashboard and local .env.local
 * Docs: https://docs.apify.com/api/v2#/reference/actors/run-actor-synchronously
 */

export interface ApifyRunOptions {
  /** Actor ID in format 'username/actor-name' or store shorthand, e.g. 'TODO/gastrojob-scraper' */
  actorId: string
  /** Input object forwarded to the actor as JSON body */
  input: Record<string, unknown>
  /** Max wall-clock seconds to wait for the run (default 120) */
  timeoutSec?: number
}

/**
 * Runs an Apify actor in synchronous mode and returns the dataset items.
 * Uses POST /acts/{actorId}/run-sync-get-dataset-items which blocks until done
 * and streams the resulting dataset as JSON array.
 */
export async function runApifyActor(opts: ApifyRunOptions): Promise<unknown[]> {
  const token = process.env.APIFY_TOKEN
  if (!token) {
    throw new Error('APIFY_TOKEN env var is not set')
  }

  const timeout = opts.timeoutSec ?? 120
  const actorIdEncoded = encodeURIComponent(opts.actorId)

  // run-sync-get-dataset-items waits for the run and returns items directly
  const url = `https://api.apify.com/v2/acts/${actorIdEncoded}/run-sync-get-dataset-items?token=${token}&timeout=${timeout}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts.input),
    signal: AbortSignal.timeout((timeout + 10) * 1000),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '(no body)')
    throw new Error(`Apify actor ${opts.actorId} failed: HTTP ${res.status} — ${body}`)
  }

  const data = await res.json() as unknown
  if (!Array.isArray(data)) {
    throw new Error(`Apify actor ${opts.actorId} returned non-array response`)
  }
  return data
}
