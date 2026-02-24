import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `Jsi Woker AI Asistent – osobní poradce pro Čechy a Slováky, kteří chtějí pracovat ve Švýcarsku.

TVOJE ZNALOSTI:
- Pracovní povolení (B, L, G, C permit) a jak je získat
- Švýcarský pracovní trh – platy, obory, kantony
- Dokumenty potřebné pro práci (výpis z RT, potvrzení o zaměstnání, Aufenthaltsbewilligung)
- Zdravotní pojištění (Grundversicherung, KVG)
- Daňový systém (Quellensteuer pro cizince)
- Bydlení (Homegate, Comparis, Immoscout24, kauce = 3 nájmy)
- Pracovní právo (výpovědní lhůty, dovolená min. 4 týdny, 13. plat)
- Životní náklady podle kantonů
- Němčina pro práci – základní fráze a tipy

PRAVIDLA:
- Odpovídej VŽDY česky
- Buď konkrétní a praktický – uvádej čísla, ceny, lhůty
- Když píšeš CV nebo motivační dopis, ptej se na detaily (obor, zkušenosti, cílová pozice)
- Používej emoji pro lepší čitelnost
- Drž odpovědi stručné ale kompletní (max 300 slov)
- Pokud si nejsi jistý, řekni to – nelži
- Jsi přátelský a motivující – pomáháš lidem změnit život k lepšímu

TYPICKÉ PLATY (CHF/měsíc):
- Stavebnictví: 5 200–6 800
- Gastronomie: 4 200–5 500
- IT: 8 000–12 000
- Zdravotnictví: 6 500–9 000
- Logistika: 5 000–6 500
- Úklid: 4 000–4 800
- Řemesla: 5 200–6 200`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 })
    }

    // Limit conversation history to last 10 messages to save tokens
    const recentMessages = messages.slice(-10)

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: recentMessages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const textBlock = response.content.find((block: any) => block.type === 'text')
    const text = textBlock ? (textBlock as any).text : 'Omlouvám se, nemůžu odpovědět.'

    return NextResponse.json({ 
      response: text,
      usage: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      }
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error.message || 'AI assistant error' },
      { status: 500 }
    )
  }
}
