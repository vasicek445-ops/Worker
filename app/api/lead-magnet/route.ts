import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

// ID tvé audience v Resend (vytvoř v Resend dashboardu pod "Audience")
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || "";

// URL tvého průvodce PDF
const GUIDE_PDF_URL = process.env.GUIDE_PDF_URL || "https://gowoker.com/pruvodce.pdf";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Zadejte platný e-mail" },
        { status: 400 }
      );
    }

    // 1. Přidej kontakt do Resend Audience (pro budoucí broadcast emaily)
    if (AUDIENCE_ID) {
      try {
        await resend.contacts.create({
          email,
          audienceId: AUDIENCE_ID,
          unsubscribed: false,
        });
      } catch (err) {
        // Kontakt možná už existuje — pokračuj dál
        console.log("Contact already exists or audience error:", err);
      }
    }

    // 2. Pošli welcome email s průvodcem
    const { data, error } = await resend.emails.send({
      from: "Václav z Wokeru <vaclav@gowoker.com>",
      to: email,
      subject: "🇨🇭 Váš průvodce: 5 kroků k práci ve Švýcarsku",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a2e; color: #fff; border-radius: 12px; overflow: hidden;">
          
          <div style="text-align: center; padding: 32px 24px 16px;">
            <div style="font-size: 28px; font-weight: 800; color: #4ade80; letter-spacing: 3px;">WOKER</div>
          </div>
          
          <div style="background-color: #222240; margin: 0 24px; border-radius: 12px; padding: 32px 24px;">
            <h1 style="color: #fff; font-size: 22px; margin: 0 0 8px;">Ahoj! 👋</h1>
            <p style="color: #ccc; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
              Díky, že jste si stáhl/a průvodce. Tady je váš odkaz ke stažení:
            </p>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="${GUIDE_PDF_URL}" 
                 style="display: inline-block; background-color: #4ade80; color: #0a0a0a; font-weight: 700; font-size: 16px; padding: 14px 32px; border-radius: 10px; text-decoration: none;">
                🇨🇭 Stáhnout průvodce (PDF)
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; line-height: 1.6;">
              <strong style="color: #ccc;">Co v průvodci najdete:</strong><br/>
              • Typy pracovních povolení a jak je získat<br/>
              • 5 nejlepších zdrojů pro hledání práce<br/>
              • Reálné platy podle oborů<br/>
              • Tipy na bydlení a život ve Švýcarsku<br/>
              • Nejčastější chyby, kterým se vyhnout
            </p>
          </div>
          
          <div style="padding: 24px; text-align: center;">
            <p style="color: #666; font-size: 13px; margin: 0;">
              Během příštích dní vám pošlu další tipy.<br/>
              Pokud nechcete dostávat e-maily, stačí odpovědět "odhlásit".
            </p>
          </div>
          
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Nepodařilo se odeslat e-mail" },
        { status: 500 }
      );
    }

    // 3. (Volitelné) Naplánuj follow-up emaily
    // Tohle můžeš řešit přes Resend Broadcasts nebo cron job
    // Příklad s delay:
    // await scheduleFollowUpEmails(email);

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Interní chyba serveru" },
      { status: 500 }
    );
  }
}
