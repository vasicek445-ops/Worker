import Link from "next/link";

const INSURANCE_COMPANIES = [
  { name: "Assura-Basis SA", city: "Pully", phone: "021 721 44 11", email: "assura@assura.ch", web: "assura.ch", highlight: true, note: "Často nejlevnější" },
  { name: "SWICA", city: "Winterthur", phone: "052 244 22 33", email: "swica@swica.ch", web: "swica.ch", highlight: false, note: "" },
  { name: "Helsana", city: "Zürich", phone: "043 340 11 11", email: "", web: "helsana.ch", highlight: true, note: "Benefit/Qualimed modely" },
  { name: "Groupe Mutuel", city: "Martigny", phone: "0848 803 111", email: "info@groupemutuel.ch", web: "groupemutuel.ch", highlight: true, note: "PrimaFlex / OptiMed" },
  { name: "Sanitas", city: "Zürich", phone: "044 298 63 00", email: "info@sanitas.com", web: "sanitas.com", highlight: true, note: "Basic/HMO modely" },
  { name: "KPT/CPT", city: "Bern", phone: "058 310 91 11", email: "kpt@kpt.ch", web: "kpt.ch", highlight: true, note: "Eco/HMO model" },
  { name: "Visana", city: "Bern", phone: "031 357 91 11", email: "info@visana.ch", web: "visana.ch", highlight: true, note: "V některých kantonech levná" },
  { name: "CSS", city: "Luzern", phone: "058 277 11 11", email: "css.info@css.ch", web: "css.ch", highlight: false, note: "" },
  { name: "Concordia", city: "Luzern", phone: "041 228 01 11", email: "info@concordia.ch", web: "concordia.ch", highlight: false, note: "" },
  { name: "Atupri", city: "Bern", phone: "031 555 09 11", email: "info@atupri.ch", web: "atupri.ch", highlight: false, note: "" },
  { name: "ÖKK", city: "Landquart", phone: "058 456 10 10", email: "info@oekk.ch", web: "oekk.ch", highlight: false, note: "" },
  { name: "Sympany (Vivao)", city: "Basel", phone: "058 262 42 00", email: "basel.vivao@sympany.ch", web: "sympany.ch", highlight: false, note: "" },
  { name: "EGK", city: "Laufen", phone: "061 765 51 11", email: "info@egk.ch", web: "egk.ch", highlight: false, note: "" },
  { name: "Agrisano", city: "Brugg", phone: "056 461 71 11", email: "info@agrisano.ch", web: "agrisano.ch", highlight: false, note: "" },
  { name: "Aquilana", city: "Baden", phone: "056 203 44 44", email: "info@aquilana.ch", web: "aquilana.ch", highlight: false, note: "" },
];

const CARE_MODELS = [
  { name: "Standard", price: "Nejdražší", desc: "Můžeš jít ke každému doktorovi", icon: "🏥", recommended: false },
  { name: "Hausarzt", price: "Střední", desc: "Máš jednoho hlavního doktora", icon: "👨‍⚕️", recommended: false },
  { name: "Telmed", price: "Levný", desc: "Nejdřív zavoláš na lékařskou linku", icon: "📞", recommended: true },
  { name: "HMO", price: "Nejlevnější", desc: "Chodíš přes vybrané HMO centrum", icon: "🏢", recommended: true },
];

export default function PojisteniPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] pb-24">
      <div className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(239,68,68,0.06)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* Header */}
      <div className="relative z-10 px-5 pt-6 pb-4">
        <Link href="/dashboard" className="text-gray-500 text-sm hover:text-gray-400 transition-colors mb-4 inline-block">← Zpět</Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center text-2xl">🏥</div>
          <div>
            <span className="text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wider text-red-400 bg-red-500/10">Důležité</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-3">Zdravotní pojištění ve Švýcarsku</h1>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">Jak nastavit nejlevnější pojištění a ušetřit stovky franků měsíčně.</p>
      </div>

      <div className="px-5 mt-4 relative z-10">

        {/* Critical warning */}
        <div className="bg-red-500/[0.06] rounded-2xl p-5 border border-red-500/[0.12] mb-6">
          <h2 className="text-base font-bold text-white mb-3">❗ Důležité vědět</h2>
          <div className="flex flex-col gap-2.5">
            {[
              "Zdravotní pojištění si platí každý sám – z vlastní kapsy",
              "Neplatí to za tebe zaměstnavatel",
              "Není to automaticky strhávané z výplaty",
              "Musíš si sám vybrat pojišťovnu do 3 měsíců od příjezdu",
              "Pokud to neuděláš včas, kanton ti pojišťovnu přiřadí – a často drahou!",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-red-400 mt-0.5 flex-shrink-0">⚠️</span>
                <span className="text-[13px] text-gray-300 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price highlight */}
        <div className="bg-green-500/[0.06] rounded-2xl p-5 border border-green-500/[0.12] mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white">💸 Kolik to stojí?</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-green-500/[0.08] rounded-xl p-3.5 border border-green-500/[0.1] text-center">
              <p className="text-[10px] text-green-400/70 uppercase tracking-wider font-semibold mb-1">Nejlevnější</p>
              <p className="text-green-400 font-bold text-2xl font-mono">180</p>
              <p className="text-[11px] text-gray-400">CHF/měsíc</p>
            </div>
            <div className="bg-red-500/[0.08] rounded-xl p-3.5 border border-red-500/[0.1] text-center">
              <p className="text-[10px] text-red-400/70 uppercase tracking-wider font-semibold mb-1">Bez strategie</p>
              <p className="text-red-400 font-bold text-2xl font-mono">350+</p>
              <p className="text-[11px] text-gray-400">CHF/měsíc</p>
            </div>
          </div>
          <div className="bg-yellow-500/[0.06] rounded-xl px-3 py-2 border border-yellow-500/[0.08]">
            <p className="text-[11px] text-yellow-400 font-medium text-center">
              💡 Rozdíl: <span className="font-bold">až 2 040 CHF ročně</span> jen správným nastavením!
            </p>
          </div>
        </div>

        {/* 3 Steps */}
        <h2 className="text-lg font-bold text-white mb-4">🎯 3 kroky k nejlevnějšímu pojištění</h2>

        {/* Step 1 - Franchise */}
        <div className="bg-blue-500/[0.06] rounded-2xl p-5 border border-blue-500/[0.12] mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400">1</div>
            <h3 className="text-sm font-bold text-white">Franchise – nastav na maximum 2 500 CHF</h3>
          </div>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-3">
            Franchise je částka, kterou si každý rok zaplatíš sám, než začne platit pojišťovna. <span className="text-blue-300 font-medium">Čím vyšší franchise, tím méně platíš měsíčně.</span>
          </p>
          <div className="bg-white/[0.04] rounded-xl overflow-hidden">
            {[
              { franchise: "300 CHF", monthly: "~350+ CHF", color: "text-red-400" },
              { franchise: "500 CHF", monthly: "~320 CHF", color: "text-orange-400" },
              { franchise: "1 000 CHF", monthly: "~280 CHF", color: "text-yellow-400" },
              { franchise: "1 500 CHF", monthly: "~250 CHF", color: "text-yellow-300" },
              { franchise: "2 000 CHF", monthly: "~220 CHF", color: "text-green-300" },
              { franchise: "2 500 CHF", monthly: "~180 CHF", color: "text-green-400" },
            ].map((f, i, arr) => (
              <div key={i} className={`px-4 py-2.5 flex items-center justify-between ${i < arr.length - 1 ? "border-b border-white/[0.04]" : ""} ${i === arr.length - 1 ? "bg-green-500/[0.06]" : ""}`}>
                <span className="text-[13px] text-gray-300 font-medium">{f.franchise}</span>
                <span className={`text-[13px] font-bold font-mono ${f.color}`}>{f.monthly}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-green-500/[0.06] rounded-lg px-3 py-2 border border-green-500/[0.08]">
            <p className="text-[12px] text-green-400 font-medium">✅ Doporučení: Zvol 2 500 CHF – pokud jsi zdravý/á a nechodíš často k doktorům, je to nejvýhodnější.</p>
          </div>
        </div>

        {/* Step 2 - Care model */}
        <div className="bg-purple-500/[0.06] rounded-2xl p-5 border border-purple-500/[0.12] mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-400">2</div>
            <h3 className="text-sm font-bold text-white">Model péče – vyber Telmed nebo HMO</h3>
          </div>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-4">
            Můžeš ušetřit <span className="text-purple-300 font-medium">až 25 % měsíčně</span> výběrem správného modelu.
          </p>
          <div className="flex flex-col gap-2">
            {CARE_MODELS.map((m, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${m.recommended ? "bg-green-500/[0.06] border-green-500/[0.12]" : "bg-white/[0.03] border-white/[0.06]"}`}>
                <span className="text-xl">{m.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{m.name}</p>
                    {m.recommended && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 uppercase">Doporučeno</span>}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{m.desc}</p>
                </div>
                <span className={`text-[11px] font-bold ${m.recommended ? "text-green-400" : m.price === "Nejdražší" ? "text-red-400" : "text-gray-400"}`}>{m.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3 - No extras */}
        <div className="bg-yellow-500/[0.06] rounded-2xl p-5 border border-yellow-500/[0.12] mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-yellow-500/20 flex items-center justify-center text-sm font-bold text-yellow-400">3</div>
            <h3 className="text-sm font-bold text-white">Žádné doplňkové balíčky – zatím</h3>
          </div>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-3">
            Pojišťovny ti nabídnou doplňky, které <span className="text-yellow-300 font-medium">výrazně zvyšují pojistné</span>:
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              { icon: "🛏️", name: "Hospita", desc: "lepší pokoj" },
              { icon: "🦷", name: "Denta", desc: "zuby" },
              { icon: "👓", name: "Brýle", desc: "optika" },
              { icon: "💆", name: "Alternativní", desc: "léčba" },
            ].map((d, i) => (
              <div key={i} className="bg-white/[0.04] rounded-lg px-3 py-2 border border-white/[0.06]">
                <span className="text-sm">{d.icon}</span>
                <span className="text-[11px] text-gray-400 ml-1.5">{d.name}</span>
              </div>
            ))}
          </div>
          <div className="bg-green-500/[0.06] rounded-lg px-3 py-2 border border-green-500/[0.08]">
            <p className="text-[12px] text-green-400 font-medium">✅ Začni jen se základním LAMal pojištěním. Doplňky můžeš přidat kdykoli později.</p>
          </div>
        </div>

        {/* Real example */}
        <div className="bg-gradient-to-br from-green-500/[0.08] to-blue-500/[0.04] rounded-2xl p-5 border border-green-500/[0.12] mb-8">
          <h2 className="text-base font-bold text-white mb-3">💰 Příklad z praxe</h2>
          <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06] mb-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between"><span className="text-[12px] text-gray-400">Pojišťovna:</span><span className="text-[12px] text-white font-medium">Assura Basic Telmed</span></div>
              <div className="flex justify-between"><span className="text-[12px] text-gray-400">Kanton:</span><span className="text-[12px] text-white font-medium">Appenzell Innerrhoden</span></div>
              <div className="flex justify-between"><span className="text-[12px] text-gray-400">Věk:</span><span className="text-[12px] text-white font-medium">25 let</span></div>
              <div className="flex justify-between"><span className="text-[12px] text-gray-400">Franchise:</span><span className="text-[12px] text-white font-medium">2 500 CHF</span></div>
              <div className="flex justify-between"><span className="text-[12px] text-gray-400">Model:</span><span className="text-[12px] text-white font-medium">Telmed</span></div>
              <div className="flex justify-between"><span className="text-[12px] text-gray-400">Doplňky:</span><span className="text-[12px] text-white font-medium">Žádné</span></div>
              <div className="border-t border-white/[0.06] mt-1.5 pt-2 flex justify-between">
                <span className="text-sm text-gray-300 font-semibold">Měsíční pojistné:</span>
                <span className="text-lg text-green-400 font-bold font-mono">178 CHF</span>
              </div>
            </div>
          </div>
          <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between"><span className="text-[12px] text-gray-400">Pojišťovna:</span><span className="text-[12px] text-white font-medium">SWICA Telmed</span></div>
              <div className="flex justify-between"><span className="text-[12px] text-gray-400">Kanton:</span><span className="text-[12px] text-white font-medium">Aargau</span></div>
              <div className="flex justify-between"><span className="text-[12px] text-gray-400">Věk:</span><span className="text-[12px] text-white font-medium">25 let</span></div>
              <div className="flex justify-between"><span className="text-[12px] text-gray-400">Franchise:</span><span className="text-[12px] text-white font-medium">2 500 CHF</span></div>
              <div className="border-t border-white/[0.06] mt-1.5 pt-2 flex justify-between">
                <span className="text-sm text-gray-300 font-semibold">Měsíční pojistné:</span>
                <span className="text-lg text-yellow-400 font-bold font-mono">215 CHF</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary box */}
        <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06] mb-8">
          <h2 className="text-base font-bold text-white mb-4">📦 Shrnutí – nejlevnější pojištění</h2>
          <div className="flex flex-col gap-2.5">
            {[
              { label: "Franchise", value: "2 500 CHF (maximum)", icon: "✅" },
              { label: "Model", value: "Telmed nebo HMO", icon: "✅" },
              { label: "Doplňky", value: "Žádné (jen LAMal základ)", icon: "✅" },
              { label: "Cena", value: "180–250 CHF/měsíc", icon: "💰" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-4 py-3 border border-white/[0.04]">
                <span className="text-base">{item.icon}</span>
                <div className="flex-1">
                  <span className="text-[11px] text-gray-500">{item.label}</span>
                  <p className="text-sm font-medium text-white">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warning about cheap insurers */}
        <div className="bg-yellow-500/[0.06] rounded-2xl p-5 border border-yellow-500/[0.12] mb-8">
          <h2 className="text-base font-bold text-white mb-3">⚠️ Na co si dát pozor</h2>
          <div className="flex flex-col gap-2.5">
            {[
              "Assura má často delší dobu schválení a složitější komunikaci",
              "U nejlevnějších pojišťoven se o vše staráš online – bez osobního poradce",
              "U Telmed modelu musíš zavolat na linku dřív, než půjdeš k lékaři",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-yellow-400 mt-0.5 flex-shrink-0 text-sm">⚡</span>
                <span className="text-[13px] text-gray-300 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Insurance contacts */}
        <h2 className="text-lg font-bold text-white mb-1">🏥 Kontakty na pojišťovny</h2>
        <p className="text-xs text-gray-500 mb-4">Nejlevnější pojišťovny jsou zvýrazněné</p>

        <div className="flex flex-col gap-2.5 mb-8">
          {INSURANCE_COMPANIES.map((company, i) => (
            <div key={i} className={`rounded-2xl p-4 border overflow-hidden transition-colors ${company.highlight ? "bg-green-500/[0.04] border-green-500/[0.1]" : "bg-white/[0.03] border-white/[0.06]"}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{company.name}</h3>
                    {company.highlight && company.note && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 uppercase">{company.note}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">📍 {company.city}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <a href={`tel:+41${company.phone.replace(/\s/g, "").replace(/^0/, "")}`} className="text-[12px] text-gray-400 hover:text-white transition-colors">📞 {company.phone}</a>
                {company.email && <a href={`mailto:${company.email}`} className="text-[12px] text-gray-400 hover:text-white transition-colors">✉️ {company.email}</a>}
                <a href={`https://www.${company.web}`} target="_blank" rel="noopener noreferrer" className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">🌐 {company.web}</a>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link href="/kontakty" className="block mb-6">
          <div className="bg-gradient-to-br from-red-500/[0.12] to-red-500/[0.04] rounded-2xl p-5 border border-red-500/[0.15] text-center hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] transition-shadow duration-300">
            <p className="text-sm font-bold text-white mb-1">Najdi práci přes ověřenou agenturu</p>
            <p className="text-[12px] text-gray-400 mb-3">1 000+ švýcarských personálních agentur s kontakty</p>
            <span className="bg-red-500 text-white px-5 py-2.5 rounded-[10px] text-[13px] font-semibold shadow-lg shadow-red-500/30 inline-block">Zobrazit agentury →</span>
          </div>
        </Link>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0c]/85 backdrop-blur-xl border-t border-white/[0.06] px-2 py-2 pb-3 z-[100]">
        <div className="max-w-lg mx-auto flex justify-around items-center">
          {[
            { icon: "🏠", label: "Přehled", href: "/dashboard", active: false },
            { icon: "📇", label: "Kontakty", href: "/kontakty", active: false },
            { icon: "📖", label: "Průvodce", href: "/pruvodce", active: true },
            { icon: "💼", label: "Pozice", href: "/nabidka", active: false },
            { icon: "👤", label: "Profil", href: "/profil", active: false },
          ].map((item) => (
            <Link key={item.label} href={item.href} className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-[10px] transition-all duration-150 ${item.active ? "bg-red-500/[0.08]" : ""}`}>
              <span className={`text-xl transition-all duration-150 ${item.active ? "" : "grayscale opacity-50"}`}>{item.icon}</span>
              <span className={`text-[10px] tracking-wide transition-all duration-150 ${item.active ? "text-red-500 font-semibold" : "text-gray-600 font-medium"}`}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
