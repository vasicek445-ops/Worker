"use client";
export default function OchranaUdaju() {
  const sections = [
    { title: "1. Spravce osobnich udaju", text: "Spravcem osobnich udaju je provozovatel platformy Woker dostupne na gowoker.com. V pripade dotazu ohledne zpracovani osobnich udaju nas kontaktujte na podpora@gowoker.com." },
    { title: "2. Jake udaje shromazdujeme", text: "Shromazdujeme nasledujici kategorie udaju: registracni udaje (e-mail, jmeno z Google uctu), platebni udaje (zpracovava Stripe, neukladame cisla karet), udaje o pouzivani platformy (navstivene stranky, pouzite funkce), technicke udaje (IP adresa, typ prohlizece, operacni system) a komunikacni udaje (dotazy zaslane pres AI asistenta nebo e-mail)." },
    { title: "3. Ucel zpracovani", text: "Osobni udaje zpracovavame za ucelem: poskytovani sluzeb platformy Woker, zpracovani plateb a spravy predplatneho, zlepsovani kvality sluzeb a uzivatelskeho zazitku, zasilani dulezitych oznameni o sluzbe a komunikace s uzivateli. Marketingove e-maily zasilame pouze s vyslovnym souhlasem uzivatele." },
    { title: "4. Pravni zaklad zpracovani", text: "Udaje zpracovavame na zaklade: plneni smlouvy (poskytovani sluzby), opravneneho zajmu (zlepsovani sluzby, bezpecnost), souhlasu (marketingova komunikace) a zakonne povinnosti (ucetni a danove predpisy)." },
    { title: "5. Sdileni udaju s tretimi stranami", text: "Osobni udaje sdilime pouze s: Supabase (hostovani databaze a autentizace), Stripe (zpracovani plateb), Vercel (hostovani webove aplikace), Resend (zasilani e-mailu) a Google (autentizace pres Google OAuth). Tyto sluzby zpracovavaji udaje v souladu s GDPR. Udaje neprodavame ani nesdilime s reklamnimi sitemi." },
    { title: "6. Doba uchovavani", text: "Osobni udaje uchovavame po dobu trvani uzivatelskeho uctu. Po zruseni uctu jsou udaje smazany do 30 dnu, s vyjimkou udaju, ktere jsme povinni uchovavat ze zakonnych duvodu (napr. ucetni doklady po dobu 5 let)." },
    { title: "7. Vase prava", text: "Jako subjekt udaju mate pravo na: pristup k osobnim udajum, opravu nepresnych udaju, vymaz udaju (pravo byt zapomenut), omezeni zpracovani, prenositelnost udaju a namitku proti zpracovani. Pro uplatneni techto prav nas kontaktujte na podpora@gowoker.com. Na vasi zadost odpovime do 30 dnu." },
    { title: "8. Cookies", text: "Platforma pouziva pouze nezbytne technicke cookies pro fungovani prihlaseni a jazykovych preferenci. Nepouzivame analyticke ani reklamni cookies." },
    { title: "9. Zabezpeceni udaju", text: "Osobni udaje chranime pomoci: sifrovaneho prenosu dat (HTTPS/TLS), zabezpecene databaze s omezenym pristupem, pravidelnych bezpecnostnich aktualizaci a autentizace prostrednictvim overenych poskytovatelu (Supabase, Google)." },
    { title: "10. Zmeny zasad ochrany udaju", text: "O zmenach v techto zasadach budeme informovat prostrednictvim e-mailu nebo oznameni v platforme." },
    { title: "11. Kontakt", text: "Spravce udaju: Provozovatel platformy Woker. E-mail: podpora@gowoker.com. Pokud se domnivate, ze vase udaje zpracovavame v rozporu s GDPR, mate pravo podat stiznost u dozoroveho uradu (Urad pro ochranu osobnich udaju, uoou.cz)." },
  ];
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a12", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "60px 20px", position: "relative" }}>
      <div style={{ position: "fixed", width: "500px", height: "500px", borderRadius: "50%", filter: "blur(140px)", pointerEvents: "none", zIndex: 0, opacity: 0.15, top: "-200px", left: "-200px", background: "radial-gradient(circle, rgba(57,255,110,0.2), transparent 70%)" }} />
      <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none", display: "inline-block", marginBottom: "32px" }}>← Zpet na hlavni stranku</a>
        <h1 style={{ fontSize: "32px", fontWeight: 800, color: "white", marginBottom: "8px" }}>Ochrana osobnich udaju</h1>
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
