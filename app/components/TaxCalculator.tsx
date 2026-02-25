"use client";
import { useState } from "react";

// Quellensteuer rates for tariff A0N (single, no kids, no church tax)
// Approximate rates for monthly income brackets based on real data
// Format: canton, name, rates for income brackets [4000, 5000, 5500, 6000, 7000, 8000]
const CANTONS = [
  { code: "ZG", name: "Zug", rates: [3.15, 4.20, 4.75, 5.25, 6.30, 7.10] },
  { code: "SZ", name: "Schwyz", rates: [3.85, 5.05, 5.60, 6.15, 7.20, 8.00] },
  { code: "AI", name: "Appenzell I.", rates: [4.10, 5.30, 5.85, 6.40, 7.45, 8.25] },
  { code: "OW", name: "Obwalden", rates: [4.25, 5.50, 6.05, 6.60, 7.65, 8.45] },
  { code: "NW", name: "Nidwalden", rates: [4.35, 5.60, 6.15, 6.70, 7.75, 8.55] },
  { code: "UR", name: "Uri", rates: [4.40, 5.65, 6.20, 6.75, 7.80, 8.60] },
  { code: "SH", name: "Schaffhausen", rates: [5.10, 6.50, 7.15, 7.80, 8.95, 9.80] },
  { code: "LU", name: "Luzern", rates: [5.95, 7.55, 8.30, 9.05, 10.40, 11.40] },
  { code: "AR", name: "Appenzell A.", rates: [6.10, 7.75, 8.55, 9.30, 10.65, 11.65] },
  { code: "GL", name: "Glarus", rates: [6.25, 7.90, 8.70, 9.45, 10.80, 11.80] },
  { code: "GR", name: "Graubünden", rates: [6.35, 8.00, 8.80, 9.55, 10.90, 11.90] },
  { code: "TG", name: "Thurgau", rates: [6.40, 8.05, 8.85, 9.60, 10.95, 11.95] },
  { code: "SG", name: "St. Gallen", rates: [6.55, 8.20, 9.00, 9.75, 11.10, 12.10] },
  { code: "SO", name: "Solothurn", rates: [6.90, 8.60, 9.40, 10.20, 11.55, 12.55] },
  { code: "AG", name: "Aargau", rates: [7.05, 8.80, 9.60, 10.40, 11.75, 12.80] },
  { code: "FR", name: "Fribourg", rates: [7.30, 9.10, 9.95, 10.75, 12.15, 13.20] },
  { code: "VS", name: "Valais", rates: [7.60, 9.45, 10.30, 11.15, 12.60, 13.70] },
  { code: "NE", name: "Neuchâtel", rates: [7.90, 9.80, 10.70, 11.55, 13.05, 14.20] },
  { code: "JU", name: "Jura", rates: [8.20, 10.15, 11.05, 11.95, 13.50, 14.70] },
  { code: "TI", name: "Ticino", rates: [8.30, 10.25, 11.15, 12.05, 13.60, 14.80] },
  { code: "ZH", name: "Zürich", rates: [8.35, 10.30, 11.20, 12.10, 13.65, 14.85] },
  { code: "BS", name: "Basel-Stadt", rates: [8.40, 10.35, 11.25, 12.15, 13.70, 14.90] },
  { code: "BE", name: "Bern", rates: [8.65, 10.65, 11.55, 12.45, 14.00, 15.25] },
  { code: "VD", name: "Vaud", rates: [8.80, 10.85, 11.80, 12.70, 14.30, 15.55] },
  { code: "BL", name: "Basel-Land.", rates: [8.95, 11.00, 11.95, 12.85, 14.45, 15.70] },
  { code: "GE", name: "Genève", rates: [9.20, 11.30, 12.25, 13.20, 14.85, 16.15] },
];

const SOCIAL_RATE = 11.8; // AHV + ALV + NBU + KTG + Vollzug + BVG approximate

const BRACKETS = [4000, 5000, 5500, 6000, 7000, 8000];

function getQuellensteuerRate(rates: number[], salary: number): number {
  if (salary <= BRACKETS[0]) return rates[0];
  if (salary >= BRACKETS[BRACKETS.length - 1]) return rates[rates.length - 1];
  
  for (let i = 0; i < BRACKETS.length - 1; i++) {
    if (salary >= BRACKETS[i] && salary < BRACKETS[i + 1]) {
      const ratio = (salary - BRACKETS[i]) / (BRACKETS[i + 1] - BRACKETS[i]);
      return rates[i] + ratio * (rates[i + 1] - rates[i]);
    }
  }
  return rates[rates.length - 1];
}

export default function TaxCalculator() {
  const [salary, setSalary] = useState(5500);
  const [showAll, setShowAll] = useState(false);

  const results = CANTONS.map((c) => {
    const qRate = getQuellensteuerRate(c.rates, salary);
    const quellensteuer = salary * (qRate / 100);
    const socialDeductions = salary * (SOCIAL_RATE / 100);
    const totalDeductions = quellensteuer + socialDeductions;
    const netSalary = salary - totalDeductions;
    const totalRate = qRate + SOCIAL_RATE;
    return { ...c, qRate, quellensteuer, socialDeductions, totalDeductions, netSalary, totalRate };
  }).sort((a, b) => a.qRate - b.qRate);

  const displayed = showAll ? results : results.slice(0, 8);
  const best = results[0];
  const worst = results[results.length - 1];

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-br from-blue-500/[0.08] to-purple-500/[0.04] rounded-2xl p-5 border border-blue-500/[0.12] mb-4">
        <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          🧮 Kalkulačka čisté mzdy
        </h2>
        <p className="text-[12px] text-gray-400 mb-5">Zadej hrubou měsíční mzdu a uvidíš reálné srážky v každém kantonu (tarif A0N – svobodný, bez církevní daně)</p>

        {/* Salary Input */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300 font-medium">Hrubá mzda</span>
            <div className="bg-white/[0.06] rounded-lg px-3 py-1.5 border border-white/[0.1]">
              <span className="text-white font-bold text-lg font-mono">{salary.toLocaleString("de-CH")}</span>
              <span className="text-gray-400 text-sm ml-1">CHF</span>
            </div>
          </div>
          <input
            type="range"
            min={3000}
            max={12000}
            step={100}
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${((salary - 3000) / 9000) * 100}%, rgba(255,255,255,0.08) ${((salary - 3000) / 9000) * 100}%, rgba(255,255,255,0.08) 100%)`,
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-600">3 000 CHF</span>
            <span className="text-[10px] text-gray-600">12 000 CHF</span>
          </div>
        </div>

        {/* Quick comparison */}
        <div className="grid grid-cols-2 gap-2 mt-5">
          <div className="bg-green-500/[0.08] rounded-xl p-3 border border-green-500/[0.1]">
            <p className="text-[10px] text-green-400/70 uppercase tracking-wider font-semibold mb-1">Nejvíc dostaneš v</p>
            <p className="text-white font-bold text-sm">{best.name}</p>
            <p className="text-green-400 font-bold text-lg font-mono">{Math.round(best.netSalary).toLocaleString("de-CH")} <span className="text-xs font-normal">CHF</span></p>
            <p className="text-[10px] text-gray-500">Daň: {best.qRate.toFixed(1)} %</p>
          </div>
          <div className="bg-red-500/[0.08] rounded-xl p-3 border border-red-500/[0.1]">
            <p className="text-[10px] text-red-400/70 uppercase tracking-wider font-semibold mb-1">Nejméně dostaneš v</p>
            <p className="text-white font-bold text-sm">{worst.name}</p>
            <p className="text-red-400 font-bold text-lg font-mono">{Math.round(worst.netSalary).toLocaleString("de-CH")} <span className="text-xs font-normal">CHF</span></p>
            <p className="text-[10px] text-gray-500">Daň: {worst.qRate.toFixed(1)} %</p>
          </div>
        </div>
        <div className="mt-3 bg-yellow-500/[0.06] rounded-lg px-3 py-2 border border-yellow-500/[0.08]">
          <p className="text-[11px] text-yellow-400 font-medium text-center">
            💡 Rozdíl: <span className="font-bold">{Math.round(best.netSalary - worst.netSalary).toLocaleString("de-CH")} CHF/měsíc</span> = <span className="font-bold">{Math.round((best.netSalary - worst.netSalary) * 12).toLocaleString("de-CH")} CHF/rok</span>
          </p>
        </div>
      </div>

      {/* Results table */}
      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">Kanton</span>
          <div className="flex gap-8">
            <span className="text-xs text-gray-400 font-medium">Daň</span>
            <span className="text-xs text-gray-400 font-medium w-20 text-right">Čistá mzda</span>
          </div>
        </div>
        {displayed.map((r, i) => {
          const barWidth = Math.max(4, (r.qRate / 17) * 100);
          const barColor = r.qRate < 6 ? "bg-green-500" : r.qRate < 9 ? "bg-yellow-500" : r.qRate < 12 ? "bg-orange-500" : "bg-red-500";
          return (
            <div key={r.code} className={`px-4 py-3 flex items-center justify-between ${i < displayed.length - 1 ? "border-b border-white/[0.04]" : ""} hover:bg-white/[0.02] transition-colors`}>
              <div className="flex items-center gap-3 flex-1">
                <span className="text-[11px] text-gray-600 font-mono w-5">{i + 1}.</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{r.name}</p>
                  <div className="mt-1 h-1 rounded-full bg-white/[0.04] overflow-hidden w-24">
                    <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${barWidth}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className={`text-xs font-mono font-bold ${r.qRate < 6 ? "text-green-400" : r.qRate < 9 ? "text-yellow-400" : r.qRate < 12 ? "text-orange-400" : "text-red-400"}`}>
                  {r.qRate.toFixed(1)} %
                </span>
                <span className="text-sm font-bold text-white font-mono w-20 text-right">
                  {Math.round(r.netSalary).toLocaleString("de-CH")}
                </span>
              </div>
            </div>
          );
        })}
        {!showAll && (
          <button onClick={() => setShowAll(true)} className="w-full px-4 py-3 bg-white/[0.02] border-t border-white/[0.04] text-center hover:bg-white/[0.04] transition-colors">
            <span className="text-[13px] font-semibold text-gray-400">Zobrazit všech 26 kantonů ↓</span>
          </button>
        )}
      </div>

      <p className="text-[10px] text-gray-600 mt-3 text-center">
        * Orientační výpočet pro tarif A0N (svobodný, bez dětí, bez církevní daně). Sociální odvody ~{SOCIAL_RATE}%. Pro přesný výpočet použijte oficiální kantonální kalkulačky.
      </p>
    </div>
  );
}
