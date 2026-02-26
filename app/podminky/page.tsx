"use client";
export default function Podminky() {
  const sections = [
    { title: "1. \u00DAvodn\u00ED ustanoven\u00ED", text: "Tyto obchodn\u00ED podm\u00EDnky upravuj\u00ED pr\u00E1va a povinnosti mezi provozovatelem platformy Woker a u\u017Eivateli slu\u017Eby. Provozovatelem je fyzick\u00E1 osoba podnikaj\u00EDc\u00ED na \u00FAzem\u00ED \u010Cesk\u00E9 republiky. Pou\u017E\u00EDv\u00E1n\u00EDm platformy Woker na adrese gowoker.com u\u017Eivatel souhlas\u00ED s t\u011Bmito podm\u00EDnkami." },
    { title: "2. Popis slu\u017Eby", text: "Woker je online platforma, kter\u00E1 poskytuje informace a n\u00E1stroje pro osoby hledaj\u00EDc\u00ED zam\u011Bstn\u00E1n\u00ED ve \u0160v\u00FDcarsku. Slu\u017Eba zahrnuje datab\u00E1zi kontakt\u016F na person\u00E1ln\u00ED agentury, pr\u016Fvodce pracovn\u00EDm pr\u00E1vem, poji\u0161t\u011Bn\u00EDm a dan\u011Bmi, AI asistenta a p\u0159ehled pracovn\u00EDch pozic. Woker nen\u00ED person\u00E1ln\u00ED agentura a nezprost\u0159edkov\u00E1v\u00E1 zam\u011Bstn\u00E1n\u00ED." },
    { title: "3. Registrace a u\u017Eivatelsk\u00FD \u00FA\u010Det", text: "Pro p\u0159\u00EDstup k placen\u00FDm funkc\u00EDm je nutn\u00E1 registrace prost\u0159ednictv\u00EDm e-mailu nebo \u00FA\u010Dtu Google. U\u017Eivatel je povinen uv\u00E1d\u011Bt pravdiv\u00E9 \u00FAdaje a chr\u00E1nit sv\u00E9 p\u0159ihla\u0161ovac\u00ED \u00FAdaje. Provozovatel si vyhrazuje pr\u00E1vo zru\u0161it \u00FA\u010Det v p\u0159\u00EDpad\u011B poru\u0161en\u00ED podm\u00EDnek." },
    { title: "4. Platebn\u00ED podm\u00EDnky", text: "Woker nab\u00EDz\u00ED p\u0159edplatn\u00E9 v cenov\u00FDch pl\u00E1nech: m\u011Bs\u00ED\u010Dn\u00ED (9,99 EUR/m\u011Bs\u00EDc) a ro\u010Dn\u00ED (99,99 EUR/rok). Platby jsou zpracov\u00E1ny prost\u0159ednictv\u00EDm slu\u017Eby Stripe. P\u0159edplatn\u00E9 se automaticky obnovuje, pokud nen\u00ED zru\u0161eno p\u0159ed koncem aktu\u00E1ln\u00EDho obdob\u00ED. Zru\u0161en\u00ED je mo\u017En\u00E9 kdykoliv v nastaven\u00ED \u00FA\u010Dtu." },
    { title: "5. Pr\u00E1vo na odstoupen\u00ED", text: "V souladu s evropskou legislativou m\u00E1 u\u017Eivatel pr\u00E1vo odstoupit od smlouvy do 14 dn\u016F od zakoupen\u00ED p\u0159edplatn\u00E9ho bez ud\u00E1n\u00ED d\u016Fvodu. \u017D\u00E1dost o vr\u00E1cen\u00ED pen\u011Bz je mo\u017En\u00E9 zaslat na e-mail podpora@gowoker.com. Vr\u00E1cen\u00ED bude provedeno stejn\u00FDm zp\u016Fsobem platby do 14 pracovn\u00EDch dn\u016F." },
    { title: "6. Omezen\u00ED odpov\u011Bdnosti", text: "Informace na platform\u011B Woker maj\u00ED informativn\u00ED charakter a nep\u0159edstavuj\u00ED pr\u00E1vn\u00ED, da\u0148ov\u00E9 ani jin\u00E9 odborn\u00E9 poradenstv\u00ED. Provozovatel nezaru\u010Duje p\u0159esnost, \u00FAplnost ani aktu\u00E1lnost poskytovan\u00FDch informac\u00ED." },
    { title: "7. Du\u0161evn\u00ED vlastnictv\u00ED", text: "Ve\u0161ker\u00FD obsah platformy (texty, grafika, datab\u00E1ze, software) je chr\u00E1n\u011Bn autorsk\u00FDm pr\u00E1vem. U\u017Eivatel nesm\u00ED obsah kop\u00EDrovat, \u0161\u00ED\u0159it nebo komer\u010Dn\u011B vyu\u017E\u00EDvat bez p\u00EDsemn\u00E9ho souhlasu provozovatele." },
    { title: "8. Zm\u011Bny podm\u00EDnek", text: "Provozovatel si vyhrazuje pr\u00E1vo tyto podm\u00EDnky kdykoliv zm\u011Bnit. O zm\u011Bn\u00E1ch bude u\u017Eivatel informov\u00E1n prost\u0159ednictv\u00EDm e-mailu nebo ozn\u00E1men\u00ED v platform\u011B." },
    { title: "9. Kontakt", text: "V p\u0159\u00EDpad\u011B dotaz\u016F n\u00E1s kontaktujte na e-mailu podpora@gowoker.com." },
  ];
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a12", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "60px 20px", position: "relative" }}>
      <div style={{ position: "fixed", width: "500px", height: "500px", borderRadius: "50%", filter: "blur(140px)", pointerEvents: "none", zIndex: 0, opacity: 0.15, top: "-200px", right: "-200px", background: "radial-gradient(circle, rgba(57,255,110,0.2), transparent 70%)" }} />
      <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none", display: "inline-block", marginBottom: "32px" }}>{"\u2190 Zp\u011Bt na hlavn\u00ED str\u00E1nku"}</a>
        <h1 style={{ fontSize: "32px", fontWeight: 800, color: "white", marginBottom: "8px" }}>{"Obchodn\u00ED podm\u00EDnky"}</h1>
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
