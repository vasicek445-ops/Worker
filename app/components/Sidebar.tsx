"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSubscription } from "../../hooks/useSubscription";
import { supabase } from "../supabase";
import { useTheme } from "../../lib/ThemeContext";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();
  const { isActive } = useSubscription();
  const { theme, toggleTheme } = useTheme();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase.from("profiles").select("avatar_url").eq("id", user.id).single()
          .then(({ data }) => { if (data?.avatar_url) setAvatarUrl(data.avatar_url); });
      }
    });
  }, []);

  useEffect(() => {
    if (pathname?.startsWith("/pruvodce") || pathname?.startsWith("/jazyky")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToolsOpen(true);
    }
  }, [pathname]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    if (mobileOpen) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActivePath = (href: string) => pathname === href;
  const isToolsActive = pathname?.startsWith("/pruvodce") || pathname?.startsWith("/jazyky");
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Uživatel";
  const userInitial = displayName.charAt(0).toUpperCase();

  const linkClass = (href: string) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm no-underline ${
      isActivePath(href)
        ? "bg-[#39ff6e]/[0.08] text-white font-semibold border border-[#39ff6e]/[0.12] shadow-[0_0_12px_rgba(57,255,110,0.04)]"
        : "text-white/40 hover:text-white hover:bg-white/[0.04] border border-transparent"
    }`;

  const subLinkClass = (href: string) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-[13px] no-underline ml-2 ${
      isActivePath(href)
        ? "bg-[#39ff6e]/[0.06] text-white font-medium border border-[#39ff6e]/[0.08]"
        : "text-white/30 hover:text-white/60 hover:bg-white/[0.03] border border-transparent"
    }`;

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 no-underline group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#39ff6e] to-[#2bcc58] flex items-center justify-center text-[#0a0a12] font-black text-sm shadow-[0_0_20px_rgba(57,255,110,0.15)] group-hover:shadow-[0_0_25px_rgba(57,255,110,0.25)] transition-all">W</div>
          <span className="text-white font-extrabold text-lg tracking-tight">Woker</span>
        </Link>
        <button onClick={() => setMobileOpen(false)} className="md:hidden text-white/30 hover:text-white p-1 transition">✕</button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <Link href="/dashboard" className={linkClass("/dashboard")}>
          <span className="text-lg">🏠</span>
          <span>Domů</span>
        </Link>

        <Link href="/nabidky" className={linkClass("/nabidky")}>
          <span className="text-lg">💼</span>
          <span>Nabídky práce</span>
          <span className="ml-auto text-[9px] bg-orange-500/15 text-orange-400 font-bold px-1.5 py-0.5 rounded-full">Nové</span>
        </Link>

        <Link href="/bydleni" className={linkClass("/bydleni")}>
          <span className="text-lg">🏠</span>
          <span>Bydlení</span>
          <span className="ml-auto text-[9px] bg-blue-500/15 text-blue-400 font-bold px-1.5 py-0.5 rounded-full">Nové</span>
        </Link>

        <Link href="/kontakty" className={linkClass("/kontakty")}>
          <span className="text-lg">📇</span>
          <span>Kontakty</span>
          <span className="ml-auto text-[10px] bg-[#39ff6e]/10 text-[#39ff6e] font-bold px-2 py-0.5 rounded-full">1007</span>
        </Link>

        <Link href="/prihlasky" className={linkClass("/prihlasky")}>
          <span className="text-lg">✉️</span>
          <span>Moje přihlášky</span>
        </Link>

        <Link href="/dokumenty" className={linkClass("/dokumenty")}>
          <span className="text-lg">📄</span>
          <span>Moje dokumenty</span>
        </Link>

        {/* Tools - expandable */}
        <div>
          <button
            onClick={() => setToolsOpen(!toolsOpen)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
              isToolsActive
                ? "bg-[#39ff6e]/[0.08] text-white font-semibold border border-[#39ff6e]/[0.12]"
                : "text-white/40 hover:text-white hover:bg-white/[0.04] border border-transparent"
            }`}
          >
            <span className="text-lg">🛠️</span>
            <span>Nástroje</span>
            <span className={`ml-auto text-[10px] text-white/20 transition-transform ${toolsOpen ? "rotate-180" : ""}`}>▾</span>
          </button>

          {toolsOpen && (
            <div className="mt-1.5 space-y-0.5">
              {/* Před odjezdem */}
              <div className="px-4 pt-3 pb-1.5">
                <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Před odjezdem</span>
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
                <span className="ml-auto text-[9px] bg-[#39ff6e]/10 text-[#39ff6e]/60 font-bold px-1.5 py-0.5 rounded-full">AI</span>
              </Link>

              {/* Hledám práci */}
              <div className="px-4 pt-4 pb-1.5">
                <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Hledám práci</span>
              </div>
              <Link href="/pruvodce/matching" className={subLinkClass("/pruvodce/matching")}>
                <span>🎯</span><span>Smart Matching</span>
                <span className="ml-auto text-[9px] bg-[#39ff6e]/10 text-[#39ff6e]/60 font-bold px-1.5 py-0.5 rounded-full">AI</span>
              </Link>
              <Link href="/pruvodce/sablony/analyza" className={subLinkClass("/pruvodce/sablony/analyza")}>
                <span>📊</span><span>Analýza inzerátu</span>
                <span className="ml-auto text-[9px] bg-[#39ff6e]/10 text-[#39ff6e]/60 font-bold px-1.5 py-0.5 rounded-full">AI</span>
              </Link>
              <Link href="/pruvodce/sablony/cv" className={subLinkClass("/pruvodce/sablony/cv")}>
                <span>📝</span><span>Životopis</span>
                <span className="ml-auto text-[9px] bg-[#39ff6e]/10 text-[#39ff6e]/60 font-bold px-1.5 py-0.5 rounded-full">AI</span>
              </Link>
              <Link href="/pruvodce/sablony/motivacni-dopis" className={subLinkClass("/pruvodce/sablony/motivacni-dopis")}>
                <span>✉️</span><span>Motivační dopis</span>
                <span className="ml-auto text-[9px] bg-[#39ff6e]/10 text-[#39ff6e]/60 font-bold px-1.5 py-0.5 rounded-full">AI</span>
              </Link>
              <Link href="/pruvodce/sablony/email" className={subLinkClass("/pruvodce/sablony/email")}>
                <span>📧</span><span>Email pro HR</span>
                <span className="ml-auto text-[9px] bg-[#39ff6e]/10 text-[#39ff6e]/60 font-bold px-1.5 py-0.5 rounded-full">AI</span>
              </Link>
              <Link href="/pruvodce/sablony/pohovor" className={subLinkClass("/pruvodce/sablony/pohovor")}>
                <span>🎤</span><span>Příprava na pohovor</span>
                <span className="ml-auto text-[9px] bg-[#39ff6e]/10 text-[#39ff6e]/60 font-bold px-1.5 py-0.5 rounded-full">AI</span>
              </Link>

              {/* Už pracuju */}
              <div className="px-4 pt-4 pb-1.5">
                <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Už pracuju</span>
              </div>
              <Link href="/pruvodce/sablony/smlouva" className={subLinkClass("/pruvodce/sablony/smlouva")}>
                <span>📑</span><span>Analýza smlouvy</span>
                <span className="ml-auto text-[9px] bg-[#39ff6e]/10 text-[#39ff6e]/60 font-bold px-1.5 py-0.5 rounded-full">AI</span>
              </Link>
              <Link href="/pruvodce/sablony/bydleni" className={subLinkClass("/pruvodce/sablony/bydleni")}>
                <span>🏠</span><span>Hledání bydlení</span>
                <span className="ml-auto text-[9px] bg-[#39ff6e]/10 text-[#39ff6e]/60 font-bold px-1.5 py-0.5 rounded-full">AI</span>
              </Link>
            </div>
          )}
        </div>

        <Link href="/komunita" className={linkClass("/komunita")}>
          <span className="text-lg">💬</span>
          <span>Komunita</span>
        </Link>

        <Link href="/dashboard#wooky" className={linkClass("/asistent")}>
          <Image src="/images/3d/wooky-wave-sm.png" alt="" width={20} height={20} className="flex-shrink-0 rounded-sm" />
          <span>Wooky AI</span>
          <span className="ml-auto w-2 h-2 rounded-full bg-[#39ff6e] shadow-[0_0_8px_rgba(57,255,110,0.4)]"></span>
        </Link>
      </nav>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="flex items-center gap-3 px-3 py-2.5 mx-3 mb-2 rounded-xl text-sm text-white/30 hover:text-white hover:bg-white/[0.04] transition-all border border-transparent"
      >
        <span className="text-lg">{theme === "dark" ? "☀️" : "🌙"}</span>
        <span>{theme === "dark" ? "Světlý režim" : "Tmavý režim"}</span>
      </button>

      {/* Bottom section */}
      <div className="px-3 pb-5 space-y-2">
        {isActive ? (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#39ff6e]/[0.04] border border-[#39ff6e]/[0.1] shadow-[0_0_15px_rgba(57,255,110,0.03)]">
            <span className="text-lg">⭐</span>
            <div>
              <p className="text-white text-xs font-bold m-0">Premium</p>
              <p className="text-[#39ff6e]/70 text-[10px] m-0">Aktivní</p>
            </div>
          </div>
        ) : (
          <Link href="/pricing" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#39ff6e]/[0.06] to-[#2bcc58]/[0.04] border border-[#39ff6e]/[0.12] no-underline hover:border-[#39ff6e]/[0.2] hover:shadow-[0_0_20px_rgba(57,255,110,0.06)] transition-all">
            <span className="text-lg">⚡</span>
            <div>
              <p className="text-white text-xs font-bold m-0">Aktivovat Premium</p>
              <p className="text-white/25 text-[10px] m-0">9,90 EUR/měsíc</p>
            </div>
          </Link>
        )}

        <Link href="/profil" className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl no-underline transition-all ${isActivePath("/profil") ? "bg-white/[0.06] border border-white/[0.08]" : "hover:bg-white/[0.04] border border-transparent"}`}>
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#39ff6e] to-[#2bcc58] flex items-center justify-center text-[#0a0a12] font-bold text-xs shadow-[0_0_12px_rgba(57,255,110,0.15)]">{userInitial}</div>
          )}
          <div>
            <p className="text-white text-xs font-medium m-0">{displayName}</p>
            <p className="text-white/20 text-[10px] m-0">Můj profil</p>
          </div>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-[60] bg-[#111120]/90 backdrop-blur-sm border border-white/[0.08] rounded-xl p-2.5 text-white shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
        style={{ display: mobileOpen ? 'none' : 'block' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 bottom-0 w-[260px] flex flex-col z-[80] overflow-y-auto
        transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
        style={{ background: 'linear-gradient(180deg, #0d0d1a 0%, #0a0a12 50%, #080812 100%)', borderRight: '1px solid rgba(255,255,255,0.04)' }}
      >
        {/* Subtle ambient glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#39ff6e]/[0.03] blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute bottom-20 left-0 w-24 h-24 bg-[#643cff]/[0.04] blur-[50px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col flex-1">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}
