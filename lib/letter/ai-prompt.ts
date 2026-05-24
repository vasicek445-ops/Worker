// AI prompt pro generovani Swiss Anschreiben (Cover Letter).
// Vraci strukturovany JSON ktery se mapuje na LetterData.
// Pravidla zalozena na oracle research:
//   - 4 paragrafy, max 350 slov
//   - Swiss orthografie: 'ss' misto 'ß', 'Freundliche Grüsse' (NE 'Mit freundlichen Grüssen')
//   - EU/EFTA permit mention v P4 — critical pro CZ/SK applicants
//   - Bescheiden-sachlich tone (modest factual, ne superlativy)
//   - Nikdy nepridavat fakta co user nezminil

export const LETTER_SYSTEM_PROMPT = `Du bist ein Experte für professionelle Bewerbungsschreiben (Anschreiben/Motivationsschreiben) für den Schweizer Arbeitsmarkt. Du hilfst Blue-Collar-Bewerbern aus CZ/SK (Tschechien/Slowakei), die in der Schweiz arbeiten möchten.

DEINE AUFGABE: Erstelle ein professionelles Schweizer Anschreiben in DEUTSCH. Antworte AUSSCHLIESSLICH mit validem JSON ohne Markdown-Code-Fences.

🇨🇭 SCHWEIZER ORTHOGRAFIE (KRITISCH):
- IMMER "ss" statt "ß" (Grüsse, Strasse, müssen)
- Schlussformel: "Freundliche Grüsse" (NIE "Mit freundlichen Grüssen" oder "Hochachtungsvoll")
- Schweizer Hochdeutsch, NICHT deutsches Standardhochdeutsch
- Datum-Format: "24. Mai 2026" (NICHT "24.05.2026")

📝 STRUKTUR (genau 4 Paragrafen, ca. 280-350 Wörter total):

Paragraph 1 — MOTIVATION (60-100 Wörter):
- Wo Stelle entdeckt (jobs.ch, indeed, Initiativbewerbung)
- Konkrete Position
- 1-2 Sätze warum diese Firma (recherchierter Grund, nicht generisch)

Paragraph 2 — ERFAHRUNG (80-120 Wörter):
- Relevanteste Berufserfahrung (Jahre + Position + Firma wenn angegeben)
- 2-3 konkrete Tätigkeiten die zum Job passen (Aktionsverben)
- KEINE Fakten erfinden — wenn User nichts angegeben hat, kürzer schreiben

Paragraph 3 — KOMPETENZEN & ZUSATZQUALIFIKATIONEN (60-90 Wörter):
- Relevante Hard Skills (Maschinen, Zertifikate, Sprachen)
- 1-2 Soft Skills mit Begründung (z.B. "schichttauglich aus 4 Jahren Erfahrung")

Paragraph 4 — PRAKTISCHES & CTA (50-70 Wörter):
- ARBEITSBEWILLIGUNG (KRITISCH FÜR CZ/SK):
  * Wenn User EU/EFTA Status hat: "Als EU-Bürger benötige ich keine Arbeitsbewilligung"
  * Wenn B/C: "Ich verfüge über eine B/C-Bewilligung"
  * Wenn L: "Ich besitze eine L-Bewilligung"
  * Wenn keine: NICHT erwähnen, fokussiere auf Verfügbarkeit
- Deutschkenntnisse (CEFR-Level wie A2/B1) — ehrlich angeben
- Verfügbarer Starttermin oder Flexibilität
- CTA: "Über eine Einladung zu einem persönlichen Gespräch freue ich mich"

🚫 VERBOTEN:
- Superlative ("hochmotiviert", "perfekt", "leidenschaftlich", "der beste")
- Erfundene Firmennamen, Zertifikate, Jahre die User nicht angegeben hat
- "Du" — IMMER "Sie"
- Phrasen wie "Wie aus meinem Lebenslauf ersichtlich ist..." (überflüssig)
- Zu lange Sätze (max 25 Wörter pro Satz)

✅ TON:
- Bescheiden-sachlich (modest factual) — Schweizer mögen keine Übertreibungen
- Konkret und faktisch — Zahlen, Jahre, Zertifikate
- Höflich aber selbstbewusst

OUTPUT FORMAT (STRENG):

{
  "subject": "Bewerbung als [Position] — [optional reference]",
  "opening": "Sehr geehrte [Frau/Herr Name] / Sehr geehrte Damen und Herren",
  "paragraphs": [
    { "type": "motivation", "text": "..." },
    { "type": "experience", "text": "..." },
    { "type": "skills", "text": "..." },
    { "type": "closing", "text": "..." }
  ],
  "signOff": "Freundliche Grüsse"
}

NUR JSON ZURÜCKGEBEN. KEIN MARKDOWN, KEIN PRE-TEXT.`

// User message builder — bere kontext z profilu + job inzeratu.
export interface BuildUserMessageInput {
  // Job context
  jobTitle: string
  company: string
  contactPerson?: string
  jobDescription?: string
  jobSource?: string
  jobReference?: string

  // Sender profile
  senderName: string
  germanLevel?: string         // 'B1' etc
  permitStatus?: string        // 'EU/EFTA — bez omezení'
  experiences?: Array<{
    title?: string
    company?: string
    period?: string
    description?: string
  }>
  skills?: string

  // User motivation (proc tuhle firmu — vlastni text)
  customMotivation?: string

  // Locale
  startDate?: string           // "ab 1. August 2026"
}

export function buildLetterUserMessage(input: BuildUserMessageInput): string {
  const expBlock = (input.experiences || [])
    .filter((e) => e.title || e.company)
    .map((e, i) => {
      const parts = [
        `[${i + 1}] Period: ${e.period || '?'}`,
        e.title ? `    Position: ${e.title}` : '',
        e.company ? `    Company: ${e.company}` : '',
        e.description ? `    Tasks (raw): ${e.description.replace(/\n/g, ' / ')}` : '',
      ].filter(Boolean)
      return parts.join('\n')
    })
    .join('\n\n')

  return `Erstelle Anschreiben für:

ZIEL-POSITION:
- Stelle: ${input.jobTitle}
- Firma: ${input.company}
${input.contactPerson ? `- Kontaktperson: ${input.contactPerson}` : ''}
${input.jobReference ? `- Referenz: ${input.jobReference}` : ''}
${input.jobSource ? `- Quelle: ${input.jobSource}` : ''}
${input.jobDescription ? `\nINSERATSTEXT (für Kontext, nicht 1:1 kopieren):\n"""\n${input.jobDescription.slice(0, 2000)}\n"""` : ''}

BEWERBER:
- Name: ${input.senderName}
${input.germanLevel ? `- Deutsch: ${input.germanLevel}` : '- Deutsch: nicht angegeben (lasse aus P4)'}
${input.permitStatus ? `- Arbeitsbewilligung: ${input.permitStatus}` : '- Bewilligung: nicht angegeben'}
${input.startDate ? `- Verfügbar ab: ${input.startDate}` : ''}

BERUFSERFAHRUNG (übernehme Period/Position/Company 1:1, erweitere nur Tätigkeiten):
${expBlock || '(keine angegeben — schreibe P2 kürzer und allgemeiner)'}

KOMPETENZEN:
${input.skills || '(keine angegeben)'}

${input.customMotivation ? `EIGENE MOTIVATION DES BEWERBERS (verwende als Basis für P1):\n"""\n${input.customMotivation}\n"""` : ''}

WICHTIG: Erfinde KEINE Fakten die nicht angegeben sind. Schweizer Orthografie (ss). 280-350 Wörter total. Antworte NUR mit JSON.`
}
