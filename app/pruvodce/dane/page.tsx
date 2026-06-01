import Link from "next/link";
import TaxCalculator from "../../components/TaxCalculator";
import { Coins, Info, Church, MapPin, BarChart3, Pin, Check, AlertTriangle, TrendingDown, TrendingUp, Minus, Lightbulb, ArrowRight, ExternalLink } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
  { name: "Aargau (AG)", note: "tarif bez církevní daně", url: "https://www.ag.ch/de/verwaltung/dfr/steuern/quellensteuer" },
  { name: "Appenzell Ausserrhoden (AR)", note: "tarif s církevní daní", url: "https://www.ar.ch/verwaltung/departement-finanzen/steuerverwaltung/formulare-und-wegleitungen/" },
  { name: "Appenzell Innerrhoden (AI)", note: "tarif bez církevní daně", url: "https://www.ai.ch/themen/steuern/steuerarten/quellensteuer" },
  { name: "Basel-Landschaft (BL)", note: "tarif bez církevní daně", url: "https://www.baselland.ch/politik-und-behorden/direktionen/finanz-und-kirchendirektion/steuerverwaltung/quellensteuer" },
  { name: "Basel-Stadt (BS)", note: "daně od stránky 38 výš", url: "https://www.steuerverwaltung.bs.ch/quellensteuer.html" },
  { name: "Bern (BE)", note: "tarif bez církevní daně", url: "https://www.sv.fin.be.ch/sv_fin/de/index/navi/index/quellensteuer.html" },
  { name: "Fribourg (FR)", note: "dvojjazyčný web, bez církevní daně", url: "https://www.fr.ch/scc/de/pub/quellensteuer.htm" },
  { name: "Genève (GE)", note: "pouze francouzsky, bez církevní daně", url: "https://www.ge.ch/impot-source" },
  { name: "Glarus (GL)", note: "tarif bez církevní daně", url: "https://www.gl.ch/verwaltung/finanzen-und-gesundheit/online-schalter.html/511" },
  { name: "Graubünden (GR)", note: "bez církevní daně", url: "https://www.gr.ch/DE/institutionen/verwaltung/dfg/stv/steuererklaerung/quellensteuer/Seiten/default.aspx" },
  { name: "Jura (JU)", note: "jen francouzsky, bez církevní daně", url: "https://www.jura.ch/DFI/CTR/Impots-speciaux/Impot-a-la-source/Impot-a-la-source.html" },
  { name: "Luzern (LU)", note: "tarif bez církevní daně", url: "https://steuern.lu.ch/publikationen/nav_wegleitungen/we_quellensteuer" },
  { name: "Neuchâtel (NE)", note: "jen francouzsky, bez církevní daně", url: "https://www.ne.ch/autorites/DFS/SCCO/impot-source/Pages/accueil.aspx" },
  { name: "Nidwalden (NW)", note: "tarif bez církevní daně", url: "https://www.steuern-nw.ch/natuerlichepersonen/quellensteuer/" },
  { name: "Obwalden (OW)", note: "nutno stáhnout PDF, bez církevní daně", url: "https://www.ow.ch/steuern/3517" },
  { name: "Sankt Gallen (SG)", note: "tarif bez církevní daně", url: "https://www.sg.ch/steuern-finanzen/steuern/steuerarten/quellensteuer.html" },
  { name: "Schaffhausen (SH)", note: "tarif bez církevní daně", url: "https://sh.ch/CMS/Webseite/Kanton-Schaffhausen/Beh-rde/Services/Such-Portal-1212278-DE.html?search=quellensteuer" },
  { name: "Schwyz (SZ)", note: "tarif bez církevní daně", url: "https://www.sz.ch/behoerden/verwaltung/finanzdepartement/steuerverwaltung/quellensteuer.html" },
  { name: "Solothurn (SO)", note: "tarif bez církevní daně", url: "https://so.ch/verwaltung/finanzdepartement/steueramt/quellensteuer/" },
  { name: "Thurgau (TG)", note: "tarif bez církevní daně", url: "https://steuerverwaltung.tg.ch/hauptrubrik-1/quellensteuern.html/2876" },
  { name: "Ticino (TI)", note: "pouze italsky, bez církevní daně", url: "https://www.ti.ch/fonte" },
  { name: "Uri (UR)", note: "tarif bez církevní daně", url: "https://www.ur.ch/finanzen/1576" },
  { name: "Valais (VS)", note: "daně od stránky 20 výš, bez církevní daně", url: "https://www.vs.ch/de/web/scc/quelle" },
  { name: "Vaud (VD)", note: "pouze francouzsky, bez církevní daně", url: "https://www.vd.ch/etat-droit-finances/impots/impot-a-la-source-pour-les-employeurs-et-les-personnes-imposees-a-la-source" },
  { name: "Zug (ZG)", note: "tarif bez církevní daně", url: "https://zg.ch/de/steuern-finanzen/steuern/quellensteuer" },
  { name: "Zürich (ZH)", note: "jedna z nejlépe zpracovaných stránek, bez církevní daně", url: "https://www.zh.ch/de/steuern-finanzen/steuern/quellensteuer.html" },
];

function TaxTable({ title, Icon, data, colorClass }: { title: string; Icon: LucideIcon; data: typeof LOW_TAX; colorClass: string }) {
  return (
    <div className="mb-8">
      <h3 className={`text-base font-bold mb-3 flex items-center gap-2 ${colorClass}`}>
        <Icon size={16} strokeWidth={2} /> {title}
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
    <main className="min-h-screen bg-[#0a0a12] pb-24" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <div className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.07)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* Header */}
      <div className="relative z-10 px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#fb923c]/20 to-[#f97316]/20 border border-[#f97316]/25 flex items-center justify-center"><Coins size={24} strokeWidth={1.75} className="text-[#fb923c]" /></div>
          <div>
            <span className="text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wider text-[#fb923c] bg-[#f97316]/10">Nové</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-3">Quellensteuer: Kompletní průvodce srážkovou daní</h1>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">Vše co potřebuješ vědět o daních ve Švýcarsku – 26 kantonů, sazby, tipy na úsporu.</p>
      </div>

      {/* Content */}
      <div className="px-5 mt-4 relative z-10">

        {/* Intro box */}
        <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06] mb-8">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2"><Info size={18} strokeWidth={1.75} className="text-[#fb923c]" /> Co je Quellensteuer?</h2>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-3">
            Quellensteuer je forma daně, která se ti <span className="text-white font-semibold">automaticky strhává z výplaty</span>, pokud:
          </p>
          <div className="flex flex-col gap-2 mb-3">
            {["Nemáš švýcarské občanství", "Pracuješ ve Švýcarsku", "Nevyděláváš víc než 120 000 CHF ročně"].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#fb923c] flex-shrink-0" />
                <span className="text-[13px] text-gray-300">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-gray-400 leading-relaxed">
            Zjednodušeně: zaměstnavatel za tebe každý měsíc odvádí daň státu – ty nic neřešíš, jen dostaneš čistou mzdu.
          </p>
        </div>

        {/* Church tax warning */}
        <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06] mb-8">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2"><Church size={18} strokeWidth={1.75} className="text-[#fb923c]" /> Církevní daň – pozor na zbytečné náklady</h2>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-3">
            V některých kantonech ti do Quellensteuer automaticky přidají i <span className="text-white font-semibold">církevní daň (Kirchensteuer)</span>, pokud jsi při registraci uvedl náboženské vyznání.
          </p>
          <div className="bg-red-500/[0.08] rounded-xl p-4 border border-red-500/[0.12] mb-3">
            <p className="text-sm font-bold text-red-400 mb-1 flex items-center gap-1.5"><AlertTriangle size={14} strokeWidth={2} /> Rozdíl může být až 500–800 CHF ročně!</p>
            <p className="text-[12px] text-gray-400">Někdy i víc, v závislosti na kantonu a výši příjmu.</p>
          </div>
          <div className="bg-[#f97316]/[0.08] rounded-xl p-4 border border-[#f97316]/[0.15]">
            <p className="text-sm font-bold text-[#fb923c] mb-1 flex items-center gap-1.5"><Lightbulb size={14} strokeWidth={2} /> Doporučení</p>
            <p className="text-[13px] text-gray-300 leading-relaxed">
              Uveď, že nemáš žádné náboženské vyznání (<span className="text-white font-medium">ohne Konfession</span>). Je to běžná a legální možnost – a ušetříš nemalé peníze.
            </p>
          </div>
        </div>

        {/* Canton importance */}
        <div className="bg-[#f97316]/[0.05] rounded-2xl p-5 border border-[#f97316]/[0.12] mb-8">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2"><MapPin size={18} strokeWidth={1.75} className="text-[#fb923c]" /> 26 kantonů = 26 různých daní</h2>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-3">
            Tohle je <span className="text-[#fb923c] font-semibold">extrémně důležité!</span> Každý kanton má jinou daňovou sazbu. Například:
          </p>
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-start gap-2">
              <TrendingDown size={15} strokeWidth={2} className="text-green-400 mt-0.5 shrink-0" />
              <span className="text-[13px] text-gray-300"><span className="text-green-400 font-medium">Zug, Schwyz, Nidwalden</span> – nejnižší daně</span>
            </div>
            <div className="flex items-start gap-2">
              <TrendingUp size={15} strokeWidth={2} className="text-red-400 mt-0.5 shrink-0" />
              <span className="text-[13px] text-gray-300"><span className="text-red-400 font-medium">Ženeva, Lausanne, Basel, Bern</span> – vyšší zdanění</span>
            </div>
          </div>
          <div className="bg-[#f97316]/[0.08] rounded-xl p-4 border border-[#f97316]/[0.12]">
            <p className="text-sm font-bold text-[#fb923c] mb-2">Proto je důležité vědět:</p>
            <div className="flex flex-col gap-1.5">
              <p className="text-[13px] text-gray-300">• Kde je sídlo agentury, přes kterou pracuješ</p>
              <p className="text-[13px] text-gray-300">• Kde jsi oficiálně přihlášený k pobytu</p>
            </div>
          </div>
          <div className="mt-3 bg-red-500/[0.06] rounded-xl p-3 border border-red-500/[0.1]">
            <p className="text-[12px] text-red-400 font-medium flex items-start gap-1.5"><AlertTriangle size={14} strokeWidth={2} className="mt-0.5 shrink-0" /> Ne každá agentura to dělá správně. Pokud tě přihlásí do dražšího kantonu, můžeš zbytečně přijít o stovky franků měsíčně.</p>
          </div>
        </div>

        {/* Tax Calculator */}
        <TaxCalculator />

        {/* Tax rates by canton */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><BarChart3 size={20} strokeWidth={1.75} className="text-[#fb923c]" /> Daňové sazby podle kantonu</h2>
          <p className="text-xs text-gray-500 mb-6">Průměr za celou zemi: <span className="text-white font-bold">33,2 %</span></p>

          <TaxTable title="Nejnižší zdanění" Icon={TrendingDown} data={LOW_TAX} colorClass="text-green-400" />
          <TaxTable title="Střední zdanění" Icon={Minus} data={MID_TAX} colorClass="text-yellow-400" />
          <TaxTable title="Vyšší zdanění" Icon={TrendingUp} data={HIGH_TAX} colorClass="text-red-400" />
        </div>

        {/* All 26 cantons links */}
        <div className="mb-8">
          <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2"><MapPin size={18} strokeWidth={1.75} className="text-[#fb923c]" /> Quellensteuer podle kantonu – přehled</h2>
          <p className="text-xs text-gray-500 mb-4">Klikni na kanton → otevře se oficiální Quellensteuer stránka dané kantonální správy (tarify a PDF).</p>
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
            {CANTONS_LINKS.map((c, i) => (
              <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className={`block px-4 py-3 no-underline hover:bg-white/[0.03] transition group ${i < CANTONS_LINKS.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white group-hover:text-[#fb923c] transition-colors">{i + 1}. {c.name}</p>
                  <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-[#fb923c]/60 group-hover:text-[#fb923c] transition-colors"><ExternalLink size={12} strokeWidth={2} /> Tarif</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1"><Check size={11} strokeWidth={2.5} className="text-[#fb923c] shrink-0" /> {c.note}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Final note */}
        <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06] mb-8">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2"><Pin size={18} strokeWidth={1.75} className="text-[#fb923c]" /> Důležitá poznámka</h2>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-3">
            Uvedená procenta (tzv. <span className="text-white font-medium">Steuerfüsse</span>) představují celkové daňové zatížení a často se vztahují na vysokopříjmové osoby.
          </p>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-4">
            Pokud jsi běžný zaměstnanec s Quellensteuer, tvoje <span className="text-white font-semibold">efektivní sazba bude často o dost nižší</span> – hlavně pokud:
          </p>
          <div className="flex flex-col gap-2 mb-4">
            {["Nemáš církevní daň", "Jsi svobodný bez dětí", "Máš příjem do cca 5 000–7 000 CHF měsíčně"].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check size={14} strokeWidth={2.5} className="text-green-400 shrink-0" />
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
          <div className="bg-gradient-to-br from-[#f97316]/[0.12] to-[#f97316]/[0.04] rounded-2xl p-5 border border-[#f97316]/[0.15] text-center hover:shadow-[0_0_30px_rgba(249,115,22,0.18)] transition-shadow duration-300">
            <p className="text-sm font-bold text-white mb-1">Najdi agenturu ve správném kantonu</p>
            <p className="text-[12px] text-gray-400 mb-3">Ušetři stovky franků měsíčně výběrem správné lokace</p>
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#fb923c] to-[#f97316] text-[#0a0a12] px-5 py-2.5 rounded-[10px] text-[13px] font-bold shadow-lg shadow-[#f97316]/30">Zobrazit 1 000+ agentur <ArrowRight size={14} strokeWidth={2.5} /></span>
          </div>
        </Link>
      </div>

    </main>
  );
}
