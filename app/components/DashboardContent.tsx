"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import WookyChat from "./WokeeWidget";
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
  const [hasCv, setHasCv] = useState(false);
  const [emailStats, setEmailStats] = useState({ sent: 0, opened: 0, replied: 0 });

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
      const { count: cv } = await supabase.from("documents").select("*", { count: "exact", head: true }).eq("user_id", u.id).eq("type", "cv");
      setHasCv((cv || 0) > 0);
      const [{ count: sent }, { count: opened }, { count: replied }] = await Promise.all([
        supabase.from("email_send_log").select("*", { count: "exact", head: true }).eq("member_id", u.id),
        supabase.from("email_send_log").select("*", { count: "exact", head: true }).eq("member_id", u.id).eq("opened", true),
        supabase.from("email_send_log").select("*", { count: "exact", head: true }).eq("member_id", u.id).eq("replied", true),
      ]);
      setEmailStats({ sent: sent || 0, opened: opened || 0, replied: replied || 0 });
    };
    load();
  }, []);

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "";
  const avatarUrl = profile?.avatar_url;
  const profileFields = ["obor", "pozice", "preferovany_kanton", "nemcina_uroven", "zkusenosti", "vzdelani", "dovednosti", "telefon", "adresa"];
  const filledFields = profile ? profileFields.filter(f => !!profile[f]).length : 0;
  const profilePercent = Math.round((filledFields / profileFields.length) * 100);
  const isProfileComplete = profilePercent === 100;

  // Onboarding kroky
  const steps = [
    { label: "Vyplň svůj profil", desc: "Základ pro všechno — AI z něj tvoří tvoje CV, dopisy i matching.", done: isProfileComplete, href: "/profil" },
    { label: "Vytvoř si životopis", desc: "Německé CV optimalizované pro švýcarský trh, za pár minut.", done: hasCv, href: "/pruvodce/sablony/cv" },
    { label: "Najdi práci přes Smart Apply", desc: "AI ti najde agentury i firmy na míru tvému profilu — ty si vybereš kam se hlásit.", done: matchCount > 0, href: "/profil/gmail" },
    { label: "Pošli přihlášku přes Smart Apply", desc: "AI za tebe odešle přihlášku přímo firmě. Pak jen sleduješ odpovědi ve statistikách.", done: appCount > 0, href: "/profil/gmail" },
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
        <div className="fixed w-[800px] h-[800px] rounded-full blur-[180px] pointer-events-none z-0 opacity-15 -top-[300px] -right-[200px]" style={{ background: "radial-gradient(circle, rgba(251,146,60,0.25), transparent 70%)" }} />
        <div className="fixed w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none z-0 opacity-10 top-[400px] -left-[200px]" style={{ background: "radial-gradient(circle, rgba(100,60,255,0.2), transparent 70%)" }} />
        <div className="fixed w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none z-0 opacity-10 bottom-[100px] right-[100px]" style={{ background: "radial-gradient(circle, rgba(232,48,42,0.15), transparent 70%)" }} />
        {/* Global dot grid pattern */}
        <svg className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-[0.015]" xmlns="http://www.w3.org/2000/svg">
          <pattern id="globalGrid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="white"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#globalGrid)"/>
        </svg>

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* ═══ HEADER ═══ */}
          <div className="pt-6 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/profil" className="no-underline">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-12 h-12 rounded-2xl object-cover border-2 border-white/10 hover:border-[#fb923c]/40 transition" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#fb923c] to-[#f97316] flex items-center justify-center text-[#0a0a12] text-lg font-extrabold">
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
              {isActive && (
                <div className="hidden sm:flex items-center gap-1.5 bg-[#fb923c]/10 border border-[#fb923c]/20 rounded-full px-3 py-1.5">
                  <Image src="/images/3d/crown.png" alt="" width={16} height={16} />
                  <span className="text-[11px] font-bold text-[#fb923c]">Premium</span>
                </div>
              )}
            </div>
          </div>

          {/* ═══ HERO CARD ═══ */}
          <div className="mt-5 rounded-3xl overflow-hidden relative" style={{ background: "linear-gradient(135deg, #111128 0%, #0d1a2e 40%, #0a1a14 100%)" }}>
            {/* Švýcarsko — foto pozadí */}
            <Image src="/images/svycarsko-hero.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
            {/* Tmavý gradient overlay — čitelnost textu */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(10,10,18,0.96) 0%, rgba(10,10,18,0.9) 32%, rgba(13,16,28,0.68) 62%, rgba(13,16,28,0.5) 100%)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,18,0.75) 0%, transparent 55%)" }} />
            {/* Oranžový glow akcent */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 80% 22%, rgba(251,146,60,0.2), transparent 55%)" }} />
            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-[#fb923c] animate-pulse" />
                    <span className="text-[11px] font-semibold text-[#fb923c]/80 uppercase tracking-widest">Tvůj přehled</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white m-0 leading-tight">
                    {isProfileComplete
                      ? "Profil je kompletní. Jsi připraven!"
                      : `Profil na ${profilePercent}% — dokonči ho`}
                  </h2>
                  <p className="text-sm text-white/40 mt-2 mb-5 max-w-md">
                    {isProfileComplete
                      ? "Spusť Smart Apply a nech agenta hledat práci i agentury za tebe."
                      : "Kompletní profil odemkne Smart Apply a personalizované nabídky."}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href={isProfileComplete ? "/profil/gmail" : "/profil"}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#fb923c] to-[#f97316] text-[#0a0a12] font-extrabold text-sm py-3 px-6 rounded-xl no-underline shadow-[0_4px_24px_rgba(251,146,60,0.3)] hover:shadow-[0_4px_32px_rgba(251,146,60,0.5)] transition-all hover:scale-[1.03]">
                      {isProfileComplete ? "🎯 Spustit Smart Apply" : "👤 Dokončit profil"}
                    </Link>
                    <Link href="/pruvodce/sablony/cv"
                      className="inline-flex items-center gap-2 bg-white/[0.06] backdrop-blur-sm text-white font-bold text-sm py-3 px-6 rounded-xl no-underline border border-white/[0.08] hover:bg-white/[0.1] hover:scale-[1.03] transition-all">
                      📄 Vytvořit CV
                    </Link>
                  </div>
                </div>

                {/* Profile progress ring with glow */}
                <div className="hidden sm:flex flex-col items-center gap-3">
                  <div className="relative w-28 h-28">
                    <div className="absolute inset-0 rounded-full blur-xl opacity-20" style={{ background: `conic-gradient(#fb923c ${profilePercent}%, transparent ${profilePercent}%)` }} />
                    <svg className="w-28 h-28 -rotate-90 relative" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#progressGrad)" strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={`${profilePercent * 2.64} 264`} className="transition-all duration-1000" />
                      <defs>
                        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fb923c" />
                          <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                      </defs>
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

          {/* ═══ STATS ROW — foto karty ═══ */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: jobCount.toLocaleString(), label: "Nabídek práce", img: "/images/stats/stat-prace.jpg", href: "/nabidky" },
              { value: housingCount.toLocaleString(), label: "Nabídek bydlení", img: "/images/stats/stat-bydleni.jpg", href: "/bydleni" },
              { value: agencyCount.toLocaleString(), label: "Temporärbüra", img: "/images/stats/stat-agentury.jpg", href: "/kontakty" },
              { value: appCount.toString(), label: "Tvých přihlášek", img: "/images/stats/stat-prihlasky.jpg", href: "/prihlasky" },
            ].map((s, i) => (
              <Link key={i} href={s.href} className="relative block aspect-[3/2] rounded-2xl overflow-hidden border border-white/[0.06] hover:border-[#fb923c]/30 transition-all group no-underline">
                <Image src={s.img} alt="" fill sizes="(max-width:640px) 50vw, 25vw" className="object-cover group-hover:scale-[1.06] transition-transform duration-500" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,18,0.97) 0%, rgba(10,10,18,0.75) 38%, rgba(10,10,18,0.2) 72%, rgba(10,10,18,0.4) 100%)" }} />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="text-2xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">{s.value}</div>
                  <div className="text-[11px] text-white/60 mt-0.5 font-medium">{s.label}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* ═══ ONBOARDING CHECKLIST (Huntr-style) ═══ */}
          {steps.every((s) => s.done) ? (
            <div className="mt-5 bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-[#fb923c]/20 p-5 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#fb923c]/15 border border-[#fb923c]/30 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <p className="text-white font-bold text-sm m-0">Máš hotové všechny kroky! 🎉</p>
                <p className="text-white/40 text-xs m-0 mt-0.5">Teď už jen posílej přihlášky a sleduj odpovědi ve statistikách.</p>
              </div>
            </div>
          ) : (
            <div className="mt-5 bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">Vítej, {firstName || "ve Wokeru"}! 👋</h2>
              <p className="text-white/45 text-[13px] mt-1 mb-5">
                Projdi těchto pár kroků a jsi připraven hledat práci ve Švýcarsku.
              </p>
              <div className="flex flex-col gap-2.5">
                {steps.map((step, i) => (
                  <Link key={i} href={step.href} className="no-underline group">
                    <div className={`flex items-start gap-3.5 rounded-xl p-4 border transition-all ${
                      step.done
                        ? "bg-white/[0.02] border-white/[0.05]"
                        : i === currentStep
                          ? "bg-[#fb923c]/[0.06] border-[#fb923c]/25"
                          : "bg-white/[0.02] border-white/[0.05] hover:border-white/[0.12]"
                    }`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        step.done ? "bg-[#fb923c]" : "border-2 border-white/20"
                      }`}>
                        {step.done && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#0a0a12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-bold m-0 ${step.done ? "text-white/40 line-through" : "text-white group-hover:text-[#fb923c] transition"}`}>{step.label}</p>
                        <p className="text-[12px] text-white/40 m-0 mt-0.5 leading-relaxed">{step.desc}</p>
                      </div>
                      {!step.done && (
                        <span className="text-[#fb923c] text-sm self-center shrink-0 opacity-0 group-hover:opacity-100 transition">→</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ═══ MAIN GRID ═══ */}
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Latest Jobs — spans 2 cols */}
            <div className="lg:col-span-2 bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20"><Image src="/images/3d/briefcase.png" alt="" width={20} height={20} /></div>
                  <span className="text-sm font-bold text-white">Nejnovější nabídky</span>
                </div>
                <Link href="/nabidky" className="text-[11px] text-[#fb923c] font-semibold no-underline hover:text-[#fb923c]/80 transition">Zobrazit vše →</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {latestJobs.slice(0, 6).map((job) => (
                  <Link key={job.id} href={`/nabidky?id=${job.id}`} className="no-underline group">
                    <div className="bg-white/[0.02] hover:bg-white/[0.05] rounded-xl p-3.5 border border-white/[0.04] hover:border-white/[0.1] transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-white m-0 truncate group-hover:text-[#fb923c] transition">{job.title}</p>
                          <p className="text-[11px] text-white/35 m-0 mt-1 truncate">{job.company} · {job.canton}</p>
                        </div>
                        <span className="text-[9px] text-white/20 font-medium whitespace-nowrap mt-0.5">{timeAgo(job.created_at)}</span>
                      </div>
                      {job.salary_text && (
                        <div className="mt-2">
                          <span className="text-[10px] font-semibold text-[#fb923c]/70 bg-[#fb923c]/[0.08] px-2 py-0.5 rounded-md">{job.salary_text}</span>
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
                  <Image src="/images/3d/rocket.png" alt="" width={20} height={20} className="drop-shadow-lg" />
                  <span className="text-sm font-bold text-white">Rychlé akce</span>
                </div>
                <div className="space-y-2">
                  {[
                    { img: "/images/3d/target.png", label: "Smart Apply", desc: "Práce i agentury", href: "/profil/gmail", gradient: "from-blue-500/10 to-blue-500/5", border: "border-blue-500/15" },
                    { img: "/images/3d/document.png", label: "Vytvořit CV", desc: "100 šablon", href: "/pruvodce/sablony/cv", gradient: "from-green-500/10 to-green-500/5", border: "border-green-500/15" },
                    { img: "/images/3d/envelope.png", label: "Motivační dopis", desc: "Německy s AI", href: "/pruvodce/sablony/motivacni-dopis", gradient: "from-purple-500/10 to-purple-500/5", border: "border-purple-500/15" },
                    { img: "/images/3d/speech.png", label: "Pohovor", desc: "AI příprava", href: "/pruvodce/sablony/pohovor", gradient: "from-amber-500/10 to-amber-500/5", border: "border-amber-500/15" },
                    { img: "/images/3d/envelope.png", label: "Email agentuře", desc: "Profesionální DE", href: "/pruvodce/sablony/email", gradient: "from-red-500/10 to-red-500/5", border: "border-red-500/15" },
                  ].map((a, i) => (
                    <Link key={i} href={a.href} className={`flex items-center gap-3 bg-gradient-to-r ${a.gradient} rounded-xl p-3 border ${a.border} no-underline group hover:scale-[1.02] transition-all`}>
                      <Image src={a.img} alt="" width={28} height={28} className="drop-shadow-lg group-hover:scale-110 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-white m-0 group-hover:text-[#fb923c] transition">{a.label}</p>
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
                  <div className="rounded-2xl p-5 border border-[#fb923c]/15 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #111120, #0f1a14)" }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20" style={{ background: "radial-gradient(circle, #fb923c, transparent)" }} />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <Image src="/images/3d/crown.png" alt="" width={24} height={24} className="drop-shadow-lg" />
                        <span className="text-sm font-extrabold text-white">{t.dashboard.premium_title}</span>
                      </div>
                      <p className="text-[12px] text-white/40 leading-relaxed mb-4">{t.dashboard.premium_desc}</p>
                      <div className="bg-gradient-to-r from-[#fb923c] to-[#f97316] text-[#0a0a12] py-2.5 px-5 rounded-xl text-[13px] font-extrabold text-center shadow-[0_4px_20px_rgba(251,146,60,0.25)]">
                        {t.dashboard.premium_cta}
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="rounded-2xl p-4 border border-[#fb923c]/15" style={{ background: "linear-gradient(135deg, #111120, #0f1a14)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] flex items-center justify-center shadow-[0_0_20px_rgba(251,146,60,0.2)]"><Image src="/images/3d/crown.png" alt="" width={24} height={24} /></div>
                    <div>
                      <p className="text-white font-extrabold text-sm m-0">Woker Premium</p>
                      <p className="text-[#fb923c] text-[11px] m-0 mt-0.5 font-medium">Aktivní — plný přístup</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══ STATISTIKY ═══ */}
          <div className="mt-5 bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/images/3d/target.png" alt="" width={20} height={20} className="drop-shadow-lg" />
              <span className="text-sm font-bold text-white">Tvoje statistiky</span>
              {emailStats.sent > 0 && (
                <span className="text-[10px] text-[#fb923c] ml-auto font-bold">
                  úspěšnost {Math.round((emailStats.replied / emailStats.sent) * 100)}%
                </span>
              )}
            </div>
            {emailStats.sent === 0 ? (
              <div className="text-center py-6 text-white/30 text-[13px] leading-relaxed">
                Zatím jsi neodeslal žádné přihlášky. Jakmile začneš,<br />
                uvidíš tady svůj pokrok — kolik firem email otevřelo a kolik odpovědělo.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {[
                  { label: "Odeslané přihlášky", count: emailStats.sent },
                  { label: "Odpovědi od firem", count: emailStats.replied },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <div className="w-40 sm:w-48 text-[12px] text-white/55 shrink-0">{row.label}</div>
                    <div className="flex-1 h-6 bg-white/[0.04] rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#fb923c] to-[#f97316] rounded-lg transition-all duration-500"
                        style={{ width: `${row.count > 0 ? Math.max((row.count / emailStats.sent) * 100, 6) : 0}%` }}
                      />
                    </div>
                    <div className="w-8 text-right text-sm font-bold text-white shrink-0">{row.count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ═══ WOOKY AI CHAT ═══ */}
          <div className="mt-5">
            <WookyChat
              profilePercent={profilePercent}
              profileData={profile}
              appCount={appCount}
              matchCount={matchCount}
              hasCv={hasCv}
            />
          </div>

        </div>
      </main>
    </>
  );
}
