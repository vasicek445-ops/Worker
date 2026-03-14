"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import WokeeWidget from "./WokeeWidget";
import { useSubscription } from "../../hooks/useSubscription";

interface JobPreview {
  id: string;
  title: string;
  company: string;
  canton: string;
  salary_text: string | null;
  created_at: string;
  source: string;
}

interface Props {
  agencyCount: number;
  jobCount: number;
  housingCount: number;
  latestJobs: JobPreview[];
}

export default function DashboardContent({ agencyCount, jobCount, housingCount, latestJobs }: Props) {
  const { t } = useLanguage();
  const { isActive } = useSubscription();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [appCount, setAppCount] = useState(0);
  const [matchCount, setMatchCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return;
      setUser(u);
      const { data: p } = await supabase.from("profiles").select("*").eq("id", u.id).single();
      if (p) setProfile(p);
      const { count: ac } = await supabase.from("applications").select("*", { count: "exact", head: true }).eq("user_id", u.id);
      setAppCount(ac || 0);
      const { count: mc } = await supabase.from("applications").select("*", { count: "exact", head: true }).eq("user_id", u.id).not("match_score", "is", null);
      setMatchCount(mc || 0);
    };
    load();
  }, []);

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "";
  const avatarUrl = profile?.avatar_url;
  const profileFields = ["obor", "pozice", "preferovany_kanton", "nemcina_uroven", "zkusenosti", "vzdelani", "dovednosti", "telefon", "adresa"];
  const filledFields = profile ? profileFields.filter(f => !!profile[f]).length : 0;
  const profilePercent = Math.round((filledFields / profileFields.length) * 100);
  const isProfileComplete = profilePercent === 100;

  // Progress steps
  const steps = [
    { label: "Profil", done: isProfileComplete, href: "/profil", icon: "👤" },
    { label: "CV", done: false, href: "/pruvodce/sablony/cv", icon: "📄" },
    { label: "Matching", done: matchCount > 0, href: "/pruvodce/matching", icon: "🎯" },
    { label: "Přihláška", done: appCount > 0, href: "/prihlasky", icon: "✉️" },
  ];
  const currentStep = steps.findIndex(s => !s.done);

  const [now] = useState(() => Date.now());
  const timeAgo = (d: string) => {
    const diff = now - new Date(d).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "právě teď";
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  return (
    <>
      <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');`}</style>
      <main className="min-h-screen bg-[#0a0a12] pb-[100px] relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>

        {/* Ambient glow effects */}
        <div className="fixed w-[800px] h-[800px] rounded-full blur-[180px] pointer-events-none z-0 opacity-15 -top-[300px] -right-[200px]" style={{ background: "radial-gradient(circle, rgba(57,255,110,0.25), transparent 70%)" }} />
        <div className="fixed w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none z-0 opacity-10 top-[400px] -left-[200px]" style={{ background: "radial-gradient(circle, rgba(100,60,255,0.2), transparent 70%)" }} />
        <div className="fixed w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none z-0 opacity-10 bottom-[100px] right-[100px]" style={{ background: "radial-gradient(circle, rgba(232,48,42,0.15), transparent 70%)" }} />

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* ═══ HEADER ═══ */}
          <div className="pt-6 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/profil" className="no-underline">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-12 h-12 rounded-2xl object-cover border-2 border-white/10 hover:border-[#39ff6e]/40 transition" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#39ff6e] to-[#2bcc58] flex items-center justify-center text-[#0a0a12] text-lg font-extrabold">
                    {firstName[0]?.toUpperCase() || "W"}
                  </div>
                )}
              </Link>
              <div>
                <p className="text-xs text-white/30 font-medium tracking-widest uppercase m-0">{t.dashboard.greeting}</p>
                <h1 className="text-xl font-extrabold text-white m-0 tracking-tight">{firstName ? `Ahoj, ${firstName}` : t.dashboard.welcome}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              {isActive && (
                <div className="hidden sm:flex items-center gap-1.5 bg-[#39ff6e]/10 border border-[#39ff6e]/20 rounded-full px-3 py-1.5">
                  <span className="text-xs">⭐</span>
                  <span className="text-[11px] font-bold text-[#39ff6e]">Premium</span>
                </div>
              )}
            </div>
          </div>

          {/* ═══ HERO CARD ═══ */}
          <div className="mt-5 rounded-3xl overflow-hidden relative" style={{ background: "linear-gradient(135deg, #111128 0%, #0d1a2e 40%, #0a1a14 100%)" }}>
            <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(57,255,110,0.15), transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(100,60,255,0.1), transparent 60%)" }} />
            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-[#39ff6e] animate-pulse" />
                    <span className="text-[11px] font-semibold text-[#39ff6e]/80 uppercase tracking-widest">Tvůj přehled</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white m-0 leading-tight">
                    {isProfileComplete
                      ? "Profil je kompletní. Jsi připraven!"
                      : `Profil na ${profilePercent}% — dokonči ho`}
                  </h2>
                  <p className="text-sm text-white/40 mt-2 mb-5 max-w-md">
                    {isProfileComplete
                      ? "Spusť Smart Matching a nech AI najít ideální agentury pro tebe."
                      : "Kompletní profil odemkne Smart Matching a personalizované nabídky."}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href={isProfileComplete ? "/pruvodce/matching" : "/profil"}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] font-extrabold text-sm py-3 px-6 rounded-xl no-underline shadow-[0_4px_24px_rgba(57,255,110,0.3)] hover:shadow-[0_4px_32px_rgba(57,255,110,0.5)] transition-all">
                      {isProfileComplete ? "🎯 Spustit Matching" : "👤 Dokončit profil"}
                    </Link>
                    <Link href="/pruvodce/sablony/cv"
                      className="inline-flex items-center gap-2 bg-white/[0.06] backdrop-blur-sm text-white font-bold text-sm py-3 px-6 rounded-xl no-underline border border-white/[0.08] hover:bg-white/[0.1] transition-all">
                      📄 Vytvořit CV
                    </Link>
                  </div>
                </div>

                {/* Profile progress ring */}
                <div className="hidden sm:flex flex-col items-center gap-3">
                  <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#39ff6e" strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={`${profilePercent * 2.64} 264`} className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold text-white">{profilePercent}%</span>
                      <span className="text-[9px] text-white/40 font-medium">PROFIL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ STATS ROW ═══ */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: jobCount.toLocaleString(), label: "Nabídek práce", icon: "💼", color: "from-orange-500/20 to-orange-500/5", glow: "shadow-orange-500/10" },
              { value: housingCount.toLocaleString(), label: "Nabídek bydlení", icon: "🏠", color: "from-cyan-500/20 to-cyan-500/5", glow: "shadow-cyan-500/10" },
              { value: agencyCount.toLocaleString(), label: "Agentur", icon: "🏢", color: "from-purple-500/20 to-purple-500/5", glow: "shadow-purple-500/10" },
              { value: appCount.toString(), label: "Tvých přihlášek", icon: "✉️", color: "from-[#39ff6e]/20 to-[#39ff6e]/5", glow: "shadow-[#39ff6e]/10" },
            ].map((s, i) => (
              <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 border border-white/[0.06] backdrop-blur-sm shadow-lg ${s.glow}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{s.icon}</span>
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#39ff6e]/60" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-white tracking-tight">{s.value}</div>
                <div className="text-[11px] text-white/35 mt-0.5 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ═══ PROGRESS TRACKER ═══ */}
          <div className="mt-5 bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm">🚀</span>
              <span className="text-sm font-bold text-white">Tvoje cesta do Švýcarska</span>
              <span className="text-[10px] text-white/30 ml-auto font-medium">{steps.filter(s => s.done).length}/{steps.length} hotovo</span>
            </div>
            <div className="flex items-center gap-0">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center flex-1">
                  <Link href={step.href} className="no-underline flex flex-col items-center gap-1.5 group flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                      step.done
                        ? "bg-[#39ff6e]/15 border-2 border-[#39ff6e]/40 shadow-[0_0_16px_rgba(57,255,110,0.15)]"
                        : i === currentStep
                          ? "bg-white/[0.08] border-2 border-white/20 animate-pulse"
                          : "bg-white/[0.03] border border-white/[0.06]"
                    } group-hover:scale-110`}>
                      {step.done ? <span className="text-[#39ff6e] text-sm">✓</span> : step.icon}
                    </div>
                    <span className={`text-[10px] font-semibold ${step.done ? "text-[#39ff6e]/70" : i === currentStep ? "text-white/60" : "text-white/25"}`}>
                      {step.label}
                    </span>
                  </Link>
                  {i < steps.length - 1 && (
                    <div className={`h-[2px] flex-1 mx-1 rounded-full mt-[-18px] ${
                      step.done ? "bg-[#39ff6e]/30" : "bg-white/[0.06]"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ═══ MAIN GRID ═══ */}
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Latest Jobs — spans 2 cols */}
            <div className="lg:col-span-2 bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">💼</div>
                  <span className="text-sm font-bold text-white">Nejnovější nabídky</span>
                </div>
                <Link href="/nabidky" className="text-[11px] text-[#39ff6e] font-semibold no-underline hover:text-[#39ff6e]/80 transition">Zobrazit vše →</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {latestJobs.slice(0, 6).map((job) => (
                  <Link key={job.id} href={`/nabidky?id=${job.id}`} className="no-underline group">
                    <div className="bg-white/[0.02] hover:bg-white/[0.05] rounded-xl p-3.5 border border-white/[0.04] hover:border-white/[0.1] transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-white m-0 truncate group-hover:text-[#39ff6e] transition">{job.title}</p>
                          <p className="text-[11px] text-white/35 m-0 mt-1 truncate">{job.company} · {job.canton}</p>
                        </div>
                        <span className="text-[9px] text-white/20 font-medium whitespace-nowrap mt-0.5">{timeAgo(job.created_at)}</span>
                      </div>
                      {job.salary_text && (
                        <div className="mt-2">
                          <span className="text-[10px] font-semibold text-[#39ff6e]/70 bg-[#39ff6e]/[0.08] px-2 py-0.5 rounded-md">{job.salary_text}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              {latestJobs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-white/30 text-sm m-0">Načítám nabídky...</p>
                </div>
              )}
            </div>

            {/* Right sidebar — Quick Actions */}
            <div className="space-y-4">
              {/* Quick Actions */}
              <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm">⚡</span>
                  <span className="text-sm font-bold text-white">Rychlé akce</span>
                </div>
                <div className="space-y-2">
                  {[
                    { icon: "🎯", label: "Smart Matching", desc: "AI najde agentury", href: "/pruvodce/matching", gradient: "from-blue-500/10 to-blue-500/5", border: "border-blue-500/15" },
                    { icon: "📄", label: "Vytvořit CV", desc: "100 šablon", href: "/pruvodce/sablony/cv", gradient: "from-green-500/10 to-green-500/5", border: "border-green-500/15" },
                    { icon: "✉️", label: "Motivační dopis", desc: "Německy s AI", href: "/pruvodce/sablony/motivacni-dopis", gradient: "from-purple-500/10 to-purple-500/5", border: "border-purple-500/15" },
                    { icon: "🎤", label: "Pohovor", desc: "AI příprava", href: "/pruvodce/sablony/pohovor", gradient: "from-amber-500/10 to-amber-500/5", border: "border-amber-500/15" },
                    { icon: "📧", label: "Email agentuře", desc: "Profesionální DE", href: "/pruvodce/sablony/email", gradient: "from-red-500/10 to-red-500/5", border: "border-red-500/15" },
                  ].map((a, i) => (
                    <Link key={i} href={a.href} className={`flex items-center gap-3 bg-gradient-to-r ${a.gradient} rounded-xl p-3 border ${a.border} no-underline group hover:scale-[1.02] transition-all`}>
                      <span className="text-xl">{a.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-white m-0 group-hover:text-[#39ff6e] transition">{a.label}</p>
                        <p className="text-[10px] text-white/30 m-0">{a.desc}</p>
                      </div>
                      <span className="text-white/15 group-hover:text-white/40 transition text-sm">→</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Premium / Status */}
              {!isActive ? (
                <Link href="/pricing" className="no-underline block">
                  <div className="rounded-2xl p-5 border border-[#39ff6e]/15 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #111120, #0f1a14)" }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20" style={{ background: "radial-gradient(circle, #39ff6e, transparent)" }} />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">⭐</span>
                        <span className="text-sm font-extrabold text-white">{t.dashboard.premium_title}</span>
                      </div>
                      <p className="text-[12px] text-white/40 leading-relaxed mb-4">{t.dashboard.premium_desc}</p>
                      <div className="bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] py-2.5 px-5 rounded-xl text-[13px] font-extrabold text-center shadow-[0_4px_20px_rgba(57,255,110,0.25)]">
                        {t.dashboard.premium_cta}
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="rounded-2xl p-4 border border-[#39ff6e]/15" style={{ background: "linear-gradient(135deg, #111120, #0f1a14)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#39ff6e] to-[#2bcc58] flex items-center justify-center text-base shadow-[0_0_20px_rgba(57,255,110,0.2)]">⭐</div>
                    <div>
                      <p className="text-white font-extrabold text-sm m-0">Woker Premium</p>
                      <p className="text-[#39ff6e] text-[11px] m-0 mt-0.5 font-medium">Aktivní — plný přístup</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══ BOTTOM ROW ═══ */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Explore tiles */}
            {[
              { icon: "🏠", title: "Bydlení", desc: `${housingCount.toLocaleString()} nabídek`, href: "/bydleni", gradient: "from-cyan-500/15 to-cyan-500/5", border: "border-cyan-500/15" },
              { icon: "📇", title: "Agentury", desc: `${agencyCount.toLocaleString()} kontaktů`, href: "/kontakty", gradient: "from-purple-500/15 to-purple-500/5", border: "border-purple-500/15" },
              { icon: "💬", title: "Komunita", desc: "Spolubydlení a tipy", href: "/komunita", gradient: "from-pink-500/15 to-pink-500/5", border: "border-pink-500/15" },
            ].map((tile, i) => (
              <Link key={i} href={tile.href} className={`bg-gradient-to-br ${tile.gradient} rounded-2xl p-5 border ${tile.border} no-underline group hover:scale-[1.02] transition-all backdrop-blur-sm`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl">{tile.icon}</span>
                    <p className="text-base font-bold text-white m-0 mt-3 group-hover:text-[#39ff6e] transition">{tile.title}</p>
                    <p className="text-[11px] text-white/35 m-0 mt-1">{tile.desc}</p>
                  </div>
                  <span className="text-white/10 group-hover:text-white/30 transition text-2xl">→</span>
                </div>
              </Link>
            ))}
          </div>

          {/* ═══ GUIDES ROW ═══ */}
          <div className="mt-5 bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">📖</span>
                <span className="text-sm font-bold text-white">{t.dashboard.guides_title}</span>
              </div>
              <Link href="/pruvodce" className="text-[11px] text-white/35 font-medium no-underline hover:text-white/50 transition">{t.dashboard.guides_all} →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { icon: "📋", title: t.guides.permits_title, desc: t.guides.permits_desc, href: "/pruvodce/povoleni", tag: t.tags.important, tagColor: "text-red-400 bg-red-500/10" },
                { icon: "🏥", title: t.guides.insurance_title, desc: t.guides.insurance_desc, href: "/pruvodce/pojisteni", tag: t.tags.popular, tagColor: "text-blue-400 bg-blue-500/10" },
                { icon: "💰", title: t.guides.tax_title, desc: t.guides.tax_desc, href: "/pruvodce/dane", tag: t.tags.new_tag, tagColor: "text-green-400 bg-green-500/10" },
              ].map((g, i) => (
                <Link key={i} href={g.href} className="flex items-center gap-3 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl p-3.5 border border-white/[0.04] hover:border-white/[0.08] no-underline transition-all">
                  <span className="text-2xl">{g.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white m-0 truncate">{g.title}</p>
                    <p className="text-[10px] text-white/30 m-0 mt-0.5 truncate">{g.desc}</p>
                  </div>
                  <span className={`text-[9px] font-bold py-1 px-2 rounded-md whitespace-nowrap ${g.tagColor}`}>{g.tag}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ═══ WOKEE WIDGET ═══ */}
          <div className="mt-5">
            <WokeeWidget />
          </div>

        </div>
      </main>
    </>
  );
}
