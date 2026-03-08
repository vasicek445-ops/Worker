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

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Subscription check
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .single()

    if (sub?.status !== 'active') return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 })

    // Load user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile?.profile_complete) {
      return NextResponse.json({ error: 'Profile not complete. Fill in your work profile first.' }, { status: 400 })
    }

    // Canton to region mapping
    const cantonRegion: Record<string, string> = {
      ZH: 'german', BE: 'german', LU: 'german', UR: 'german', SZ: 'german',
      OW: 'german', NW: 'german', GL: 'german', ZG: 'german', SO: 'german',
      BS: 'german', BL: 'german', SH: 'german', AR: 'german', AI: 'german',
      SG: 'german', GR: 'german', AG: 'german', TG: 'german',
      FR: 'french', VD: 'french', NE: 'french', GE: 'french', JU: 'french',
      VS: 'french', TI: 'italian',
    }

    const preferredRegion = cantonRegion[profile.preferovany_kanton] || 'german'

    // Query agencies: first by canton, then same region
    let { data: agencies } = await supabaseAdmin
      .from('agencies')
      .select('id, company, city, canton, region, email, website, telephone')
      .eq('canton', profile.preferovany_kanton)
      .not('email', 'is', null)
      .limit(30)

    // If not enough results, broaden to region
    if (!agencies || agencies.length < 15) {
      const { data: regionAgencies } = await supabaseAdmin
        .from('agencies')
        .select('id, company, city, canton, region, email, website, telephone')
        .eq('region', preferredRegion)
        .not('email', 'is', null)
        .limit(50)

      const existingIds = new Set((agencies || []).map(a => a.id))
      const additional = (regionAgencies || []).filter(a => !existingIds.has(a.id))
      agencies = [...(agencies || []), ...additional].slice(0, 50)
    }

    if (!agencies || agencies.length === 0) {
      return NextResponse.json({ error: 'No agencies found for your region' }, { status: 404 })
    }

    // Prepare agency list for AI (minimal data to save tokens)
    const agencyList = agencies.map(a => ({
      id: a.id,
      company: a.company,
      city: a.city,
      canton: a.canton,
      region: a.region,
    }))

    // AI matching
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: `Jsi expert na švýcarský pracovní trh a temporální agentury. Na základě profilu kandidáta a seznamu agentur vyber TOP 10 nejlepších shod.

Pro každou agenturu zhodnoť:
- Blízkost k preferovanému kantonu kandidáta
- Velikost a známost agentury (velké agentury jako Adecco, Manpower, Randstad mají více nabídek)
- Vhodnost regionu pro daný obor

ODPOVĚZ POUZE VALIDNÍM JSON polem (žádný jiný text):
[
  {
    "agency_id": 123,
    "match_score": 85,
    "reasoning": "Krátké zdůvodnění v češtině (max 2 věty)"
  }
]

Seřaď od nejvyššího match_score. Match score 70-100.`,
      messages: [{
        role: 'user',
        content: `PROFIL KANDIDÁTA:
Obor: ${profile.obor}
Pozice: ${profile.pozice}
Preferovaný kanton: ${profile.preferovany_kanton}
Němčina: ${profile.nemcina_uroven}
Zkušenosti: ${profile.zkusenosti}
Dovednosti: ${profile.dovednosti || 'neuvedeno'}

SEZNAM AGENTUR:
${JSON.stringify(agencyList)}`
      }],
    })

    const textBlock = response.content.find((block: any) => block.type === 'text')
    let text = textBlock ? (textBlock as any).text : ''
    if (!text) return NextResponse.json({ error: 'Matching failed' }, { status: 500 })

    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

    let matchResults: any[]
    try {
      matchResults = JSON.parse(text)
    } catch {
      console.error('Match parse error:', text)
      return NextResponse.json({ error: 'AI returned invalid data. Try again.' }, { status: 500 })
    }

    // Enrich with full agency data
    const agencyMap = new Map(agencies.map(a => [a.id, a]))
    const matches = matchResults
      .filter((m: any) => agencyMap.has(m.agency_id))
      .map((m: any) => {
        const agency = agencyMap.get(m.agency_id)!
        return {
          agency_id: m.agency_id,
          company: agency.company,
          city: agency.city,
          canton: agency.canton,
          email: agency.email,
          website: agency.website,
          telephone: agency.telephone,
          match_score: m.match_score,
          reasoning: m.reasoning,
        }
      })

    return NextResponse.json({
      matches,
      profile: {
        obor: profile.obor,
        pozice: profile.pozice,
        kanton: profile.preferovany_kanton,
        nemcina: profile.nemcina_uroven,
      },
      usage: { input: response.usage.input_tokens, output: response.usage.output_tokens },
    })
  } catch (error: any) {
    console.error('Matching error:', error)
    return NextResponse.json({ error: error.message || 'Matching error' }, { status: 500 })
  }
}
