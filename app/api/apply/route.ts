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

    const letterBlock = letterResponse.content.find((b: any) => b.type === 'text')
    const letterText = letterBlock ? (letterBlock as any).text : ''

    if (!letterText) return NextResponse.json({ error: 'Letter generation failed' }, { status: 500 })

    // Build email HTML
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
</body></html>`

    // Send email via Resend
    await resend.emails.send({
      from: `${candidateName} via Woker <vaclav@gowoker.com>`,
      to: agency.email,
      replyTo: user.email!,
      subject: `Bewerbung als ${profile.pozice} - ${candidateName}`,
      html: emailHtml,
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
    })

    return NextResponse.json({ success: true, letterPreview: letterText.substring(0, 200) + '...' })
  } catch (error: any) {
    console.error('Apply error:', error)
    return NextResponse.json({ error: error.message || 'Application error' }, { status: 500 })
  }
}
