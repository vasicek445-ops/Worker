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

const SYSTEM_PROMPT = `Du bist ein erfahrener Bewerbungscoach mit Spezialisierung auf den Schweizer Arbeitsmarkt. Du schreibst professionelle Bewerbungsschreiben (Motivationsschreiben) auf Hochdeutsch.

FORMATREGELN:
- Formelles Geschäftsdeutsch (Hochdeutsch, kein Schweizerdeutsch)
- Länge: 280–400 Wörter (optimal für Schweizer Arbeitgeber)
- Kein Markdown, keine Sonderformatierung
- Schweizer Rechtschreibung (ss statt ß)

STRUKTUR:
1. Betreffzeile (kurz, prägnant)
2. Anrede (formell: "Sehr geehrte Damen und Herren," oder personalisiert)
3. Einleitung: Bezug zur Stelle, Motivation, Aufmerksamkeit wecken
4. Hauptteil: Relevante Erfahrung, Kompetenzen, konkreter Mehrwert für das Unternehmen
5. Schweiz-Bezug: Warum Schweiz, Anpassungsfähigkeit, kulturelles Verständnis
6. Abschluss: Gesprächsbereitschaft, freundliche Verabschiedung
7. Grussformel: "Mit freundlichen Grüssen," (Schweizer Schreibweise!)

SCHWEIZER ARBEITSMARKT:
- Betone: Zuverlässigkeit, Präzision, Pünktlichkeit, Qualitätsbewusstsein
- Schweizer Arbeitsmoral: Eigenverantwortung, Teamfähigkeit, Flexibilität
- Bei niedrigem Deutschniveau: Lernbereitschaft und bestehende Grundkenntnisse hervorheben
- Manuelle Berufe: Körperliche Belastbarkeit, Sicherheitsbewusstsein, praktische Erfahrung
- Büroberufe: Analytisches Denken, Digitalkompetenz, Organisationsfähigkeit

TONALITÄT NACH BRANCHE:
- Bau/Logistik: Praktisch, direkt, ergebnisorientiert
- Gastronomie/Hotel: Serviceorientiert, flexibel, belastbar
- IT/Tech: Innovativ, lösungsorientiert, technisch versiert
- Gesundheit: Empathisch, verantwortungsbewusst, belastbar
- Büro/Admin: Strukturiert, zuverlässig, kommunikationsstark

WICHTIG:
- Verwende konkrete Beispiele und Zahlen wenn möglich
- Vermeide Floskeln und Allgemeinplätze
- Jeder Absatz soll einen klaren Mehrwert kommunizieren
- Der Brief muss sofort professionell und überzeugend wirken

Antworte NUR mit einem JSON-Objekt im folgenden Format (kein anderer Text, kein Markdown):
{
  "subject": "Betreffzeile",
  "salutation": "Anrede (z.B. Sehr geehrte Damen und Herren,)",
  "bodyParagraphs": ["Absatz 1", "Absatz 2", "Absatz 3", "Absatz 4"],
  "closing": "Grussformel (z.B. Mit freundlichen Grüssen,)"
}`

interface LetterFormData {
  name: string
  address: string
  phone: string
  email: string
  position: string
  company: string
  companyAddress: string
  field: string
  experienceYears?: string
  experience?: string
  skills: string
  germanLevel?: string
  german?: string
  whySwitzerland?: string
  motivation?: string
  additionalInfo?: string
  extra?: string
}

interface GeneratedLetterFields {
  subject: string
  salutation: string
  bodyParagraphs: string[]
  closing: string
}

interface LetterData {
  senderName: string
  senderAddress: string
  senderPhone: string
  senderEmail: string
  recipientName: string
  recipientAddress: string
  date: string
  subject: string
  salutation: string
  bodyParagraphs: string[]
  closing: string
  signature: string
}

function formatGermanDate(): string {
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ]
  const now = new Date()
  return `${now.getDate()}. ${months[now.getMonth()]} ${now.getFullYear()}`
}

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

    // Parse and validate form data
    const { formData } = await req.json() as { formData: LetterFormData }
    if (!formData || typeof formData !== 'object') {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    if (!formData.name || !formData.position || !formData.company) {
      return NextResponse.json({ error: 'Name, position, and company are required' }, { status: 400 })
    }

    // Build user message with all form data
    const userMessage = `Erstelle ein professionelles Bewerbungsschreiben für den Schweizer Arbeitsmarkt:

BEWERBER:
Name: ${formData.name}
Adresse: ${formData.address || 'nicht angegeben'}
Telefon: ${formData.phone || 'nicht angegeben'}
E-Mail: ${formData.email || 'nicht angegeben'}

ZIELSTELLE:
Position: ${formData.position}
Unternehmen: ${formData.company}
Firmenadresse: ${formData.companyAddress || 'nicht angegeben'}
Branche: ${formData.field || 'nicht angegeben'}

QUALIFIKATIONEN:
Berufserfahrung: ${formData.experienceYears || formData.experience || 'nicht angegeben'} Jahre
Kompetenzen/Fähigkeiten: ${formData.skills || 'nicht angegeben'}
Deutschniveau: ${formData.germanLevel || formData.german || 'nicht angegeben'}

MOTIVATION:
Warum Schweiz: ${formData.whySwitzerland || formData.motivation || 'nicht angegeben'}
Zusätzliche Informationen: ${formData.additionalInfo || formData.extra || 'keine'}

Antworte NUR mit validem JSON. Kein anderer Text.`

    // Generate letter with retry
    const generateLetter = async (): Promise<string> => {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      })

      const textBlock = response.content.find((block: { type: string }) => block.type === 'text')
      const text = textBlock && 'text' in textBlock ? textBlock.text : ''
      if (!text) throw new Error('Generation failed')
      return text
    }

    let generatedFields: GeneratedLetterFields | null = null
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        let text = await generateLetter()
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
        // Extract JSON object from response
        const jsonStart = text.indexOf('{')
        const jsonEnd = text.lastIndexOf('}')
        if (jsonStart !== -1 && jsonEnd !== -1) {
          text = text.substring(jsonStart, jsonEnd + 1)
        }
        generatedFields = JSON.parse(text) as GeneratedLetterFields

        // Validate required fields
        if (!generatedFields.subject || !generatedFields.salutation ||
            !Array.isArray(generatedFields.bodyParagraphs) || !generatedFields.closing) {
          throw new Error('Missing required fields in generated JSON')
        }
        break
      } catch {
        if (attempt === 2) {
          console.error('JSON parse error after retries')
          return NextResponse.json({ error: 'AI generated invalid data. Try again.' }, { status: 500 })
        }
      }
    }

    if (!generatedFields) {
      return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
    }

    // Assemble full letter data
    const letterData: LetterData = {
      senderName: formData.name,
      senderAddress: formData.address || '',
      senderPhone: formData.phone || '',
      senderEmail: formData.email || '',
      recipientName: formData.company,
      recipientAddress: formData.companyAddress || '',
      date: formatGermanDate(),
      subject: generatedFields.subject,
      salutation: generatedFields.salutation,
      bodyParagraphs: generatedFields.bodyParagraphs,
      closing: generatedFields.closing,
      signature: formData.name,
    }

    return NextResponse.json({ letterData })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Generate letter error:', error)
    return NextResponse.json({ error: error.message || 'Generation error' }, { status: 500 })
  }
}
