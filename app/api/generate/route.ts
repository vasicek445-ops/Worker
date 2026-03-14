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

const PROMPTS: Record<string, string> = {
  'motivacni-dopis': `Jsi expert na psaní motivačních dopisů pro švýcarský pracovní trh. Píšeš v NĚMČINĚ (Hochdeutsch, ne Schwyzerdütsch).

PRAVIDLA:
- Piš formální obchodní němčinu, jasnou a profesionální
- Používej švýcarský formát dopisu (datum nahoře vpravo, adresa vlevo)
- Délka: 250–350 slov
- Struktura: oslovení → proč chci tuto pozici → mé zkušenosti a přínos → motivace pro Švýcarsko → závěr
- Na konci VŽDY přidej ČESKÝ PŘEKLAD celého dopisu (oddělený čarou ───)
- Nepoužívej markdown formátování (žádné ** # - atd.)
- Přizpůsob tón oboru (stavebnictví = praktický, IT = technický, gastro = flexibilní)

DŮLEŽITÉ PRO ŠVÝCARSKÝ TRH:
- Zdůrazni spolehlivost, přesnost a pracovní morálku (Schweizer Arbeitsmoral)
- Pokud kandidát nemá němčinu, zmiň ochotu se učit
- Pokud je to manuální obor, zdůrazni fyzickou zdatnost a praxi
- Zmiň flexibilitu ohledně směn a lokace`,

  'email': `Jsi expert na psaní profesionálních emailů pro oslovení švýcarských HR oddělení a personálních agentur. Píšeš v NĚMČINĚ.

PRAVIDLA:
- Email musí být KRÁTKÝ a EFEKTIVNÍ (max 150 slov)
- Předmět emailu musí být jasný a profesionální
- Struktura: pozdrav → kdo jsem a co hledám → proč vaše firma → co nabízím → závěr s call-to-action
- Na konci VŽDY přidej ČESKÝ PŘEKLAD (oddělený čarou ───)
- Nepoužívej markdown formátování
- Švýcarské firmy dostávají stovky emailů – musíš zaujmout hned v prvních 2 větách

FORMÁT ODPOVĚDI:
Betreff: [předmět emailu]

[tělo emailu]

───
ČESKÝ PŘEKLAD:
Předmět: [překlad předmětu]

[překlad těla]`,

  'cv': `Jsi expert na tvorbu životopisů (Lebenslauf) pro švýcarský pracovní trh. Generuješ CV ve ŠVÝCARSKÉM FORMÁTU v NĚMČINĚ.

PRAVIDLA:
- Švýcarský Lebenslauf je tabulkový, strukturovaný, přehledný
- Používej formát: kategorie vlevo, údaje vpravo
- Sekce: Persönliche Daten, Berufserfahrung, Ausbildung, Sprachkenntnisse, Fähigkeiten, Referenzen
- Datumový formát: MM.YYYY – MM.YYYY
- Zkušenosti řaď od NEJNOVĚJŠÍ po nejstarší
- U každé pozice uveď 2–3 hlavní činnosti
- Jazyky uváděj s úrovní (A1–C2 nebo Muttersprache/Grundkenntnisse/Fließend)
- Na konci přidej "Referenzen: auf Anfrage"
- Na konci VŽDY přidej ČESKÝ PŘEKLAD (oddělený čarou ───)
- Nepoužívej markdown formátování (žádné ** # atd.)
- Používej čisté textové formátování s mezerami pro zarovnání

DŮLEŽITÉ:
- Švýcarské CV NEMÁ fotku (na rozdíl od českého)
- Datum narození a národnost se UVÁDÍ (na rozdíl od USA/UK)
- Řidičský průkaz se uvádí pokud je relevantní
- Pokud kandidát nemá mnoho zkušeností, zdůrazni dovednosti a motivaci`,
}

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

    const { type, formData, stream: wantStream } = await req.json()

    if (!type || !PROMPTS[type]) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 })
    }

    if (!formData || typeof formData !== 'object') {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const userMessage = buildUserMessage(type, formData)

    // Streaming mode
    if (wantStream) {
      const stream = await anthropic.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: PROMPTS[type],
        messages: [{ role: 'user', content: userMessage }],
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
      max_tokens: 2048,
      system: PROMPTS[type],
      messages: [{ role: 'user', content: userMessage }],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    const text = textBlock && textBlock.type === 'text' ? textBlock.text : ''

    if (!text) {
      return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
    }

    return NextResponse.json({
      document: text,
      usage: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
    })
  } catch (error: unknown) {
    console.error('Generate API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation error' },
      { status: 500 }
    )
  }
}

function buildUserMessage(type: string, data: Record<string, string>): string {
  switch (type) {
    case 'motivacni-dopis':
      return `Napiš motivační dopis pro tyto údaje:

Jméno: ${data.name}
Cílová pozice: ${data.position}
Firma / agentura: ${data.company || 'obecná agentura'}
Obor: ${data.field}
Roky zkušeností: ${data.experience}
Hlavní dovednosti: ${data.skills}
Úroveň němčiny: ${data.german}
Proč chci pracovat ve Švýcarsku: ${data.motivation || 'lepší podmínky a plat'}
${data.extra ? `Další info: ${data.extra}` : ''}`

    case 'email':
      return `Napiš email pro oslovení švýcarské firmy/agentury:

Jméno: ${data.name}
Cílová pozice: ${data.position}
Firma / agentura: ${data.company || 'obecná agentura'}
Obor: ${data.field}
Roky zkušeností: ${data.experience}
Úroveň němčiny: ${data.german}
${data.extra ? `Další info: ${data.extra}` : ''}`

    case 'cv':
      return `Vytvoř švýcarský životopis (Lebenslauf):

Jméno: ${data.name}
Datum narození: ${data.birthdate}
Národnost: ${data.nationality || 'Česká'}
Adresa: ${data.address || 'Česká republika'}
Telefon: ${data.phone}
Email: ${data.email}
Cílová pozice: ${data.position}
Obor: ${data.field}

PRACOVNÍ ZKUŠENOSTI:
${data.experience_detail}

VZDĚLÁNÍ:
${data.education}

JAZYKY:
Čeština: rodilý mluvčí
Němčina: ${data.german}
${data.other_languages ? `Další jazyky: ${data.other_languages}` : ''}

DOVEDNOSTI:
${data.skills}

Řidičský průkaz: ${data.driving || 'B'}
${data.extra ? `Další info: ${data.extra}` : ''}`

    default:
      return JSON.stringify(data)
  }
}
