import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const SYSTEM_PROMPT = `Jsi expert na analýzu pracovních inzerátů ve Švýcarsku. Pomáháš českým pracovníkům pochopit co firma hledá a jak se nejlépe prezentovat.

TVŮJ ÚKOL: Analyzuj pracovní inzerát (v němčině nebo češtině) a vytvoř kompletní analýzu.

ODPOVĚZ POUZE VALIDNÍM JSON (žádný jiný text!):

{
  "company": "Název firmy (pokud je v inzerátu)",
  "position": "Název pozice (v originále + český překlad)",
  "location": "Místo práce",
  "salary": "Plat pokud je uveden, jinak 'Neuvedeno'",
  "contract_type": "Typ úvazku (plný, částečný, temp, pevný)",
  "summary": "Shrnutí pozice česky (3-4 věty – co firma dělá, co hledá, proč je to zajímavé)",
  "requirements": {
    "must_have": [
      {"requirement": "Požadavek (česky)", "requirement_de": "Originál v němčině", "difficulty": "easy/medium/hard"}
    ],
    "nice_to_have": [
      {"requirement": "Výhoda (česky)", "requirement_de": "Originál v němčině"}
    ]
  },
  "languages": [
    {"language": "Jazyk", "level": "Požadovaná úroveň", "importance": "Povinné/Výhoda"}
  ],
  "skills_needed": ["skill1", "skill2"],
  "red_flags": [
    {"flag": "Na co si dát pozor (česky)", "explanation": "Vysvětlení"}
  ],
  "green_flags": [
    {"flag": "Co je pozitivní (česky)", "explanation": "Vysvětlení"}
  ],
  "match_tips": [
    "Konkrétní tip jak se prezentovat pro tuto pozici (česky)",
    "Tip 2",
    "Tip 3"
  ],
  "cover_letter_keywords": ["klíčová slova co použít v motivačním dopise"],
  "interview_topics": ["téma na které se pravděpodobně budou ptát"],
  "salary_estimate": "Odhad platu pro tuto pozici ve Švýcarsku (rozmezí CHF/měsíc) pokud není uveden",
  "match_score": 75
}

MATCH SCORE (0-100):
Pokud je k dispozici profil uchazeče, vypočítej match_score (0-100) na základě:
- Shoda požadavků s dovednostmi uchazeče (40%)
- Jazyková úroveň vs. požadavek (30%)
- Relevance zkušeností (20%)
- Obor/pozice shoda (10%)
Pokud profil není k dispozici, nastav match_score na null.`

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

    const { jobText, userProfile } = await req.json()
    if (!jobText || typeof jobText !== 'string' || jobText.trim().length < 30) {
      return NextResponse.json({ error: 'Vlož text inzerátu (min. 30 znaků)' }, { status: 400 })
    }

    // Load profile from DB if not provided
    let profileData = userProfile
    if (!profileData) {
      const { data: dbProfile } = await supabaseAdmin
        .from('profiles')
        .select('pozice, obor, nemcina_uroven, zkusenosti, dovednosti')
        .eq('id', user.id)
        .single()

      if (dbProfile && (dbProfile.pozice || dbProfile.dovednosti || dbProfile.zkusenosti)) {
        profileData = {
          position: dbProfile.pozice || '',
          experience: dbProfile.zkusenosti || '',
          german: dbProfile.nemcina_uroven || '',
          skills: dbProfile.dovednosti || '',
          field: dbProfile.obor || '',
        }
      }
    }

    const userContext = profileData ? `

PROFIL UCHAZEČE (porovnej s požadavky a vypočítej match_score):
Pozice: ${profileData.position || 'Neuvedeno'}
Obor: ${profileData.field || 'Neuvedeno'}
Zkušenosti: ${profileData.experience || 'Neuvedeno'}
Němčina: ${profileData.german || 'Neuvedeno'}
Dovednosti: ${profileData.skills || 'Neuvedeno'}` : ''

    const userMessage = `Analyzuj tento pracovní inzerát a vytvoř kompletní analýzu v JSON:

--- INZERÁT ---
${jobText.substring(0, 5000)}
--- KONEC INZERÁTU ---
${userContext}

DŮLEŽITÉ:
- Vytáhni VŠECHNY požadavky a rozděl na povinné (must_have) a výhodné (nice_to_have)
- U povinných požadavků ohodnoť obtížnost pro českého uchazeče (easy/medium/hard)
- Najdi red flags i green flags
- Dej konkrétní tipy jak se prezentovat
- Odhadni plat pokud není uveden
- Navrhni klíčová slova pro motivační dopis
${profileData ? '- VYPOČÍTEJ match_score (0-100) na základě profilu uchazeče' : '- match_score nastav na null (profil není k dispozici)'}
- Odpověz POUZE validním JSON`

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const textBlock = response.content.find((block: { type: string }) => block.type === 'text')
    let text = textBlock && 'text' in textBlock ? (textBlock as { type: string; text: string }).text : ''
    if (!text) return NextResponse.json({ error: 'Generation failed' }, { status: 500 })

    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    if (jsonStart !== -1 && jsonEnd !== -1) text = text.substring(jsonStart, jsonEnd + 1)

    let analysisData
    try {
      analysisData = JSON.parse(text)
    } catch {
      try {
        text = text.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')
        analysisData = JSON.parse(text)
      } catch {
        console.error('JSON parse failed:', text.substring(0, 500))
        return NextResponse.json({ error: 'AI generated invalid data. Try again.' }, { status: 500 })
      }
    }

    // Save to history (non-blocking)
    void supabaseAdmin
      .from('job_analyses')
      .insert({
        user_id: user.id,
        job_text: jobText.substring(0, 5000),
        position: analysisData.position || null,
        company: analysisData.company || null,
        location: analysisData.location || null,
        match_score: typeof analysisData.match_score === 'number' ? analysisData.match_score : null,
        analysis_data: analysisData,
      })

    return NextResponse.json({ analysisData, usage: { input: response.usage.input_tokens, output: response.usage.output_tokens } })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Analyze job error:', error)
    return NextResponse.json({ error: error.message || 'Analysis error' }, { status: 500 })
  }
}
