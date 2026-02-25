import Link from "next/link";
import TaxCalculator from "../../components/TaxCalculator";

const LOW_TAX = [
  { canton: "Zug", rate: "22,2 %", lowest: "Baar (22,1 %), Neuheim (23,3 %)" },
  { canton: "Schwyz", rate: "23,6 %", lowest: "Freienbach (19,6 %)" },
  { canton: "Appenzell Innerrhoden", rate: "23,7 %", lowest: "Appenzell (23,7 %), Oberegg (26,9 %)" },
  { canton: "Obwalden", rate: "24,3 %", lowest: "Sarnen (24,3 %), Lungern (26,8 %)" },
  { canton: "Nidwalden", rate: "25,3 %", lowest: "Hergiswil (22,5 %), Wolfenschiessen (25,7 %)" },
  { canton: "Uri", rate: "25,3 %", lowest: "Seedorf (25,0 %), Sisikon (26,8 %)" },
  { canton: "Schaffhausen", rate: "27,8 %", lowest: "Stetten (25,4 %)" },
  { canton: "Luzern", rate: "29,2 %", lowest: "Meggen (25,5 %)" },
];

const MID_TAX = [
  { canton: "Appenzell Ausserrhoden", rate: "30,7 %", lowest: "Teufen (26,8 %)" },
  { canton: "Glarus", rate: "31,2 %", lowest: "" },
  { canton: "Graubünden", rate: "31,6 %", lowest: "Rongellen (25,3 %)" },
  { canton: "Thurgau", rate: "31,7 %", lowest: "Warth-Weiningen (26,9 %)" },
  { canton: "St. Gallen", rate: "32,2 %", lowest: "Balgach (25,6 %)" },
  { canton: "Solothurn", rate: "33,7 %", lowest: "Kammersrohr (29,2 %)" },
  { canton: "Aargau", rate: "34,3 %", lowest: "Oberwil-Lieli (29,0 %)" },
];

const HIGH_TAX = [
  { canton: "Fribourg", rate: "35,3 %", lowest: "Greng (28,8 %)" },
  { canton: "Valais", rate: "36,5 %", lowest: "od 35,5 %, nejvyšší Leukerbad (40,0 %)" },
  { canton: "Neuchâtel", rate: "37,7 %", lowest: "" },
  { canton: "Jura", rate: "39,0 %", lowest: "Les Breuleux (35,5 %)" },
  { canton: "Ticino", rate: "39,5 %", lowest: "Castel San Pietro (34,0 %)" },
  { canton: "Zürich", rate: "39,7 %", lowest: "Kilchberg (33,6 %)" },
  { canton: "Basel-Stadt", rate: "39,8 %", lowest: "Bettingen (36,2 %)" },
  { canton: "Bern", rate: "40,9 %", lowest: "Deisswil b. Münchenbuchsee (36,6 %)" },
  { canton: "Vaud", rate: "41,5 %", lowest: "" },
  { canton: "Basel-Landschaft", rate: "42,2 %", lowest: "" },
  { canton: "Genève", rate: "43,2 %", lowest: "Genthod (39,5 %)" },
];

const CANTONS_LINKS = [
  { name: "Aargau (AG)", note: "tarif bez církevní daně" },
  { name: "Appenzell Ausserrhoden (AR)", note: "tarif s církevní daní" },
  { name: "Appenzell Innerrhoden (AI)", note: "tarif bez církevní daně" },
  { name: "Basel-Landschaft (BL)", note: "tarif bez církevní daně" },
  { name: "Basel-Stadt (BS)", note: "daně od stránky 38 výš" },
  { name: "Bern (BE)", note: "tarif bez církevní daně" },
  { name: "Fribourg (FR)", note: "dvojjazyčný web, bez církevní daně" },
  { name: "Genève (GE)", note: "pouze francouzsky, bez církevní daně" },
  { name: "Glarus (GL)", note: "tarif bez církevní daně" },
  { name: "Graubünden (GR)", note: "bez církevní daně" },
  { name: "Jura (JU)", note: "jen francouzsky, bez církevní daně" },
  { name: "Luzern (LU)", note: "tarif bez církevní daně" },
  { name: "Neuchâtel (NE)", note: "jen francouzsky, bez církevní daně" },
  { name: "Nidwalden (NW)", note: "tarif bez církevní daně" },
  { name: "Obwalden (OW)", note: "nutno stáhnout PDF, bez církevní daně" },
  { name: "Sankt Gallen (SG)", note: "tarif bez církevní daně" },
  { name: "Schaffhausen (SH)", note: "tarif bez církevní daně" },
  { name: "Schwyz (SZ)", note: "tarif bez církevní daně" },
  { name: "Solothurn (SO)", note: "tarif bez církevní daně" },
  { name: "Thurgau (TG)", note: "tarif bez církevní daně" },
  { name: "Ticino (TI)", note: "pouze italsky, bez církevní daně" },
  { name: "Uri (UR)", note: "tarif bez církevní daně" },
  { name: "Valais (VS)", note: "daně od stránky 20 výš, bez církevní daně" },
  { name: "Vaud (VD)", note: "pouze francouzsky, bez církevní daně" },
  { name: "Zug (ZG)", note: "tarif bez církevní daně" },
  { name: "Zürich (ZH)", note: "jedna z nejlépe zpracovaných stránek, bez církevní daně" },
];

function TaxTable({ title, emoji, data, colorClass }: { title: string; emoji: string; data: typeof LOW_TAX; colorClass: string }) {
  return (
    <div className="mb-8">
      <h3 className={`text-base font-bold mb-3 flex items-center gap-2 ${colorClass}`}>
        <span>{emoji}</span> {title}
      </h3>
      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
        {data.map((item, i) => (
          <div key={i} className={`px-4 py-3 flex items-center justify-between ${i < data.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{item.canton}</p>
              {item.lowest && (
                <p className="text-[11px] text-gray-500 mt-0.5">Nejnižší: {item.lowest}</p>
              )}
            </div>
            <span className={`text-sm font-bold font-mono ${colorClass}`}>{item.rate}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DanePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] pb-24">
      <div className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(239,68,68,0.06)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* Header */}
      <div className="relative z-10 px-5 pt-6 pb-4">
        <Link href="/dashboard" className="text-gray-500 text-sm hover:text-gray-400 transition-colors mb-4 inline-block">← Zpět</Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20 flex items-center justify-center text-2xl">💰</div>
          <div>
            <span className="text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wider text-green-400 bg-green-500/10">Nové</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-3">Quellensteuer: Kompletní průvodce srážkovou daní</h1>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">Vše co potřebuješ vědět o daních ve Švýcarsku – 26 kantonů, sazby, tipy na úsporu.</p>
      </div>

      {/* Content */}
      <div className="px-5 mt-4 relative z-10">

        {/* Intro box */}
        <div className="bg-blue-500/[0.06] rounded-2xl p-5 border border-blue-500/[0.12] mb-8">
          <h2 className="text-base font-bold text-white mb-3">🇨🇭 Co je Quellensteuer?</h2>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-3">
            Quellensteuer je forma daně, která se ti <span className="text-white font-semibold">automaticky strhává z výplaty</span>, pokud:
          </p>
          <div className="flex flex-col gap-2 mb-3">
            {["Nemáš švýcarské občanství", "Pracuješ ve Švýcarsku", "Nevyděláváš víc než 120 000 CHF ročně"].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                <span className="text-[13px] text-gray-300">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-gray-400 leading-relaxed">
            Zjednodušeně: zaměstnavatel za tebe každý měsíc odvádí daň státu – ty nic neřešíš, jen dostaneš čistou mzdu.
          </p>
        </div>

        {/* Church tax warning */}
        <div className="bg-red-500/[0.06] rounded-2xl p-5 border border-red-500/[0.12] mb-8">
          <h2 className="text-base font-bold text-white mb-3">✝️ Církevní daň – pozor na zbytečné náklady</h2>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-3">
            V některých kantonech ti do Quellensteuer automaticky přidají i <span className="text-red-400 font-semibold">církevní daň (Kirchensteuer)</span>, pokud jsi při registraci uvedl náboženské vyznání.
          </p>
          <div className="bg-red-500/[0.08] rounded-xl p-4 border border-red-500/[0.1] mb-3">
            <p className="text-sm font-bold text-red-400 mb-1">Rozdíl může být až 500–800 CHF ročně!</p>
            <p className="text-[12px] text-gray-400">Někdy i víc, v závislosti na kantonu a výši příjmu.</p>
          </div>
          <div className="bg-green-500/[0.06] rounded-xl p-4 border border-green-500/[0.1]">
            <p className="text-sm font-bold text-green-400 mb-1">👉 Doporučení</p>
            <p className="text-[13px] text-gray-300 leading-relaxed">
              Uveď, že nemáš žádné náboženské vyznání (<span className="text-white font-medium">ohne Konfession</span>). Je to běžná a legální možnost – a ušetříš nemalé peníze.
            </p>
          </div>
        </div>

        {/* Canton importance */}
        <div className="bg-yellow-500/[0.06] rounded-2xl p-5 border border-yellow-500/[0.12] mb-8">
          <h2 className="text-base font-bold text-white mb-3">📍 26 kantonů = 26 různých daní</h2>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-3">
            Tohle je <span className="text-yellow-400 font-semibold">extrémně důležité!</span> Každý kanton má jinou daňovou sazbu. Například:
          </p>
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-start gap-2">
              <span className="text-green-400 text-sm mt-0.5">▼</span>
              <span className="text-[13px] text-gray-300"><span className="text-green-400 font-medium">Zug, Schwyz, Nidwalden</span> – nejnižší daně</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-400 text-sm mt-0.5">▲</span>
              <span className="text-[13px] text-gray-300"><span className="text-red-400 font-medium">Ženeva, Lausanne, Basel, Bern</span> – vyšší zdanění</span>
            </div>
          </div>
          <div className="bg-yellow-500/[0.08] rounded-xl p-4 border border-yellow-500/[0.1]">
            <p className="text-sm font-bold text-yellow-400 mb-2">🧐 Proto je důležité vědět:</p>
            <div className="flex flex-col gap-1.5">
              <p className="text-[13px] text-gray-300">• Kde je sídlo agentury, přes kterou pracuješ</p>
              <p className="text-[13px] text-gray-300">• Kde jsi oficiálně přihlášený k pobytu</p>
            </div>
          </div>
          <div className="mt-3 bg-red-500/[0.06] rounded-xl p-3 border border-red-500/[0.08]">
            <p className="text-[12px] text-red-400 font-medium">⚠️ Ne každá agentura to dělá správně. Pokud tě přihlásí do dražšího kantonu, můžeš zbytečně přijít o stovky franků měsíčně.</p>
          </div>
        </div>

        {/* Tax Calculator */}
        <TaxCalculator />

        {/* Tax rates by canton */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-1">📊 Daňové sazby podle kantonu</h2>
          <p className="text-xs text-gray-500 mb-6">Průměr za celou zemi: <span className="text-white font-bold">33,2 %</span></p>

          <TaxTable title="Nejnižší zdanění" emoji="🟢" data={LOW_TAX} colorClass="text-green-400" />
          <TaxTable title="Střední zdanění" emoji="🟡" data={MID_TAX} colorClass="text-yellow-400" />
          <TaxTable title="Vyšší zdanění" emoji="🔴" data={HIGH_TAX} colorClass="text-red-400" />
        </div>

        {/* All 26 cantons links */}
        <div className="mb-8">
          <h2 className="text-base font-bold text-white mb-4">🇨🇭 Quellensteuer podle kantonu – přehled</h2>
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
            {CANTONS_LINKS.map((c, i) => (
              <div key={i} className={`px-4 py-3 ${i < CANTONS_LINKS.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{i + 1}. {c.name}</p>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">✅ {c.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final note */}
        <div className="bg-purple-500/[0.06] rounded-2xl p-5 border border-purple-500/[0.12] mb-8">
          <h2 className="text-base font-bold text-white mb-3">📌 Důležitá poznámka</h2>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-3">
            Uvedená procenta (tzv. <span className="text-purple-300 font-medium">Steuerfüsse</span>) představují celkové daňové zatížení a často se vztahují na vysokopříjmové osoby.
          </p>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-4">
            Pokud jsi běžný zaměstnanec s Quellensteuer, tvoje <span className="text-white font-semibold">efektivní sazba bude často o dost nižší</span> – hlavně pokud:
          </p>
          <div className="flex flex-col gap-2 mb-4">
            {["Nemáš církevní daň", "Jsi svobodný bez dětí", "Máš příjem do cca 5 000–7 000 CHF měsíčně"].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-[13px] text-gray-300">{item}</span>
              </div>
            ))}
          </div>
          <div className="bg-green-500/[0.08] rounded-xl p-4 border border-green-500/[0.1]">
            <p className="text-sm font-bold text-green-400 mb-1">Ve skutečnosti můžeš platit jen 4–12 % z platu</p>
            <p className="text-[12px] text-gray-400">V závislosti na kantonu, obci a tvé situaci. Zug, Schwyz, Nidwalden nebo Freienbach patří mezi nejlepší kantony pro šetření.</p>
          </div>
        </div>

        {/* CTA */}
        <Link href="/kontakty" className="block mb-6">
          <div className="bg-gradient-to-br from-red-500/[0.12] to-red-500/[0.04] rounded-2xl p-5 border border-red-500/[0.15] text-center hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] transition-shadow duration-300">
            <p className="text-sm font-bold text-white mb-1">Najdi agenturu ve správném kantonu</p>
            <p className="text-[12px] text-gray-400 mb-3">Ušetři stovky franků měsíčně výběrem správné lokace</p>
            <span className="bg-red-500 text-white px-5 py-2.5 rounded-[10px] text-[13px] font-semibold shadow-lg shadow-red-500/30 inline-block">Zobrazit 1 000+ agentur →</span>
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
