import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { profession, level, userId } = await req.json();
    if (!profession) return NextResponse.json({ error: "Zadej svůj obor" }, { status: 400 });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3000,
      system: `Jsi expert na němčinu pro české pracovníky ve Švýcarsku. Generuješ praktické fráze pro konkrétní obor.

PRAVIDLA:
- Fráze musí být reálně použitelné v práci
- Hochdeutsch (ne Schweizerdeutsch)
- Přidej výslovnost kde je to těžké
- Vrať JSON a nic jiného

Vrať POUZE validní JSON v tomto formátu:
{
  "categories": [
    {
      "title": "název kategorie (emoji + text)",
      "phrases": [
        {
          "de": "německá fráze",
          "cs": "český překlad",
          "context": "kdy použít (2-3 slova)",
          "pronunciation": "výslovnost pokud je to těžké slovo, jinak null"
        }
      ]
    }
  ],
  "tip": "jeden praktický tip pro tento obor v němčině"
}`,
      messages: [
        {
          role: "user",
          content: `Vygeneruj 20-25 nejdůležitějších německých frází pro obor: ${profession}
Jazyková úroveň uživatele: ${level || "začátečník A1-A2"}

Rozděl do 4-5 kategorií podle situací v tomto oboru. Fráze musí být specifické pro daný obor, ne obecné.`
        }
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "AI chyba" }, { status: 500 });

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Chyba serveru" }, { status: 500 });
  }
}
