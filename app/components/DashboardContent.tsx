"use client";
import Link from "next/link";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import WokeeWidget from "./WokeeWidget";
import type { Agency } from "../../lib/types";

const langFlag: Record<string, string> = { de: "🇩🇪", fr: "🇫🇷", it: "🇮🇹" };

interface Props {
  agencyCount: number;
  agencies: Agency[];
}

export default function DashboardContent({ agencyCount, agencies }: Props) {
  const { t } = useLanguage();

  const guides = [
    { icon: "📋", title: t.guides.permits_title, desc: t.guides.permits_desc, tag: t.tags.important, tagColor: "text-red-400", tagBg: "bg-red-500/10", href: "/pruvodce/povoleni", gradient: "bg-gradient-to-br from-red-500/[0.08] to-red-500/[0.02]", borderColor: "border-red-500/[0.12]" },
    { icon: "🏥", title: t.guides.insurance_title, desc: t.guides.insurance_desc, tag: t.tags.popular, tagColor: "text-blue-400", tagBg: "bg-blue-500/10", href: "/pruvodce/pojisteni", gradient: "bg-gradient-to-br from-blue-500/[0.08] to-blue-500/[0.02]", borderColor: "border-blue-500/[0.12]" },
    { icon: "💰", title: t.guides.tax_title, desc: t.guides.tax_desc, tag: t.tags.new_tag, tagColor: "text-green-400", tagBg: "bg-green-500/10", href: "/pruvodce/dane", gradient: "bg-gradient-to-br from-green-400/[0.08] to-green-400/[0.02]", borderColor: "border-green-400/[0.12]" },
    { icon: "🗣️", title: t.guides.language_title, desc: t.guides.language_desc, tag: t.tags.recommended, tagColor: "text-purple-400", tagBg: "bg-purple-400/10", href: "/jazyky", gradient: "bg-gradient-to-br from-purple-400/[0.08] to-purple-400/[0.02]", borderColor: "border-purple-400/[0.12]" },
  ];

  const navItems = [
    { icon: "🏠", label: t.nav.overview, href: "/dashboard", active: true },
    { icon: "📇", label: t.nav.contacts, href: "/kontakty", active: false },
    { icon: "📖", label: t.nav.guide, href: "/pruvodce", active: false },
    { icon: "💼", label: t.nav.jobs, href: "/nabidka", active: false },
    { icon: "👤", label: t.nav.profile, href: "/profil", active: false },
  ];

  const stats = [
    { value: agencyCount.toLocaleString(), label: t.dashboard.agencies_count, icon: "🏢" },
    { value: "26", label: "Kantonů", icon: "📍" },
    { value: "3", label: "Jazyky", icon: "🌐" },
    { value: "24/7", label: "AI", icon: "🤖" },
  ];

  return (
    <>
      <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');`}</style>
      <main className="min-h-screen bg-[#0a0a12] pb-[100px] relative overflow-visible" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
        {/* Background effects */}
        <div className="fixed w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none z-0 opacity-20 -top-[200px] -right-[200px]" style={{ background: "radial-gradient(circle, rgba(57,255,110,0.2), transparent 70%)" }} />
        <div className="fixed w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none z-0 opacity-15 bottom-[100px] -left-[150px]" style={{ background: "radial-gradient(circle, rgba(100,60,255,0.15), transparent 70%)" }} />
        <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px", maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)" }} />

        {/* Header */}
        <div className="relative z-50 px-5 pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/35 font-medium tracking-wide uppercase m-0">{t.dashboard.greeting}</p>
              <h1 className="text-2xl font-extrabold text-white mt-1 tracking-tight">{t.dashboard.welcome}</h1>
            </div>
            <div className="flex items-center gap-2.5">
              <LanguageSwitcher />
              <Link href="/profil" className="w-[42px] h-[42px] rounded-[14px] bg-gradient-to-br from-[#39ff6e] to-[#2bcc58] flex items-center justify-center text-[#0a0a12] text-base font-extrabold no-underline shadow-[0_4px_20px_rgba(57,255,110,0.25)]">W</Link>
            </div>
          </div>
          <div className="mt-[18px] bg-white/[0.04] rounded-[14px] py-[13px] px-4 flex items-center gap-3 border border-white/[0.06]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <span className="text-white/30 text-sm">{t.dashboard.search}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-50 px-5 pt-5 grid grid-cols-4 gap-2.5">
          {stats.map((s, i) => (
            <div key={i} className="bg-white/[0.03] rounded-2xl py-3.5 px-2.5 text-center border border-white/[0.05]">
              <div className="text-lg mb-1.5">{s.icon}</div>
              <div className="text-lg font-extrabold text-[#39ff6e] tracking-tight">{s.value}</div>
              <div className="text-[10px] text-white/35 mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Agencies */}
        <div className="relative z-10 px-5 pt-6">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-[#39ff6e]/[0.08] flex items-center justify-center border border-[#39ff6e]/[0.12]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39ff6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
              </div>
              <span className="text-base font-bold text-white">{t.dashboard.agencies_title}</span>
            </div>
            <Link href="/kontakty" className="text-xs text-[#39ff6e] font-semibold no-underline">{agencyCount.toLocaleString()} {t.dashboard.agencies_count} →</Link>
          </div>
          <div className="bg-[#111120] rounded-[18px] border border-white/[0.06] overflow-visible">
            {agencies.map((a, i) => (
              <Link key={i} href="/kontakty" className="flex py-3.5 px-4 items-center justify-between no-underline" style={{ borderBottom: i < agencies.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <div className="flex items-center gap-3">
                  <div className="w-[38px] h-[38px] rounded-xl bg-gradient-to-br from-[#39ff6e]/10 to-[#39ff6e]/[0.03] flex items-center justify-center text-sm font-bold text-[#39ff6e] border border-[#39ff6e]/[0.12]">{a.name?.charAt(0) || "?"}</div>
                  <div>
                    <p className="text-sm font-semibold text-white m-0">{a.name}</p>
                    <p className="text-xs text-white/35 mt-0.5 m-0">{a.city} • {a.canton}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{langFlag[a.language_region || ""] || "🇨🇭"}</span>
                  <span className="text-white/20 text-sm">›</span>
                </div>
              </Link>
            ))}
            <Link href="/kontakty" className="block py-[13px] bg-[#39ff6e]/[0.04] border-t border-[#39ff6e]/[0.08] text-center no-underline">
              <span className="text-[13px] font-bold text-[#39ff6e]">{t.dashboard.agencies_show_all}</span>
            </Link>
          </div>
        </div>

        {/* Guides */}
        <div className="relative z-10 px-5 pt-7">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-[#39ff6e]/[0.08] flex items-center justify-center border border-[#39ff6e]/[0.12]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39ff6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>
              </div>
              <span className="text-base font-bold text-white">{t.dashboard.guides_title}</span>
            </div>
            <Link href="/pruvodce" className="text-xs text-white/35 font-medium no-underline">{t.dashboard.guides_all} →</Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {guides.map((g, i) => (
              <Link key={i} href={g.href} className={`${g.gradient} rounded-2xl py-[18px] px-4 border ${g.borderColor} no-underline block`}>
                <div className="text-[28px] mb-3">{g.icon}</div>
                <p className="text-sm font-bold text-white m-0 mb-1 leading-tight">{g.title}</p>
                <p className="text-[11px] text-white/40 m-0 mb-2.5 leading-snug">{g.desc}</p>
                <span className={`text-[10px] font-bold py-1 px-2.5 rounded-md ${g.tagColor} ${g.tagBg} uppercase tracking-wide`}>{g.tag}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Premium */}
        <div className="relative z-10 px-5 pt-7">
          <Link href="/pricing" className="no-underline block">
            <div className="bg-gradient-to-br from-[#111120] to-[#0f1a14] rounded-[20px] p-6 border border-[#39ff6e]/15 relative overflow-visible">
              <div className="absolute -top-[50px] -right-[50px] w-[200px] h-[200px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(57,255,110,0.1), transparent 70%)" }} />
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "20px 20px" }} />
              <div className="relative z-[1]">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#39ff6e] to-[#2bcc58] flex items-center justify-center">⭐</div>
                  <span className="text-base font-extrabold text-white">{t.dashboard.premium_title}</span>
                </div>
                <p className="text-[13px] text-white/45 leading-relaxed my-2 mb-[18px]">{t.dashboard.premium_desc}</p>
                <div className="flex items-center gap-3.5">
                  <div className="bg-gradient-to-br from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] py-3 px-6 rounded-xl text-sm font-extrabold shadow-[0_4px_20px_rgba(57,255,110,0.25)]">{t.dashboard.premium_cta}</div>
                  <span className="text-xs text-white/30">{t.dashboard.premium_trial}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Wokee */}
        <div className="relative z-10 px-5 pt-7">
          <WokeeWidget />
        </div>

        {/* Bottom Nav */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a12]/[0.92] backdrop-blur-[20px] border-t border-white/[0.06] px-2 py-2 pb-3 z-[100]">
          <div className="max-w-[500px] mx-auto flex justify-around items-center">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className={`flex flex-col items-center gap-1 py-2 px-3.5 rounded-xl no-underline ${item.active ? "bg-[#39ff6e]/[0.08]" : ""}`}>
                <span className={`text-xl ${item.active ? "" : "grayscale opacity-40"}`}>{item.icon}</span>
                <span className={`text-[10px] tracking-wide ${item.active ? "text-[#39ff6e] font-bold" : "text-white/35 font-medium"}`}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
