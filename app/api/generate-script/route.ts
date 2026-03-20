import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const PLATFORM_CONSTRAINTS: Record<string, string> = {
  tiktok: 'TikTok: 15–60 sekund, rychlý střih, hook musí být v první 1 sekundě, vertikální formát 9:16',
  instagram: 'Instagram Reels: 15–90 sekund, vizuálně atraktivní, hook v prvních 2 sekundách, vertikální 9:16',
  youtube: 'YouTube Shorts: 30–60 sekund, informativní, hook v prvních 3 sekundách, vertikální 9:16',
}

const TONE_INSTRUCTIONS: Record<string, string> = {
  informative: 'Informativní tón — jasná fakta, strukturované sdělení, důvěryhodnost. Mluv jako expert který ví o čem mluví.',
  funny: 'Zábavný tón — humor, nadsázka, relatable momenty. Mluv jako kamarád co má skvělou historku.',
  provocative: 'Provokativní tón — kontroverzní úhel pohledu, challenge běžných názorů, vyvolej diskusi. Mluv odvážně a přímo.',
  motivational: 'Motivační tón — energie, inspirace, call to action. Mluv jako mentor co tě nakopne k akci.',
}

interface Transcription {
  title: string
  text: string
  creator: string
  views: string
}

export async function POST(req: NextRequest) {
  try {
    const { idea, platform, tone, transcriptions } = await req.json()

    if (!idea || typeof idea !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid "idea"' }, { status: 400 })
    }

    if (!platform || !PLATFORM_CONSTRAINTS[platform]) {
      return NextResponse.json({ error: 'Invalid platform. Use: tiktok, instagram, youtube' }, { status: 400 })
    }

    if (!tone || !TONE_INSTRUCTIONS[tone]) {
      return NextResponse.json({ error: 'Invalid tone. Use: informative, funny, provocative, motivational' }, { status: 400 })
    }

    // Build transcription reference block
    let transcriptionBlock = ''
    if (transcriptions && Array.isArray(transcriptions) && transcriptions.length > 0) {
      transcriptionBlock = '\n\n--- REFERENČNÍ PŘEPISY VIRÁLNÍCH VIDEÍ ---\n'
      transcriptionBlock += 'Analyzuj tyto reálné přepisy virálních videí. Všímej si vzorců: jak začínají (hook), jak udržují pozornost, jaký slovník používají, jak strukturují obsah, a jak končí.\n\n'

      transcriptions.forEach((t: Transcription, i: number) => {
        transcriptionBlock += `[Video ${i + 1}] "${t.title}" od ${t.creator} (${t.views} zhlédnutí)\n`
        transcriptionBlock += `${t.text}\n\n`
      })

      transcriptionBlock += '--- KONEC PŘEPISŮ ---\n'
    }

    const systemPrompt = `Jsi elitní scenárista virálních videí. Tvým úkolem je psát scénáře které zaujmou diváky v prvních sekundách a donutí je sledovat až do konce.
${transcriptionBlock}

TVŮJ STYL:
- Piš v ČEŠTINĚ
- ${TONE_INSTRUCTIONS[tone]}
- Napodobuj styl a vzorce z referenčních přepisů — NE generický AI styl
- Používej krátké, úderné věty
- Každá věta musí mít důvod proč tam je
- Hook musí být nečekaný, kontroverzní nebo emocionální

PLATFORMA:
${PLATFORM_CONSTRAINTS[platform]}

FORMÁT VÝSTUPU (dodržuj přesně):

🎬 HOOK (0-3s):
[úderný začátek který zastaví scrollování]

📖 TĚLO (3-25s):
[hlavní obsah s poznámkami o timingu]

📢 CTA (posledních 3-5s):
[výzva k akci]

🎥 B-ROLL:
- [vizuální návrh 1]
- [vizuální návrh 2]
- [vizuální návrh 3]

⏱️ Celková délka: Xs
📊 Hashtags: #tag1 #tag2 #tag3

DŮLEŽITÉ:
- Hook je NEJDŮLEŽITĚJŠÍ část — pokud nezaujmeš v 1-3 sekundách, divák odejde
- Nepiš "Ahoj lidi" nebo jiné nudné začátky
- Hashtags musí být mix populárních a niche tagů
- B-roll návrhy musí být prakticky natočitelné
- Délka musí odpovídat platformě`

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Napiš virální video scénář na toto téma:\n\n${idea}`,
        },
      ],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    const script = textBlock && textBlock.type === 'text' ? textBlock.text : ''

    if (!script) {
      return NextResponse.json({ error: 'Script generation failed' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      script,
    })
  } catch (error: unknown) {
    console.error('Generate script API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Script generation error' },
      { status: 500 }
    )
  }
}
