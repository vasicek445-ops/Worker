"use client";
export default function OchranaUdaju() {
  return (
    <>
      <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');`}</style>
      <main style={{ minHeight: "100vh", background: "#0a0a12", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "60px 20px", position: "relative" }}>
        <div style={{ position: "fixed", width: "500px", height: "500px", borderRadius: "50%", filter: "blur(140px)", pointerEvents: "none", zIndex: 0, opacity: 0.15, top: "-200px", left: "-200px", background: "radial-gradient(circle, rgba(57,255,110,0.2), transparent 70%)" }} />
        <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none", display: "inline-block", marginBottom: "32px" }}>← Zpět na hlavní stránku</a>
          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "white", marginBottom: "8px" }}>Ochrana osobních údajů</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", marginBottom: "40px" }}>Poslední aktualizace: 26. února 2026</p>

          {[
            { title: "1. Správce osobních údajů", text: "Správcem osobních údajů je provozovatel platformy Woker dostupné na gowoker.com. V případě dotazů ohledně zpracování osobních údajů nás kontaktujte na podpora@gowoker.com." },
            { title: "2. Jaké údaje shromažďujeme", text: "Shromažďujeme následující kategorie údajů: registrační údaje (e-mail, jméno z Google účtu), platební údaje (zpracovává Stripe — neukládáme čísla karet), údaje o používání platformy (navštívené stránky, použité funkce), technické údaje (IP adresa, typ prohlížeče, operační systém), a komunikační údaje (dotazy zaslané přes AI asistenta nebo e-mail)." },
            { title: "3. Účel zpracování", text: "Osobní údaje zpracováváme za účelem: poskytování služeb platformy Woker, zpracování plateb a správy předplatného, zlepšování kvality služeb a uživatelského zážitku, zasílání důležitých oznámení o službě, a komunikace s uživateli (podpora, odpovědi na dotazy). Marketingové e-maily zasíláme pouze s výslovným souhlasem uživatele." },
            { title: "4. Právní základ zpracování", text: "Údaje zpracováváme na základě: plnění smlouvy (poskytování služby), oprávněného zájmu (zlepšování služby, bezpečnost), souhlasu (marketingová komunikace), a zákonné povinnosti (účetní a daňové předpisy)." },
            { title: "5. Sdílení údajů s třetími stranami", text: "Osobní údaje sdílíme pouze s: Supabase (hostování databáze a autentizace), Stripe (zpracování plateb), Vercel (hostování webové aplikace), Resend (zasílání e-mailů), a Google (autentizace přes Google OAuth). Tyto služby zpracovávají údaje v souladu s GDPR. Údaje neprodáváme ani nesdílíme s reklamními sítěmi." },
            { title: "6. Doba uchovávání", text: "Osobní údaje uchováváme po dobu trvání uživatelského účtu. Po zrušení účtu jsou údaje smazány do 30 dnů, s výjimkou údajů, které jsme povinni uchovávat ze zákonných důvodů (např. účetní doklady — 5 let)." },
            { title: "7. Vaše práva", text: "Jako subjekt údajů máte právo na: přístup k osobním údajům, opravu nepřesných údajů, výmaz údajů (právo být zapomenut), omezení zpracování, přenositelnost údajů, a námitku proti zpracování. Pro uplatnění těchto práv nás kontaktujte na podpora@gowoker.com. Na vaši žádost odpovíme do 30 dnů." },
            { title: "8. Cookies", text: "Platforma používá pouze nezbytné technické cookies pro fungování přihlášení a jazykových preferencí. Nepoužíváme analytické ani reklamní cookies. Souhlas s cookies není vyžadován, protože používáme pouze nezbytné cookies." },
            { title: "9. Zabezpečení údajů", text: "Osobní údaje chráníme pomocí: šifrovaného přenosu dat (HTTPS/TLS), zabezpečené databáze s omezeným přístupem, pravidelných bezpečnostních aktualizací, a autentizace prostřednictvím ověřených poskytovatelů (Supabase, Google)." },
            { title: "10. Změny zásad ochrany údajů", text: "O změnách v těchto zásadách budeme informovat prostřednictvím e-mailu nebo oznámení v platformě. Doporučujeme pravidelně kontrolovat tuto stránku." },
            { title: "11. Kontakt", text: "Správce údajů: Provozovatel platformy Woker. E-mail: podpora@gowoker.com. Pokud se domníváte, že vaše údaje zpracováváme v rozporu s GDPR, máte právo podat stížnost u dozorového úřadu (Úřad pro ochranu osobních údajů — uoou.cz)." },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: "32px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#39ff6e", marginBottom: "10px" }}>{s.title}</h2>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>{s.text}</p>
            </div>
          ))}

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px", marginTop: "20px" }}>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>© 2026 Woker. Všechna práva vyhrazena.</p>
          </div>
        </div>
      </main>
    </>
  );
}
