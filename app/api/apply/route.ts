import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

const MOTIVATION_PROMPT = `Jsi expert na psaní motivačních dopisů pro švýcarský pracovní trh. Píšeš v NĚMČINĚ (Hochdeutsch).

PRAVIDLA:
- Piš formální obchodní němčinu, jasnou a profesionální
- Délka: 200–300 slov
- Struktura: oslovení → proč chci tuto pozici → mé zkušenosti a přínos → motivace → závěr
- Nepoužívej markdown formátování (žádné ** # - atd.)
- Přizpůsob tón oboru
- Zdůrazni spolehlivost, přesnost a pracovní morálku
- Odpověz POUZE textem dopisu, nic jiného`

const GERMAN_LEVEL_MAP: Record<string, string> = {
  'Žádná – teprve se učím': 'A1 – Anfänger',
  'Základy (A1)': 'A1 – Anfänger',
  'Základní komunikace (A2)': 'A2 – Grundkenntnisse',
  'Dorozumím se (B1)': 'B1 – Fortgeschritten',
  'Dobrá úroveň (B2)': 'B2 – Fliessend',
  'Plynulá (C1/C2)': 'C1 – Verhandlungssicher',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateLebenslaufHtml(profile: any, email: string): string {
  const name = profile.full_name || 'Kandidát'
  const position = profile.pozice || ''
  const germanLevel = GERMAN_LEVEL_MAP[profile.nemcina_uroven] || profile.nemcina_uroven || ''
  const experience = profile.zkusenosti || ''
  const education = profile.vzdelani || ''
  const skills = profile.dovednosti || ''
  const phone = profile.telefon || ''
  const address = profile.adresa || ''
  const birthdate = profile.datum_narozeni || ''
  const driving = profile.ridicky_prukaz || ''
  const otherLangs = profile.dalsi_jazyky || ''

  const experienceRows = experience.split('\n').filter((l: string) => l.trim()).map((line: string) => {
    return `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;color:#333;font-size:13px;">${line.trim()}</td></tr>`
  }).join('')

  const educationRows = education.split('\n').filter((l: string) => l.trim()).map((line: string) => {
    return `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;color:#333;font-size:13px;">${line.trim()}</td></tr>`
  }).join('')

  const skillsList = skills.split(/[,;\n]/).filter((s: string) => s.trim()).map((s: string) => {
    return `<span style="display:inline-block;background:#f0f4f8;color:#2c3e50;padding:3px 10px;border-radius:12px;font-size:12px;margin:2px 3px;">${s.trim()}</span>`
  }).join('')

  const languages = [
    { lang: 'Tschechisch', level: 'Muttersprache' },
    ...(germanLevel ? [{ lang: 'Deutsch', level: germanLevel }] : []),
    ...(otherLangs ? otherLangs.split(/[,;]/).filter((l: string) => l.trim()).map((l: string) => ({ lang: l.trim(), level: '' })) : []),
  ]

  const langRows = languages.map(l => {
    return `<tr><td style="padding:4px 12px;font-size:13px;color:#333;">${l.lang}</td><td style="padding:4px 12px;font-size:13px;color:#666;">${l.level}</td></tr>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><title>Lebenslauf – ${name}</title></head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background:#fff;color:#333;">
<div style="max-width:650px;margin:0 auto;padding:30px;">

<!-- Header -->
<div style="background:#2c3e50;color:#fff;padding:25px 30px;border-radius:8px 8px 0 0;">
  <h1 style="margin:0;font-size:24px;font-weight:700;letter-spacing:0.5px;">${name}</h1>
  ${position ? `<p style="margin:5px 0 0;font-size:15px;color:#bdc3c7;">${position}</p>` : ''}
</div>

<!-- Personal Data -->
<div style="background:#f8f9fa;padding:15px 30px;border-bottom:1px solid #e0e0e0;">
  <table style="width:100%;border-collapse:collapse;">
    ${birthdate ? `<tr><td style="padding:3px 0;font-size:12px;color:#888;width:120px;">Geburtsdatum</td><td style="padding:3px 0;font-size:13px;color:#333;">${birthdate}</td></tr>` : ''}
    ${address ? `<tr><td style="padding:3px 0;font-size:12px;color:#888;">Adresse</td><td style="padding:3px 0;font-size:13px;color:#333;">${address}</td></tr>` : ''}
    <tr><td style="padding:3px 0;font-size:12px;color:#888;">E-Mail</td><td style="padding:3px 0;font-size:13px;color:#333;">${email}</td></tr>
    ${phone ? `<tr><td style="padding:3px 0;font-size:12px;color:#888;">Telefon</td><td style="padding:3px 0;font-size:13px;color:#333;">${phone}</td></tr>` : ''}
    <tr><td style="padding:3px 0;font-size:12px;color:#888;">Nationalität</td><td style="padding:3px 0;font-size:13px;color:#333;">Tschechisch</td></tr>
    ${driving ? `<tr><td style="padding:3px 0;font-size:12px;color:#888;">Führerschein</td><td style="padding:3px 0;font-size:13px;color:#333;">${driving}</td></tr>` : ''}
  </table>
</div>

<!-- Berufserfahrung -->
${experienceRows ? `
<div style="padding:20px 30px;">
  <h2 style="font-size:14px;color:#2c3e50;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #2c3e50;padding-bottom:5px;margin:0 0 10px;">Berufserfahrung</h2>
  <table style="width:100%;border-collapse:collapse;">
    ${experienceRows}
  </table>
</div>
` : ''}

<!-- Ausbildung -->
${educationRows ? `
<div style="padding:10px 30px 20px;">
  <h2 style="font-size:14px;color:#2c3e50;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #2c3e50;padding-bottom:5px;margin:0 0 10px;">Ausbildung</h2>
  <table style="width:100%;border-collapse:collapse;">
    ${educationRows}
  </table>
</div>
` : ''}

<!-- Sprachen -->
<div style="padding:10px 30px 20px;">
  <h2 style="font-size:14px;color:#2c3e50;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #2c3e50;padding-bottom:5px;margin:0 0 10px;">Sprachen</h2>
  <table style="width:100%;border-collapse:collapse;">
    ${langRows}
  </table>
</div>

<!-- Kompetenzen -->
${skillsList ? `
<div style="padding:10px 30px 20px;">
  <h2 style="font-size:14px;color:#2c3e50;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #2c3e50;padding-bottom:5px;margin:0 0 10px;">Kompetenzen</h2>
  <div style="margin-top:8px;">${skillsList}</div>
</div>
` : ''}

<div style="padding:20px 30px;text-align:center;border-top:1px solid #e0e0e0;">
  <p style="font-size:11px;color:#aaa;margin:0;">Erstellt über gowoker.com</p>
</div>
</div>
</body>
</html>`
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

    const { agency, matchScore, matchReasoning } = await req.json()

    if (!agency?.id || !agency?.email) {
      return NextResponse.json({ error: 'Missing agency data' }, { status: 400 })
    }

    // Check for duplicate application
    const { data: existing } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('user_id', user.id)
      .eq('agency_id', agency.id)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Already applied to this agency' }, { status: 409 })
    }

    // Load user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const candidateName = profile.full_name || user.email?.split('@')[0] || 'Kandidát'

    // Generate motivation letter
    const letterResponse = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: MOTIVATION_PROMPT,
      messages: [{
        role: 'user',
        content: `Napiš motivační dopis pro:
Jméno: ${candidateName}
Cílová pozice: ${profile.pozice}
Firma / agentura: ${agency.company}
Obor: ${profile.obor}
Zkušenosti: ${profile.zkusenosti}
Dovednosti: ${profile.dovednosti || 'neuvedeno'}
Úroveň němčiny: ${profile.nemcina_uroven}
Vzdělání: ${profile.vzdelani || 'neuvedeno'}`
      }],
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const letterBlock = letterResponse.content.find((b: any) => b.type === 'text')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const letterText = letterBlock ? (letterBlock as any).text : ''

    if (!letterText) return NextResponse.json({ error: 'Letter generation failed' }, { status: 500 })

    // Use saved CV from CV generator if available, otherwise generate basic Lebenslauf
    const cvHtml = profile.saved_cv_html || generateLebenslaufHtml(profile, user.email || '')

    // Build email HTML (motivation letter)
    const emailHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;font-family:Arial,sans-serif;color:#333;line-height:1.6;">
${letterText.split('\n').map((line: string) => line.trim() ? `<p style="margin:0 0 10px;">${line}</p>` : '<br>').join('\n')}
<hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
<p style="font-size:12px;color:#888;">
Kontakt: ${candidateName}<br>
Email: ${user.email}<br>
${profile.telefon ? `Tel: ${profile.telefon}<br>` : ''}
${profile.adresa ? `Adresse: ${profile.adresa}` : ''}
</p>
<p style="font-size:11px;color:#aaa;margin-top:15px;">
Im Anhang finden Sie meinen Lebenslauf.
</p>
</body></html>`

    // Send email with CV attachment
    await resend.emails.send({
      from: `${candidateName} – Bewerbung <bewerbung@gowoker.com>`,
      to: agency.email,
      replyTo: user.email!,
      bcc: user.email!,
      subject: `Bewerbung als ${profile.pozice} - ${candidateName}`,
      html: emailHtml,
      attachments: [
        {
          filename: `Lebenslauf_${candidateName.replace(/\s+/g, '_')}.html`,
          content: Buffer.from(cvHtml).toString('base64'),
        },
      ],
    })

    // Record application in database
    await supabaseAdmin.from('applications').insert({
      user_id: user.id,
      agency_id: agency.id,
      agency_name: agency.company,
      agency_email: agency.email,
      status: 'sent',
      match_score: matchScore,
      match_reasoning: matchReasoning,
      letter_text: letterText,
      cv_html: cvHtml,
    })

    return NextResponse.json({ success: true, letterPreview: letterText.substring(0, 200) + '...' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Apply error:', error)
    return NextResponse.json({ error: error.message || 'Application error' }, { status: 500 })
  }
}
