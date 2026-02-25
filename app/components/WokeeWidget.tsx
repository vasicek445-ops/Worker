"use client";
import { useState } from "react";
import Link from "next/link";

const QUICK_QUESTIONS = [
  "Jak získat pracovní povolení?",
  "Kolik se vydělá ve stavebnictví?",
  "Jak najít bydlení v Zürichu?",
  "Jakou úroveň němčiny potřebuji?",
  "Jak funguje zdravotní pojištění?",
];

export default function WokeeWidget() {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div onClick={() => setExpanded(true)} className="cursor-pointer group">
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden transition-all duration-200 hover:bg-white/[0.05] hover:border-purple-500/20">
          <div className="px-4 py-3.5 flex items-center justify-between border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-base shadow-lg shadow-purple-500/25">🤖</div>
              <div>
                <p className="text-white text-sm font-semibold">Wokee asistent</p>
                <p className="text-purple-400 text-[11px] font-medium">Online 24/7</p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="bg-purple-500/[0.08] rounded-xl rounded-bl-sm px-3.5 py-2.5 max-w-[85%] border border-purple-500/10">
              <p className="text-[13px] text-gray-300 leading-relaxed">Ahoj! 👋 Jsem Wokee, tvůj asistent pro práci ve Švýcarsku. Poradím ti s povolením, bydlením i hledáním práce.</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["Jak získat povolení?", "Průměrné platy?", "Kde bydlet?"].map((q, i) => (
                <span key={i} className="text-[11px] text-gray-400 bg-white/[0.05] px-2.5 py-1.5 rounded-lg border border-white/[0.06] font-medium">{q}</span>
              ))}
            </div>
          </div>
          <div className="px-4 py-3 bg-purple-500/[0.04] border-t border-purple-500/[0.08] flex items-center justify-center">
            <span className="text-[13px] font-semibold text-purple-400 group-hover:text-purple-300 transition-colors">Otevřít chat →</span>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="fixed inset-0 z-[200] bg-[#0a0a0c] flex flex-col max-w-lg mx-auto" style={{animation: "fadeUp 0.3s ease-out"}}>
          <div className="px-5 py-4 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-lg shadow-lg shadow-purple-500/25">🤖</div>
              <div>
                <p className="text-white text-base font-bold">Wokee</p>
                <p className="text-green-400 text-xs font-medium">Online</p>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setExpanded(false); }} className="w-9 h-9 rounded-[10px] bg-white/[0.06] flex items-center justify-center text-gray-500 hover:bg-white/[0.1] transition-colors text-lg">✕</button>
          </div>
          <div className="flex-1 px-5 py-5 overflow-y-auto flex flex-col gap-5">
            <div className="bg-purple-500/[0.08] rounded-2xl rounded-bl-sm px-4 py-3.5 max-w-[85%] border border-purple-500/10">
              <p className="text-sm text-gray-200 leading-relaxed">Ahoj! 👋 Jsem <span className="text-purple-300 font-semibold">Wokee</span>, tvůj osobní asistent pro práci ve Švýcarsku.</p>
              <p className="text-sm text-gray-200 leading-relaxed mt-2">Poradím ti s čímkoliv – od pracovních povolení, přes hledání bytu, až po daňové přiznání. Na co se chceš zeptat?</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[11px] text-gray-600 font-medium uppercase tracking-wider">Časté dotazy</p>
              {QUICK_QUESTIONS.map((q, i) => (
                <Link key={i} href={`/asistent?q=${encodeURIComponent(q)}`} className="bg-white/[0.04] rounded-xl px-3.5 py-3 border border-white/[0.06] text-[13px] text-gray-300 font-medium hover:bg-purple-500/[0.08] hover:border-purple-500/[0.15] transition-all duration-150">{q}</Link>
              ))}
            </div>
          </div>
          <div className="px-5 py-4 pb-6 border-t border-white/[0.06] bg-white/[0.02]">
            <Link href="/asistent" className="flex items-center gap-3 bg-white/[0.05] rounded-xl px-4 py-3 border border-white/[0.08]">
              <span className="text-gray-500 text-sm flex-1">Napiš svůj dotaz...</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center text-white text-sm shadow-lg shadow-purple-500/30">↑</div>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
