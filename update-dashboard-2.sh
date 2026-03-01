cd ~/path-to-woker#!/bin/bash
echo "🎨 Updating Woker Dashboard..."

# ============================================
# 1. Create Wokee Widget Component (Client)
# ============================================
cat > app/components/WokeeWidget.tsx << 'WOKEE_EOF'
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
      {/* Mini Widget */}
      <div
        onClick={() => setExpanded(true)}
        className="cursor-pointer group"
      >
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden transition-all duration-200 hover:bg-white/[0.05] hover:border-purple-500/20">
          {/* Header */}
          <div className="px-4 py-3.5 flex items-center justify-between border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-base shadow-lg shadow-purple-500/25">
                🤖
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Wokee asistent</p>
                <p className="text-purple-400 text-[11px] font-medium">Online 24/7</p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
          </div>

          {/* Preview Message */}
          <div className="p-4 flex flex-col gap-3">
            <div className="bg-purple-500/[0.08] rounded-xl rounded-bl-sm px-3.5 py-2.5 max-w-[85%] border border-purple-500/10">
              <p className="text-[13px] text-gray-300 leading-relaxed">
                Ahoj! 👋 Jsem Wokee, tvůj asistent pro práci ve Švýcarsku. Poradím ti s povolením, bydlením i hledáním práce.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["Jak získat povolení?", "Průměrné platy?", "Kde bydlet?"].map((q, i) => (
                <span
                  key={i}
                  className="text-[11px] text-gray-400 bg-white/[0.05] px-2.5 py-1.5 rounded-lg border border-white/[0.06] font-medium"
                >
                  {q}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="px-4 py-3 bg-purple-500/[0.04] border-t border-purple-500/[0.08] flex items-center justify-center gap-1.5">
            <span className="text-[13px] font-semibold text-purple-400 group-hover:text-purple-300 transition-colors">
              Otevřít chat →
            </span>
          </div>
        </div>
      </div>

      {/* Full Screen Chat */}
      {expanded && (
        <div className="fixed inset-0 z-[200] bg-[#0a0a0c] flex flex-col max-w-lg mx-auto animate-[fadeUp_0.3s_ease-out]">
          {/* Chat Header */}
          <div className="px-5 py-4 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-lg shadow-lg shadow-purple-500/25">
                🤖
              </div>
              <div>
                <p className="text-white text-base font-bold">Wokee</p>
                <p className="text-green-400 text-xs font-medium">Online</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
              className="w-9 h-9 rounded-[10px] bg-white/[0.06] flex items-center justify-center text-gray-500 hover:bg-white/[0.1] transition-colors text-lg"
            >
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 px-5 py-5 overflow-y-auto flex flex-col gap-5">
            <div className="bg-purple-500/[0.08] rounded-2xl rounded-bl-sm px-4 py-3.5 max-w-[85%] border border-purple-500/10">
              <p className="text-sm text-gray-200 leading-relaxed">
                Ahoj! 👋 Jsem <span className="text-purple-300 font-semibold">Wokee</span>, tvůj osobní asistent pro práci ve Švýcarsku.
              </p>
              <p className="text-sm text-gray-200 leading-relaxed mt-2">
                Poradím ti s čímkoliv – od pracovních povolení, přes hledání bytu, až po daňové přiznání. Na co se chceš zeptat?
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[11px] text-gray-600 font-medium uppercase tracking-wider">
                Časté dotazy
              </p>
              {QUICK_QUESTIONS.map((q, i) => (
                <Link
                  key={i}
                  href={`/asistent?q=${encodeURIComponent(q)}`}
                  className="bg-white/[0.04] rounded-xl px-3.5 py-3 border border-white/[0.06] text-[13px] text-gray-300 font-medium hover:bg-purple-500/[0.08] hover:border-purple-500/[0.15] transition-all duration-150"
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <div className="px-5 py-4 pb-6 border-t border-white/[0.06] bg-white/[0.02]">
            <Link
              href="/asistent"
              className="flex items-center gap-3 bg-white/[0.05] rounded-xl px-4 py-3 border border-white/[0.08]"
            >
              <span className="text-gray-500 text-sm flex-1">Napiš svůj dotaz...</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center text-white text-sm shadow-lg shadow-purple-500/30 flex-shrink-0">
                ↑
              </div>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
WOKEE_EOF

# ============================================
# 2. Create New Dashboard Page
# ============================================
cat > app/dashboard/page.tsx << 'DASHBOARD_EOF'
import Link from "next/link";
import { supabase } from "../supabase";
import WokeeWidget from "../components/WokeeWidget";

export const dynamic = 'force-dynamic';

async function getAgencyCount() {
  const { count } = await supabase
    .from("agencies")
    .select("*", { count: "exact", head: true });
  return count || 0;
}

async function getAgencyPreview() {
  const { data } = await supabase
    .from("agencies")
    .select("name, city, canton, language_region")
    .limit(5);
  return data || [];
}

export default async function Dashboard() {
  const agencyCount = await getAgencyCount();
  const agencies = await getAgencyPreview();

  const guides = [
    { icon: "📋", title: "Pracovní povolení", desc: "Typy povolení, jak získat", tag: "Důležité", tagColor: "red", href: "/pruvodce" },
    { icon: "🏠", title: "Bydlení", desc: "Jak najít byt, ceny, tipy", tag: "Populární", tagColor: "blue", href: "/pruvodce" },
    { icon: "💰", title: "Daně a pojištění", desc: "Systém daní, povinné pojištění", tag: "Nové", tagColor: "green", href: "/pruvodce" },
    { icon: "🗣️", title: "Němčina pro práci", desc: "Fráze, testy, kurzy", tag: "Doporučeno", tagColor: "blue", href: "/jazyky" },
  ];

  const tagStyles: Record<string, string> = {
    red: "text-red-400 bg-red-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    green: "text-green-400 bg-green-500/10",
  };

  const langFlag: Record<string, string> = {
    de: "🇩🇪",
    fr: "🇫🇷",
    it: "🇮🇹",
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] pb-24">
      {/* Ambient Glow */}
      <div className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(239,68,68,0.06)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* Header */}
      <div className="relative z-10 px-5 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-gray-500 font-medium tracking-wide">Ahoj 👋</p>
            <h1 className="text-[22px] font-bold text-white mt-0.5 tracking-tight">Vítej ve Wokeru</h1>
          </div>
          <Link
            href="/profil"
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-base font-bold shadow-lg shadow-red-500/30"
          >
            W
          </Link>
        </div>

        {/* Search */}
        <div className="mt-5 bg-white/[0.04] rounded-[14px] px-4 py-3 flex items-center gap-3 border border-white/[0.06] transition-all duration-200 focus-within:bg-white/[0.08] focus-within:border-red-500/30">
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-gray-500 text-sm">Hledat agenturu, město, pozici...</span>
        </div>
      </div>

      {/* ================================= */}
      {/* 1. KONTAKTY NA AGENTURY           */}
      {/* ================================= */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-[15px]">📇</span>
            <span className="text-[15px] font-semibold text-white tracking-tight">Kontakty na agentury</span>
          </div>
          <Link href="/kontakty" className="text-xs text-red-500 font-medium hover:text-red-400 transition-colors">
            {agencyCount.toLocaleString("cs-CZ")} agentur →
          </Link>
        </div>

        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
          {agencies.map((a: any, i: number) => (
            <Link
              key={i}
              href="/kontakty"
              className={`px-4 py-3.5 flex items-center justify-between hover:bg-white/[0.04] transition-colors ${
                i < agencies.length - 1 ? "border-b border-white/[0.04]" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-red-500/[0.08] flex items-center justify-center text-sm font-semibold text-red-400 border border-red-500/[0.12]">
                  {a.name?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{a.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{a.city} • {a.canton}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{langFlag[a.language_region] || "🇨🇭"}</span>
                <span className="text-sm text-gray-700">›</span>
              </div>
            </Link>
          ))}

          <Link
            href="/kontakty"
            className="block px-4 py-3 bg-red-500/[0.04] border-t border-red-500/[0.08] text-center hover:bg-red-500/[0.08] transition-colors"
          >
            <span className="text-[13px] font-semibold text-red-500">
              Zobrazit všechny agentury
            </span>
          </Link>
        </div>
      </div>

      {/* ================================= */}
      {/* 2. PRŮVODCE ŠVÝCARSKEM            */}
      {/* ================================= */}
      <div className="px-5 mt-7">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-[15px]">📖</span>
            <span className="text-[15px] font-semibold text-white">Průvodce Švýcarskem</span>
          </div>
          <Link href="/pruvodce" className="text-xs text-gray-500 font-medium hover:text-gray-400 transition-colors">
            Vše →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {guides.map((g, i) => (
            <Link
              key={i}
              href={g.href}
              className="bg-white/[0.03] rounded-[14px] p-4 border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <div className="text-2xl mb-2.5">{g.icon}</div>
              <p className="text-[13px] font-semibold text-white mb-1 leading-tight">{g.title}</p>
              <p className="text-[11px] text-gray-500 leading-relaxed mb-2">{g.desc}</p>
              <span className={`text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wider ${tagStyles[g.tagColor]}`}>
                {g.tag}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ================================= */}
      {/* 3. PREMIUM CTA                    */}
      {/* ================================= */}
      <div className="px-5 mt-7">
        <Link href="/pricing" className="block">
          <div className="bg-gradient-to-br from-red-500/[0.12] to-red-500/[0.04] rounded-2xl p-5 border border-red-500/[0.15] relative overflow-hidden group hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] transition-shadow duration-300">
            {/* Dot pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⭐</span>
                <span className="text-sm font-bold text-white tracking-tight">Woker Premium</span>
              </div>
              <p className="text-[13px] text-gray-400 leading-relaxed mb-4">
                Odemkni 1 000+ kontaktů, prémiové průvodce a AI asistenta za práci ve Švýcarsku.
              </p>
              <div className="flex items-center gap-3">
                <div className="bg-red-500 text-white px-5 py-2.5 rounded-[10px] text-[13px] font-semibold shadow-lg shadow-red-500/30 group-hover:scale-[1.02] transition-transform">
                  Aktivovat za 9,90 €/měsíc
                </div>
                <span className="text-[11px] text-gray-500">7 dní zdarma</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* ================================= */}
      {/* 4. WOKEE ASISTENT                 */}
      {/* ================================= */}
      <div className="px-5 mt-7">
        <WokeeWidget />
      </div>

      {/* ================================= */}
      {/* BOTTOM NAVIGATION                 */}
      {/* ================================= */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0c]/85 backdrop-blur-xl border-t border-white/[0.06] px-2 py-2 pb-3 z-[100]">
        <div className="max-w-lg mx-auto flex justify-around items-center">
          {[
            { icon: "🏠", label: "Přehled", href: "/dashboard", active: true },
            { icon: "📇", label: "Kontakty", href: "/kontakty", active: false },
            { icon: "📖", label: "Průvodce", href: "/pruvodce", active: false },
            { icon: "💼", label: "Pozice", href: "/nabidka", active: false },
            { icon: "👤", label: "Profil", href: "/profil", active: false },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-[10px] transition-all duration-150 ${
                item.active ? "bg-red-500/[0.08]" : ""
              }`}
            >
              <span className={`text-xl transition-all duration-150 ${item.active ? "" : "grayscale opacity-50"}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] tracking-wide transition-all duration-150 ${
                item.active ? "text-red-500 font-semibold" : "text-gray-600 font-medium"
              }`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
DASHBOARD_EOF

# ============================================
# 3. Add fadeUp keyframe to global CSS
# ============================================
if ! grep -q "fadeUp" app/globals.css 2>/dev/null; then
  cat >> app/globals.css << 'CSS_EOF'

/* Woker Dashboard Animations */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-\[fadeUp_0\.3s_ease-out\] {
  animation: fadeUp 0.3s ease-out;
}
CSS_EOF
  echo "✅ Added fadeUp animation to globals.css"
fi

echo ""
echo "═══════════════════════════════════════"
echo "✅ Dashboard updated!"
echo "═══════════════════════════════════════"
echo ""
echo "📁 Files modified/created:"
echo "  • app/dashboard/page.tsx (new dashboard)"
echo "  • app/components/WokeeWidget.tsx (chat widget)"
echo "  • app/globals.css (animation)"
echo ""
echo "🚀 Run:"
echo "  git add -A && git commit -m 'feat: redesign dashboard - Vercel/Raycast style' && git push"
echo ""
