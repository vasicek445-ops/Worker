"use client";
export default function Podminky() {
  return (
    <>
      <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');`}</style>
      <main style={{ minHeight: "100vh", background: "#0a0a12", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "60px 20px", position: "relative" }}>
        <div style={{ position: "fixed", width: "500px", height: "500px", borderRadius: "50%", filter: "blur(140px)", pointerEvents: "none", zIndex: 0, opacity: 0.15, top: "-200px", right: "-200px", background: "radial-gradient(circle, rgba(57,255,110,0.2), transparent 70%)" }} />
        <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none", display: "inline-block", marginBottom: "32px" }}>← Zpět na hlavní stránku</a>
          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "white", marginBottom: "8px" }}>Obchodní podmínky</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", marginBottom: "40px" }}>Poslední aktualizace: 26. února 2026</p>

          {[
            { title: "1. Úvodní ustanovení", text: "Tyto obchodní podmínky (dále jen „Podmínky") upravují práva a povinnosti mezi provozovatelem platformy Woker (dále jen „Provozovatel") a uživateli služby (dále jen „Uživatel"). Provozovatelem je fyzická osoba podnikající na území České republiky. Používáním platformy Woker na adrese gowoker.com Uživatel souhlasí s těmito Podmínkami." },
            { title: "2. Popis služby", text: "Woker je online platforma, která poskytuje informace a nástroje pro osoby hledající zaměstnání ve Švýcarsku. Služba zahrnuje: databázi kontaktů na personální agentury ve Švýcarsku, průvodce pracovním právem, pojištěním a daněmi, AI asistenta pro zodpovězení dotazů, a přehled pracovních pozic. Woker není personální agentura a nezprostředkovává zaměstnání." },
            { title: "3. Registrace a uživatelský účet", text: "Pro přístup k placeným funkcím je nutná registrace prostřednictvím e-mailu nebo účtu Google. Uživatel je povinen uvádět pravdivé údaje a chránit své přihlašovací údaje. Provozovatel si vyhrazuje právo zrušit účet v případě porušení Podmínek." },
            { title: "4. Platební podmínky", text: "Woker nabízí předplatné v cenových plánech: měsíční (9,99 €/měsíc) a roční (99,99 €/rok). Platby jsou zpracovány prostřednictvím služby Stripe. Předplatné se automaticky obnovuje, pokud není zrušeno před koncem aktuálního období. Zrušení je možné kdykoliv v nastavení účtu." },
            { title: "5. Právo na odstoupení", text: "V souladu s evropskou legislativou má Uživatel právo odstoupit od smlouvy do 14 dnů od zakoupení předplatného bez udání důvodu. Žádost o vrácení peněz je možné zaslat na e-mail podpora@gowoker.com. Vrácení bude provedeno stejným způsobem platby do 14 pracovních dnů." },
            { title: "6. Omezení odpovědnosti", text: "Informace na platformě Woker mají informativní charakter a nepředstavují právní, daňové ani jiné odborné poradenství. Provozovatel nezaručuje přesnost, úplnost ani aktuálnost poskytovaných informací. Provozovatel nenese odpovědnost za rozhodnutí učiněná na základě informací z platformy." },
            { title: "7. Duševní vlastnictví", text: "Veškerý obsah platformy (texty, grafika, databáze, software) je chráněn autorským právem. Uživatel nesmí obsah kopírovat, šířit nebo komerčně využívat bez písemného souhlasu Provozovatele." },
            { title: "8. Změny podmínek", text: "Provozovatel si vyhrazuje právo tyto Podmínky kdykoliv změnit. O změnách bude Uživatel informován prostřednictvím e-mailu nebo oznámení v platformě. Pokračování v užívání služby po změně Podmínek znamená souhlas s novým zněním." },
            { title: "9. Kontakt", text: "V případě dotazů nás kontaktujte na e-mailu podpora@gowoker.com." },
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
