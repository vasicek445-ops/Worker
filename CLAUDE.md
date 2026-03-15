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

## Current Focus

- **Landing page animations** — countUp numbers, scroll-triggered reveals, hover effects, progress bars
- **Megan** — self-healing autonomous bot (tool use, proactive monitoring, voice interface planned)
- **Future:** Megan PWA dashboard (Jarvis-style sci-fi HUD, voice I/O via ElevenLabs + Whisper)

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

## Session Management

Aktualizuj tento CLAUDE.md když:
- Dokončíme feature nebo větší úkol (přidej do changelog / uprav strukturu)
- Změníme workflow nebo konvenci
- Uděláme důležité architektonické rozhodnutí
- Uživatel napíše **"update docs"** nebo **"konec"**
