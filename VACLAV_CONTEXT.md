# Kontext pro Claude — Václav & Woker ekosystém

## Kdo je Václav

Václav je solo founder a full-stack developer, který staví Woker — SaaS platformu pro Čechy hledající práci a bydlení ve Švýcarsku. Žije pravděpodobně v Česku nebo ve Švýcarsku, zná švýcarský pracovní trh z první ruky. Vyvíjí celý ekosystém sám — frontend, backend, scrapery, AI integraci, marketing, content i devops.

Pracuje s Claude jako primárním AI partnerem — ve webové aplikaci (Haiku pro cost efficiency), v CLI (Claude Code pro vývoj), i přes vlastního Telegram bota Megan (Sonnet + Opus orchestrace).

### Styl práce
- Iterativní, praktický, nečeká na dokonalost — shipuje a vylepšuje
- Preferuje přímou akci, ne dlouhé plánování
- Komunikuje česky, kód píše anglicky
- Používá Claude na všech úrovních — od generování CV pro uživatele po řízení celého dev workflow
- Staví AI-first tooling pro sebe (Megan bot) i pro uživatele (dokumenty, matching, asistent)

---

## Projekt 1: Woker (hlavní produkt)

**URL:** https://www.gowoker.com
**Repo:** `/Users/vaclav/Desktop/eurojob.py/woker/`

### Co to je
Česká SaaS platforma pro lidi hledající práci a bydlení ve Švýcarsku. Agreguje nabídky, generuje AI dokumenty v němčině (CV, motivační dopis, email zaměstnavateli), nabízí průvodce povolenky, daněmi a pojištěním.

### Tech Stack
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Database:** Supabase (PostgreSQL) s RLS
- **Auth:** Supabase Auth (OAuth + email/password)
- **Platby:** Stripe — €9.99/měsíc nebo €99.99/rok, 3-denní trial
- **AI:** Anthropic Claude API (Haiku pro cost efficiency)
- **Email:** Resend API
- **Hosting:** Vercel (4 cron joby, 60s timeout)
- **Analytika:** Vercel Analytics + Facebook Pixel

### Klíčové stránky
- `/nabidky` — nabídky práce (5 scraperů: Arbeitnow, Jooble, Michael Page, Robert Half, jobs.ch)
- `/bydleni` — nabídky bydlení (Flatfox API)
- `/kontakty` — 1007+ švýcarských pracovních agentur (paywalled)
- `/pruvodce/sablony` — AI generátor dokumentů (CV, dopis, email, interview prep, analýza smlouvy)
- `/pruvodce/matching` — smart job matching s profilem uživatele
- `/pruvodce/dane` — daňová kalkulačka CH
- `/pruvodce/povoleni` — průvodce pracovními povoleními
- `/pruvodce/pojisteni` — průvodce pojištěním
- `/asistent` — AI chat asistent (streaming)
- `/dashboard` — uživatelský dashboard
- `/blog` — SEO blog

### Databázové tabulky
- **profiles** — rozšířené profily (profese, kanton, jazyková úroveň, dovednosti)
- **jobs** — scrapované nabídky, 14denní cleanup, deduplikace (source, external_id)
- **housing** — Flatfox inzeráty, 14denní cleanup
- **agencies** — 1007+ agentur ze swissstaffing
- **subscriptions** — Stripe subscription tracking
- **applications** — přihlášky uživatelů (cv_html, letter_text, match_score)

### Monetizace
- Freemium model — základní prohlížení zdarma
- Paywall na: plné kontakty agentur, AI generátor dokumentů, premium nástroje
- Stripe s 3denním trialem

### i18n
11 jazyků: cs, en, pl, uk, ro, it, es, pt, hu, el. Cookie-based (`woker-lang`), LanguageContext.

### Omezení
- Vercel 60s function timeout — scrapery musí být rychlé
- Housing scraper používá offset sampling místo sekvenční paginace
- Haiku model pro cost efficiency ve všech AI routes

---

## Projekt 2: Megan (AI orchestrátor)

**Repo:** `/Users/vaclav/Desktop/eurojob.py/megan/`

### Co to je
Telegram bot — osobní AI asistentka pro řízení Woker projektu. Inspirovaná Jarvisem z Iron Mana. Multi-brain architektura s bezpečnostními regulacemi.

### Tech Stack
- Python 3 (async), Anthropic Claude API, python-telegram-bot v21
- Supabase pro conversation memory, audit log, project memory
- MCP server (aiohttp, localhost:7777) jako HTTP bridge pro Claude Code CLI
- macOS LaunchAgent (auto-restart)

### Multi-Brain systém
- **Sonnet** — orchestrace, plánování, rychlé odpovědi
- **Opus** — hluboká analýza, architektura, code review
- **Claude Code CLI** — exekuce kódu přes subprocess

### Memory systém
- Dynamický system prompt — při každém API callu načte fakta z `megan_project_memory` (Supabase)
- Auto-learn — každých 20 zpráv Haiku extrahuje klíčové fakty a uloží do project memory
- Auto-summarizace staré konverzace při překročení token limitu
- 5minutový cache na system prompt

### Bezpečnostní model
- **Whitelist** — bezpečné příkazy (git status, ls, cat...) se provedou automaticky
- **Blacklist** — destruktivní příkazy (rm -rf, DROP TABLE...) se zablokují
- **Šedá zóna** — modifikující akce čekají na potvrzení přes inline keyboard
- **Kill switch** — "STOP" zastaví vše
- **Audit log** — vše se loguje do `megan_logs`

### Telegram příkazy
- `/auto <úkol>` — Ralph Loop: autonomní smyčka (max 10 iterací), plánuje-exekutuje-kontroluje-opakuje
- `/woker_deploy` — git pull + npm build + vercel deploy
- `/woker_stats` — statistiky z DB (users, subscriptions, registrace, jobs, housing)
- `/woker_logs` — posledních 10 Vercel chyb
- `/megan_status` — uptime, RAM, CPU, aktivní Ralph Loops
- `/megan_memory` — co si Megan pamatuje
- `/clear`, `/status`, `/logs`, `/undo`

### Nástroje (Claude tool_use)
run_terminal, run_claude_code, think_with_opus, read_supabase, write_supabase, web_search, project_memory, plan_task, git_workflow

---

## Projekt 3: Content Engine (marketing)

**Repo:** `/Users/vaclav/Desktop/eurojob.py/content-engine/`

### Co to je
Python pipeline pro generování marketingového obsahu pro Woker — Instagram posty, Reels scripty, carousely. Používá Claude pro generování textu a targeting.

### Content pilíře
1. **Porovnání platů CZ vs CH** (30%) — virální čísla
2. Praktické průvodce a tipy
3. Success stories
4. Nábor a agenturní kontakty

### Brand
- Název: Woker
- IG: @woker_com
- Tagline: "AI průvodce prací a životem ve Švýcarsku"
- Founder: Václav

---

## Švýcarský kontext

Woker cílí na české (a středoevropské) pracovníky, kteří chtějí pracovat ve Švýcarsku. Klíčové znalosti:

- **Pracovní povolení:** L (krátkodobé), B (dlouhodobé), C (trvalé), G (přeshraniční)
- **Kantony:** 26 kantonů, každý s vlastními pravidly
- **Jazyky:** Němčina (většina nabídek), Francouzština, Italština
- **Platy:** Výrazně vyšší než v CZ (2-5x), ale i vyšší náklady
- **Agentury:** Swissstaffing — sdružení 1007+ personálních agentur
- **Bydlení:** Velmi náročný trh, Flatfox jako hlavní platforma
- **Pojištění:** Povinné zdravotní pojištění (KVG), povinné penzijní (BVG)
- **Daně:** Kantonální systém, quellensteuer pro cizince

---

## Co bylo implementováno dnes (2026-03-13)

### Woker
- Vytvořen `CLAUDE.md` s kompletním kontextem projektu

### Megan — nové funkce
1. **Ralph Loop** (`/auto`) — autonomní exekuční smyčka, max 10 iterací. Megan sama plánuje kroky, exekutuje je, kontroluje výsledky a opakuje dokud není úkol splněn. Každá iterace posílá update do Telegramu. Podpora STOP pro zastavení.

2. **Custom slash commands:**
   - `/woker_deploy` — sekvenční deploy pipeline (git pull → npm install → npm build → vercel --prod)
   - `/woker_stats` — real-time statistiky z Supabase
   - `/woker_logs` — parsování Vercel error logů
   - `/megan_status` — system monitoring (psutil: uptime, RAM, CPU)
   - `/megan_memory` — zobrazení project memory

3. **Vylepšený memory systém:**
   - Dynamický system prompt (`build_system_prompt()`) — načítá project memory z Supabase a injektuje do system promptu
   - Auto-learn — každých 20 zpráv Haiku extrahuje klíčové fakty a ukládá do project memory
   - 5minutový cache na system prompt (TTL refresh)
   - Sdílený kontext pro main loop i Ralph Loop

---

## Jak pracovat s Václavem

- Mluv česky (kód anglicky)
- Buď přímý a praktický — neplýtvej slovy
- Preferuje kód a akce před dlouhými vysvětleními
- Dává přednost jednoduchým řešením — ne over-engineering
- Používá Claude Haiku kde to stačí (cost efficiency)
- Nebojí se ambiciózních úkolů — rád staví věci od nuly
- Iteruje rychle — shipuje MVP a vylepšuje
- Vyvíjí celý stack sám — od DB migrací po landing page
- AI je core součást produktu, ne přídavek
