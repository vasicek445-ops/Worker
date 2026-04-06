import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, source } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Neplatný email' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name?.trim() || null;

    // Ulož do Supabase
    const { error: dbError } = await supabase
      .from('leads')
      .upsert(
        {
          email: cleanEmail,
          name: cleanName,
          source: source || 'lead-magnet',
          status: 'active',
          email_sequence_step: 0,
        },
        { onConflict: 'email' }
      );

    if (dbError) {
      console.error('Supabase error:', dbError);
      return NextResponse.json({ error: 'Nepodařilo se uložit' }, { status: 500 });
    }

    // Odešli uvítací email s PDF
    try {
      await resend.emails.send({
        from: 'Václav z Wokeru <vaclav@gowoker.com>',
        to: cleanEmail,
        subject: '📥 Váš průvodce: 5 kroků k práci ve Švýcarsku',
        html: getWelcomeEmail(cleanName || 'příteli', cleanEmail),
      });

      await supabase
        .from('leads')
        .update({
          email_sequence_step: 1,
          last_email_sent_at: new Date().toISOString(),
        })
        .eq('email', cleanEmail);
    } catch (emailError) {
      console.error('Resend error:', emailError);
      // Email je uložen i když se neposlal
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead API error:', error);
    return NextResponse.json({ error: 'Interní chyba' }, { status: 500 });
  }
}

function getWelcomeEmail(name: string, email: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a12;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:30px;">
    <span style="color:#39ff6e;font-size:24px;font-weight:bold;letter-spacing:3px;">WOKER</span>
  </div>
  <div style="background:#111122;border-radius:16px;padding:32px 28px;border:1px solid rgba(255,255,255,0.06);">
    <h1 style="color:#f0f0f5;font-size:24px;margin:0 0 8px;">Ahoj ${name}! 👋</h1>
    <p style="color:#8888aa;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Díky, že jste si stáhl/a průvodce. Tady je váš odkaz ke stažení:
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://gowoker.com/downloads/5-kroku-prace-svycarsko.pdf"
         style="display:inline-block;background:#39ff6e;color:#0a0a12;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;">
        📥 Stáhnout průvodce (PDF)
      </a>
    </div>
    <p style="color:#ccccdd;font-size:14px;line-height:1.6;margin:24px 0 0;">
      <strong style="color:#f0f0f5;">Co v průvodci najdete:</strong>
    </p>
    <ul style="color:#ccccdd;font-size:14px;line-height:1.8;padding-left:20px;">
      <li>Typy pracovních povolení a jak je získat</li>
      <li>5 nejlepších zdrojů pro hledání práce</li>
      <li>Jak napsat CV pro švýcarský trh</li>
      <li>Reálné platy a daně podle oborů</li>
      <li>Jak se vyhnout podvodným agenturám</li>
    </ul>
  </div>
  <div style="margin-top:24px;padding:20px 24px;background:#111122;border-radius:12px;border-left:3px solid #39ff6e;">
    <p style="color:#ccccdd;font-size:14px;line-height:1.6;margin:0;">
      <strong style="color:#39ff6e;">P.S.</strong> Pokud chcete přímý přístup k
      <strong style="color:#f0f0f5;">1 007+ kontaktům na švýcarské zaměstnavatele</strong>,
      podívejte se na <a href="https://gowoker.com/#cenik" style="color:#39ff6e;">Woker Premium</a>.
      Vše za €9,99/měsíc — levnější než 20 minut práce ve Švýcarsku.
    </p>
  </div>
  <div style="text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #222244;">
    <p style="color:#8888aa;font-size:12px;margin:0;">
      Václav z Wokeru | <a href="https://gowoker.com" style="color:#39ff6e;text-decoration:none;">gowoker.com</a>
    </p>
    <p style="color:#555577;font-size:11px;margin-top:8px;">
      <a href="https://gowoker.com/api/unsubscribe?email=${encodeURIComponent(email)}" style="color:#555577;text-decoration:underline;">Odhlásit se</a>
    </p>
  </div>
</div>
</body></html>`;
}
