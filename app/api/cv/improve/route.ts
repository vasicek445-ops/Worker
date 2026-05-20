import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { callOpenAI } from '@/lib/openai'
import type { CVFormData, SectionId } from '@/lib/cv/types'

type ImproveAction =
  | 'expand'
  | 'translate-de'
  | 'professional-tone'
  | 'find-keywords'
  | 'fill-from-profile'
  | 'suggest-skills'

interface ImproveBody {
  action: ImproveAction
  section: SectionId
  formData: CVFormData
  jobDescription?: string
}

const VALID_ACTIONS: ImproveAction[] = [
  'expand',
  'translate-de',
  'professional-tone',
  'find-keywords',
  'fill-from-profile',
  'suggest-skills',
]

function sectionTargetKey(section: SectionId): keyof CVFormData | null {
  switch (section) {
    case 'experience':
      return 'experience_detail'
    case 'education':
      return 'education'
    case 'skills':
      return 'skills'
    case 'basics':
      return null
    default:
      return null
  }
}

function buildPrompt(action: ImproveAction, section: SectionId, formData: CVFormData, jobDescription?: string): string {
  const field = formData.field || 'všeobecný obor'
  const position = formData.position || 'pracovní pozice'
  const sectionTarget = sectionTargetKey(section)
  const sourceText = sectionTarget ? (formData[sectionTarget] as string) || '' : ''

  switch (action) {
    case 'expand':
      return `Jsi asistent pro tvorbu CV pro švýcarský pracovní trh.
ÚKOL: Rozšiř následující krátké poznámky uchazeče do plnohodnotných CV bullet pointů v ČEŠTINĚ.
Použij silná akční slovesa (zajišťoval, koordinoval, optimalizoval). 3-5 bullet pointů. NIC NEVYMÝŠLEJ co tam není naznačeno.

Pozice: ${position}
Obor: ${field}

Sekce: ${section}
Původní text:
"""
${sourceText}
"""

Odpověz POUZE rozšířeným textem v češtině, bez úvodu. Bullet pointy uveď jako odrážky "- ".`

    case 'translate-de':
      return `Jsi překladatel CV do švýcarské němčiny (CH formality, formal Sie, Schweizer Hochdeutsch — "Strasse" ne "Straße").
ÚKOL: Přelož následující český CV text do DE pro Schweizer Arbeitsmarkt. Zachovej strukturu (odrážky, řádky).

Sekce: ${section}
Český text:
"""
${sourceText}
"""

Odpověz POUZE německým překladem, bez úvodu.`

    case 'professional-tone':
      return `Jsi editor CV. ÚKOL: Zformalizuj následující text: méně osobní, víc akčních sloves, profesionální tón, žádný hovorový jazyk. Zachovej jazyk originálu.

Sekce: ${section}
Text:
"""
${sourceText}
"""

Odpověz POUZE upraveným textem, bez úvodu.`

    case 'find-keywords':
      return `Jsi ATS expert pro německý/švýcarský pracovní trh.
ÚKOL: Z následujícího inzerátu vypiš 5-10 nejdůležitějších DE klíčových slov, která by měly být v CV uchazeče pro ATS systém.

Pozice uchazeče: ${position} (${field})

Inzerát:
"""
${(jobDescription || '').slice(0, 4000)}
"""

Odpověz POUZE seznamem klíčových slov, jedno na řádku, bez čísel a bez úvodu.`

    case 'suggest-skills':
      return `Jsi kariérní poradce. ÚKOL: Pro pozici "${position}" v oboru "${field}" navrhni 6-10 relevantních dovedností (mix hard + soft). Pokud uchazeč už nějaké uvedl, doplň jen nové.

Stávající dovednosti:
"""
${(formData.skills || '').trim() || '(žádné)'}
"""

Odpověz POUZE seznamem dovedností oddělených čárkami v ČEŠTINĚ, bez úvodu.`

    default:
      return ''
  }
}

function mergeIntoSection(section: SectionId, newText: string, formData: CVFormData): Partial<CVFormData> {
  const target = sectionTargetKey(section)
  if (!target) return {}
  if (target === 'skills') {
    // Skills jsou volný text — pokud sugest-skills, append k existujícím
    const existing = (formData.skills || '').trim()
    const merged = existing ? `${existing}, ${newText}` : newText
    return { skills: merged }
  }
  return { [target]: newText } as Partial<CVFormData>
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.replace(/^Bearer\s+/i, '')
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as ImproveBody
    if (!body || !body.action || !body.section || !body.formData) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
    if (!VALID_ACTIONS.includes(body.action)) {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    // fill-from-profile — žádné AI volání, jen načti z user profilu
    if (body.action === 'fill-from-profile') {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('full_name, phone, email, address, birthdate, nationality')
        .eq('id', user.id)
        .maybeSingle()

      const updated: Partial<CVFormData> = {}
      if (profile?.full_name) updated.name = profile.full_name
      if (profile?.phone) updated.phone = profile.phone
      if (profile?.email || user.email) updated.email = profile?.email || user.email || ''
      if (profile?.address) updated.address = profile.address
      if (profile?.birthdate) updated.birthdate = profile.birthdate
      if (profile?.nationality) updated.nationality = profile.nationality
      return NextResponse.json({ updated })
    }

    // find-keywords vyžaduje jobDescription
    if (body.action === 'find-keywords' && (!body.jobDescription || !body.jobDescription.trim())) {
      return NextResponse.json({ error: 'Chybí inzerát (jobDescription).' }, { status: 400 })
    }

    const prompt = buildPrompt(body.action, body.section, body.formData, body.jobDescription)
    if (!prompt) {
      return NextResponse.json({ error: 'Unsupported action/section combo' }, { status: 400 })
    }

    let aiText = ''
    try {
      aiText = await callOpenAI(prompt, {
        model: 'gpt-4o-mini',
        maxTokens: 800,
        timeoutMs: 30_000,
        temperature: 0.3,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'AI volání selhalo'
      return NextResponse.json({ error: msg }, { status: 502 })
    }

    aiText = aiText.trim()
    if (!aiText) {
      return NextResponse.json({ error: 'Prázdná odpověď z AI' }, { status: 502 })
    }

    // find-keywords: vrať jako keywords pole (textově, doplnit do skills jako návrh)
    if (body.action === 'find-keywords') {
      const keywords = aiText
        .split(/\r?\n|,/)
        .map((k) => k.replace(/^[\s\-•\d\.\)]+/, '').trim())
        .filter((k) => k.length > 0)
        .slice(0, 10)
      return NextResponse.json({ updated: { skills: keywords.join(', ') }, keywords })
    }

    const updated = mergeIntoSection(body.section, aiText, body.formData)
    return NextResponse.json({ updated })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal error'
    console.error('CV improve error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
