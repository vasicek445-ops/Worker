import Link from "next/link";

const PERMIT_TYPES = [
  {
    type: "L",
    name: "Ausweis L",
    subtitle: "Krátkodobé povolení",
    color: "yellow",
    duration: "3–12 měsíců",
    details: [
      "Smlouva na méně než 12 měsíců",
      "Nejčastější u práce přes agenturu (temporär)",
      "Možnost prodloužení",
      "Vhodné, když ve Švýcarsku začínáš",
    ],
  },
  {
    type: "B",
    name: "Ausweis B",
    subtitle: "Dlouhodobé povolení",
    color: "green",
    duration: "5 let",
    details: [
      "Smlouva na 12+ měsíců nebo na dobu neurčitou",
      "Větší svoboda (změna kantonu, ubytování, práce)",
      "Lepší benefity (rekvalifikace, stabilita, pojištění)",
      "Nejlepší volba pro dlouhodobý pobyt",
    ],
  },
  {
    type: "C",
    name: "Ausweis C",
    subtitle: "Trvalý pobyt",
    color: "blue",
    duration: "Neomezený",
    details: [
      "Po 5–10 letech pobytu (záleží na zemi původu)",
      "Prakticky stejná práva jako Švýcaři",
      "Volný přístup na trh práce bez omezení",
      "Nejsilnější forma povolení",
    ],
  },
  {
    type: "G",
    name: "Ausweis G",
    subtitle: "Přeshraniční pracovník",
    color: "purple",
    duration: "5 let",
    details: [
      "Bydlíš v jiné zemi (Německo, Francie, Itálie...)",
      "Denně nebo týdně dojíždíš do Švýcarska",
      "Nehodí se pro ty, kdo se chtějí usadit",
      "Min. 1× týdně návrat do země bydliště",
    ],
  },
];

const DOCUMENTS = [
  { icon: "🪪", name: "Pas nebo občanku" },
  { icon: "📝", name: "Pracovní smlouvu" },
  { icon: "🏠", name: "Potvrzení o ubytování" },
  { icon: "📸", name: "Pasovou fotku" },
  { icon: "💰", name: "Poplatek (cca 40–60 CHF)" },
];

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string; light: string }> = {
  yellow: { bg: "bg-yellow-500/[0.06]", border: "border-yellow-500/[0.12]", text: "text-yellow-400", badge: "bg-yellow-500/20", light: "bg-yellow-500/[0.08]" },
  green: { bg: "bg-green-500/[0.06]", border: "border-green-500/[0.12]", text: "text-green-400", badge: "bg-green-500/20", light: "bg-green-500/[0.08]" },
  blue: { bg: "bg-blue-500/[0.06]", border: "border-blue-500/[0.12]", text: "text-blue-400", badge: "bg-blue-500/20", light: "bg-blue-500/[0.08]" },
  purple: { bg: "bg-purple-500/[0.06]", border: "border-purple-500/[0.12]", text: "text-purple-400", badge: "bg-purple-500/20", light: "bg-purple-500/[0.08]" },
};

export default function PovoleniPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] pb-24">
      <div className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(239,68,68,0.06)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* Header */}
      <div className="relative z-10 px-5 pt-6 pb-4">
        <Link href="/dashboard" className="text-gray-500 text-sm hover:text-gray-400 transition-colors mb-4 inline-block">← Zpět</Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/20 flex items-center justify-center text-2xl">📋</div>
          <div>
            <span className="text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wider text-red-400 bg-red-500/10">Důležité</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-3">Pobytová povolení ve Švýcarsku</h1>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">Co musíš vědět, než začneš pracovat – typy povolení, jak je získat a co potřebuješ.</p>
      </div>

      <div className="px-5 mt-4 relative z-10">

        {/* Intro */}
        <div className="bg-blue-500/[0.06] rounded-2xl p-5 border border-blue-500/[0.12] mb-6">
          <h2 className="text-base font-bold text-white mb-3">🛃 Proč potřebuješ povolení?</h2>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-3">
            Ve Švýcarsku nestačí jen přijet a začít pracovat. Každý cizinec – <span className="text-white font-semibold">včetně občanů EU</span> – musí mít tzv. pobytové povolení (Ausweis).
          </p>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-4">
            Díky němu můžeš legálně pracovat, být pojištěný a získat spoustu benefitů – třeba i rekvalifikace zdarma nebo podporu v nezaměstnanosti.
          </p>
          <div className="bg-green-500/[0.06] rounded-xl p-3.5 border border-green-500/[0.1]">
            <p className="text-sm font-bold text-green-400 mb-1">🇪🇺 Dobrá zpráva pro občany EU/EFTA</p>
            <p className="text-[12px] text-gray-300 leading-relaxed">Díky dohodě o volném pohybu (<span className="text-white font-medium">Freizügigkeitsabkommen</span>) máš jako občan ČR/SR zjednodušený přístup k pobytu i práci ve Švýcarsku.</p>
          </div>
        </div>

        {/* Permit types */}
        <h2 className="text-lg font-bold text-white mb-4">📋 Typy povolení</h2>

        <div className="flex flex-col gap-3 mb-8">
          {PERMIT_TYPES.map((permit, i) => {
            const c = colorMap[permit.color];
            return (
              <div key={i} className={`${c.bg} rounded-2xl p-5 border ${c.border}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${c.badge} flex items-center justify-center`}>
                      <span className={`text-lg font-black ${c.text}`}>{permit.type}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{permit.name}</h3>
                      <p className="text-[11px] text-gray-500">{permit.subtitle}</p>
                    </div>
                  </div>
                  <div className={`${c.light} rounded-lg px-2.5 py-1 border ${c.border}`}>
                    <span className={`text-[11px] font-bold ${c.text}`}>{permit.duration}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  {permit.details.map((detail, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${c.text.replace("text-", "bg-")} mt-1.5 flex-shrink-0`} />
                      <span className="text-[13px] text-gray-300 leading-relaxed">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Deadline warning */}
        <div className="bg-red-500/[0.06] rounded-2xl p-5 border border-red-500/[0.12] mb-6">
          <h2 className="text-base font-bold text-white mb-3">⏰ Kdy to musíš zařídit?</h2>
          <div className="flex flex-col gap-2.5 mb-4">
            {[
              { icon: "📅", text: "Do 14 dnů od příjezdu do Švýcarska" },
              { icon: "⚠️", text: "Než začneš oficiálně pracovat" },
              { icon: "🏛️", text: "Registrace přes obec (Einwohnerkontrolle) nebo Migrationsamt" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-base">{item.icon}</span>
                <span className="text-[13px] text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>
          <div className="bg-yellow-500/[0.06] rounded-xl p-3 border border-yellow-500/[0.08]">
            <p className="text-[12px] text-yellow-400 font-medium">💡 Některé agentury tě zaregistrují samy, ale vždy si to ověř!</p>
          </div>
        </div>

        {/* Documents needed */}
        <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06] mb-6">
          <h2 className="text-base font-bold text-white mb-4">👜 Co budeš potřebovat?</h2>
          <div className="flex flex-col gap-2">
            {DOCUMENTS.map((doc, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-4 py-3 border border-white/[0.04]">
                <span className="text-lg">{doc.icon}</span>
                <span className="text-sm font-medium text-white">{doc.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What happens if you don't */}
        <div className="bg-red-500/[0.08] rounded-2xl p-5 border border-red-500/[0.15] mb-6">
          <h2 className="text-base font-bold text-white mb-3">⚠️ Co se stane, když to nevyřídíš?</h2>
          <div className="flex flex-col gap-2.5">
            {[
              { icon: "💸", text: "Pokuta", severity: "high" },
              { icon: "🚫", text: "Zákaz pobytu", severity: "high" },
              { icon: "❌", text: "Ztráta nároků na podporu, pojištění a rekvalifikace", severity: "high" },
              { icon: "⚡", text: "Problémy s agenturou nebo zaměstnavatelem", severity: "medium" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-base mt-0.5">{item.icon}</span>
                <span className={`text-[13px] leading-relaxed ${item.severity === "high" ? "text-red-300 font-medium" : "text-gray-300"}`}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Renewal */}
        <div className="bg-blue-500/[0.06] rounded-2xl p-5 border border-blue-500/[0.12] mb-6">
          <h2 className="text-base font-bold text-white mb-3">🔄 Prodloužení povolení</h2>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-3">
            O prodloužení žádáš na <span className="text-white font-medium">obecním úřadě</span> (v Ženevě přímo přes kanton).
          </p>
          <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06] mb-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✅</span>
                <span className="text-[13px] text-gray-300">Žádost podej <span className="text-white font-medium">nejdříve 3 měsíce</span> před koncem platnosti</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400">⚠️</span>
                <span className="text-[13px] text-gray-300"><span className="text-white font-medium">Nejpozději 2 týdny</span> před vypršením</span>
              </div>
            </div>
          </div>
          <p className="text-[12px] text-gray-500 mb-2">Přílohy k žádosti:</p>
          <div className="flex flex-col gap-1.5">
            {["Stávající Ausweis", "Pas nebo občanka", "Potvrzení z úřadu o blížícím se konci platnosti"].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                <span className="text-[13px] text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lost/stolen */}
        <div className="bg-yellow-500/[0.06] rounded-2xl p-5 border border-yellow-500/[0.12] mb-6">
          <h2 className="text-base font-bold text-white mb-3">❗ Ztráta nebo krádež povolení</h2>
          <div className="flex flex-col gap-3">
            {[
              { step: "1", text: "Nahlásíš na policii → dostaneš potvrzení o ztrátě", icon: "🚔" },
              { step: "2", text: "S potvrzením, fotkou a pasem jdeš na obec (nebo kanton)", icon: "🏛️" },
              { step: "3", text: "Zaplatíš poplatek a vystaví ti nový doklad", icon: "📄" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/[0.04] rounded-xl px-4 py-3 border border-white/[0.04]">
                <div className="w-7 h-7 rounded-lg bg-yellow-500/20 flex items-center justify-center text-sm font-bold text-yellow-400 flex-shrink-0">{item.step}</div>
                <span className="text-[13px] text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divorce/death */}
        <div className="bg-purple-500/[0.06] rounded-2xl p-5 border border-purple-500/[0.12] mb-8">
          <h2 className="text-base font-bold text-white mb-3">❤️ Rozvod, úmrtí partnera – co dál?</h2>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-4">
            Pokud jsi ve Švýcarsku díky rodinnému sloučení a partner tě opustí, zemře nebo se rozvedete:
          </p>
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-green-500/[0.04] rounded-xl p-4 border border-green-500/[0.08]">
              <p className="text-sm font-bold text-green-400 mb-2">🇪🇺 EU/EFTA občané</p>
              <p className="text-[13px] text-gray-300 leading-relaxed">Můžeš si zažádat o nový Ausweis, pokud:</p>
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex items-center gap-2"><span className="text-green-400">✓</span><span className="text-[12px] text-gray-300">Pracuješ</span></div>
                <div className="flex items-center gap-2"><span className="text-green-400">✓</span><span className="text-[12px] text-gray-300">Máš dost vlastních financí</span></div>
              </div>
            </div>
            <div className="bg-orange-500/[0.04] rounded-xl p-4 border border-orange-500/[0.08]">
              <p className="text-sm font-bold text-orange-400 mb-2">🌍 Třetizemci</p>
              <p className="text-[13px] text-gray-300 leading-relaxed">Povolení si můžeš prodloužit, pokud:</p>
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex items-center gap-2"><span className="text-orange-400">✓</span><span className="text-[12px] text-gray-300">Min. 3 roky spolu</span></div>
                <div className="flex items-center gap-2"><span className="text-orange-400">✓</span><span className="text-[12px] text-gray-300">Dobrá integrace (práce, jazyk, bez problémů)</span></div>
                <div className="flex items-center gap-2"><span className="text-orange-400">✓</span><span className="text-[12px] text-gray-300">Osobní důvody (násilí, nemožnost návratu)</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Key takeaway */}
        <div className="bg-gradient-to-br from-red-500/[0.1] to-orange-500/[0.04] rounded-2xl p-5 border border-red-500/[0.15] mb-6">
          <p className="text-base font-bold text-white mb-2">🔒 Nejdůležitější pravidlo</p>
          <p className="text-[13px] text-gray-300 leading-relaxed">
            Ve Švýcarsku není nic důležitějšího než mít <span className="text-white font-semibold">správné papíry</span>. Díky nim máš přístup k rekvalifikacím, jistotě a legální ochraně.
          </p>
        </div>

        {/* Official link */}
        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06] mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xl">📚</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Oficiální informace</p>
              <p className="text-[11px] text-gray-500">ch.ch – přehled pobytových povolení</p>
            </div>
            <a href="https://www.ch.ch" target="_blank" rel="noopener noreferrer" className="text-[12px] text-blue-400 font-medium hover:text-blue-300 transition-colors">Navštívit →</a>
          </div>
        </div>

        {/* CTA */}
        <Link href="/kontakty" className="block mb-6">
          <div className="bg-gradient-to-br from-red-500/[0.12] to-red-500/[0.04] rounded-2xl p-5 border border-red-500/[0.15] text-center hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] transition-shadow duration-300">
            <p className="text-sm font-bold text-white mb-1">Najdi agenturu, která ti vyřídí povolení</p>
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
