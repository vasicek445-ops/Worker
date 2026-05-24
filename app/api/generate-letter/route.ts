import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { LETTER_SYSTEM_PROMPT, buildLetterUserMessage, type BuildUserMessageInput } from '@/lib/letter/ai-prompt'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

interface RequestBody {
  jobTitle: string
  company: string
  contactPerson?: string
  jobDescription?: string
  jobSource?: string
  jobReference?: string
  customMotivation?: string
  language?: 'de' | 'cs'
}

interface GeneratedLetterBody {
  subject: string
  opening: string
  paragraphs: Array<{ type: string; text: string }>
  signOff: string
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalizeLetter(raw: any): GeneratedLetterBody {
  const paragraphs = Array.isArray(raw?.paragraphs)
    ? raw.paragraphs
        .map((p: any) => ({
          type: typeof p?.type === 'string' ? p.type : 'custom',
          text: typeof p?.text === 'string' ? p.text.trim() : '',
        }))
        .filter((p: { text: string }) => p.text.length > 0)
    : []

  return {
    subject: typeof raw?.subject === 'string' ? raw.subject.trim() : '',
    opening: typeof raw?.opening === 'string' ? raw.opening.trim() : '',
    paragraphs,
    signOff: typeof raw?.signOff === 'string' ? raw.signOff.trim() : 'Freundliche Grüsse',
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

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

    if (sub?.status !== 'active' && sub?.status !== 'trialing') {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 })
    }

    const body = (await req.json()) as RequestBody
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    if (!body.jobTitle || !body.company) {
      return NextResponse.json({ error: 'jobTitle and company are required' }, { status: 400 })
    }

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('full_name, telefon, adresa, nemcina_uroven, work_permit_status, experiences, dovednosti')
      .eq('id', user.id)
      .maybeSingle()

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 500 })
    }
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found — vyplň profil před generací dopisu' }, { status: 400 })
    }

    const aiInput: BuildUserMessageInput = {
      jobTitle: body.jobTitle,
      company: body.company,
      contactPerson: body.contactPerson,
      jobDescription: body.jobDescription,
      jobSource: body.jobSource,
      jobReference: body.jobReference,
      customMotivation: body.customMotivation,
      senderName: profile.full_name || user.email?.split('@')[0] || 'Bewerber',
      germanLevel: profile.nemcina_uroven || undefined,
      permitStatus: profile.work_permit_status || undefined,
      experiences: Array.isArray(profile.experiences) ? profile.experiences : undefined,
      skills: profile.dovednosti || undefined,
    }

    const userMessage = buildLetterUserMessage(aiInput)

    const generateLetter = async (): Promise<string> => {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        temperature: 0.6,
        system: LETTER_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      })
      const textBlock = response.content.find((block: { type: string }) => block.type === 'text')
      const text = textBlock && 'text' in textBlock ? textBlock.text : ''
      if (!text) throw new Error('Generation failed')
      return text
    }

    let letterData: GeneratedLetterBody | null = null
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        let text = await generateLetter()
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
        const jsonStart = text.indexOf('{')
        const jsonEnd = text.lastIndexOf('}')
        if (jsonStart !== -1 && jsonEnd !== -1) {
          text = text.substring(jsonStart, jsonEnd + 1)
        }
        const parsed = normalizeLetter(JSON.parse(text))
        if (!parsed.subject || !parsed.opening || parsed.paragraphs.length < 3 || !parsed.signOff) {
          throw new Error('Incomplete letter shape')
        }
        letterData = parsed
        break
      } catch {
        if (attempt === 2) {
          console.error('Letter generation failed after retries')
          return NextResponse.json({ error: 'AI vygenerovala neúplná data. Zkus to prosím znovu.' }, { status: 500 })
        }
      }
    }

    if (!letterData) {
      return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
    }

    return NextResponse.json({ letterData })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Generate letter error:', error)
    return NextResponse.json({ error: error.message || 'Generation error' }, { status: 500 })
  }
}
