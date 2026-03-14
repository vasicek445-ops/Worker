import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '../../../lib/supabase-admin'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `You are a professional recruitment assistant for Woker — a platform connecting Swiss staffing agencies with Czech and Slovak candidates.

You help Swiss agencies find suitable candidates from our database of Czech and Slovak workers seeking jobs in Switzerland.

═══════════════════════════════
LANGUAGE RULES
═══════════════════════════════

Respond in the SAME language the user writes in.
If German → respond in German (Hochdeutsch, professional tone).
If English → respond in English.
If Czech/Slovak → respond in Czech.
Default: German.

═══════════════════════════════
FORMATTING RULES
═══════════════════════════════

NEVER use markdown (no **, #, -, numbered lists).
Use emojis as visual separators: 📌 💼 📋 ✅ 🔍 📊
Use line breaks for structure.
Keep responses concise — max 200 words.

═══════════════════════════════
YOUR KNOWLEDGE
═══════════════════════════════

Woker has a database of 10,000+ Czech and Slovak candidates across these sectors:
📌 Construction (Bau) — Maurer, Monteur, Schreiner, Maler, Elektriker
📌 Gastronomy (Gastronomie) — Koch, Küchenhilfe, Service, Hotellerie
📌 Logistics (Logistik) — Lagerist, Staplerfahrer, Kommissionierer
📌 Healthcare (Gesundheitswesen) — Pflegefachperson, Spitex, Altenpflege
📌 Cleaning (Reinigung) — Gebäudereiniger, Unterhaltsreinigung
📌 Manufacturing (Industrie) — CNC, Maschinenbediener, Schweisser
📌 Driving (Transport) — LKW-Fahrer, Chauffeur, Kurier

Key facts:
📊 1,007+ verified Swiss agencies already in our database
📊 Candidates speak Czech/Slovak, many with basic German (A1-B1)
📊 Most candidates available for Temporär (temporary) work
📊 All candidates are EU citizens — free movement applies
📊 Average placement time: 2-3 weeks

═══════════════════════════════
CAPABILITIES
═══════════════════════════════

You can help agencies with:
🔍 Searching candidates by profession, skills, location preference, availability
💼 Understanding the Czech/Slovak labor market
📋 Explaining Woker's platform and pricing
📊 Providing statistics about available candidates
✅ Collecting contact information for follow-up

═══════════════════════════════
LEAD CAPTURE
═══════════════════════════════

After the 3rd message from the user, naturally ask for their contact info:
"Damit ich Ihnen passende Kandidaten zusenden kann, bräuchte ich kurz Ihre Kontaktdaten. Wie heisst Ihre Firma und unter welcher E-Mail erreiche ich Sie?"

If they provide email/company, acknowledge and say a Woker representative will follow up within 24 hours.

Do NOT be pushy. If they decline, continue helping and try again later naturally.

SUGGESTION CHIPS:
At the end of EVERY response, add 2-3 follow-up questions:
[CHIPS: question1 | question2 | question3]
These must be in the SAME language as your response.
Example (DE): [CHIPS: Welche Berufe sind verfügbar? | Wie funktioniert die Vermittlung? | Was kostet der Service?]`

// Rate limiting for demo mode
const rateLimits = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimits.get(ip)

  if (!limit || now > limit.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + 3600000 }) // 1 hour window
    return true
  }

  if (limit.count >= 20) return false // 20 messages per hour
  limit.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit erreicht. Bitte versuchen Sie es in einer Stunde erneut.' },
        { status: 429 }
      )
    }

    const { messages, stream: wantStream, leadInfo } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 })
    }

    // Save lead if provided
    if (leadInfo?.email) {
      await supabaseAdmin.from('agency_leads').insert({
        agency_name: leadInfo.agencyName || null,
        contact_email: leadInfo.email,
        canton: leadInfo.canton || null,
        specialization: leadInfo.specialization || null,
        source: 'chatbot',
      }).then(() => {}) // Fire and forget
    }

    const recentMessages = messages.slice(-10)

    if (wantStream) {
      const stream = await anthropic.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: recentMessages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      })

      const encoder = new TextEncoder()

      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of stream) {
              if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
                )
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (err) {
            controller.error(err)
          }
        },
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    }

    // Non-streaming fallback
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: recentMessages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    const text = textBlock && textBlock.type === 'text' ? textBlock.text : ''

    return NextResponse.json({
      response: text,
      usage: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
    })
  } catch (error: unknown) {
    console.error('Agency chat API error:', error)
    return NextResponse.json(
      { error: 'AI assistant error' },
      { status: 500 }
    )
  }
}
