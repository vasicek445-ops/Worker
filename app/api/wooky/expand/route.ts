import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { callOpenAI } from '@/lib/openai'
import { wookyField } from '@/lib/wooky/fields'
import type { WookyExpandRequest, WookyExpandResponse } from '@/lib/wooky/types'

// POST /api/wooky/expand
// Body: { field: keyof ProfileRow, raw: string, language?: 'cs' | 'sk' }
// Returns: { expanded: string }
//
// Bezpecnostni zasady promptu: nikdy nedoplnovat fakta, jen profesionalne
// preformulovat to co user explicitne rekl + doplnit logicke kontextove detaily.

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

    // Validate body
    const body = (await req.json()) as WookyExpandRequest
    if (!body || typeof body.field !== 'string' || typeof body.raw !== 'string') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
    const raw = body.raw.trim()
    if (raw.length === 0) {
      return NextResponse.json({ error: 'Empty input' }, { status: 400 })
    }
    if (raw.length > 2000) {
      return NextResponse.json({ error: 'Input too long' }, { status: 400 })
    }

    const meta = wookyField(body.field)
    if (!meta) {
      return NextResponse.json({ error: `Unknown field: ${body.field}` }, { status: 400 })
    }
    if (meta.kind !== 'expand') {
      return NextResponse.json({ error: 'Field does not support expansion' }, { status: 400 })
    }

    const lang = body.language === 'sk' ? 'slovenštině' : 'češtině'

    const prompt = `Jsi Wooky — laskavý AI asistent pro Worker.app, který pomáhá blue-collar pracovníkům z CZ/SK připravit profesionální profil pro práci ve Švýcarsku.

ÚKOL: Rozšíř uživatelův KRÁTKÝ vstup do profesionální podoby v ${lang} pro pole "${meta.label}".

INSTRUKCE PRO TOTO POLE:
${meta.expansionInstruction}

🚫 KRITICKÉ — co NESMÍŠ:
- Nikdy nepřidávej fakta která uživatel nezmínil (jména zaměstnavatelů, čísla certifikátů, konkrétní roky pokud neuvedl, úrovně jazyků B2/C1 pokud neuvedl).
- Nevymýšlej si city/země pokud user uvedl jen obor.
- Žádný marketingový sales-jazyk ("excelentní", "vynikající").

✅ ŠVÝCARSKÝ KONTEXT:
- Pracujeme pro švýcarský trh — používej terminologii, kterou tam HR čeká.
- Stručné a věcné. Žádná osobní fráze ("rád pracuji"), jen fakta a dovednosti.

VSTUP UŽIVATELE:
"""
${raw}
"""

Odpověz POUZE rozšířeným textem. Žádný úvod, žádný komentář, žádné uvozovky kolem.`

    let aiText = ''
    try {
      aiText = await callOpenAI(prompt, {
        model: 'gpt-4o-mini',
        maxTokens: 600,
        timeoutMs: 30_000,
        temperature: 0.3,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'AI volání selhalo'
      return NextResponse.json({ error: msg }, { status: 502 })
    }

    aiText = aiText.trim()
    // Strip případné AI uvozovky kolem
    aiText = aiText.replace(/^["'„«]/, '').replace(/["'""»]$/, '').trim()

    if (!aiText) {
      return NextResponse.json({ error: 'Prázdná odpověď z AI' }, { status: 502 })
    }

    const response: WookyExpandResponse = { expanded: aiText }
    return NextResponse.json(response)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal error'
    console.error('Wooky expand error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
