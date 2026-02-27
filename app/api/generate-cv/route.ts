import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const SYSTEM_PROMPT = `Jsi expert na tvorbu životopisů (Lebenslauf) pro švýcarský pracovní trh. Vytváříš BOHATÉ, PROFESIONÁLNÍ životopisy.

TVŮJ ÚKOL: Na základě údajů od uživatele (v češtině) vytvoříš STRUKTUROVANÝ JSON životopis v NĚMČINĚ.

KLÍČOVÁ PRAVIDLA PRO KVALITU:
1. PROFIL sekce (3-4 věty): Napiš poutavý profesní profil ve třetí osobě. Zdůrazni klíčové silné stránky, roky zkušeností a hlavní kompetence. Musí znít sebevědomě ale ne arogantně.
2. ZKUŠENOSTI: U každé pozice napiš 3-4 KONKRÉTNÍ činnosti (ne obecné). Použij akční slovesa (durchführen, koordinieren, sicherstellen, optimieren, betreuen). Pokud uživatel napíše málo, ROZŠIŘ a vylepši na základě typických činností v oboru.
3. DOVEDNOSTI: Rozděl na technical (oborové, konkrétní) a soft (osobnostní). Vždy přidej alespoň 4-5 technických a 4-5 soft skills i když uživatel zadal méně.
4. JAZYKY: Vždy přidej správné německé názvy úrovní.
5. VZDĚLÁNÍ: Přelož do němčiny, ale ponech vlastní jména institucí.

ODPOVĚZ POUZE VALIDNÍM JSON (žádný jiný text!):

{
  "profil": "3-4 věty profesního profilu v němčině. Motivující, konkrétní, profesionální.",
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
      "location": "město, země",
      "tasks": ["činnost 1 s akčním slovesem", "činnost 2", "činnost 3", "činnost 4"]
    }
  ],
  "education": [
    {
      "period": "YYYY – YYYY",
      "school": "název školy",
      "degree": "titul/obor v němčině",
      "location": "město, země"
    }
  ],
  "languages": [
    {
      "language": "název jazyka v němčině",
      "level": "Muttersprache / A1 Anfänger / A2 Grundkenntnisse / B1 Fortgeschritten / B2 Fließend / C1 Verhandlungssicher"
    }
  ],
  "skills": {
    "technical": ["min 4-5 oborových dovedností"],
    "soft": ["min 4-5 osobnostních vlastností v němčině"]
  },
  "certifications": ["certifikáty pokud relevantní, jinak prázdné pole"]
}`

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: sub } = await supabaseAdmin.from('subscriptions').select('status').eq('user_id', user.id).single()
    if (sub?.status !== 'active') return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 })

    const { formData } = await req.json()
    if (!formData || typeof formData !== 'object') return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })

    const userMessage = `Vytvoř bohatý strukturovaný JSON životopis pro:

Jméno: ${formData.name}
Datum narození: ${formData.birthdate}
Národnost: ${formData.nationality || 'Česká'}
Adresa: ${formData.address || 'Česká republika'}
Telefon: ${formData.phone}
Email: ${formData.email}
Řidičský průkaz: ${formData.driving || 'žádný'}
Cílová pozice: ${formData.position}
Obor: ${formData.field}

PRACOVNÍ ZKUŠENOSTI (rozšiř a vylepši popisy):
${formData.experience_detail}

VZDĚLÁNÍ:
${formData.education}

JAZYKY:
Čeština: rodilý mluvčí
Němčina: ${formData.german}
${formData.other_languages ? 'Další jazyky: ' + formData.other_languages : ''}

DOVEDNOSTI (doplň relevantní pro obor):
${formData.skills}

DŮLEŽITÉ: Rozšiř každou pozici na 3-4 konkrétní činnosti s akčními slovesy. Napiš motivující profil. Doplň skills pokud jich je málo. Odpověz POUZE validním JSON.`

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const textBlock = response.content.find((block: any) => block.type === 'text')
    let text = textBlock ? (textBlock as any).text : ''
    if (!text) return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
    text = text.replace(/\`\`\`json\s*/g, '').replace(/\`\`\`\s*/g, '').trim()

    let cvData
    try { cvData = JSON.parse(text) }
    catch (parseError) { console.error('JSON parse error:', text); return NextResponse.json({ error: 'AI generated invalid data. Try again.' }, { status: 500 }) }

    return NextResponse.json({ cvData, usage: { input: response.usage.input_tokens, output: response.usage.output_tokens } })
  } catch (error: any) {
    console.error('Generate CV error:', error)
    return NextResponse.json({ error: error.message || 'Generation error' }, { status: 500 })
  }
}
