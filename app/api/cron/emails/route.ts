import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  // Ověř cron secret
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Min 2 dny od posledního emailu
  const delay = new Date();
  delay.setDate(delay.getDate() - 2);

  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .eq('status', 'active')
    .gte('email_sequence_step', 1)
    .lte('email_sequence_step', 5)
    .lt('last_email_sent_at', delay.toISOString())
    .limit(50);

  if (error || !leads) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }

  let sent = 0;
  for (const lead of leads) {
    const email = getSequenceEmail(lead.email_sequence_step, lead.name || 'příteli');
    if (!email) continue;

    try {
      await resend.emails.send({
        from: 'Václav z Wokeru <vaclav@gowoker.com>',
        to: lead.email,
        subject: email.subject,
        html: email.html,
      });

      await supabase
        .from('leads')
        .update({
          email_sequence_step: lead.email_sequence_step + 1,
          last_email_sent_at: new Date().toISOString(),
        })
        .eq('id', lead.id);

      sent++;
    } catch (e) {
      console.error(`Failed: ${lead.email}`, e);
    }
  }

  return NextResponse.json({ success: true, sent });
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
    <p style="color:#8888aa;font-size:12px;margin:0;">Václav z Wokeru | <a href="https://gowoker.com" style="color:#39ff6e;text-decoration:none;">gowoker.com</a></p>
    <p style="color:#555577;font-size:11px;margin-top:8px;">
      <a href="https://gowoker.com/api/unsubscribe?email=UNSUBSCRIBE" style="color:#555577;text-decoration:underline;">Odhlásit se</a>
    </p>
  </div>
</div>
</body></html>`;
}

function getSequenceEmail(step: number, name: string) {
  const emails: Record<number, { subject: string; html: string }> = {
    // EMAIL 2 (den 2): Příběh
    1: {
      subject: '🇨🇭 Jak jsem si našel práci ve Švýcarsku za 2 týdny',
      html: wrap(name, `
        <h2 style="color:#f0f0f5;font-size:20px;margin:0 0 16px;">Můj příběh</h2>
        <p>Když jsem poprvé přemýšlel o práci ve Švýcarsku, taky jsem nevěděl, kde začít. Agentury chtěly stovky eur, kamarádi říkali, že to nejde.</p>
        <p>Ale šlo to. A šlo to rychleji, než jsem čekal.</p>
        <p>Klíč? <strong style="color:#39ff6e;">Přímý kontakt na zaměstnavatele.</strong> Žádný prostředník. Žádné poplatky. Prostě jsem napsal email, zavolal a za 2 týdny měl smlouvu.</p>
        <p>Proto jsem vytvořil Woker — abych tohle umožnil každému.</p>
        <div style="margin:24px 0;padding:16px;background:rgba(57,255,110,0.08);border-radius:10px;border-left:3px solid #39ff6e;">
          <p style="margin:0;color:#ccccdd;font-size:14px;"><strong style="color:#39ff6e;">Tip:</strong> Už jste si přečetl/a průvodce? Začněte krokem 1 — pracovní povolení. Je to jednodušší, než si myslíte.</p>
        </div>`)
    },
    // EMAIL 3 (den 4): CV tipy
    2: {
      subject: '📄 3 chyby v CV, kvůli kterým vás Švýcaři odmítnou',
      html: wrap(name, `
        <h2 style="color:#f0f0f5;font-size:20px;margin:0 0 16px;">3 nejčastější chyby v CV</h2>
        <p>Švýcarský trh práce je specifický. Tady jsou 3 chyby, které vidím nejčastěji:</p>
        <div style="margin:16px 0;padding:14px;background:rgba(255,68,68,0.08);border-radius:8px;">
          <p style="margin:0;color:#ff8888;"><strong>❌ Chyba #1: CV bez fotky</strong></p>
          <p style="margin:4px 0 0;color:#ccccdd;font-size:13px;">Ve Švýcarsku je profesionální fotka standard. Bez ní vypadáte neprofesionálně.</p>
        </div>
        <div style="margin:16px 0;padding:14px;background:rgba(255,68,68,0.08);border-radius:8px;">
          <p style="margin:0;color:#ff8888;"><strong>❌ Chyba #2: Žádné jazyky</strong></p>
          <p style="margin:4px 0 0;color:#ccccdd;font-size:13px;">I základní němčina (A2) dramaticky zvýší vaše šance. Vždy uveďte úrovně.</p>
        </div>
        <div style="margin:16px 0;padding:14px;background:rgba(255,68,68,0.08);border-radius:8px;">
          <p style="margin:0;color:#ff8888;"><strong>❌ Chyba #3: Příliš dlouhé CV</strong></p>
          <p style="margin:4px 0 0;color:#ccccdd;font-size:13px;">Max 2 strany. Švýcaři nemají čas na romány. Buďte konkrétní — čísla a výsledky.</p>
        </div>
        <p style="margin-top:20px;">Podrobný návod najdete v průvodci na straně 5 (krok 3).</p>`)
    },
    // EMAIL 4 (den 6): Social proof
    3: {
      subject: '💬 „Za měsíc jsem měl smlouvu" — Martin, elektrikář',
      html: wrap(name, `
        <h2 style="color:#f0f0f5;font-size:20px;margin:0 0 16px;">Co říkají ostatní</h2>
        <div style="margin:16px 0;padding:18px;background:#1a1a2e;border-radius:10px;">
          <p style="color:#ffd700;margin:0 0 8px;">⭐⭐⭐⭐⭐</p>
          <p style="color:#ccccdd;font-style:italic;margin:0 0 8px;">„Díky Wokeru jsem kontaktoval přímo 15 firem. Za měsíc jsem měl smlouvu na montéra za 5 800 CHF měsíčně."</p>
          <p style="color:#8888aa;font-size:13px;margin:0;">— Martin K., elektrikář, Zürich</p>
        </div>
        <div style="margin:16px 0;padding:18px;background:#1a1a2e;border-radius:10px;">
          <p style="color:#ffd700;margin:0 0 8px;">⭐⭐⭐⭐⭐</p>
          <p style="color:#ccccdd;font-style:italic;margin:0 0 8px;">„Agentura chtěla 500 € a nic mi nenašla. Přes Woker jsem si práci našla sama za týden."</p>
          <p style="color:#8888aa;font-size:13px;margin:0;">— Petra H., kuchařka, Bern</p>
        </div>
        <p style="margin-top:20px;">Chcete se přidat? S <strong style="color:#39ff6e;">1 007+ kontakty</strong> je to jednodušší, než si myslíte.</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://gowoker.com/#cenik" style="display:inline-block;background:#39ff6e;color:#0a0a12;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold;">Prozkoumat Woker Premium →</a>
        </div>`)
    },
    // EMAIL 5 (den 8): Nabídka
    4: {
      subject: '⏰ Speciální nabídka pro čtenáře průvodce (€9,99/měs)',
      html: wrap(name, `
        <h2 style="color:#f0f0f5;font-size:20px;margin:0 0 16px;">Exkluzivní nabídka</h2>
        <p>Děkuji, že jste si přečetl/a průvodce. Doufám, že vám pomohl.</p>
        <div style="margin:20px 0;padding:24px;background:linear-gradient(135deg,rgba(57,255,110,0.08),rgba(57,255,110,0.02));border:1px solid rgba(57,255,110,0.15);border-radius:12px;">
          <p style="color:#39ff6e;font-weight:bold;font-size:18px;margin:0 0 12px;">Woker Premium — €9,99/měsíc</p>
          <ul style="color:#ccccdd;font-size:14px;line-height:1.8;padding-left:20px;">
            <li><strong style="color:#f0f0f5;">1 007+ kontaktů</strong> přímo na švýcarské zaměstnavatele</li>
            <li><strong style="color:#f0f0f5;">Najděte si parťáka</strong> a ušetřete 40–60 % na bydlení</li>
            <li><strong style="color:#f0f0f5;">Zdravotní pojištění za 200 CHF</strong> — návod v komunitě</li>
            <li><strong style="color:#f0f0f5;">24/7 AI asistent</strong> — zeptejte se na cokoliv</li>
          </ul>
          <p style="color:#8888aa;font-size:13px;margin:16px 0 0;">Agentura = 400–600 € | Woker = €9,99/měs. Zaplatí se za 20 minut práce.</p>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://gowoker.com/#cenik" style="display:inline-block;background:#39ff6e;color:#0a0a12;padding:16px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;">Začít s Woker Premium →</a>
        </div>
        <div style="margin-top:16px;padding:14px;background:rgba(255,215,0,0.08);border-radius:8px;border-left:3px solid #ffd700;">
          <p style="margin:0;color:#ccccdd;font-size:13px;"><strong style="color:#ffd700;">⚠️ Plánujeme rozšíření do 10 zemí</strong> — cena poroste na €24,99. Kdo se připojí teď, platí navždy aktuální cenu.</p>
        </div>`)
    },
    // EMAIL 6 (den 10): Poslední
    5: {
      subject: '👋 Poslední zpráva ode mě (+ překvapení)',
      html: wrap(name, `
        <h2 style="color:#f0f0f5;font-size:20px;margin:0 0 16px;">Tohle je můj poslední email</h2>
        <p>Nechci být otravný, takže tohle je poslední email z této série.</p>
        <div style="margin:20px 0;padding:18px;background:#1a1a2e;border-radius:10px;border-left:3px solid #39ff6e;">
          <p style="color:#f0f0f5;font-size:16px;margin:0;">
            <strong>Každý měsíc, který čekáte, vás stojí potenciálně 6 400 €.</strong>
          </p>
          <p style="color:#8888aa;font-size:13px;margin:8px 0 0;">To je průměrný měsíční plat ve Švýcarsku. Kolik měsíců ještě budete čekat?</p>
        </div>
        <p>Průvodce máte. Informace máte. Teď je to jen na vás.</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="https://gowoker.com/#cenik" style="display:inline-block;background:#39ff6e;color:#0a0a12;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold;">Začít s Woker Premium →</a>
        </div>
        <p>Ať už se rozhodnete jakkoliv — přeji hodně štěstí! 🍀</p>
        <p style="color:#8888aa;">Václav</p>
        <p style="color:#8888aa;font-style:italic;font-size:13px;">P.S. TikTok a Instagram: @vasicenko — sledujte pro denní tipy.</p>`)
    },
  };
  return emails[step] || null;
}
