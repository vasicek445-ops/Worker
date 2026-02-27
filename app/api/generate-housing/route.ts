import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const SYSTEM_PROMPT = `Jsi expert na švýcarský trh s bydlením. Pomáháš českým pracovníkům najít bydlení ve Švýcarsku a připravit profesionální Bewerbungsdossier (žádost o byt).

KONTEXT: Ve Švýcarsku je obrovská konkurence o byty. Pronajímatelé dostávají 50-200 žádostí na jeden byt. Bez profesionálního Bewerbungsdossier nemáš šanci. Češi o tom většinou nevědí.

TVŮJ ÚKOL: Vygeneruj kompletní Bewerbungsdossier v němčině + české tipy.

ODPOVĚZ POUZE VALIDNÍM JSON:

{
  "bewerbungsschreiben": "Kompletní motivační dopis pro pronajímatele v NĚMČINĚ (5-8 odstavců). Profesionální, zdvořilý, s konkrétními detaily o osobě. Zmíň zaměstnání, příjem, důvod stěhování, spolehlivost. Formát: Sehr geehrte Damen und Herren...",
  "bewerbungsschreiben_cz": "Český překlad motivačního dopisu",
  "personal_profile_de": "Krátký profil v němčině pro přiložení k žádosti (jméno, věk, zaměstnání, firma, příjem, nekuřák/kuřák, domácí zvířata, aktuální bydliště)",
  "personal_profile_cz": "Český překlad profilu",
  "checklist": [
    {
      "document": "Název dokumentu (česky)",
      "document_de": "Název v němčině",
      "description": "Co to je a kde to získat (česky)",
      "priority": "essential/recommended/optional",
      "how_to_get": "Konkrétní postup jak získat (česky)"
    }
  ],
  "portals": [
    {
      "name": "Název portálu",
      "url": "URL",
      "description": "Popis (česky)",
      "cost": "Cena/zdarma",
      "warning": "Varování pokud existuje (česky), jinak null"
    }
  ],
  "scam_warnings": [
    {
      "scam": "Typ podvodu (česky)",
      "how_to_spot": "Jak ho poznat (česky)",
      "example": "Příklad (česky)"
    }
  ],
  "tips": [
    "Konkrétní tip pro hledání bydlení ve Švýcarsku (česky)"
  ],
  "cost_breakdown": {
    "deposit": "Info o kauci (Mietkaution) — obvykle 3 měsíční nájmy",
    "first_month": "Co zaplatit první měsíc",
    "insurance": "Haftpflichtversicherung (pojištění odpovědnosti) — povinné",
    "other": "Další náklady (Nebenkosten, Serafe/Billag...)"
  },
  "region_tips": "Tipy specifické pro region/kanton kde hledá (česky, 2-3 věty)"
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

    const { formData } = await req.json()
    if (!formData?.name?.trim() || !formData?.region?.trim()) {
      return NextResponse.json({ error: 'Vyplň jméno a region' }, { status: 400 })
    }

    const userMessage = `Vytvoř Bewerbungsdossier pro tuto osobu:

ÚDAJE:
- Jméno: ${formData.name}
- Věk: ${formData.age || 'Neuvedeno'}
- Aktuální bydliště: ${formData.currentCity || 'Česká republika'}
- Zaměstnavatel: ${formData.employer || 'Neuvedeno'}
- Pozice: ${formData.position || 'Neuvedeno'}
- Měsíční příjem (hrubý): ${formData.income || 'Neuvedeno'}
- Region kde hledá byt: ${formData.region}
- Typ bytu: ${formData.apartmentType || '1-2 pokoje'}
- Max. nájem: ${formData.maxRent || 'Neuvedeno'}
- Kuřák: ${formData.smoker || 'Ne'}
- Domácí zvířata: ${formData.pets || 'Ne'}
- Stěhování od: ${formData.moveDate || 'Co nejdříve'}
- Další info: ${formData.extra || 'Žádné'}

DŮLEŽITÉ:
- Bewerbungsschreiben musí být profesionální, v němčině, 5-8 odstavců
- Přizpůsob region — jiné tipy pro Zürich vs. Luzern vs. Bern
- Varuj před podvody (falešné inzeráty, platba předem)
- Uveď realistické náklady pro daný region
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

    let housingData
    try {
      housingData = JSON.parse(text)
    } catch {
      try {
        text = text.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')
        housingData = JSON.parse(text)
      } catch {
        console.error('JSON parse failed:', text.substring(0, 500))
        return NextResponse.json({ error: 'AI generated invalid data. Try again.' }, { status: 500 })
      }
    }

    return NextResponse.json({ housingData, usage: { input: response.usage.input_tokens, output: response.usage.output_tokens } })
  } catch (error: any) {
    console.error('Housing error:', error)
    return NextResponse.json({ error: error.message || 'Generation error' }, { status: 500 })
  }
}
