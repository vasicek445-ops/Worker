# Woker — CLAUDE.md

## What is Woker?

Woker (https://www.gowoker.com) is a Next.js SaaS app for Czech-speaking workers seeking jobs and housing in Switzerland. It aggregates listings, generates AI-powered documents in German, and provides guides for permits, taxes, and insurance.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL) with RLS
- **Auth:** Supabase Auth (OAuth + email/password)
- **Payments:** Stripe (monthly €9.99 / yearly €99.99, 3-day trial)
- **AI:** Anthropic Claude API (`@anthropic-ai/sdk`) — haiku model for cost efficiency
- **3D:** Google `<model-viewer>` for interactive 3D mascot on landing page
- **Email:** Resend API
- **Hosting:** Vercel (4 cron jobs, 60s function timeout)
- **Analytics:** Vercel Analytics + Facebook Pixel

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
```

## Project Structure

```
app/                        App Router pages and API routes
  api/
    cron/                   Cron jobs (scrape-jobs, scrape-housing, emails, user-emails)
    generate/               AI document generation (CV, cover letter, email)
    generate-cv/            Swiss CV (Lebenslauf)
    generate-interview/     Interview prep
    chat/                   Streaming AI assistant (Wooky — AI Team Leader)
    chat-landing/           Landing page chat widget
    analyze-contract/       AI contract analysis with image support
    matching/               Smart job matching
    stripe/                 Checkout, portal, webhook
    jobs/, housing/, agencies/  Data endpoints
  dashboard/                User dashboard
  nabidky/                  Job listings
  bydleni/                  Housing listings
  kontakty/                 Agency directory (paywalled)
  pruvodce/                 Guide hub (matching, permits, insurance, taxes, templates)
  asistent/                 Redirects to /dashboard#wooky
  profil/                   User profile
  pricing/                  Subscription plans
  login/, onboarding/       Auth flows
  blog/                     Blog with [slug] dynamic routes
lib/                        Shared utilities
  supabase-admin.ts         Admin Supabase client
  stripe.ts                 Stripe client
  ThemeContext.tsx           Dark/light theme
  i18n/LanguageContext.tsx   i18n context (11 languages)
content/                    Static content
public/                     Static assets, landing.html, ebook.html
  images/3d/              3D assets (Wooky PNGs, robot_playground.glb, icons)
scripts/                    Utility scripts
hooks/                      Custom hooks
src/                        Additional source code
```

## Database Tables

- **profiles** — extended user profiles (profession, canton, language level, skills)
- **jobs** — scraped job listings (5 sources), 14-day cleanup, (source, external_id) dedup
- **housing** — Flatfox listings, 14-day cleanup, (source, external_id) dedup
- **agencies** — 1,007+ Swiss employment agencies (from swissstaffing-agencies.json)
- **subscriptions** — Stripe subscription tracking
- **applications** — user job applications (cv_html, letter_text, match_score)

## Job Scraping Sources

1. Arbeitnow (API), 2. Jooble (API, optional), 3. Michael Page CH (HTML), 4. Robert Half (JSON from HTML), 5. jobs.ch (keyword search)

## Key Constraints

- Vercel 60s function timeout — limits scraper pagination
- Housing scraper uses offset sampling (not sequential) to stay within timeout
- Claude haiku preferred for cost efficiency in all AI routes
- `landing.html` and `ebook.html` are served via Next.js rewrites from `/public`

## i18n

11 languages: cs, en, pl, uk, ro, it, es, pt, hu, el. Context-based via `LanguageContext`, stored in `woker-lang` cookie.

## Paywall

- Full agency contacts, AI doc generation, and premium tools require active subscription
- `PaywallOverlay` component handles subscription prompts

## Wooky — AI Team Leader

- Brand mascot and AI assistant personality across the platform
- **3D model:** `robot_playground.glb` from Sketchfab "Robot Playground" — rendered via `<model-viewer>` on landing page
- **Static PNGs:** `wooky-wave.png` (avatar), `wooky-default.png` (chat bubbles), + `-sm.png` variants (128x128)
- **Chat:** Inline dashboard component (`WokeeWidget.tsx` = `WookyChat`), context-aware based on user profile
- **System prompt:** Team Leader personality in `app/api/chat/route.ts`
- **Sidebar:** Uses `wooky-wave-sm.png` as nav icon
- **Landing page:** Interactive 3D model + chat FAB widget

## Dev Tooling & MCP Servers

### MCP Servers (configured in `~/.claude/settings.json`)
- **Supabase** — direct DB queries, schema inspection, migrations
- **GitHub** — repo management, PRs, issues, code search (PAT token in settings)
- **Playwright** — browser automation, E2E testing
- **Stripe** — subscription debugging, customer management, webhook logs
- **Vercel** — deployment logs, build status
- **Notion** — workspace management, pages, databases, CRM, project tracking (via Notion API, free tier)
- **Apple Notes** — read/write/search macOS notes, folders, checklists
- **WhatsApp** — read/send messages (⚠️ never send autonomously, ban risk)
- **Firecrawl** — AI web scraping, structured data extraction (API key, free tier 500 credits)
- **Whisper STT** — voice input, lokální Whisper daemon na localhost:8765, voice hook (`v` → mluv → `s`)
- **n8n** — workflow automation engine (self-hosted Docker, localhost:5678)

### Docker Services (auto-restart)
- **changedetection.io** — website change monitoring, localhost:5001, competitive intel pipeline
- **n8n** — workflow automation, localhost:5678, orchestrace automatizací

### Planned MCP Integrations
- **Google Calendar** — booking flow (Hepner), scheduling, time blocking
- **Slack** — client communication, deployment notifications, Megan alerts
- **Gmail** — email automation, client follow-ups, inbox management
- **Sentry** — error monitoring for Woker production (gowoker.com)

### Hooks (configured in `.claude/hooks.json` + `~/.claude/settings.json`)
- **ESLint auto-fix** (PostToolUse) — runs `eslint --fix` on every .ts/.tsx file after Edit/Write
- **Security gate** (PreToolUse) — blocks destructive commands (`DROP`, `TRUNCATE`, `DELETE FROM`, `rm -rf`, `git push --force`, `git reset --hard`) before execution
- **macOS notification** (Notification) — desktop alert with sound when Claude needs user input
- **Lessons loader** (SessionStart) — auto-loads `~/.claude/lessons.md` (self-improvement loop)
- **Voice hook** (UserPromptSubmit) — Whisper voice input (`v` start, `s` stop)

### Installed Skills & Plugins
- **Superpowers v5.0.7** — brainstorming → planning → execution workflow, TDD, systematic debugging, code review, parallel agents
- **Trail of Bits** (30+ skills) — security audits, YARA rules, supply chain analysis, differential review
- **planning-with-files** — persistent plans that survive context compaction (`/plan`)
- **AI Marketing** (15 skills) — `/market audit`, `/market competitors`, `/market proposal`, `/market seo`
- **ccproxy** — intelligent model routing proxy, Haiku for simple / Sonnet for complex (`ccproxy start --detach`)

### Knowledge Base
- **Wiki** — `~/Desktop/transcripts/wiki/` — 24 stránek, Karpathy LLM Wiki metodologie, backlinks, hot cache
- **lessons.md** — `~/.claude/lessons.md` — self-improvement loop, logování chyb, auto-load každou session
- **Memory** — `~/.claude/projects/.../memory/` — long-term memory across conversations

## Current Focus

- **Landing page animations** — countUp numbers, scroll-triggered reveals, hover effects, progress bars
- **Megan** — self-healing autonomous bot (tool use, proactive monitoring, voice interface active via Whisper)
- **MCP integrations** — expanding agent capabilities (next: Google Calendar, Slack, Gmail, Sentry)
- **Competitive intel** — changedetection.io monitoring pipeline, AI marketing audits
- **Future:** Megan PWA dashboard (Jarvis-style sci-fi HUD, ElevenLabs TTS for natural voice output)

## Never Do

1. **Never run cron jobs locally** — they modify production data (scrape-jobs, scrape-housing, emails, user-emails)
2. **Never change pricing** without explicit user confirmation — Stripe plans, trial length, amounts
3. **Never add npm packages** without asking first — bundle size and cost matter on Vercel Hobby

## Known Intentional Decisions

- Housing scraper uses **offset sampling** (not sequential pagination) — intentional to stay within Vercel 60s timeout
- `landing.html` and `ebook.html` are served from `/public` via Next.js rewrites — intentional, not a bug
- `robot_playground.glb` (8.3MB) served from `/public/images/3d/` — consider Draco compression in future
- Wooky renamed from "Wokee" — all references updated across 22+ files including landing page
- Contract analysis supports iPhone HEIC images via client-side canvas JPEG conversion
- Interview prep AI has "don't invent facts" guardrails in system prompt

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Anthropic (AI)
ANTHROPIC_API_KEY=

# Resend (Email)
RESEND_API_KEY=
RESEND_AUDIENCE_ID=

# App
NEXT_PUBLIC_APP_URL=
CRON_SECRET=

# Optional
JOOBLE_API_KEY=
GUIDE_PDF_URL=
```

## Rules for Claude Code

1. **Never delete database data** without explicit user confirmation — no DROP, DELETE, or TRUNCATE without asking first
2. **Always use TypeScript** — never create plain `.js` files, all new code must be `.ts` or `.tsx`
3. **RLS must be enabled** on every new Supabase table — add appropriate policies (users see only own data unless intentionally public)
4. **Run ESLint before every deploy** — `npm run lint` must pass with zero errors before pushing to main
5. **Never modify the Stripe webhook** (`app/api/stripe/webhook/route.ts`) without explicitly notifying the user — changes can break payments
6. **Always include i18n** for all new user-facing text — add translations for all 11 languages in `LanguageContext`
7. **Use Claude Haiku** (`claude-haiku-4-5-20251001`) for all AI API routes — cost efficiency is critical, never use Sonnet/Opus for user-facing generation

## Autonomous Mode

### Branch & Commit Rules
- Always work on feature branch, never commit directly to main
- Branch naming: `feature/nazev-tasku`
- Commit after every completed subtask with descriptive message
- Each commit must be atomic — independently revertable
- After all subtasks done, add a summary comment to the PR

### Scope Limits
- Max **10 changed files** per subtask — if more needed, split into smaller commits
- Max **3 consecutive errors** before stopping and documenting the blocker in TODO.md
- If completely blocked — document in TODO.md and move to next task

### Confirmation Rules
- **No confirmation needed:** code changes, linting, formatting, tests, commits to feature branch
- **Always ask before:** DB schema changes, auth logic changes, API contract changes, adding/removing API routes, changing middleware

### Quality Gates (must pass before each commit)
- `npm run lint` — zero errors
- `npm run build` — must compile successfully
- Fix all errors automatically before committing

### Safety Rules
- Never modify Stripe webhook, never delete database data
- Never commit `.env*` files or any secrets/credentials
- Write tests for new functions where possible
- Document all changes in CHANGELOG.md

### Stop Conditions
- 3 consecutive failing builds/lint errors on the same issue → stop, document in TODO.md
- Task requires changes outside the defined scope (DB schema, auth, Stripe) without user online → stop
- Unsure about business logic → stop and document question in TODO.md

## Starting Autonomous Session

1. Create feature branch
2. Implement task
3. Run `npm run lint` + `npm run build` — fix all errors
4. Write tests
5. Commit (atomic, revertable)
6. Document in CHANGELOG.md
7. Repeat 2–6 for each subtask

## Session Management

Aktualizuj tento CLAUDE.md když:
- Dokončíme feature nebo větší úkol (přidej do changelog / uprav strukturu)
- Změníme workflow nebo konvenci
- Uděláme důležité architektonické rozhodnutí
- Uživatel napíše **"update docs"** nebo **"konec"**
