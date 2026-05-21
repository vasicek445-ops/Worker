# Apify Integration — Niche CH Job Boards

This module scrapes 4 Swiss niche job boards via Apify actors and upserts
email-contactable jobs into the `jobs` DB table.

## Sources

| Source | Board | Category |
|---|---|---|
| `gastrojob` | gastrojob.ch | Hospitality / Gastronomy |
| `logistik24` | logistik24.ch | Logistics / Warehouse / Transport |
| `lokal` | lokal.ch | Local CH (all categories) |
| `ostschweizerjobs` | ostschweizerjobs.ch | Eastern Switzerland |

## Setup

### 1. Create an Apify account

Sign up at https://apify.com/ (free tier available).

### 2. Get your API token

Dashboard → Settings → Integrations → API token.

### 3. Add APIFY_TOKEN

**Local `.env.local`:**
```
APIFY_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxxxxx
```

**Vercel:**
Dashboard → Your project → Settings → Environment Variables → Add `APIFY_TOKEN`.

## Finding or Building Actors

Each source file has a `// TODO` comment with suggested Apify Store search terms
and CSS selectors gathered from visual inspection of the site.

**Option A — Find existing actor:**
Go to https://apify.com/store and search for the board name. If found, copy
the actor ID (format: `username/actor-name`) and replace the `TODO/...` placeholder
in the corresponding source file.

**Option B — Build custom actor:**
1. Install Apify CLI: `npm install -g apify-cli`
2. `apify create my-gastrojob-scraper` (choose Crawlee template)
3. Implement the crawler using the selectors in the source file's TODO comment
4. `apify push` → copy the published actor ID back into the source file

Actor IDs to replace:

| File | Placeholder |
|---|---|
| `lib/apify/sources/gastrojob.ts` | `TODO/gastrojob-scraper` |
| `lib/apify/sources/logistik24.ts` | `TODO/logistik24-scraper` |
| `lib/apify/sources/lokal.ts` | `TODO/lokal-scraper` |
| `lib/apify/sources/ostschweizerjobs.ts` | `TODO/ostschweizerjobs-scraper` |

## Cron Endpoint

`GET /api/cron/scrape-apify`

Requires `Authorization: Bearer $CRON_SECRET` header (same as other cron routes).

**Manual test (local):**
```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/scrape-apify
```

**Manual test (production):**
```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.vercel.app/api/cron/scrape-apify
```

Add to `vercel.json` crons section to run on schedule:
```json
{ "path": "/api/cron/scrape-apify", "schedule": "0 7 * * *" }
```

## Email Filter

Every source applies a skip-no-email filter before returning jobs:
only positions where `extractEmails(description)` finds at least one valid email
address are included. This keeps the DB focused on directly-contactable listings,
which is the core Woker value proposition vs. big boards that use ATS forms.

## Architecture

```
lib/apify/
  client.ts          — runApifyActor() HTTP wrapper
  types.ts           — JobItem interface
  sources/
    gastrojob.ts     — gastrojob.ch source
    logistik24.ts    — logistik24.ch source
    lokal.ts         — lokal.ch source
    ostschweizerjobs.ts — ostschweizerjobs.ch source

app/api/cron/scrape-apify/route.ts  — cron endpoint (parallel fetch + upsert)
```
