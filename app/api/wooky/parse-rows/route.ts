import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { callOpenAI } from '@/lib/openai'

// POST /api/wooky/parse-rows
// Bere user free text + kind (experiences/educations/languages) a vraci strukturovany
// JSON array. Pouziva se v profil/kariera inline AI helperu — user pise volnym textem
// a Wooky to rozparsuje do radku ktere se pridaji do multi-row UI.

type Kind = 'experiences' | 'educations' | 'languages'

const SCHEMAS: Record<Kind, { description: string; shape: string; example: string }> = {
  experiences: {
    description: 'pracovni zkusenosti',
    shape: `{
  "period": "RRRR – RRRR" nebo "RRRR – Současné",
  "title": "Pozice (Kuchar, Skladnik, ...)",
  "company": "Firma",
  "location": "Mesto",
  "description": "1-3 strucnych bullet pointu oddelenych \\n — co user delal. Akcni slovesa."
}`,
    example: `[
  {"period": "2020 – 2024", "title": "Skladnik", "company": "DHL Logistics", "location": "Curych", "description": "Obsluha vysokozdvizneho voziku\\nKomisionovani zbozi\\nKontrola kvality"},
  {"period": "2018 – 2020", "title": "Pomocnik v kuchyni", "company": "Restaurace Slunce", "location": "Praha", "description": "Priprava ingredienci\\nUdrzba kuchyne"}
]`,
  },
  educations: {
    description: 'vzdelani',
    shape: `{
  "period": "RRRR – RRRR",
  "school": "Skola",
  "degree": "Obor / Titul (SOU, SS, VS)",
  "location": "Mesto"
}`,
    example: `[
  {"period": "2014 – 2017", "school": "SOU gastronomicke", "degree": "Kuchar-cisnik", "location": "Praha"}
]`,
  },
  languages: {
    description: 'jazyky',
    shape: `{
  "language": "Cesky nazev jazyka (Anglictina, Italstina, Polstina, Madarstina, ...)",
  "level": "A1, A2, B1, B2, C1, C2 nebo Matersky"
}`,
    example: `[
  {"language": "Anglictina", "level": "B2"},
  {"language": "Italstina", "level": "A2"}
]`,
  },
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const token = authHeader.replace(/^Bearer\s+/i, '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json() as { kind?: Kind; raw?: string }
    const kind = body.kind
    const raw = (body.raw || '').trim()

    if (!kind || !SCHEMAS[kind]) {
      return NextResponse.json({ error: 'Invalid kind' }, { status: 400 })
    }
    if (raw.length < 3) {
      return NextResponse.json({ error: 'Empty input' }, { status: 400 })
    }
    if (raw.length > 3000) {
      return NextResponse.json({ error: 'Input too long' }, { status: 400 })
    }

    const schema = SCHEMAS[kind]

    const prompt = `Jsi Wooky — AI asistent pro Worker.app (pomahas blue-collar pracovnikum z CZ/SK do Svycarska).

UKOL: Z volneho textu uzivatele vytvor JSON array objektu pro pole "${schema.description}".

SHAPE OBJEKTU:
${schema.shape}

PRIKLAD VYSTUPU:
${schema.example}

🚫 KRITICKE:
- Vrat POUZE platny JSON array — zadny markdown, zadny komentar, zadny text okolo.
- Pokud user neuvedl konkretni rok, nech period prazdny "".
- Pokud user neuvedl misto, nech location prazdny "".
- Nikdy nevymysli jmena zamestnavatelu/skol pokud user nezminil.
- Nikdy nevymysli urovne jazyku — pokud user nerekl "B2", nech level prazdny.
- Pokud user popsal vic polozek, vrat array s vice objekty.

VSTUP UZIVATELE:
"""
${raw}
"""

Odpovez POUZE platnym JSON array (zacni "[" a skonci "]").`

    let aiText = ''
    try {
      aiText = await callOpenAI(prompt, {
        model: 'gpt-4o-mini',
        maxTokens: 800,
        timeoutMs: 30_000,
        temperature: 0.2,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'AI volání selhalo'
      return NextResponse.json({ error: msg }, { status: 502 })
    }

    // Strip markdown code fences kdyby AI je pridala
    aiText = aiText
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()

    let rows: unknown
    try {
      rows = JSON.parse(aiText)
    } catch {
      return NextResponse.json({ error: 'AI vratila neplatny JSON', preview: aiText.slice(0, 200) }, { status: 502 })
    }

    if (!Array.isArray(rows)) {
      return NextResponse.json({ error: 'AI nevratila array' }, { status: 502 })
    }

    return NextResponse.json({ rows })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal error'
    console.error('Wooky parse-rows error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
