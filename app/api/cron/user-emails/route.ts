import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY);

// Post-registration drip for free users who haven't subscribed
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get registered users who need nurturing emails
  // user_email_step: 0 = welcome sent, 1-5 = drip emails
  // Only process users without active subscription
  const delay = new Date();
  delay.setDate(delay.getDate() - 2); // 2 days between emails

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, user_email_step, last_user_email_at')
    .gte('user_email_step', 1)
    .lte('user_email_step', 5)
    .lt('last_user_email_at', delay.toISOString())
    .limit(50);

  if (error || !profiles) {
    return NextResponse.json({ error: 'DB error', details: error?.message }, { status: 500 });
  }

  // Filter out users who already have active subscription
  const activeSubIds = new Set<string>();
  if (profiles.length > 0) {
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('status', 'active')
      .in('user_id', profiles.map(p => p.id));
    (subs || []).forEach(s => activeSubIds.add(s.user_id));
  }

  // Get emails from auth.users
  let sent = 0;
  for (const profile of profiles) {
    if (activeSubIds.has(profile.id)) continue; // Skip paid users

    const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
    if (!userData?.user?.email) continue;

    const email = getUserSequenceEmail(
      profile.user_email_step,
      profile.full_name?.split(' ')[0] || 'příteli'
    );
    if (!email) continue;

    try {
      await resend.emails.send({
        from: 'Václav z Wokeru <vaclav@gowoker.com>',
        to: userData.user.email,
        subject: email.subject,
        html: email.html.replace('UNSUBSCRIBE_EMAIL', encodeURIComponent(userData.user.email)),
      });

      await supabase
        .from('profiles')
        .update({
          user_email_step: profile.user_email_step + 1,
          last_user_email_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      sent++;
    } catch (e) {
      console.error(`Failed user email: ${userData.user.email}`, e);
    }
  }

  return NextResponse.json({ success: true, processed: profiles.length, sent });
}

function wrap(name: string, content: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a12;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:24px;">
    <span style="color:#39ff6e;font-size:20px;font-weight:bold;letter-spacing:3px;">WOKER</span>
  </div>
  <div style="background:#111122;border-radius:16px;padding:28px 24px;border:1px solid rgba(255,255,255,0.06);color:#ccccdd;font-size:15px;line-height:1.7;">
    <p style="margin:0 0 16px;">Ahoj ${name},</p>
    ${content}
  </div>
  <div style="text-align:center;margin-top:28px;padding-top:16px;border-top:1px solid #222244;">
    <p style="color:#8888aa;font-size:12px;margin:0;">Václav z Wokeru | <a href="https://www.gowoker.com" style="color:#39ff6e;text-decoration:none;">gowoker.com</a></p>
    <p style="color:#555577;font-size:11px;margin-top:8px;">
      <a href="https://www.gowoker.com/api/unsubscribe?email=UNSUBSCRIBE_EMAIL" style="color:#555577;text-decoration:underline;">Odhlásit se</a>
    </p>
  </div>
</div>
</body></html>`;
}

function getUserSequenceEmail(step: number, name: string) {
  const emails: Record<number, { subject: string; html: string }> = {
    // EMAIL 1 (den 2 po registraci): Už jsi zkusil AI nástroje?
    1: {
      subject: '🤖 Zkusil/a jsi AI nástroje? (2 minuty a máš CV)',
      html: wrap(name, `
        <h2 style="color:#f0f0f5;font-size:20px;margin:0 0 16px;">Máš CV na švýcarský standard?</h2>
        <p>Švýcarský zaměstnavatel vyhodí CV za 6 sekund, pokud nevypadá profesionálně.</p>
        <p>Ve Wokeru máme AI šablonu, která ti <strong style="color:#39ff6e;">za 2 minuty vytvoří CV</strong> přesně podle švýcarských standardů:</p>
        <ul style="color:#ccccdd;font-size:14px;line-height:2;padding-left:20px;">
          <li>Profesionální formát se správným fotka</li>
          <li>Správná struktura (osobní údaje, vzdělání, praxe)</li>
          <li>Přeloženo do němčiny/francouzštiny</li>
        </ul>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://www.gowoker.com/pruvodce/sablony/cv" style="display:inline-block;background:#39ff6e;color:#0a0a12;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold;">Vytvořit CV teď →</a>
        </div>
        <p style="color:#8888aa;font-size:13px;">P.S. K tomu máme i AI motivační dopis a email pro HR. Vše v sekci Šablony.</p>`)
    },

    // EMAIL 2 (den 4): Kolik se vydělá?
    2: {
      subject: '💰 Kolik reálně vyděláš ve Švýcarsku? (čísla)',
      html: wrap(name, `
        <h2 style="color:#f0f0f5;font-size:20px;margin:0 0 16px;">Reálné platy ve Švýcarsku 2026</h2>
        <p>Tady jsou čísla, které agentury neříkají:</p>
        <div style="margin:16px 0;">
          <div style="padding:12px 16px;background:#1a1a2e;border-radius:8px;margin-bottom:8px;display:flex;justify-content:space-between;">
            <span>🔧 Elektrikář / montér</span>
            <strong style="color:#39ff6e;">5 200–6 800 CHF</strong>
          </div>
          <div style="padding:12px 16px;background:#1a1a2e;border-radius:8px;margin-bottom:8px;display:flex;justify-content:space-between;">
            <span>👨‍🍳 Kuchař / kuchařka</span>
            <strong style="color:#39ff6e;">4 800–6 200 CHF</strong>
          </div>
          <div style="padding:12px 16px;background:#1a1a2e;border-radius:8px;margin-bottom:8px;display:flex;justify-content:space-between;">
            <span>🏗️ Stavbař / dělník</span>
            <strong style="color:#39ff6e;">5 500–7 000 CHF</strong>
          </div>
          <div style="padding:12px 16px;background:#1a1a2e;border-radius:8px;margin-bottom:8px;display:flex;justify-content:space-between;">
            <span>🏥 Zdravotní sestra</span>
            <strong style="color:#39ff6e;">5 800–7 500 CHF</strong>
          </div>
          <div style="padding:12px 16px;background:#1a1a2e;border-radius:8px;display:flex;justify-content:space-between;">
            <span>💻 IT / programátor</span>
            <strong style="color:#39ff6e;">8 000–12 000 CHF</strong>
          </div>
        </div>
        <p style="color:#8888aa;font-size:13px;">To je hrubý plat. Po odečtení daní a pojištění ti zůstane cca 70–80 %.</p>
        <div style="margin:20px 0;padding:14px;background:rgba(57,255,110,0.08);border-radius:10px;border-left:3px solid #39ff6e;">
          <p style="margin:0;font-size:14px;"><strong style="color:#39ff6e;">Tip:</strong> Zeptej se AI asistenta Wokee na plat ve svém oboru. Klikni na zelené kolečko na dashboardu.</p>
        </div>`)
    },

    // EMAIL 3 (den 6): Social proof + Premium pitch
    3: {
      subject: '📱 „Za 2 týdny jsem měl smlouvu" (screenshoty)',
      html: wrap(name, `
        <h2 style="color:#f0f0f5;font-size:20px;margin:0 0 16px;">Reálné výsledky uživatelů</h2>
        <p>Nechci ti říkat, že Woker funguje. Raději ti ukážu, co píšou lidi:</p>
        <div style="margin:16px 0;padding:18px;background:#1a1a2e;border-radius:10px;">
          <p style="color:#ffd700;margin:0 0 8px;">⭐⭐⭐⭐⭐</p>
          <p style="color:#ccccdd;font-style:italic;margin:0 0 8px;">„Kontaktoval jsem 15 firem přímo, bez agentury. Za 2 týdny jsem měl smlouvu. Woker mi ušetřil 500 €."</p>
          <p style="color:#8888aa;font-size:13px;margin:0;">— Martin K., elektrikář</p>
        </div>
        <div style="margin:16px 0;padding:18px;background:#1a1a2e;border-radius:10px;">
          <p style="color:#ffd700;margin:0 0 8px;">⭐⭐⭐⭐⭐</p>
          <p style="color:#ccccdd;font-style:italic;margin:0 0 8px;">„AI mi za minutu napsalo perfektní motivační dopis v němčině. Zaměstnavatel byl překvapený."</p>
          <p style="color:#8888aa;font-size:13px;margin:0;">— Jana M., účetní</p>
        </div>
        <p style="margin-top:20px;">Všichni tihle lidi začali stejně jako ty — registrací. Rozdíl? Odemkli si <strong style="color:#39ff6e;">přímý přístup k 1 007 kontaktům.</strong></p>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://www.gowoker.com/#pricing" style="display:inline-block;background:#39ff6e;color:#0a0a12;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold;">Odemknout kontakty →</a>
        </div>`)
    },

    // EMAIL 4 (den 8): Urgence + konkrétní nabídka
    4: {
      subject: '⏰ Každý měsíc čekání tě stojí 6 400 €',
      html: wrap(name, `
        <h2 style="color:#f0f0f5;font-size:20px;margin:0 0 16px;">Jednoduchá matematika</h2>
        <div style="margin:20px 0;padding:20px;background:#1a1a2e;border-radius:10px;text-align:center;">
          <p style="color:#39ff6e;font-size:32px;font-weight:bold;margin:0;">6 400 CHF</p>
          <p style="color:#8888aa;font-size:13px;margin:8px 0 0;">Průměrný měsíční plat ve Švýcarsku</p>
        </div>
        <p>Každý měsíc, co čekáš, je měsíc, kdy bys mohl vydělávat 3–4x víc než doma.</p>
        <p>Woker Premium stojí <strong style="color:#39ff6e;">€9,99/měsíc</strong>. To je:</p>
        <ul style="color:#ccccdd;font-size:14px;line-height:2;padding-left:20px;">
          <li>Cena 20 minut práce ve Švýcarsku</li>
          <li>40x méně než agentura (400–600 €)</li>
          <li>Zrušíš kdykoliv jedním klikem</li>
        </ul>
        <div style="margin:20px 0;padding:16px;background:linear-gradient(135deg,rgba(57,255,110,0.08),rgba(57,255,110,0.02));border:1px solid rgba(57,255,110,0.15);border-radius:12px;">
          <p style="margin:0;color:#f0f0f5;font-weight:bold;">Co odemkneš:</p>
          <p style="margin:8px 0 0;color:#ccccdd;font-size:14px;">✅ 1 007 kontaktů · ✅ 10 AI nástrojů · ✅ Průvodce od A do Z · ✅ AI asistent 24/7</p>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://www.gowoker.com/#pricing" style="display:inline-block;background:#39ff6e;color:#0a0a12;padding:16px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;">Odemknout Woker Premium →</a>
        </div>`)
    },

    // EMAIL 5 (den 10): Poslední email
    5: {
      subject: '👋 Můj poslední email (a nabídka)',
      html: wrap(name, `
        <h2 style="color:#f0f0f5;font-size:20px;margin:0 0 16px;">Tohle je poslední email</h2>
        <p>Nechci být otravný. Tohle je poslední email z této série.</p>
        <p>Věřím, že Woker ti může pomoct najít práci ve Švýcarsku. Ale rozhodnutí je na tobě.</p>
        <div style="margin:20px 0;padding:18px;background:#1a1a2e;border-radius:10px;border-left:3px solid #39ff6e;">
          <p style="color:#f0f0f5;margin:0;font-size:16px;">
            <strong>Roční plán: 3 dny zdarma.</strong>
          </p>
          <p style="color:#8888aa;font-size:13px;margin:8px 0 0;">Vyzkoušej vše na 3 dny — pokud se ti to nelíbí, zrušíš to a neplatíš nic.</p>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://www.gowoker.com/#pricing" style="display:inline-block;background:#39ff6e;color:#0a0a12;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold;">Vyzkoušet 3 dny zdarma →</a>
        </div>
        <p>Ať se rozhodneš jakkoliv — přeju ti hodně štěstí! 🍀</p>
        <p style="color:#8888aa;">Václav</p>
        <p style="color:#8888aa;font-style:italic;font-size:13px;">P.S. Sleduj mě na TikToku a Instagramu: <a href="https://www.tiktok.com/@vasicenko" style="color:#39ff6e;">@vasicenko</a> — denní tipy o práci ve Švýcarsku.</p>`)
    },
  };
  return emails[step] || null;
}
