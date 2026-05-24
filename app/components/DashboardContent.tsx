'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import {
  Briefcase, Building2, Users, MailOpen, Target, FileText, TrendingUp, Sparkles,
} from 'lucide-react'

interface DashboardContentProps {
  agencyCount: number
  jobCount: number
  housingCount: number
  // latestJobs ze starého page.tsx — zatím ignorujeme, dashboard je čistě statistický
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  latestJobs?: any[]
}

// ─── Skeleton hodnoty než přijdou reálná data ────────────────────────────────
// User naplní reálné výpočty postupně. Skeleton zachovává shape pro layout work.
const SKELETON = {
  userName: 'Václav',
  probability: 78,           // 0-100, "šance najít práci"
  probabilityTier: 'Solidní' as 'Slabá' | 'Solidní' | 'Silná',
  matchedCohortCount: 247,   // "na základě 247 podobných profilů"
  targetPosition: 'Logistika',
  targetCanton: 'Curych',
  avgDaysToFind: 18,
  factors: [
    { id: 'profile', label: 'Profil úplný', score: 92, status: 'good' as const },
    { id: 'permit', label: 'Pracovní povolení', score: 100, status: 'good' as const },
    { id: 'experience', label: 'Zkušenost v oboru', score: 80, status: 'good' as const },
    { id: 'german', label: 'Němčina (B1+)', score: 40, status: 'weak' as const },
  ],
  improvementTip: 'Zvyš na 84 % — dodělej němčinu B1 (cca 2 týdny v Duolingo)',
  improvementTarget: 84,
  // Profile completion (z DB later)
  profileComplete: 85,
  profileMissing: 2,
  // User activity
  sentApplications: 12,
  emailOpenRate: 68,   // % HR-istů co otevřelo email
  contactedAgencies: 7,
  documentsCount: 3,
  // Trends
  newJobsThisWeek: 23,
}

export default function DashboardContent({ agencyCount, jobCount, housingCount }: DashboardContentProps) {
  const [userName, setUserName] = useState(SKELETON.userName)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user || cancelled) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .maybeSingle()
      if (profile?.full_name && !cancelled) {
        // Zobrazujeme jen křestní jméno
        setUserName(profile.full_name.split(' ')[0])
      }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <main
      className="min-h-screen bg-[#0a0a12] text-white px-4 sm:px-6 lg:px-8 py-6 lg:py-8"
      style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ─── HEADER ──────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight m-0">
              Dobré ráno, {userName} <span className="inline-block animate-pulse">👋</span>
            </h1>
            <p className="text-sm text-white/40 mt-1.5 m-0">
              Tvoje cesta za prací ve Švýcarsku v číslech
            </p>
          </div>
        </header>

        {/* ─── HERO: PRAVDĚPODOBNOST ZISKU PRÁCE ────────────────────────── */}
        <ProbabilityHeroCard />

        {/* ─── 4-UP STATS ROW ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatTile
            icon={Building2}
            value={agencyCount.toLocaleString('cs-CZ')}
            label="Agentur"
            sublabel={`${Math.round((946 / Math.max(agencyCount, 1)) * 100)}% s HR emailem`}
            accent={false}
          />
          <StatTile
            icon={Briefcase}
            value={jobCount.toLocaleString('cs-CZ')}
            label="Volných pozic"
            sublabel={`+${SKELETON.newJobsThisWeek} tento týden`}
            accent={false}
          />
          <StatTile
            icon={Users}
            value={housingCount.toLocaleString('cs-CZ')}
            label="Nabídek bydlení"
            sublabel="kantony 1–26"
            accent={false}
          />
          <StatTile
            icon={MailOpen}
            value={SKELETON.sentApplications.toString()}
            label="Tvých přihlášek"
            sublabel={`${SKELETON.emailOpenRate}% otevřeli HR`}
            accent
          />
        </div>

        {/* ─── PROFILE + ACTIVITY ROW ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <ProfileCompletionCard />
          <ActivityCard />
        </div>

        {/* ─── BENCHMARK FOOTER ─────────────────────────────────────────── */}
        <BenchmarkCard />

      </div>
    </main>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  HERO: ŠANCE NA PRÁCI                                                       */
/*  Pattern: Teal Resume Match Score + GrowPal big % dark                      */
/* ────────────────────────────────────────────────────────────────────────── */

function ProbabilityHeroCard() {
  const { probability, probabilityTier, matchedCohortCount, targetPosition, targetCanton, factors, improvementTip, improvementTarget } = SKELETON

  return (
    <section className="rounded-3xl bg-gradient-to-br from-[#111120] via-[#0d0d18] to-[#0a0a12] border border-white/[0.06] p-6 sm:p-8 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[120px] opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.45), transparent 70%)' }} />

      <div className="relative grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-12 items-start">

        {/* Levá: BIG NUMBER + tier */}
        <div>
          <p className="text-[11px] font-semibold tracking-[0.12em] text-white/40 uppercase m-0">
            Šance na práci
          </p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-[#fb923c] text-7xl sm:text-8xl font-extrabold tracking-tight leading-none">
              {probability}
            </span>
            <span className="text-[#fb923c]/70 text-4xl sm:text-5xl font-medium">%</span>
          </div>
          <TierChip tier={probabilityTier} />
          <p className="text-white/50 text-xs sm:text-sm mt-3 m-0 max-w-xs">
            {targetPosition} · {targetCanton} — na základě <span className="text-white/70 font-semibold">{matchedCohortCount}</span> podobných profilů
          </p>
        </div>

        {/* Pravá: faktorový rozpad */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold tracking-[0.12em] text-white/40 uppercase m-0">
            Co tvoří tvoji šanci
          </p>
          <div className="space-y-2.5">
            {factors.map((f) => (
              <FactorRow key={f.id} {...f} />
            ))}
          </div>

          {/* Improvement strip */}
          <div className="mt-4 rounded-2xl bg-[#fb923c]/[0.08] border border-[#fb923c]/25 p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#fb923c]/15 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-[#fb923c]" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold m-0">
                Zvyš na <span className="text-[#fb923c]">{improvementTarget} %</span>
              </p>
              <p className="text-white/60 text-xs mt-0.5 m-0">
                {improvementTip}
              </p>
            </div>
            <button className="text-[#fb923c] text-xs font-bold whitespace-nowrap hover:underline">
              Začít →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function TierChip({ tier }: { tier: 'Slabá' | 'Solidní' | 'Silná' }) {
  const tiers: Array<'Slabá' | 'Solidní' | 'Silná'> = ['Slabá', 'Solidní', 'Silná']
  return (
    <div className="inline-flex items-center gap-1 mt-3 p-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
      {tiers.map((t) => (
        <span
          key={t}
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition ${
            t === tier
              ? 'bg-[#fb923c]/15 text-[#fb923c]'
              : 'text-white/35'
          }`}
        >
          {t}
        </span>
      ))}
    </div>
  )
}

function FactorRow({ label, score, status }: { label: string; score: number; status: 'good' | 'weak' }) {
  const barColor = status === 'good' ? '#fb923c' : '#71717a'
  const trackColor = status === 'good' ? 'rgba(251,146,60,0.15)' : 'rgba(255,255,255,0.05)'
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-white/75 flex-1 min-w-0">{label}</span>
      <div className="w-32 sm:w-44 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: trackColor }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: barColor }}
        />
      </div>
      <span className={`text-xs font-bold tabular-nums w-8 text-right ${status === 'good' ? 'text-[#fb923c]' : 'text-white/40'}`}>
        {score}%
      </span>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  4-UP STAT TILE                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

function StatTile({
  icon: Icon,
  value,
  label,
  sublabel,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  value: string
  label: string
  sublabel?: string
  accent?: boolean
}) {
  return (
    <div className="rounded-2xl bg-[#111120] border border-white/[0.06] p-4 sm:p-5 hover:border-white/[0.12] transition relative overflow-hidden group">
      <div className="flex items-start justify-between mb-3">
        <Icon
          className={`w-5 h-5 ${accent ? 'text-[#fb923c]' : 'text-white/40 group-hover:text-white/60'} transition`}
          strokeWidth={1.75}
        />
      </div>
      <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight m-0 tabular-nums ${accent ? 'text-[#fb923c]' : 'text-white'}`}>
        {value}
      </p>
      <p className="text-white/60 text-xs sm:text-sm font-medium mt-1 m-0">{label}</p>
      {sublabel && (
        <p className="text-white/35 text-[11px] mt-1.5 m-0">{sublabel}</p>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  PROFILE COMPLETION CARD  (Contra-style ring)                              */
/* ────────────────────────────────────────────────────────────────────────── */

function ProfileCompletionCard() {
  const { profileComplete, profileMissing } = SKELETON
  const circumference = 2 * Math.PI * 36
  const dashoffset = circumference - (profileComplete / 100) * circumference

  return (
    <div className="rounded-2xl bg-[#111120] border border-white/[0.06] p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-white/40 uppercase m-0">
          Stav profilu
        </p>
        {profileMissing === 0 && (
          <span className="text-[10px] bg-[#22c55e]/15 text-[#22c55e] font-bold px-1.5 py-0.5 rounded-full">
            HOTOVO
          </span>
        )}
      </div>

      <div className="flex items-center gap-5">
        {/* Ring */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 -rotate-90">
            <circle cx="48" cy="48" r="36" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
            <circle
              cx="48" cy="48" r="36"
              stroke="url(#completeGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="completeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-extrabold text-white tabular-nums">{profileComplete}%</span>
          </div>
        </div>

        {/* Info + CTA */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-base font-bold m-0">
            {profileMissing > 0 ? `Doplň ${profileMissing} ${profileMissing === 1 ? 'pole' : 'pole'}` : 'Vše vyplněno'}
          </p>
          <p className="text-white/50 text-xs mt-1 m-0">
            {profileMissing > 0
              ? 'Kompletní profil = vyšší šance na práci'
              : 'Profil je připraven pro Smart Apply'}
          </p>
          <a
            href="/profil/osobni-udaje"
            className="inline-flex items-center gap-1.5 mt-3 text-[#fb923c] text-xs font-bold no-underline hover:underline"
          >
            Otevřít profil →
          </a>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  ACTIVITY CARD  (sent vs replied bar chart simplified)                     */
/* ────────────────────────────────────────────────────────────────────────── */

function ActivityCard() {
  const { sentApplications, emailOpenRate, contactedAgencies, documentsCount } = SKELETON

  return (
    <div className="rounded-2xl bg-[#111120] border border-white/[0.06] p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-white/40 uppercase m-0">
          Tvoje aktivita
        </p>
        <span className="text-[10px] text-white/30">posledních 30 dní</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MiniStat icon={MailOpen} value={sentApplications} label="přihlášek" />
        <MiniStat icon={Target} value={`${emailOpenRate}%`} label="otevřelo HR" />
        <MiniStat icon={Building2} value={contactedAgencies} label="agentur kontaktováno" />
        <MiniStat icon={FileText} value={documentsCount} label="dokumentů" />
      </div>
    </div>
  )
}

function MiniStat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  value: string | number
  label: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
      <Icon className="w-4 h-4 text-white/40 flex-shrink-0" strokeWidth={1.75} />
      <div className="min-w-0">
        <p className="text-white text-lg font-extrabold tabular-nums m-0 leading-tight">{value}</p>
        <p className="text-white/40 text-[11px] m-0 mt-0.5 truncate">{label}</p>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  BENCHMARK FOOTER                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

function BenchmarkCard() {
  const { matchedCohortCount, avgDaysToFind } = SKELETON
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#0d0d18] to-[#111120] border border-white/[0.06] p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[#fb923c]/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#fb923c]" strokeWidth={2} />
        </div>
        <p className="text-[11px] font-semibold tracking-[0.12em] text-white/40 uppercase m-0">
          Benchmark
        </p>
      </div>
      <p className="text-white text-base m-0 leading-relaxed">
        Lidé s podobným profilem jako ty našli práci za <span className="text-[#fb923c] font-bold">Ø {avgDaysToFind} dní</span> ·
        <span className="text-white/50"> Vzorek {matchedCohortCount} úspěšných uchazečů</span>
      </p>
    </div>
  )
}
