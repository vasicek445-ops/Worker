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

interface UserStats {
  sent_total: number
  sent_week: number
  replies_total: number
  interviews_total: number
  documents_total: number
  reply_rate_pct: number
}

export default function DashboardContent({ agencyCount, jobCount, housingCount }: DashboardContentProps) {
  const [userName, setUserName] = useState(SKELETON.userName)
  const [stats, setStats] = useState<UserStats | null>(null)

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
        setUserName(profile.full_name.split(' ')[0])
      }

      try {
        const res = await fetch('/api/dashboard/stats', { credentials: 'include' })
        if (res.ok && !cancelled) {
          const json = (await res.json()) as UserStats
          setStats(json)
        }
      } catch {
        // necháme SKELETON placeholder
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
            value={(stats?.sent_total ?? 0).toString()}
            label="Tvých přihlášek"
            sublabel={
              stats && stats.sent_total > 0
                ? `${stats.replies_total} odpovědí · ${stats.reply_rate_pct}%`
                : 'Začni v Smart Apply'
            }
            accent
          />
        </div>

        {/* ─── ACTIVITY CHART (full-width time-series) ──────────────────── */}
        <ActivityChart />

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
/*  ACTIVITY CHART — time series line chart (Flixy pattern)                   */
/*  Pure SVG, no deps. Period switcher tabs (7/14/30 dni).                    */
/* ────────────────────────────────────────────────────────────────────────── */

type ChartRange = '7d' | '14d' | '30d'

interface ActivityPoint {
  date: string           // ISO yyyy-mm-dd
  label: string          // "23. 5."
  sent: number
  replies: number
  agencies_added: number
}

interface ActivityPayload {
  range: ChartRange
  data: ActivityPoint[]
  totals: {
    sent: number
    replies: number
    agencies_added: number
    total_agencies: number
  }
}

function emptyPayload(range: ChartRange): ActivityPayload {
  const days = range === '7d' ? 7 : range === '14d' ? 14 : 30
  const now = new Date()
  const out: ActivityPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    out.push({
      date: d.toISOString().slice(0, 10),
      label: `${d.getDate()}. ${d.getMonth() + 1}.`,
      sent: 0,
      replies: 0,
      agencies_added: 0,
    })
  }
  return { range, data: out, totals: { sent: 0, replies: 0, agencies_added: 0, total_agencies: 0 } }
}

function ActivityChart() {
  const [range, setRange] = useState<ChartRange>('7d')
  const [payload, setPayload] = useState<ActivityPayload>(() => emptyPayload('7d'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const res = await fetch(`/api/dashboard/activity?range=${range}`, { credentials: 'include' })
        if (res.ok && !cancelled) {
          const json = (await res.json()) as ActivityPayload
          setPayload(json)
        } else if (!cancelled) {
          setPayload(emptyPayload(range))
        }
      } catch {
        if (!cancelled) setPayload(emptyPayload(range))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [range])

  const data = payload.data

  // Chart dimensions
  const W = 800
  const H = 220
  const PAD_L = 32
  const PAD_R = 16
  const PAD_T = 12
  const PAD_B = 32
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B

  const maxY = Math.max(5, ...data.flatMap((d) => [d.sent, d.replies, d.agencies_added]))
  const yTicks = [0, Math.ceil(maxY / 2), maxY]

  // X coords
  const xAt = (i: number) =>
    PAD_L + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
  const yAt = (v: number) => PAD_T + innerH - (v / maxY) * innerH

  // Polyline points for each series
  const sentPath = data.map((d, i) => `${xAt(i)},${yAt(d.sent)}`).join(' ')
  const agenciesPath = data.map((d, i) => `${xAt(i)},${yAt(d.agencies_added)}`).join(' ')
  const repliesPath = data.map((d, i) => `${xAt(i)},${yAt(d.replies)}`).join(' ')

  // Area fill pod sent line
  const sentArea = `M${PAD_L},${PAD_T + innerH} L${sentPath} L${xAt(data.length - 1)},${PAD_T + innerH} Z`

  // Totals z payload (autoritativni — backend uz agreguje)
  const totalSent = payload.totals.sent
  const totalReplies = payload.totals.replies
  const totalAgenciesAdded = payload.totals.agencies_added
  const totalAgencies = payload.totals.total_agencies

  return (
    <section className="rounded-2xl bg-[#111120] border border-white/[0.06] p-5 sm:p-6">
      {/* Header: title + period tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.12em] text-white/40 uppercase m-0">
            Tvoje aktivita
          </p>
          <p className="text-white text-lg sm:text-xl font-bold mt-1 m-0">
            {loading ? 'Načítám…' : 'Posílání přihlášek v čase'}
          </p>
          {totalAgencies > 0 && (
            <p className="text-[11px] text-white/40 mt-1 m-0">
              Pro tebe pracuje {totalAgencies.toLocaleString('cs-CZ')} zaměstnavatelů
            </p>
          )}
        </div>
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/[0.06] self-start sm:self-auto">
          {(['7d', '14d', '30d'] as ChartRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition ${
                r === range ? 'bg-[#fb923c]/15 text-[#fb923c]' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {r === '7d' ? '7 dní' : r === '14d' ? '14 dní' : '30 dní'}
            </button>
          ))}
        </div>
      </div>

      {/* Legend + totals */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <LegendItem color="#fb923c" label="Odesláno" value={totalSent} />
        <LegendItem color="#22c55e" label="Odpovědi" value={totalReplies} />
        <LegendItem color="#60a5fa" label="Nových zaměstnavatelů" value={totalAgenciesAdded} />
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
          {/* Y grid */}
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={PAD_L} y1={yAt(t)} x2={W - PAD_R} y2={yAt(t)}
                stroke="rgba(255,255,255,0.05)" strokeWidth={1}
              />
              <text
                x={PAD_L - 8} y={yAt(t) + 4}
                fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="end"
              >
                {t}
              </text>
            </g>
          ))}

          {/* Area pod sent (orange tint) */}
          <defs>
            <linearGradient id="sentAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={sentArea} fill="url(#sentAreaGradient)" />

          {/* Lines */}
          <polyline points={sentPath} fill="none" stroke="#fb923c" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={repliesPath} fill="none" stroke="#22c55e" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={agenciesPath} fill="none" stroke="#60a5fa" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

          {/* Data point dots na sent (hero series) */}
          {data.map((d, i) => (
            <circle key={i} cx={xAt(i)} cy={yAt(d.sent)} r="3.5" fill="#fb923c" stroke="#0a0a12" strokeWidth={2} />
          ))}

          {/* X labels (each 2nd/3rd to avoid overlap on dense ranges) */}
          {data.map((d, i) => {
            const step = data.length > 14 ? Math.ceil(data.length / 7) : data.length > 7 ? 2 : 1
            if (i % step !== 0 && i !== data.length - 1) return null
            return (
              <text
                key={i}
                x={xAt(i)} y={H - 8}
                fill="rgba(255,255,255,0.35)" fontSize="10" textAnchor="middle"
              >
                {d.date}
              </text>
            )
          })}
        </svg>
      </div>
    </section>
  )
}

function LegendItem({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-white/60 text-xs">{label}</span>
      <span className="text-white font-bold text-sm tabular-nums">{value}</span>
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
