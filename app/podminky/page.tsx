"use client";
export default function Podminky() {
  const sections = [
    { title: "1. Uvodni ustanoveni", text: "Tyto obchodni podminky upravuji prava a povinnosti mezi provozovatelem platformy Woker a uzivateli sluzby. Provozovatelem je fyzicka osoba podnikajici na uzemi Ceske republiky. Pouzivanim platformy Woker na adrese gowoker.com uzivatel souhlasi s temito podminkami." },
    { title: "2. Popis sluzby", text: "Woker je online platforma, ktera poskytuje informace a nastroje pro osoby hledajici zamestnani ve Svycarsku. Sluzba zahrnuje databazi kontaktu na personalni agentury, pruvodce pracovnim pravem, pojistenim a danemi, AI asistenta a prehled pracovnich pozic. Woker neni personalni agentura a nezprostredkovava zamestnani." },
    { title: "3. Registrace a uzivatelsky ucet", text: "Pro pristup k placenym funkcim je nutna registrace prostrednictvim e-mailu nebo uctu Google. Uzivatel je povinen uvadet pravdive udaje a chranit sve prihlasovaci udaje. Provozovatel si vyhrazuje pravo zrusit ucet v pripade poruseni podminek." },
    { title: "4. Platebni podminky", text: "Woker nabizi predplatne v cenovych planech: mesicni (9,99 EUR/mesic) a rocni (99,99 EUR/rok). Platby jsou zpracovany prostrednictvim sluzby Stripe. Predplatne se automaticky obnovuje, pokud neni zruseno pred koncem aktualniho obdobi. Zruseni je mozne kdykoliv v nastaveni uctu." },
    { title: "5. Pravo na odstoupeni", text: "V souladu s evropskou legislativou ma uzivatel pravo odstoupit od smlouvy do 14 dnu od zakoupeni predplatneho bez udani duvodu. Zadost o vraceni penez je mozne zaslat na e-mail podpora@gowoker.com. Vraceni bude provedeno stejnym zpusobem platby do 14 pracovnich dnu." },
    { title: "6. Omezeni odpovednosti", text: "Informace na platforme Woker maji informativni charakter a nepredstavuji pravni, danove ani jine odborne poradenstvi. Provozovatel nezarucuje presnost, uplnost ani aktualnost poskytovanych informaci. Provozovatel nenese odpovednost za rozhodnuti ucinena na zaklade informaci z platformy." },
    { title: "7. Dusevni vlastnictvi", text: "Veskery obsah platformy (texty, grafika, databaze, software) je chranen autorskym pravem. Uzivatel nesmi obsah kopirovat, sirit nebo komercne vyuzivat bez pisemneho souhlasu provozovatele." },
    { title: "8. Zmeny podminek", text: "Provozovatel si vyhrazuje pravo tyto podminky kdykoliv zmenit. O zmenach bude uzivatel informovan prostrednictvim e-mailu nebo oznameni v platforme." },
    { title: "9. Kontakt", text: "V pripade dotazu nas kontaktujte na e-mailu podpora@gowoker.com." },
  ];
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a12", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "60px 20px", position: "relative" }}>
      <div style={{ position: "fixed", width: "500px", height: "500px", borderRadius: "50%", filter: "blur(140px)", pointerEvents: "none", zIndex: 0, opacity: 0.15, top: "-200px", right: "-200px", background: "radial-gradient(circle, rgba(57,255,110,0.2), transparent 70%)" }} />
      <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none", display: "inline-block", marginBottom: "32px" }}>← Zpet na hlavni stranku</a>
        <h1 style={{ fontSize: "32px", fontWeight: 800, color: "white", marginBottom: "8px" }}>Obchodni podminky</h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", marginBottom: "40px" }}>Posledni aktualizace: 26. unora 2026</p>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#39ff6e", marginBottom: "10px" }}>{s.title}</h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>{s.text}</p>
          </div>
        ))}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px", marginTop: "20px" }}>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>© 2026 Woker. Vsechna prava vyhrazena.</p>
        </div>
      </div>
    </main>
  );
}
