import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SYSTEM_PROMPT = `Jsi expert na tvorbu životopisů (Lebenslauf) pro švýcarský pracovní trh.

TVŮJ ÚKOL: Na základě údajů od uživatele (v češtině) vytvoříš STRUKTUROVANÝ JSON životopis v NĚMČINĚ.

PRAVIDLA:
- Všechny texty v JSON piš v NĚMČINĚ (Hochdeutsch)
- Zkušenosti řaď od nejnovější po nejstarší
- Datumový formát: MM.YYYY – MM.YYYY
- U každé pozice uveď 2–3 konkrétní činnosti (tasks)
- Jazyky uváděj s úrovní v němčině (Muttersprache, Grundkenntnisse, Fließend, etc.)
- Čeština = Muttersprache
- Národnost přelož do němčiny (Česká = Tschechisch)
- Pokud kandidát nemá mnoho zkušeností, zdůrazni dovednosti
- Soft skills vždy v němčině (Zuverlässigkeit, Teamfähigkeit, etc.)
- Technical skills mohou zůstat v originále (MIG/MAG, CNC, etc.)

ODPOVĚZ POUZE VALIDNÍM JSON v tomto formátu (žádný jiný text!):

{
  "personalData": {
    "name": "string",
    "birthdate": "string",
    "nationality": "string (v němčině)",
    "address": "string",
    "phone": "string",
    "email": "string",
    "drivingLicense": "string nebo null"
  },
  "experience": [
    {
      "period": "MM.YYYY – MM.YYYY",
      "title": "název pozice v němčině",
      "company": "název firmy",
      "tasks": ["činnost 1 v němčině", "činnost 2", "činnost 3"]
    }
  ],
  "education": [
    {
      "period": "YYYY – YYYY",
      "school": "název školy v němčině",
      "degree": "titul/obor v němčině"
    }
  ],
  "languages": [
    {
      "language": "název jazyka v němčině",
      "level": "úroveň v němčině (např. Muttersprache, A2 Grundkenntnisse, B2 Fließend)"
    }
  ],
  "skills": {
    "technical": ["technická dovednost 1", "dovednost 2"],
    "soft": ["soft skill v němčině 1", "soft skill 2"]
  }
}`

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .single()

    if (sub?.status !== 'active') {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 })
    }

    const { formData } = await req.json()

    if (!formData || typeof formData !== 'object') {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const userMessage = `Vytvoř strukturovaný JSON životopis pro tyto údaje:

Jméno: ${formData.name}
Datum narození: ${formData.birthdate}
Národnost: ${formData.nationality || 'Česká'}
Adresa: ${formData.address || 'Česká republika'}
Telefon: ${formData.phone}
Email: ${formData.email}
Řidičský průkaz: ${formData.driving || 'žádný'}
Cílová pozice: ${formData.position}
Obor: ${formData.field}

PRACOVNÍ ZKUŠENOSTI:
${formData.experience_detail}

VZDĚLÁNÍ:
${formData.education}

JAZYKY:
Čeština: rodilý mluvčí
Němčina: ${formData.german}
${formData.other_languages ? 'Další jazyky: ' + formData.other_languages : ''}

DOVEDNOSTI:
${formData.skills}

Odpověz POUZE validním JSON objektem.`

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const textBlock = response.content.find((block: any) => block.type === 'text')
    let text = textBlock ? (textBlock as any).text : ''

    if (!text) {
      return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
    }

    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

    let cvData
    try {
      cvData = JSON.parse(text)
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Raw text:', text)
      return NextResponse.json({ error: 'AI generated invalid data. Try again.' }, { status: 500 })
    }

    return NextResponse.json({
      cvData,
      usage: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
    })
  } catch (error: any) {
    console.error('Generate CV error:', error)
    return NextResponse.json(
      { error: error.message || 'Generation error' },
      { status: 500 }
    )
  }
}
