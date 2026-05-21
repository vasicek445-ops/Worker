import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { callOpenAI } from '@/lib/openai'

// POST /api/smart-apply/draft
// Body: { jobId: string }
// Returns: { subject: string, body: string }
//
// Generuje motivacni email pro konkretni nabidku z user profile + job description.
// gpt-4o-mini, strict no-hallucination prompt: nesmi vymyslet fakta ktera user
// neuvedl v profile. Nemcina prioritne pro CH trh, fallback na cestinu pokud
// uziv. profile ma cs locale a neumi DE.

// Body podporuje 2 modes:
//   - { jobId } — original mode (motivacni email pro konkretni inzerat)
//   - { agencyId } — agency-first mode (general motivacni email pro agenturu)
interface DraftRequest {
  jobId?: string
  agencyId?: number
}

interface DraftResponse {
  subject: string
  body: string
}

export async function POST(req: NextRequest) {
  try {
    // Auth
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.replace(/^Bearer\s+/i, '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate body — accept jobId OR agencyId
    const body = (await req.json()) as DraftRequest
    if (!body || (!body.jobId && !body.agencyId)) {
      return NextResponse.json({ error: 'Invalid body — missing jobId or agencyId' }, { status: 400 })
    }
    const isAgencyMode = !!body.agencyId

    // Load profile
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('full_name, nationality, zkusenosti, vzdelani, dovednosti, nemcina_uroven, dalsi_jazyky, pozice, obor, adresa, telefon, email, ridicky_prukaz, work_permit_status, profile_locale')
      .eq('id', user.id)
      .maybeSingle()

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 500 })
    }
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found — vyplň profil před generací draftu' }, { status: 400 })
    }

    // Vyber jazyk emailu: nemcina prioritne pokud user umi alespon B1, jinak cestina.
    const germanLevel = profile.nemcina_uroven || ''
    const canWriteGerman = ['B1', 'B2', 'C1', 'C2', 'Mateřský'].includes(germanLevel)
    const lang = canWriteGerman ? 'německy (Schweizer Hochdeutsch — "Strasse" ne "Straße", formální Sie)' : 'česky'
    const langCode = canWriteGerman ? 'de' : 'cs'

    // Profile summary jen z explicitnich poli — zadne fantazirovani
    const profileSummary = [
      profile.full_name ? `Jméno: ${profile.full_name}` : null,
      profile.pozice ? `Cílová pozice: ${profile.pozice}` : null,
      profile.obor ? `Obor: ${profile.obor}` : null,
      profile.zkusenosti ? `Pracovní zkušenosti: ${profile.zkusenosti}` : null,
      profile.vzdelani ? `Vzdělání: ${profile.vzdelani}` : null,
      profile.dovednosti ? `Dovednosti: ${profile.dovednosti}` : null,
      profile.nemcina_uroven ? `Úroveň němčiny: ${profile.nemcina_uroven}` : null,
      profile.dalsi_jazyky ? `Další jazyky: ${profile.dalsi_jazyky}` : null,
      profile.nationality ? `Národnost: ${profile.nationality}` : null,
      profile.work_permit_status ? `Pracovní povolení: ${profile.work_permit_status}` : null,
      profile.ridicky_prukaz ? `Řidičský průkaz: ${profile.ridicky_prukaz}` : null,
      profile.adresa ? `Adresa: ${profile.adresa}` : null,
      profile.telefon ? `Telefon: ${profile.telefon}` : null,
    ].filter(Boolean).join('\n')

    // ========================================================================
    // Mode A: AGENCY (general application — Faze A pivot)
    // ========================================================================
    let prompt = ''
    if (isAgencyMode) {
      const { data: agency, error: agencyErr } = await supabaseAdmin
        .from('agencies')
        .select('company, city, canton, region, email, website, industry, current_positions, has_open_positions')
        .eq('id', body.agencyId!)
        .maybeSingle()
      if (agencyErr) return NextResponse.json({ error: agencyErr.message }, { status: 500 })
      if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 })

      const agencySummary = [
        `Firma: ${agency.company}`,
        agency.city ? `Lokace: ${agency.city}${agency.canton ? ` (${agency.canton})` : ''}` : null,
        agency.region ? `Region: ${agency.region}` : null,
        agency.industry && Array.isArray(agency.industry) && agency.industry.length > 0
          ? `Obory: ${(agency.industry as string[]).join(', ')}`
          : null,
        agency.current_positions && Array.isArray(agency.current_positions) && agency.current_positions.length > 0
          ? `Aktuálně otevřené pozice: ${(agency.current_positions as string[]).slice(0, 5).join(', ')}`
          : null,
      ].filter(Boolean).join('\n')

      prompt = `Jsi expert na psaní motivačních emailů pro švýcarský pracovní trh. Pomáháš blue-collar pracovníkům z CZ/SK najít práci ve Švýcarsku.

ÚKOL: Napiš krátký, profesionální OPEN APPLICATION (Initiativbewerbung) email — uchazeč se hlásí do personální agentury s otevřenou žádostí, NE na konkrétní inzerát. Jazyk: ${lang}.

🚫 KRITICKÉ:
- Nikdy nepřidávej fakta, která uchazeč neuvedl v profilu.
- Žádné marketingové superlativy. Buď věcný.
- Email je VŠEOBECNÁ ŽÁDOST do agentury, ne reakce na konkrétní inzerát. NEzminujte specifické pozice pokud agency nemá current_positions.

✅ STRUKTURA EMAILU:
- Předmět: "Initiativbewerbung — [Jméno], [Cílová pozice nebo Obor]" nebo "Otevřená žádost o práci — [Jméno]". Max 60 znaků.
- Tělo: 3-4 odstavce plain text:
  1. Pozdrav: "Sehr geehrte Damen und Herren," / "Vážená paní, vážený pane,"
  2. Krátké představení a důvod kontaktu: hledám práci ve Švýcarsku, viděl jsem že vaše agentura působí v ${agency.region || 'CH'} ${agency.industry ? `v oboru ${(agency.industry as string[]).join('/')}` : ''} — chci se nabídnout jako uchazeč.
  3. Tvoje kvalifikace přesně z profilu.
  4. Závěr: pošlu CV, ochota pohovoru, díky, podpis (Jméno + telefon).

PROFIL UCHAZEČE:
${profileSummary || '(profil je převážně prázdný — zminuj jen to co je vyplneno)'}

AGENTURA:
${agencySummary}

VRAŤ POUZE platný JSON s klíči "subject" a "body". Žádný úvod, žádný komentář, žádné code-fence.
Příklad: {"subject":"...","body":"..."}`
    }
    // ========================================================================
    // Mode B: JOB (original — konkrétní inzerát)
    // ========================================================================
    else {
      const { data: job, error: jobErr } = await supabaseAdmin
        .from('jobs')
        .select('title, company, location, canton, category, description, salary_text, url, remote, job_type')
        .eq('id', body.jobId!)
        .maybeSingle()

      if (jobErr) return NextResponse.json({ error: jobErr.message }, { status: 500 })
      if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

      const jobSummary = [
        `Pozice: ${job.title}`,
        `Firma: ${job.company}`,
        `Lokace: ${job.location}${job.canton ? ` (${job.canton})` : ''}`,
        job.category ? `Kategorie: ${job.category}` : null,
        job.remote ? 'Remote: Ano' : null,
        job.job_type ? `Typ: ${job.job_type}` : null,
        job.description ? `Popis pozice:\n${(job.description as string).slice(0, 2000)}` : null,
      ].filter(Boolean).join('\n')

      prompt = `Jsi expert na psaní motivačních emailů pro švýcarský pracovní trh. Pomáháš blue-collar pracovníkům z CZ/SK najít práci ve Švýcarsku.

ÚKOL: Napiš krátký, profesionální motivační email pro tuto pozici. Jazyk: ${lang}.

🚫 KRITICKÉ:
- Nikdy nepřidávej fakta, která uchazeč neuvedl v profilu.
- Žádné marketingové superlativy. Buď věcný.
- Žádné dlouhé úvody.

✅ STRUKTURA EMAILU:
- Předmět: "Bewerbung als [Pozice] — [Jméno]" nebo "Žádost o pozici [Pozice] — [Jméno]". Max 60 znaků.
- Tělo: 3-4 odstavce plain text:
  1. Pozdrav: "Sehr geehrte Damen und Herren," / "Vážená paní, vážený pane,"
  2. Krátké představení (kdo jsi, jakou pozici hledáš, proč právě tato firma).
  3. Tvoje kvalifikace přesně z profilu.
  4. Závěr: ochota pohovoru, díky, podpis (Jméno + telefon).

PROFIL UCHAZEČE:
${profileSummary || '(profil je převážně prázdný — zminuj jen to co je vyplneno)'}

NABÍDKA:
${jobSummary}

VRAŤ POUZE platný JSON s klíči "subject" a "body". Žádný úvod, žádný komentář, žádné code-fence.
Příklad: {"subject":"...","body":"..."}`
    }

    let aiText = ''
    try {
      aiText = await callOpenAI(prompt, {
        model: 'gpt-4o-mini',
        maxTokens: 900,
        timeoutMs: 30_000,
        temperature: 0.4,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'AI volání selhalo'
      return NextResponse.json({ error: msg }, { status: 502 })
    }

    aiText = aiText.trim()
    // Strip code fences pokud AI je doda navzdory instrukci
    aiText = aiText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()

    let parsed: DraftResponse
    try {
      parsed = JSON.parse(aiText) as DraftResponse
    } catch {
      return NextResponse.json({ error: 'AI vrátila neparseable JSON', raw: aiText.slice(0, 200) }, { status: 502 })
    }

    if (!parsed.subject || !parsed.body) {
      return NextResponse.json({ error: 'AI vrátila prázdný subject/body' }, { status: 502 })
    }

    return NextResponse.json({
      subject: parsed.subject.trim(),
      body: parsed.body.trim(),
      language: langCode,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal error'
    console.error('Smart Apply draft error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
