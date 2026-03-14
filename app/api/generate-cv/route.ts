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

const SYSTEM_PROMPT = `Du bist ein Experte für die Erstellung von Lebensläufen (CV) für den Schweizer Arbeitsmarkt. Du erstellst REICHHALTIGE, PROFESSIONELLE Lebensläufe, die neben Canva-Vorlagen bestehen können.

DEINE AUFGABE: Erstelle aus den Benutzerdaten (auf Tschechisch) einen STRUKTURIERTEN JSON-Lebenslauf auf DEUTSCH.

QUALITÄTSREGELN:
1. PROFIL (3-4 Sätze): Schreibe ein überzeugendes berufliches Profil in der dritten Person. Betone Schlüsselstärken, Jahre der Erfahrung und Kernkompetenzen. Selbstbewusst, aber nicht arrogant. Verwende branchenspezifische Begriffe die in der Schweiz üblich sind.
2. BERUFSERFAHRUNG: Schreibe 3-5 KONKRETE Tätigkeiten pro Position (keine allgemeinen). Verwende Aktionsverben: durchführen, koordinieren, sicherstellen, optimieren, betreuen, implementieren, leiten, analysieren. Falls der Benutzer wenig schreibt, ERWEITERE basierend auf typischen Tätigkeiten in der Branche. Beginne jede Tätigkeit mit einem starken Verb.
3. KOMPETENZEN: Aufteilen in technical (fachlich, konkret, branchenspezifisch) und soft (persönliche Eigenschaften). Mindestens 5-7 technische und 5-7 Soft Skills. Ergänze relevante Skills für die Branche. Verwende Schweizer Fachbegriffe wo möglich.
4. SPRACHEN: Immer mit korrekten deutschen Bezeichnungen der Stufen. Tschechisch immer als "Muttersprache" einordnen.
5. AUSBILDUNG: Übersetze Schulnamen und Fachrichtungen ins Deutsche, behalte aber Eigennamen. Füge den Abschlusstyp hinzu (Lehrabschluss, Berufsmatura, Fachausweis etc.)
6. ZERTIFIKATE: Ergänze branchenübliche Schweizer Zertifikate die für die Position relevant sind (z.B. SUVA-Kurse, SIZ, SVEB etc.)

WICHTIG FÜR SCHWEIZER MARKT:
- Verwende Schweizer Hochdeutsch (z.B. "Strasse" statt "Straße")
- Verwende Begriffe die in der Schweiz üblich sind
- Formuliere Tätigkeiten ergebnisorientiert
- Profil sollte die Motivation für die Arbeit in der Schweiz subtil betonen

ANTWORTE NUR MIT VALIDEM JSON (kein anderer Text!):

{
  "profil": "3-4 Sätze berufliches Profil auf Deutsch. Motivierend, konkret, professionell.",
  "personalData": {
    "name": "string",
    "birthdate": "string",
    "nationality": "string (auf Deutsch)",
    "address": "string",
    "phone": "string",
    "email": "string",
    "drivingLicense": "string oder null"
  },
  "experience": [
    {
      "period": "MM.YYYY – MM.YYYY (oder 'Aktuell' für aktuelle Position)",
      "title": "Positionsbezeichnung auf Deutsch",
      "company": "Firmenname",
      "location": "Stadt, Land",
      "tasks": ["Konkrete Tätigkeit 1 mit Aktionsverb", "Tätigkeit 2", "Tätigkeit 3", "Tätigkeit 4"]
    }
  ],
  "education": [
    {
      "period": "YYYY – YYYY",
      "school": "Schulname",
      "degree": "Abschluss/Fachrichtung auf Deutsch",
      "location": "Stadt, Land"
    }
  ],
  "languages": [
    {
      "language": "Sprachname auf Deutsch",
      "level": "Stufe (Muttersprache / A1 Anfänger / A2 Grundkenntnisse / B1 Fortgeschritten / B2 Fliessend / C1 Verhandlungssicher / C2 Muttersprachliches Niveau)"
    }
  ],
  "skills": {
    "technical": ["min 5-7 fachliche Kompetenzen"],
    "soft": ["min 5-7 persönliche Eigenschaften auf Deutsch"]
  },
  "certifications": ["Zertifikate, Kurse, Berechtigungen – branchenrelevant, sonst leeres Array"]
}`

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

    if (sub?.status !== 'active') return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 })

    const { formData } = await req.json()
    if (!formData || typeof formData !== 'object') return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })

    const userMessage = `Erstelle einen reichhaltigen strukturierten JSON-Lebenslauf für:

Name: ${formData.name}
Geburtsdatum: ${formData.birthdate}
Nationalität: ${formData.nationality || 'Tschechisch'}
Adresse: ${formData.address || 'Tschechische Republik'}
Telefon: ${formData.phone}
E-Mail: ${formData.email}
Führerschein: ${formData.driving || 'keiner'}
Zielposition: ${formData.position}
Branche: ${formData.field}

BERUFSERFAHRUNG (erweitere und verbessere die Beschreibungen, min. 3-5 Tätigkeiten pro Position):
${formData.experience_detail}

AUSBILDUNG:
${formData.education}

SPRACHEN:
Tschechisch: Muttersprache
Deutsch: ${formData.german}
${formData.other_languages ? 'Weitere Sprachen: ' + formData.other_languages : ''}

KOMPETENZEN (ergänze branchenrelevante):
${formData.skills}

WICHTIG: Erweitere jede Position auf 3-5 konkrete Tätigkeiten mit Aktionsverben. Schreibe ein motivierendes Profil. Ergänze Skills wenn zu wenig. Antworte NUR mit validem JSON.`

    const generateCV = async (): Promise<string> => {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      })

      const textBlock = response.content.find((block: { type: string }) => block.type === 'text')
      const text = textBlock && 'text' in textBlock ? textBlock.text : ''
      if (!text) throw new Error('Generation failed')
      return text
    }

    let cvData
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        let text = await generateCV()
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
        // Remove any leading/trailing non-JSON text
        const jsonStart = text.indexOf('{')
        const jsonEnd = text.lastIndexOf('}')
        if (jsonStart !== -1 && jsonEnd !== -1) {
          text = text.substring(jsonStart, jsonEnd + 1)
        }
        cvData = JSON.parse(text)
        break
      } catch {
        if (attempt === 2) {
          console.error('JSON parse error after retries')
          return NextResponse.json({ error: 'AI generated invalid data. Try again.' }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ cvData })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Generate CV error:', error)
    return NextResponse.json({ error: error.message || 'Generation error' }, { status: 500 })
  }
}
