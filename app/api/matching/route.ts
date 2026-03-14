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

// In-memory cache: userId -> { matches, timestamp }
const matchCache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

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

    // Check for force refresh param
    const body = await req.json().catch(() => ({}))
    const forceRefresh = body?.forceRefresh === true

    // Check cache (unless force refresh)
    const cacheKey = user.id
    if (!forceRefresh) {
      const cached = matchCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json({ ...(cached.data as object), cached: true })
      }
    }

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

    // 1. Load already applied agency IDs to exclude them
    const { data: appliedApps } = await supabaseAdmin
      .from('applications')
      .select('agency_id')
      .eq('user_id', user.id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appliedAgencyIds = new Set((appliedApps || []).map((a: any) => a.agency_id))

    // 2. Query agencies with bigger pool — canton first, then region, then all
    let allAgencies: { id: number; company: string; city: string; canton: string; region: string; email: string; website: string | null; telephone: string | null }[] = []
    const seenIds = new Set<number>()

    // Priority 1: Same canton (most relevant)
    const { data: cantonAgencies } = await supabaseAdmin
      .from('agencies')
      .select('id, company, city, canton, region, email, website, telephone')
      .eq('canton', profile.preferovany_kanton)
      .not('email', 'is', null)
      .limit(100)

    for (const a of (cantonAgencies || [])) {
      if (!appliedAgencyIds.has(a.id) && !seenIds.has(a.id)) {
        allAgencies.push(a)
        seenIds.add(a.id)
      }
    }

    // Priority 2: Same language region (nearby cantons)
    const { data: regionAgencies } = await supabaseAdmin
      .from('agencies')
      .select('id, company, city, canton, region, email, website, telephone')
      .eq('region', preferredRegion)
      .not('email', 'is', null)
      .limit(200)

    for (const a of (regionAgencies || [])) {
      if (!appliedAgencyIds.has(a.id) && !seenIds.has(a.id)) {
        allAgencies.push(a)
        seenIds.add(a.id)
      }
    }

    // Priority 3: Other regions (nationwide agencies like Adecco, Manpower etc.)
    if (allAgencies.length < 100) {
      const { data: otherAgencies } = await supabaseAdmin
        .from('agencies')
        .select('id, company, city, canton, region, email, website, telephone')
        .neq('region', preferredRegion)
        .not('email', 'is', null)
        .limit(100)

      for (const a of (otherAgencies || [])) {
        if (!appliedAgencyIds.has(a.id) && !seenIds.has(a.id)) {
          allAgencies.push(a)
          seenIds.add(a.id)
        }
      }
    }

    if (allAgencies.length === 0) {
      return NextResponse.json({ error: 'No agencies found for your region' }, { status: 404 })
    }

    // Cap at 150 to stay within token limits but give AI a much bigger pool
    allAgencies = allAgencies.slice(0, 150)

    // Prepare agency list for AI (minimal data to save tokens)
    const agencyList = allAgencies.map(a => ({
      id: a.id,
      company: a.company,
      city: a.city,
      canton: a.canton,
    }))

    // AI matching with improved prompt for field-awareness
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: `Jsi expert na švýcarský pracovní trh a temporální agentury. Na základě profilu kandidáta a seznamu agentur vyber TOP 10 nejlepších shod.

Pro každou agenturu zhodnoť:
1. OBOR — z názvu firmy odhadni specializaci (stavba, gastro, logistika, zdravotnictví, IT...) a porovnej s oborem kandidáta. Agentury s relevantním oborem mají přednost.
2. LOKACE — blízkost k preferovanému kantonu. Stejný kanton = bonus, sousední kanton = ok, vzdálený = penalizace.
3. VELIKOST — velké agentury (Adecco, Manpower, Randstad, Kelly, Hays, Michael Page, Grafton) mají více nabídek ve všech oborech.
4. SPECIALIZACE — z názvu firmy odhadni typ (personal, temporär, bau, gastro, pflege, technik, industrie...) a preferuj ty relevantní pro kandidátův obor.

ODPOVĚZ POUZE VALIDNÍM JSON polem (žádný jiný text):
[
  {
    "agency_id": 123,
    "match_score": 85,
    "reasoning": "Krátké zdůvodnění v češtině (max 2 věty) — proč tato agentura sedí k profilu"
  }
]

Seřaď od nejvyššího match_score. Match score 70-100. Buď přísný — 90+ jen pro perfektní shodu obor+lokace.`,
      messages: [{
        role: 'user',
        content: `PROFIL KANDIDÁTA:
Obor: ${profile.obor}
Pozice: ${profile.pozice}
Preferovaný kanton: ${profile.preferovany_kanton}
Němčina: ${profile.nemcina_uroven}
Zkušenosti: ${profile.zkusenosti}
Dovednosti: ${profile.dovednosti || 'neuvedeno'}

SEZNAM AGENTUR (${agencyList.length}):
${JSON.stringify(agencyList)}`
      }],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const textBlock = response.content.find((block: any) => block.type === 'text')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let text = textBlock ? (textBlock as any).text : ''
    if (!text) return NextResponse.json({ error: 'Matching failed' }, { status: 500 })

    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let matchResults: any[]
    try {
      matchResults = JSON.parse(text)
    } catch {
      console.error('Match parse error:', text)
      return NextResponse.json({ error: 'AI returned invalid data. Try again.' }, { status: 500 })
    }

    // Enrich with full agency data
    const agencyMap = new Map(allAgencies.map(a => [a.id, a]))
    const matches = matchResults
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((m: any) => agencyMap.has(m.agency_id))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const result = {
      matches,
      profile: {
        obor: profile.obor,
        pozice: profile.pozice,
        kanton: profile.preferovany_kanton,
        nemcina: profile.nemcina_uroven,
      },
      excluded: appliedAgencyIds.size,
      pool: allAgencies.length,
      usage: { input: response.usage.input_tokens, output: response.usage.output_tokens },
    }

    // Cache the result
    matchCache.set(cacheKey, { data: result, timestamp: Date.now() })

    return NextResponse.json(result)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Matching error:', error)
    return NextResponse.json({ error: error.message || 'Matching error' }, { status: 500 })
  }
}
