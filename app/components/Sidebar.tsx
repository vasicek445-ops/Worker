"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSubscription } from "../../hooks/useSubscription";
import { supabase } from "../supabase";

export default function Sidebar() {
  const pathname = usePathname();
  const { isActive } = useSubscription();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  // Auto-expand tools if on a tools page
  useEffect(() => {
    if (pathname?.startsWith("/pruvodce") || pathname?.startsWith("/jazyky")) {
      setToolsOpen(true);
    }
  }, [pathname]);

  const isActive2 = (href: string) => pathname === href;
  const isToolsActive = pathname?.startsWith("/pruvodce") || pathname?.startsWith("/jazyky");

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Uživatel";
  const userInitial = displayName.charAt(0).toUpperCase();

  const linkClass = (href: string) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm no-underline ${
      isActive2(href)
        ? "bg-white/[0.08] text-white font-semibold"
        : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
    }`;

  const subLinkClass = (href: string) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-[13px] no-underline ml-2 ${
      isActive2(href)
        ? "bg-white/[0.06] text-white font-medium"
        : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]"
    }`;

  // Don't render on login/register pages
  if (pathname === "/login" || pathname === "/registrace" || pathname === "/auth/callback" || pathname === "/pricing") {
    return null;
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#0a0a12] border-r border-white/[0.06] flex flex-col z-50 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E8302A] to-orange-500 flex items-center justify-center text-white font-black text-sm">W</div>
          <span className="text-white font-extrabold text-lg tracking-tight">Woker</span>
        </Link>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 space-y-1">
        <Link href="/dashboard" className={linkClass("/dashboard")}>
          <span className="text-lg">🏠</span>
          <span>Domů</span>
        </Link>

        <Link href="/kontakty" className={linkClass("/kontakty")}>
          <span className="text-lg">📇</span>
          <span>Kontakty</span>
          <span className="ml-auto text-[10px] bg-[#39ff6e]/10 text-[#39ff6e] font-bold px-2 py-0.5 rounded-full">1007</span>
        </Link>

        {/* Tools - expandable */}
        <div>
          <button
            onClick={() => setToolsOpen(!toolsOpen)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
              isToolsActive
                ? "bg-white/[0.08] text-white font-semibold"
                : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <span className="text-lg">🛠️</span>
            <span>Nástroje</span>
            <span className={`ml-auto text-xs transition-transform ${toolsOpen ? "rotate-180" : ""}`}>▾</span>
          </button>

          {toolsOpen && (
            <div className="mt-1 space-y-0.5">
              {/* Pred odjezdem */}
              <div className="px-3 pt-2 pb-1">
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Před odjezdem</span>
              </div>
              <Link href="/pruvodce/povoleni" className={subLinkClass("/pruvodce/povoleni")}>
                <span>📋</span><span>Pracovní povolení</span>
              </Link>
              <Link href="/pruvodce/pojisteni" className={subLinkClass("/pruvodce/pojisteni")}>
                <span>🏥</span><span>Zdravotní pojištění</span>
              </Link>
              <Link href="/pruvodce/dane" className={subLinkClass("/pruvodce/dane")}>
                <span>💰</span><span>Daně a pojištění</span>
              </Link>
              <Link href="/jazyky" className={subLinkClass("/jazyky")}>
                <span>🗣️</span><span>Němčina pro práci</span>
              </Link>

              {/* Hledam praci */}
              <div className="px-3 pt-3 pb-1">
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Hledám práci</span>
              </div>
              <Link href="/pruvodce/sablony/analyza" className={subLinkClass("/pruvodce/sablony/analyza")}>
                <span>📊</span><span>Analýza inzerátu</span>
                <span className="ml-auto text-[9px] bg-blue-500/15 text-blue-400 font-bold px-1.5 py-0.5 rounded">AI</span>
              </Link>
              <Link href="/pruvodce/sablony/cv" className={subLinkClass("/pruvodce/sablony/cv")}>
                <span>📝</span><span>Životopis</span>
                <span className="ml-auto text-[9px] bg-blue-500/15 text-blue-400 font-bold px-1.5 py-0.5 rounded">AI</span>
              </Link>
              <Link href="/pruvodce/sablony/motivacni-dopis" className={subLinkClass("/pruvodce/sablony/motivacni-dopis")}>
                <span>✉️</span><span>Motivační dopis</span>
                <span className="ml-auto text-[9px] bg-blue-500/15 text-blue-400 font-bold px-1.5 py-0.5 rounded">AI</span>
              </Link>
              <Link href="/pruvodce/sablony/email" className={subLinkClass("/pruvodce/sablony/email")}>
                <span>📧</span><span>Email pro HR</span>
                <span className="ml-auto text-[9px] bg-blue-500/15 text-blue-400 font-bold px-1.5 py-0.5 rounded">AI</span>
              </Link>
              <Link href="/pruvodce/sablony/pohovor" className={subLinkClass("/pruvodce/sablony/pohovor")}>
                <span>🎤</span><span>Příprava na pohovor</span>
                <span className="ml-auto text-[9px] bg-blue-500/15 text-blue-400 font-bold px-1.5 py-0.5 rounded">AI</span>
              </Link>

              {/* Uz pracuju */}
              <div className="px-3 pt-3 pb-1">
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Už pracuju</span>
              </div>
              <Link href="/pruvodce/sablony/smlouva" className={subLinkClass("/pruvodce/sablony/smlouva")}>
                <span>📑</span><span>Analýza smlouvy</span>
                <span className="ml-auto text-[9px] bg-blue-500/15 text-blue-400 font-bold px-1.5 py-0.5 rounded">AI</span>
              </Link>
              <Link href="/pruvodce/sablony/bydleni" className={subLinkClass("/pruvodce/sablony/bydleni")}>
                <span>🏠</span><span>Hledání bydlení</span>
                <span className="ml-auto text-[9px] bg-blue-500/15 text-blue-400 font-bold px-1.5 py-0.5 rounded">AI</span>
              </Link>
            </div>
          )}
        </div>

        <Link href="/komunita" className={linkClass("/komunita")}>
          <span className="text-lg">💬</span>
          <span>Komunita</span>
        </Link>

        <Link href="/asistent" className={linkClass("/asistent")}>
          <span className="text-lg">🤖</span>
          <span>AI Asistent</span>
          <span className="ml-auto w-2 h-2 rounded-full bg-[#39ff6e]"></span>
        </Link>
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-5 space-y-2">
        {/* Premium */}
        {isActive ? (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#39ff6e]/[0.06] border border-[#39ff6e]/[0.1]">
            <span className="text-lg">⭐</span>
            <div>
              <p className="text-white text-xs font-bold m-0">Premium</p>
              <p className="text-[#39ff6e] text-[10px] m-0">Aktivní</p>
            </div>
          </div>
        ) : (
          <Link href="/pricing" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#E8302A]/10 to-orange-500/10 border border-[#E8302A]/20 no-underline">
            <span className="text-lg">⚡</span>
            <div>
              <p className="text-white text-xs font-bold m-0">Aktivovat Premium</p>
              <p className="text-gray-500 text-[10px] m-0">9,90 EUR/měsíc</p>
            </div>
          </Link>
        )}

        {/* User */}
        <Link href="/profil" className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline ${isActive2("/profil") ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E8302A] to-orange-400 flex items-center justify-center text-white font-bold text-xs">{userInitial}</div>
          <div>
            <p className="text-white text-xs font-medium m-0">{displayName}</p>
            <p className="text-gray-600 text-[10px] m-0">Můj profil</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
