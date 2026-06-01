import Link from "next/link";
import { HeartPulse, AlertTriangle, Banknote, Lightbulb, Target, Check, Stethoscope, Phone, Building2, Hospital, BedDouble, Smile, Glasses, Sparkles, Wallet, Package, Zap, MapPin, Mail, Globe, ArrowRight, ShieldCheck, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

const CARE_MODELS: { name: string; price: string; desc: string; Icon: LucideIcon; recommended: boolean }[] = [
  { name: "Standard", price: "Nejdražší", desc: "Můžeš jít ke každému doktorovi", Icon: Hospital, recommended: false },
  { name: "Hausarzt", price: "Střední", desc: "Máš jednoho hlavního doktora", Icon: Stethoscope, recommended: false },
  { name: "Telmed", price: "Levný", desc: "Nejdřív zavoláš na lékařskou linku", Icon: Phone, recommended: true },
  { name: "HMO", price: "Nejlevnější", desc: "Chodíš přes vybrané HMO centrum", Icon: Building2, recommended: true },
];

export default function PojisteniPage() {
  return (
    <main className="min-h-screen bg-[#0a0a12] pb-24" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <div className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.07)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* Header */}
      <div className="relative z-10 px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#fb923c]/20 to-[#f97316]/20 border border-[#f97316]/25 flex items-center justify-center"><HeartPulse size={24} strokeWidth={1.75} className="text-[#fb923c]" /></div>
          <div>
            <span className="text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wider text-[#fb923c] bg-[#f97316]/10">Důležité</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-3">Zdravotní pojištění ve Švýcarsku</h1>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">Jak nastavit nejlevnější pojištění a ušetřit stovky franků měsíčně.</p>
      </div>

      <div className="px-5 mt-4 relative z-10">

        {/* Critical warning */}
        <div className="bg-red-500/[0.06] rounded-2xl p-5 border border-red-500/[0.12] mb-6">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2"><AlertTriangle size={18} strokeWidth={2} className="text-red-400" /> Důležité vědět</h2>
          <div className="flex flex-col gap-2.5">
            {[
              "Zdravotní pojištění si platí každý sám – z vlastní kapsy",
              "Neplatí to za tebe zaměstnavatel",
              "Není to automaticky strhávané z výplaty",
              "Musíš si sám vybrat pojišťovnu do 3 měsíců od příjezdu",
              "Pokud to neuděláš včas, kanton ti pojišťovnu přiřadí – a často drahou!",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <AlertTriangle size={14} strokeWidth={2} className="text-red-400 mt-0.5 shrink-0" />
                <span className="text-[13px] text-gray-300 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verified specialist — Branislav Hepner */}
        <a href="https://helpner.ch" target="_blank" rel="noopener noreferrer" className="block mb-6 no-underline group">
          <div className="bg-gradient-to-br from-[#f97316]/[0.1] to-[#fb923c]/[0.03] rounded-2xl p-5 border border-[#f97316]/20 hover:border-[#f97316]/40 hover:shadow-[0_0_30px_rgba(249,115,22,0.12)] transition">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#f97316]/15 border border-[#f97316]/25 flex items-center justify-center text-[#fb923c] font-extrabold text-base">BH</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-white font-bold text-sm">Branislav Hepner</h3>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-[#f97316]/15 text-[#fb923c] px-1.5 py-0.5 rounded"><ShieldCheck size={11} strokeWidth={2.5} /> Ověřený</span>
                </div>
                <p className="text-[12px] text-gray-400 mt-0.5">Nezávislý pojišťovací poradce · Wallisellen (ZH)</p>
                <p className="text-[13px] text-gray-300 leading-relaxed mt-2">
                  Nechce se ti to řešit samotnému? <span className="text-white font-medium">Mluví česky a slovensky</span> a pomůže ti vybrat a nastavit nejlevnější pojištění, vyřídit Prämienverbilligung, daně i 3. pilíř.
                </p>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] text-yellow-400"><Star size={12} strokeWidth={2} className="fill-yellow-400" /> 4,5/5 Trustpilot</span>
                  <span className="text-[11px] text-gray-500">CZ · SK · DE · EN · PL</span>
                  <span className="ml-auto inline-flex items-center gap-1 text-[12px] font-semibold text-[#fb923c]">helpner.ch <ArrowRight size={13} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" /></span>
                </div>
              </div>
            </div>
          </div>
        </a>

        {/* Price highlight */}
        <div className="bg-green-500/[0.06] rounded-2xl p-5 border border-green-500/[0.12] mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2"><Banknote size={18} strokeWidth={1.75} className="text-[#fb923c]" /> Kolik to stojí?</h2>
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
            <p className="text-[11px] text-yellow-400 font-medium text-center inline-flex items-center gap-1.5 justify-center w-full">
              <Lightbulb size={13} strokeWidth={2} /> Rozdíl: <span className="font-bold">až 2 040 CHF ročně</span> jen správným nastavením!
            </p>
          </div>
        </div>

        {/* 3 Steps */}
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Target size={20} strokeWidth={1.75} className="text-[#fb923c]" /> 3 kroky k nejlevnějšímu pojištění</h2>

        {/* Step 1 - Franchise */}
        <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06] mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-[#f97316]/15 flex items-center justify-center text-sm font-bold text-[#fb923c]">1</div>
            <h3 className="text-sm font-bold text-white">Franchise – nastav na maximum 2 500 CHF</h3>
          </div>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-3">
            Franchise je částka, kterou si každý rok zaplatíš sám, než začne platit pojišťovna. <span className="text-[#fb923c] font-medium">Čím vyšší franchise, tím méně platíš měsíčně.</span>
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
            <p className="text-[12px] text-green-400 font-medium flex items-start gap-1.5"><Check size={13} strokeWidth={2.5} className="mt-0.5 shrink-0" /> Doporučení: Zvol 2 500 CHF – pokud jsi zdravý/á a nechodíš často k doktorům, je to nejvýhodnější.</p>
          </div>
        </div>

        {/* Step 2 - Care model */}
        <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06] mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-[#f97316]/15 flex items-center justify-center text-sm font-bold text-[#fb923c]">2</div>
            <h3 className="text-sm font-bold text-white">Model péče – vyber Telmed nebo HMO</h3>
          </div>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-4">
            Můžeš ušetřit <span className="text-[#fb923c] font-medium">až 25 % měsíčně</span> výběrem správného modelu.
          </p>
          <div className="flex flex-col gap-2">
            {CARE_MODELS.map((m, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${m.recommended ? "bg-green-500/[0.06] border-green-500/[0.12]" : "bg-white/[0.03] border-white/[0.06]"}`}>
                <m.Icon size={20} strokeWidth={1.75} className={m.recommended ? "text-green-400" : "text-gray-400"} />
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
        <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06] mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-[#f97316]/15 flex items-center justify-center text-sm font-bold text-[#fb923c]">3</div>
            <h3 className="text-sm font-bold text-white">Žádné doplňkové balíčky – zatím</h3>
          </div>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-3">
            Pojišťovny ti nabídnou doplňky, které <span className="text-[#fb923c] font-medium">výrazně zvyšují pojistné</span>:
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              { Icon: BedDouble, name: "Hospita" },
              { Icon: Smile, name: "Denta" },
              { Icon: Glasses, name: "Brýle" },
              { Icon: Sparkles, name: "Alternativní" },
            ].map((d, i) => (
              <div key={i} className="inline-flex items-center gap-1.5 bg-white/[0.04] rounded-lg px-3 py-2 border border-white/[0.06]">
                <d.Icon size={14} strokeWidth={1.75} className="text-gray-400" />
                <span className="text-[11px] text-gray-400">{d.name}</span>
              </div>
            ))}
          </div>
          <div className="bg-green-500/[0.06] rounded-lg px-3 py-2 border border-green-500/[0.08]">
            <p className="text-[12px] text-green-400 font-medium flex items-start gap-1.5"><Check size={13} strokeWidth={2.5} className="mt-0.5 shrink-0" /> Začni jen se základním LAMal pojištěním. Doplňky můžeš přidat kdykoli později.</p>
          </div>
        </div>

        {/* Real example */}
        <div className="bg-gradient-to-br from-green-500/[0.08] to-[#f97316]/[0.04] rounded-2xl p-5 border border-green-500/[0.12] mb-8">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2"><Wallet size={18} strokeWidth={1.75} className="text-[#fb923c]" /> Příklad z praxe</h2>
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
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2"><Package size={18} strokeWidth={1.75} className="text-[#fb923c]" /> Shrnutí – nejlevnější pojištění</h2>
          <div className="flex flex-col gap-2.5">
            {[
              { label: "Franchise", value: "2 500 CHF (maximum)", Icon: Check },
              { label: "Model", value: "Telmed nebo HMO", Icon: Check },
              { label: "Doplňky", value: "Žádné (jen LAMal základ)", Icon: Check },
              { label: "Cena", value: "180–250 CHF/měsíc", Icon: Wallet },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-4 py-3 border border-white/[0.04]">
                <item.Icon size={16} strokeWidth={2} className="text-[#fb923c] shrink-0" />
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
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2"><Zap size={18} strokeWidth={2} className="text-yellow-400" /> Na co si dát pozor</h2>
          <div className="flex flex-col gap-2.5">
            {[
              "Assura má často delší dobu schválení a složitější komunikaci",
              "U nejlevnějších pojišťoven se o vše staráš online – bez osobního poradce",
              "U Telmed modelu musíš zavolat na linku dřív, než půjdeš k lékaři",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Zap size={14} strokeWidth={2} className="text-yellow-400 mt-0.5 shrink-0" />
                <span className="text-[13px] text-gray-300 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Insurance contacts */}
        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><Hospital size={20} strokeWidth={1.75} className="text-[#fb923c]" /> Kontakty na pojišťovny</h2>
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
                  <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1"><MapPin size={11} strokeWidth={2} className="shrink-0" /> {company.city}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <a href={`tel:+41${company.phone.replace(/\s/g, "").replace(/^0/, "")}`} className="inline-flex items-center gap-1 text-[12px] text-gray-400 hover:text-white transition-colors"><Phone size={11} strokeWidth={2} /> {company.phone}</a>
                {company.email && <a href={`mailto:${company.email}`} className="inline-flex items-center gap-1 text-[12px] text-gray-400 hover:text-white transition-colors"><Mail size={11} strokeWidth={2} /> {company.email}</a>}
                <a href={`https://www.${company.web}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[12px] text-[#fb923c] hover:text-[#fb923c]/80 transition-colors"><Globe size={11} strokeWidth={2} /> {company.web}</a>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link href="/kontakty" className="block mb-6">
          <div className="bg-gradient-to-br from-[#f97316]/[0.12] to-[#f97316]/[0.04] rounded-2xl p-5 border border-[#f97316]/[0.15] text-center hover:shadow-[0_0_30px_rgba(249,115,22,0.18)] transition-shadow duration-300">
            <p className="text-sm font-bold text-white mb-1">Najdi práci přes ověřenou agenturu</p>
            <p className="text-[12px] text-gray-400 mb-3">1 000+ švýcarských personálních agentur s kontakty</p>
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#fb923c] to-[#f97316] text-[#0a0a12] px-5 py-2.5 rounded-[10px] text-[13px] font-bold shadow-lg shadow-[#f97316]/30">Zobrazit agentury <ArrowRight size={14} strokeWidth={2.5} /></span>
          </div>
        </Link>
      </div>

    </main>
  );
}
