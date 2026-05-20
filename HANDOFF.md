# Handoff — pokračování profile reorganizace (2026-05-20)

## Co je hotové a nasazené (gowoker.com)

### CV builder — kompletní redesign (F1-F11 + thumbnails)
- 3-column layout (`app/components/cv/CVBuilderLayout.tsx`)
- 7 sekcí (`app/components/cv/sections/*.tsx`)
- 15 šablon s názvy švýcarských měst (`lib/cv/templates.ts`)
- Reálné PNG náhledy ve `public/cv-thumbs/` (Petr Novák dummy, bez UI chrome)
- Live preview s aspect-ratio + skrytými PDF buttons
- Template-first onboarding `/pruvodce/sablony/cv/vyber-sablonu`
- WheelDatePicker (3-select cz, kompatibilní s Hepner stylem)
- Woker Score 1-100 (lib/cv/score.ts)
- AI dropdown per sekce (/api/cv/improve)
- DE phrases library 5 oborů × 15 frází (lib/cv/phrases-de.ts)
- Web URL sdílení `/cv/{slug}`

### Profile refactor (P1-P4) — právě dokončený
- Migrace `supabase/migrations/20260520_profile_extensions.sql` — Václav musel spustit v SQL editoru
- Nová struktura `/profil/*`:
  - `/profil` → redirect na `/profil/osobni-udaje`
  - `/profil/osobni-udaje`, `/profil/kariera`, `/profil/cil` (3 hlavní sekce)
  - `/profil/dokumenty` → redirect na `/dokumenty`
  - `/profil/gmail` (existing Smart Apply)
  - `/profil/preference` (jazyk UI, notifikace)
  - `/profil/nastaveni` (index) + `/ucet`, `/predplatne`, `/data`
  - `/profil/nastaveni/predplatne/zrusit` (3 kliky cancel)
- Shell `app/profil/_components/`: ProfileNav, ReadinessSidebar, ProfileShell, AutoSaveIndicator
- Sdílené lib `lib/profile/`: types.ts, sections.ts, completeness.ts, hooks.ts (useProfile auto-save)
- Auto-fill napříč 4 formami: motivacni-dopis, email, pohovor, bydleni (badge „z profilu")

### Smart Apply (z minulých sessions, ne tahle)
- /profil/nastaveni/predplatne/zrusit/page.tsx s dotazníkem (7 důvodů)
- Cancellation feedback migrace `cancellation_feedback`
- Google OAuth verification submitted (gmail.send, sensitive scope)

## Aktuálně řešený problém (přerušeno na restart)

**Václavův feedback ke screenshotu /profil/cil:**
> „obsah je perfektní ale uspořádání je chaotické"

### Mé doporučení (3 priority změny):

**P1: Compactnější sidebar nav** — vyhodit 2-line subtitles, přidat inline completion dots
```
DNES:                          NAVRHOVANE:
👤 Osobní údaje                👤 Osobní údaje      • 60%
   Jméno, foto, kontakt        💼 Kariéra           • 80%
💼 Kariéra                     🎯 Cíl              ○ 0%
   ...                         (žádný subtitle)
```

**P2: Breadcrumb + tighter title**
```
DNES: H1 32px „Můj profil" + subtitle 14px + H2 24px „Cíl"
NAVRH: 12px gray "Profil › Cíl" + H1 22px „Cíl"
```

**P3: Pravý sidebar menší (280px → 220px)** + odstranění SSOT „Vyplň jednou" boxu (info je v title)

### Co dělat po restartu

1. **Použít Refero MCP** (přidaný, ale require restart) pro skutečnou inspiraci — search „profile settings page" / „Linear settings" / „Cal.com profile"
2. Aplikovat 3 priority změny v:
   - `app/profil/_components/ProfileNav.tsx` (P1)
   - `app/profil/_components/ProfileShell.tsx` (P2 breadcrumb + tighter title)
   - `app/profil/_components/ReadinessSidebar.tsx` (P3 narrower + drop SSOT box)
3. Add completion percentage per sekce do ProfileNav (potřebuje volat `calculateCompleteness` per section group)
4. Deploy + screenshot check

### Důležitý kontext
- Memory rule: feedback_push_after_approval (explicit OK pro commit+push, pak ne ptat se znovu)
- Memory rule: project_landing_page (Mercury/Linear dark style preference)
- Václav žije v CH, Worker target = blue-collar CZ/SK workers
- Brand: oranžová #fb923c, dark #0a0a12, Plus Jakarta Sans
- Refero MCP byl několik dní dolů, teď přidán s auth token

## Klíčové soubory pro reorganizaci

```
app/profil/_components/
├── ProfileNav.tsx          ← P1: compact items + completion dots
├── ProfileShell.tsx        ← P2: breadcrumb + smaller title
├── ReadinessSidebar.tsx    ← P3: narrower, drop SSOT box
└── AutoSaveIndicator.tsx   ← OK, neměnit

lib/profile/
├── sections.ts             ← PROFILE_SECTIONS — možná přidat completion mapping
├── completeness.ts         ← calculateCompleteness — možná rozšířit o per-section %
├── types.ts                ← OK
└── hooks.ts                ← OK

app/profil/page.tsx         ← redirect na /osobni-udaje (OK)
app/profil/layout.tsx       ← wrappuje do ProfileShell unless STANDALONE_PATHS
app/profil/page.legacy.tsx.bak  ← záloha původních 709 řádků
```

## Co Václav musí udělat lokálně

1. Restart Claude Code (Cmd+Q + `claude` v terminálu) aby Refero MCP bylo aktivní
2. Pokud potřebuje skip permissions: `claude --dangerously-skip-permissions`
3. Pak pokračovat: „Pokračuj v profile reorganizaci podle HANDOFF.md, použij Refero MCP"
