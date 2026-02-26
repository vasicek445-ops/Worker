"use client";
export default function OchranaUdaju() {
  const sections = [
    { title: "1. Spr\u00E1vce osobn\u00EDch \u00FAdaj\u016F", text: "Spr\u00E1vcem osobn\u00EDch \u00FAdaj\u016F je provozovatel platformy Woker dostupn\u00E9 na gowoker.com. V p\u0159\u00EDpad\u011B dotaz\u016F ohledn\u011B zpracov\u00E1n\u00ED osobn\u00EDch \u00FAdaj\u016F n\u00E1s kontaktujte na podpora@gowoker.com." },
    { title: "2. Jak\u00E9 \u00FAdaje shroma\u017E\u010Fujeme", text: "Shroma\u017E\u010Fujeme n\u00E1sleduj\u00EDc\u00ED kategorie \u00FAdaj\u016F: registra\u010Dn\u00ED \u00FAdaje (e-mail, jm\u00E9no z Google \u00FA\u010Dtu), platebn\u00ED \u00FAdaje (zpracov\u00E1v\u00E1 Stripe, neukl\u00E1d\u00E1me \u010D\u00EDsla karet), \u00FAdaje o pou\u017E\u00EDv\u00E1n\u00ED platformy (nav\u0161t\u00EDven\u00E9 str\u00E1nky, pou\u017Eit\u00E9 funkce), technick\u00E9 \u00FAdaje (IP adresa, typ prohl\u00ED\u017Ee\u010De, opera\u010Dn\u00ED syst\u00E9m) a komunika\u010Dn\u00ED \u00FAdaje (dotazy zaslan\u00E9 p\u0159es AI asistenta nebo e-mail)." },
    { title: "3. \u00DA\u010Del zpracov\u00E1n\u00ED", text: "Osobn\u00ED \u00FAdaje zpracov\u00E1v\u00E1me za \u00FA\u010Delem: poskytov\u00E1n\u00ED slu\u017Eeb platformy Woker, zpracov\u00E1n\u00ED plateb a spr\u00E1vy p\u0159edplatn\u00E9ho, zlep\u0161ov\u00E1n\u00ED kvality slu\u017Eeb a u\u017Eivatelsk\u00E9ho z\u00E1\u017Eitku, zas\u00EDl\u00E1n\u00ED d\u016Fle\u017Eit\u00FDch ozn\u00E1men\u00ED o slu\u017Eb\u011B a komunikace s u\u017Eivateli. Marketingov\u00E9 e-maily zas\u00EDl\u00E1me pouze s v\u00FDslovn\u00FDm souhlasem u\u017Eivatele." },
    { title: "4. Pr\u00E1vn\u00ED z\u00E1klad zpracov\u00E1n\u00ED", text: "\u00DAdaje zpracov\u00E1v\u00E1me na z\u00E1klad\u011B: pln\u011Bn\u00ED smlouvy (poskytov\u00E1n\u00ED slu\u017Eby), opr\u00E1vn\u011Bn\u00E9ho z\u00E1jmu (zlep\u0161ov\u00E1n\u00ED slu\u017Eby, bezpe\u010Dnost), souhlasu (marketingov\u00E1 komunikace) a z\u00E1konn\u00E9 povinnosti (\u00FA\u010Detn\u00ED a da\u0148ov\u00E9 p\u0159edpisy)." },
    { title: "5. Sd\u00EDlen\u00ED \u00FAdaj\u016F s t\u0159et\u00EDmi stranami", text: "Osobn\u00ED \u00FAdaje sd\u00EDl\u00EDme pouze s: Supabase (hostov\u00E1n\u00ED datab\u00E1ze a autentizace), Stripe (zpracov\u00E1n\u00ED plateb), Vercel (hostov\u00E1n\u00ED webov\u00E9 aplikace), Resend (zas\u00EDl\u00E1n\u00ED e-mail\u016F) a Google (autentizace p\u0159es Google OAuth). Tyto slu\u017Eby zpracov\u00E1vaj\u00ED \u00FAdaje v souladu s GDPR. \u00DAdaje neprod\u00E1v\u00E1me ani nesd\u00EDl\u00EDme s reklamn\u00EDmi s\u00EDt\u011Bmi." },
    { title: "6. Doba uchov\u00E1v\u00E1n\u00ED", text: "Osobn\u00ED \u00FAdaje uchov\u00E1v\u00E1me po dobu trv\u00E1n\u00ED u\u017Eivatelsk\u00E9ho \u00FA\u010Dtu. Po zru\u0161en\u00ED \u00FA\u010Dtu jsou \u00FAdaje smaz\u00E1ny do 30 dn\u016F, s v\u00FDjimkou \u00FAdaj\u016F, kter\u00E9 jsme povinni uchov\u00E1vat ze z\u00E1konn\u00FDch d\u016Fvod\u016F (nap\u0159. \u00FA\u010Detn\u00ED doklady po dobu 5 let)." },
    { title: "7. Va\u0161e pr\u00E1va", text: "Jako subjekt \u00FAdaj\u016F m\u00E1te pr\u00E1vo na: p\u0159\u00EDstup k osobn\u00EDm \u00FAdaj\u016Fm, opravu nep\u0159esn\u00FDch \u00FAdaj\u016F, v\u00FDmaz \u00FAdaj\u016F (pr\u00E1vo b\u00FDt zapomenut), omezen\u00ED zpracov\u00E1n\u00ED, p\u0159enositelnost \u00FAdaj\u016F a n\u00E1mitku proti zpracov\u00E1n\u00ED. Pro uplatn\u011Bn\u00ED t\u011Bchto pr\u00E1v n\u00E1s kontaktujte na podpora@gowoker.com. Na va\u0161i \u017E\u00E1dost odpov\u00EDme do 30 dn\u016F." },
    { title: "8. Cookies", text: "Platforma pou\u017E\u00EDv\u00E1 pouze nezbytn\u00E9 technick\u00E9 cookies pro fungov\u00E1n\u00ED p\u0159ihl\u00E1\u0161en\u00ED a jazykov\u00FDch preferenc\u00ED. Nepou\u017E\u00EDv\u00E1me analytick\u00E9 ani reklamn\u00ED cookies." },
    { title: "9. Zabezpe\u010Den\u00ED \u00FAdaj\u016F", text: "Osobn\u00ED \u00FAdaje chr\u00E1n\u00EDme pomoc\u00ED: \u0161ifrovan\u00E9ho p\u0159enosu dat (HTTPS/TLS), zabezpe\u010Den\u00E9 datab\u00E1ze s omezen\u00FDm p\u0159\u00EDstupem, pravideln\u00FDch bezpe\u010Dnostn\u00EDch aktualizac\u00ED a autentizace prost\u0159ednictv\u00EDm ov\u011B\u0159en\u00FDch poskytovatel\u016F (Supabase, Google)." },
    { title: "10. Zm\u011Bny z\u00E1sad ochrany \u00FAdaj\u016F", text: "O zm\u011Bn\u00E1ch v t\u011Bchto z\u00E1sad\u00E1ch budeme informovat prost\u0159ednictv\u00EDm e-mailu nebo ozn\u00E1men\u00ED v platform\u011B." },
    { title: "11. Kontakt", text: "Spr\u00E1vce \u00FAdaj\u016F: Provozovatel platformy Woker. E-mail: podpora@gowoker.com. Pokud se domn\u00EDv\u00E1te, \u017Ee va\u0161e \u00FAdaje zpracov\u00E1v\u00E1me v rozporu s GDPR, m\u00E1te pr\u00E1vo podat st\u00ED\u017Enost u dozorov\u00E9ho \u00FA\u0159adu (\u00DA\u0159ad pro ochranu osobn\u00EDch \u00FAdaj\u016F, uoou.cz)." },
  ];
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a12", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "60px 20px", position: "relative" }}>
      <div style={{ position: "fixed", width: "500px", height: "500px", borderRadius: "50%", filter: "blur(140px)", pointerEvents: "none", zIndex: 0, opacity: 0.15, top: "-200px", left: "-200px", background: "radial-gradient(circle, rgba(57,255,110,0.2), transparent 70%)" }} />
      <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none", display: "inline-block", marginBottom: "32px" }}>{"\u2190 Zp\u011Bt na hlavn\u00ED str\u00E1nku"}</a>
        <h1 style={{ fontSize: "32px", fontWeight: 800, color: "white", marginBottom: "8px" }}>{"Ochrana osobn\u00EDch \u00FAdaj\u016F"}</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", marginBottom: "40px" }}>{"Posledn\u00ED aktualizace: 26. \u00FAnora 2026"}</p>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#39ff6e", marginBottom: "10px" }}>{s.title}</h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>{s.text}</p>
          </div>
        ))}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px", marginTop: "20px" }}>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>{"\u00A9 2026 Woker. V\u0161echna pr\u00E1va vyhrazena."}</p>
        </div>
      </div>
    </main>
  );
}
