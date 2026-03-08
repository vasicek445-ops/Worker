import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const firstName = name?.split(' ')[0] || 'příteli';

    await resend.emails.send({
      from: 'Václav z Wokeru <vaclav@gowoker.com>',
      to: email,
      subject: '🎉 Vítej ve Wokeru! Tady je tvůj plán',
      html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a12;font-family:Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:24px;">
    <span style="color:#39ff6e;font-size:20px;font-weight:bold;letter-spacing:3px;">WOKER</span>
  </div>
  <div style="background:#111122;border-radius:16px;padding:28px 24px;border:1px solid rgba(255,255,255,0.06);color:#ccccdd;font-size:15px;line-height:1.7;">
    <p style="margin:0 0 16px;">Ahoj ${firstName}! 👋</p>
    <h2 style="color:#f0f0f5;font-size:20px;margin:0 0 16px;">Vítej ve Wokeru</h2>
    <p>Registrace proběhla. Tady je tvůj plán na první týden:</p>

    <div style="margin:20px 0;">
      <div style="display:flex;gap:12px;margin-bottom:14px;">
        <div style="min-width:32px;height:32px;background:rgba(57,255,110,0.1);border-radius:50%;text-align:center;line-height:32px;font-size:14px;">1</div>
        <div>
          <p style="margin:0;color:#f0f0f5;font-weight:bold;">Prohlédni si nabídky</p>
          <p style="margin:4px 0 0;font-size:13px;color:#8888aa;">Máme 1 007+ přímých kontaktů na švýcarské firmy a agentury.</p>
        </div>
      </div>
      <div style="display:flex;gap:12px;margin-bottom:14px;">
        <div style="min-width:32px;height:32px;background:rgba(57,255,110,0.1);border-radius:50%;text-align:center;line-height:32px;font-size:14px;">2</div>
        <div>
          <p style="margin:0;color:#f0f0f5;font-weight:bold;">Připrav si CV</p>
          <p style="margin:4px 0 0;font-size:13px;color:#8888aa;">Použij AI šablonu — za 2 minuty budeš mít CV na švýcarský standard.</p>
        </div>
      </div>
      <div style="display:flex;gap:12px;margin-bottom:14px;">
        <div style="min-width:32px;height:32px;background:rgba(57,255,110,0.1);border-radius:50%;text-align:center;line-height:32px;font-size:14px;">3</div>
        <div>
          <p style="margin:0;color:#f0f0f5;font-weight:bold;">Zeptej se Wokee</p>
          <p style="margin:4px 0 0;font-size:13px;color:#8888aa;">AI asistent ti poradí s čímkoliv — povolení, daně, bydlení, platy.</p>
        </div>
      </div>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="https://www.gowoker.com/dashboard" style="display:inline-block;background:#39ff6e;color:#0a0a12;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;">Otevřít Woker →</a>
    </div>

    <p style="color:#8888aa;font-size:13px;margin-top:20px;">P.S. Během příštích dní ti pošlu pár tipů, které ti pomůžou najít práci rychleji. Žádný spam — jen věci, co fungují.</p>
  </div>
  <div style="text-align:center;margin-top:28px;padding-top:16px;border-top:1px solid #222244;">
    <p style="color:#8888aa;font-size:12px;margin:0;">Václav z Wokeru | <a href="https://www.gowoker.com" style="color:#39ff6e;text-decoration:none;">gowoker.com</a></p>
    <p style="color:#555577;font-size:11px;margin-top:8px;">
      <a href="https://www.gowoker.com/api/unsubscribe?email=${encodeURIComponent(email)}" style="color:#555577;text-decoration:underline;">Odhlásit se</a>
    </p>
  </div>
</div>
</body></html>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
