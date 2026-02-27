import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const SYSTEM_PROMPT = `Jsi expert na švýcarské pracovní právo a pracovní smlouvy. Pomáháš českým pracovníkům porozumět jejich pracovní smlouvě v němčině.

TVŮJ ÚKOL: Analyzuj pracovní smlouvu a vytvoř srozumitelnou analýzu v češtině.

KLÍČOVÁ PRAVIDLA:
1. Překládej přesně — právní termíny musí být správně
2. Porovnávej se švýcarským standardem (OR, GAV pokud existuje)
3. Upozorni na vše nestandardní nebo nevýhodné
4. Buď konkrétní — "výpovědní lhůta 1 měsíc je KRATŠÍ než standard 3 měsíce"
5. Vždy zmiň co ve smlouvě CHYBÍ a mělo by tam být

ODPOVĚZ POUZE VALIDNÍM JSON:

{
  "overview": {
    "employer": "Název zaměstnavatele",
    "position": "Pozice",
    "location": "Místo práce",
    "start_date": "Datum nástupu",
    "contract_type": "Typ smlouvy (befristet/unbefristet)",
    "workload": "Úvazek (100%, 80%...)",
    "salary_gross": "Hrubá mzda",
    "salary_info": "Další info o mzdě (13. plat, bonusy...)"
  },
  "key_terms": [
    {
      "term_de": "Originální text klauzule v němčině (zkrácený)",
      "term_name": "Název klauzule česky (Zkušební doba, Výpovědní lhůta...)",
      "translation": "Překlad do češtiny",
      "explanation": "Co to prakticky znamená pro tebe (česky, 2-3 věty)",
      "status": "ok/warning/danger",
      "status_reason": "Proč je to ok/varování/problém (česky, 1 věta)"
    }
  ],
  "red_flags": [
    {
      "issue": "Problém (česky)",
      "detail": "Vysvětlení proč je to problém (česky, 2-3 věty)",
      "recommendation": "Co s tím dělat (česky)"
    }
  ],
  "green_flags": [
    {
      "positive": "Co je pozitivní (česky)",
      "detail": "Proč je to dobré (česky)"
    }
  ],
  "missing_items": [
    {
      "item": "Co ve smlouvě chybí (česky)",
      "importance": "high/medium/low",
      "recommendation": "Co udělat (česky)"
    }
  ],
  "swiss_comparison": {
    "probation": "Porovnání zkušební doby se standardem",
    "notice_period": "Porovnání výpovědní lhůty",
    "vacation": "Porovnání dovolené (min. 4 týdny ze zákona)",
    "overtime": "Jak je řešena přesčasová práce",
    "thirteenth_salary": "Je/není 13. plat"
  },
  "negotiate_tips": [
    "Konkrétní tip co si vyjednat (česky)"
  ],
  "overall_rating": "good/acceptable/caution/bad",
  "overall_summary": "Celkové shrnutí smlouvy česky (3-4 věty)"
}`

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .single()

    if (sub?.status !== 'active') return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 })

    const { contractText } = await req.json()
    if (!contractText || typeof contractText !== 'string' || contractText.trim().length < 50) {
      return NextResponse.json({ error: 'Vlož text smlouvy (min. 50 znaků)' }, { status: 400 })
    }

    const userMessage = `Analyzuj tuto švýcarskou pracovní smlouvu:

--- SMLOUVA ---
${contractText.substring(0, 8000)}
--- KONEC SMLOUVY ---

DŮLEŽITÉ:
- Vytáhni VŠECHNY klíčové klauzule a přelož je
- Porovnej se švýcarským standardem (OR čl. 319-362)
- Upozorni na red flags i green flags
- Řekni co ve smlouvě chybí
- Dej konkrétní tipy co si vyjednat
- Ohodnoť celkově: good/acceptable/caution/bad
- Odpověz POUZE validním JSON`

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 6000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const textBlock = response.content.find((block: any) => block.type === 'text')
    let text = textBlock ? (textBlock as any).text : ''
    if (!text) return NextResponse.json({ error: 'Generation failed' }, { status: 500 })

    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    if (jsonStart !== -1 && jsonEnd !== -1) text = text.substring(jsonStart, jsonEnd + 1)

    let contractData
    try {
      contractData = JSON.parse(text)
    } catch {
      try {
        text = text.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')
        contractData = JSON.parse(text)
      } catch {
        console.error('JSON parse failed:', text.substring(0, 500))
        return NextResponse.json({ error: 'AI generated invalid data. Try again.' }, { status: 500 })
      }
    }

    return NextResponse.json({ contractData, usage: { input: response.usage.input_tokens, output: response.usage.output_tokens } })
  } catch (error: any) {
    console.error('Analyze contract error:', error)
    return NextResponse.json({ error: error.message || 'Analysis error' }, { status: 500 })
  }
}
