"use client";
import Link from "next/link";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import WokeeWidget from "./WokeeWidget";
import BottomNav from "./BottomNav";
import { useSubscription } from "../../hooks/useSubscription";
import type { Agency } from "../../lib/types";

interface Props {
  agencyCount: number;
  agencies: Agency[];
}

export default function DashboardContent({ agencyCount }: Props) {
  const { t } = useLanguage();
  const { isActive } = useSubscription();

  const actions = [
    { icon: "🔍", title: "Hledám práci", desc: agencyCount.toLocaleString() + " agentur", href: "/kontakty", grad: "from-red-500/[0.08] to-red-500/[0.02]", border: "border-red-500/[0.12]" },
    { icon: "📝", title: "Připravit CV", desc: "5 AI šablon", href: "/pruvodce/sablony", grad: "from-blue-500/[0.08] to-blue-500/[0.02]", border: "border-blue-500/[0.12]" },
    { icon: "📑", title: "Mám smlouvu", desc: "AI analýza", href: "/pruvodce/sablony/smlouva", grad: "from-green-500/[0.08] to-green-500/[0.02]", border: "border-green-500/[0.12]" },
    { icon: "🏠", title: "Hledám bydlení", desc: "Bewerbungsdossier", href: "/pruvodce/sablony/bydleni", grad: "from-purple-500/[0.08] to-purple-500/[0.02]", border: "border-purple-500/[0.12]" },
  ];

  const stats = [
    { value: agencyCount.toLocaleString(), label: t.dashboard.agencies_count, icon: "🏢" },
    { value: "26", label: "Kantonů", icon: "📍" },
    { value: "8", label: "AI nástrojů", icon: "🤖" },
    { value: "24/7", label: "Asistent", icon: "💬" },
  ];

  const guides = [
    { icon: "📋", title: t.guides.permits_title, desc: t.guides.permits_desc, href: "/pruvodce/povoleni", tag: t.tags.important, tagColor: "text-red-400", tagBg: "bg-red-500/10" },
    { icon: "🏥", title: t.guides.insurance_title, desc: t.guides.insurance_desc, href: "/pruvodce/pojisteni", tag: t.tags.popular, tagColor: "text-blue-400", tagBg: "bg-blue-500/10" },
    { icon: "💰", title: t.guides.tax_title, desc: t.guides.tax_desc, href: "/pruvodce/dane", tag: t.tags.new_tag, tagColor: "text-green-400", tagBg: "bg-green-500/10" },
  ];

  return (
    <>
      <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');`}</style>
      <main className="min-h-screen bg-[#0a0a12] pb-[100px] relative overflow-visible" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
        <div className="fixed w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none z-0 opacity-20 -top-[200px] -right-[200px]" style={{ background: "radial-gradient(circle, rgba(57,255,110,0.2), transparent 70%)" }} />
        <div className="fixed w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none z-0 opacity-15 bottom-[100px] -left-[150px]" style={{ background: "radial-gradient(circle, rgba(100,60,255,0.15), transparent 70%)" }} />

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

        {/* Action Tiles - Co potřebuješ? */}
        <div className="relative z-10 px-5 pt-6">
          <div className="flex items-center gap-2.5 mb-3.5">
            <div className="w-8 h-8 rounded-[10px] bg-[#39ff6e]/[0.08] flex items-center justify-center border border-[#39ff6e]/[0.12]">🎯</div>
            <span className="text-base font-bold text-white">Co potřebuješ?</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {actions.map((a, i) => (
              <Link key={i} href={a.href} className={`bg-gradient-to-br ${a.grad} rounded-2xl py-5 px-4 border ${a.border} no-underline block`}>
                <div className="text-3xl mb-2.5">{a.icon}</div>
                <p className="text-sm font-bold text-white m-0 mb-1">{a.title}</p>
                <p className="text-[11px] text-white/40 m-0">{a.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Community Preview */}
        <div className="relative z-10 px-5 pt-6">
          <Link href="/komunita" className="no-underline block">
            <div className="bg-[#111120] rounded-[18px] border border-white/[0.06] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[10px] bg-[#39ff6e]/[0.08] flex items-center justify-center border border-[#39ff6e]/[0.12]">💬</div>
                  <span className="text-base font-bold text-white">Komunita</span>
                </div>
                <span className="text-xs text-[#39ff6e] font-semibold">Otevřít →</span>
              </div>
              <div className="space-y-2.5">
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
                  <p className="text-white/60 text-xs m-0">🏠 Hledej spolubydlení a ušetři tisíce na kauci</p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
                  <p className="text-white/60 text-xs m-0">🤖 AI odpovídá na dotazy o práci ve Švýcarsku 24/7</p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
                  <p className="text-white/60 text-xs m-0">💡 Navrhni funkce a hlasuj co přidáme další</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Recommended Guides */}
        <div className="relative z-10 px-5 pt-6">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-[#39ff6e]/[0.08] flex items-center justify-center border border-[#39ff6e]/[0.12]">📖</div>
              <span className="text-base font-bold text-white">{t.dashboard.guides_title}</span>
            </div>
            <Link href="/pruvodce" className="text-xs text-white/35 font-medium no-underline">{t.dashboard.guides_all} →</Link>
          </div>
          <div className="space-y-2">
            {guides.map((g, i) => (
              <Link key={i} href={g.href} className="flex items-center gap-3.5 bg-[#111120] rounded-xl p-3.5 border border-white/[0.06] no-underline">
                <span className="text-2xl">{g.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white m-0">{g.title}</p>
                  <p className="text-[11px] text-white/35 m-0 mt-0.5">{g.desc}</p>
                </div>
                <span className={`text-[10px] font-bold py-1 px-2.5 rounded-md ${g.tagColor} ${g.tagBg}`}>{g.tag}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Premium */}
        {!isActive && (
          <div className="relative z-10 px-5 pt-6">
            <Link href="/pricing" className="no-underline block">
              <div className="bg-gradient-to-br from-[#111120] to-[#0f1a14] rounded-[20px] p-6 border border-[#39ff6e]/15">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#39ff6e] to-[#2bcc58] flex items-center justify-center">⭐</div>
                  <span className="text-base font-extrabold text-white">{t.dashboard.premium_title}</span>
                </div>
                <p className="text-[13px] text-white/45 leading-relaxed my-2 mb-[18px]">{t.dashboard.premium_desc}</p>
                <div className="bg-gradient-to-br from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] py-3 px-6 rounded-xl text-sm font-extrabold text-center shadow-[0_4px_20px_rgba(57,255,110,0.25)]">{t.dashboard.premium_cta}</div>
              </div>
            </Link>
          </div>
        )}
        {isActive && (
          <div className="relative z-10 px-5 pt-6">
            <div className="bg-gradient-to-br from-[#111120] to-[#0f1a14] rounded-[20px] p-5 border border-[#39ff6e]/15">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#39ff6e] to-[#2bcc58] flex items-center justify-center text-lg">⭐</div>
                <div>
                  <p className="text-white font-extrabold text-sm m-0">Woker Premium</p>
                  <p className="text-[#39ff6e] text-xs m-0 mt-0.5 font-medium">Aktivní — plný přístup ke všemu</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wokee */}
        <div className="relative z-10 px-5 pt-6">
          <WokeeWidget />
        </div>
      </main>
    </>
  );
}
