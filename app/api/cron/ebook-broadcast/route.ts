import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY);

const EBOOK_URL = 'https://www.gowoker.com/ebook';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Načti všechny aktivní leady
  const { data: leads, error } = await supabase
    .from('leads')
    .select('email, name')
    .eq('status', 'active');

  if (error || !leads) {
    return NextResponse.json({ error: 'DB error', details: error }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const lead of leads) {
    const firstName = lead.name?.split(' ')[0] || 'příteli';

    try {
      await resend.emails.send({
        from: 'Václav z Wokeru <vaclav@gowoker.com>',
        to: lead.email,
        subject: '📖 Můj příběh: Jak jsem začínal ve Švýcarsku (interaktivní ebook)',
        html: getEbookEmail(firstName, lead.email),
      });
      sent++;
    } catch (e) {
      console.error(`Failed: ${lead.email}`, e);
      failed++;
    }
  }

  return NextResponse.json({ success: true, total: leads.length, sent, failed });
}

function getEbookEmail(name: string, email: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a12;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:30px;">
    <span style="color:#39ff6e;font-size:24px;font-weight:bold;letter-spacing:3px;">WOKER</span>
  </div>
  <div style="background:#111122;border-radius:16px;padding:32px 28px;border:1px solid rgba(255,255,255,0.06);">
    <h1 style="color:#f0f0f5;font-size:22px;margin:0 0 8px;">Ahoj ${name}! 👋</h1>
    <p style="color:#ccccdd;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Napsal jsem interaktivní ebook o tom, <strong style="color:#f0f0f5;">jak jsem začínal ve Švýcarsku</strong> — od spaní v autě až po založení Wokeru.
    </p>

    <div style="margin:24px 0;padding:20px;background:linear-gradient(135deg,rgba(57,255,110,0.08),rgba(57,255,110,0.02));border:1px solid rgba(57,255,110,0.15);border-radius:12px;">
      <p style="color:#f0f0f5;font-weight:bold;font-size:16px;margin:0 0 12px;">📖 Co v ebooku najdeš:</p>
      <ul style="color:#ccccdd;font-size:14px;line-height:1.8;padding-left:20px;margin:0;">
        <li>Můj osobní příběh — proč jsem odešel a co mě čekalo</li>
        <li><strong style="color:#39ff6e;">Kalkulačka</strong> — kolik stojí hledání práce bez Wokeru</li>
        <li><strong style="color:#39ff6e;">Živé ukázky</strong> — AI hledání práce, CV generátor, smart matching</li>
        <li>Jak AI napíše motivační dopis v němčině za 12 sekund</li>
        <li>Databáze 1 007 agentur s přímými kontakty</li>
      </ul>
    </div>

    <div style="text-align:center;margin:28px 0 8px;">
      <a href="${EBOOK_URL}"
         style="display:inline-block;background:#39ff6e;color:#0a0a12;padding:16px 36px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;">
        📖 Přečíst ebook zdarma →
      </a>
    </div>
    <p style="color:#8888aa;font-size:12px;text-align:center;margin:0;">Bez registrace. Kompletně zdarma. Trvá 5 minut.</p>
  </div>

  <div style="margin-top:24px;padding:18px 24px;background:#111122;border-radius:12px;border-left:3px solid #39ff6e;">
    <p style="color:#ccccdd;font-size:14px;line-height:1.6;margin:0;">
      <strong style="color:#39ff6e;">Proč to čtu?</strong> Protože jsi se zajímal/a o práci ve Švýcarsku.
      Tohle je ten příběh, který bych chtěl přečíst, když jsem sám začínal.
    </p>
  </div>

  <div style="text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #222244;">
    <p style="color:#8888aa;font-size:12px;margin:0;">Václav z Wokeru | <a href="https://gowoker.com" style="color:#39ff6e;text-decoration:none;">gowoker.com</a></p>
    <p style="color:#555577;font-size:11px;margin-top:8px;">
      <a href="https://gowoker.com/api/unsubscribe?email=${encodeURIComponent(email)}" style="color:#555577;text-decoration:underline;">Odhlásit se</a>
    </p>
  </div>
</div>
</body></html>`;
}
