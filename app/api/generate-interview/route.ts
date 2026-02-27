import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const SYSTEM_PROMPT = `Jsi expert na přípravu na pracovní pohovory ve Švýcarsku. Pomáháš českým pracovníkům připravit se na pohovor v němčině.

TVŮJ ÚKOL: Na základě pozice, oboru a firmy vygeneruješ KOMPLETNÍ přípravu na pohovor.

KLÍČOVÁ PRAVIDLA:
1. OTÁZKY musí být SPECIFICKÉ pro danou pozici a obor — ne generic. Ptej se na konkrétní dovednosti, nástroje, postupy relevantní pro obor.
2. ODPOVĚDI musí znít přirozeně a sebevědomě v němčině. Použij konkrétní příklady.
3. FRÁZE musí být praktické — to co reálně řekneš na pohovoru.
4. TIPY musí být specifické pro švýcarský pracovní trh.
5. Vše přizpůsob úrovni němčiny uživatele — pokud je A2, drž odpovědi jednodušší.

ODPOVĚZ POUZE VALIDNÍM JSON (žádný jiný text!):

{
  "position_summary": "Krátké shrnutí co zaměstnavatel u této pozice hledá (2-3 věty, česky)",
  "questions": [
    {
      "question_de": "Otázka v němčině",
      "question_cz": "Český překlad otázky",
      "answer_de": "Vzorová odpověď v němčině (3-4 věty, konkrétní)",
      "answer_cz": "Český překlad odpovědi",
      "tip": "Krátký tip k odpovědi (česky, 1 věta)"
    }
  ],
  "warnings": [
    {
      "title": "Název varování (česky)",
      "description": "Popis na co si dát pozor (česky, 2-3 věty)"
    }
  ],
  "phrases": [
    {
      "de": "Fráze v němčině",
      "cz": "Český překlad",
      "context": "Kdy to použít (česky, krátce)"
    }
  ],
  "salary_tip": "Tip ohledně platu a Lohnvorstellung pro tuto pozici ve Švýcarsku (česky, 2-3 věty)"
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
    if (!formData || typeof formData !== 'object') return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })

    const userMessage = `Připrav kompletní přípravu na pohovor pro:

Pozice: ${formData.position}
Obor: ${formData.field}
Firma: ${formData.company || 'Nespecifikováno'}
Úroveň němčiny uchazeče: ${formData.german}
Zkušenosti: ${formData.experience || 'Nespecifikováno'}

DŮLEŽITÉ:
- Vygeneruj přesně 10 otázek specifických pro tuto pozici a obor
- Vygeneruj přesně 5 varování/tipů na co si dát pozor
- Vygeneruj přesně 10 klíčových frází pro pohovor v tomto oboru
- Přizpůsob složitost němčiny úrovni uchazeče (${formData.german})
- Zahrň tip ohledně platového očekávání (Lohnvorstellung) pro tuto pozici
- Odpověz POUZE validním JSON`

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const textBlock = response.content.find((block: any) => block.type === 'text')
    let text = textBlock ? (textBlock as any).text : ''
    if (!text) return NextResponse.json({ error: 'Generation failed' }, { status: 500 })

    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

    let interviewData
    try {
      interviewData = JSON.parse(text)
    } catch (parseError) {
      console.error('JSON parse error:', text)
      return NextResponse.json({ error: 'AI generated invalid data. Try again.' }, { status: 500 })
    }

    return NextResponse.json({ interviewData, usage: { input: response.usage.input_tokens, output: response.usage.output_tokens } })
  } catch (error: any) {
    console.error('Generate interview error:', error)
    return NextResponse.json({ error: error.message || 'Generation error' }, { status: 500 })
  }
}
