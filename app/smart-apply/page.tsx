'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '../supabase'
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Sparkles,
  Search,
  MapPin,
  Home,
  Briefcase,
  ExternalLink,
} from 'lucide-react'

// ============================================================================
// Smart Apply — sjednoceny center.
// Sjednocuje: drive samostatne /nabidky (job browse) + /profil/gmail (OAuth
// setup) + auto-draft motivacniho dopisu/emailu.
//
// Flow: user pripoji Gmail (1x setup) -> vidi seznam pasujicich nabidek ->
// kliknuti "Posli za me" -> AI vygeneruje draft z profile + job description
// -> preview + edit -> 1-click send pres user-uv vlastni Gmail.
// ============================================================================

type Job = {
  id: string
  title: string
  company: string
  location: string
  canton: string | null
  salary_text: string | null
  job_type: string
  category: string | null
  url: string | null
  remote: boolean
  posted_at: string | null
  tags: string[] | null
  source: string
}

type GmailStatus =
  | { state: 'loading' }
  | { state: 'not_connected' }
  | { state: 'connected'; email: string; connectedAt: string }
  | { state: 'error'; message: string }

const CANTONS: Record<string, string> = {
  ZH: 'Zürich', BE: 'Bern', LU: 'Luzern', UR: 'Uri', SZ: 'Schwyz',
  OW: 'Obwalden', NW: 'Nidwalden', GL: 'Glarus', ZG: 'Zug', FR: 'Fribourg',
  SO: 'Solothurn', BS: 'Basel-Stadt', BL: 'Basel-Land', SH: 'Schaffhausen',
  AR: 'Appenzell AR', AI: 'Appenzell AI', SG: 'St. Gallen', GR: 'Graubünden',
  AG: 'Aargau', TG: 'Thurgau', TI: 'Ticino', VD: 'Vaud', VS: 'Valais',
  NE: 'Neuchâtel', GE: 'Genève', JU: 'Jura',
}

const CATEGORIES = [
  'IT / Software', 'Stavebnictví', 'Gastronomie', 'Zdravotnictví',
  'Logistika', 'Elektro / Technik', 'Úklid / Údržba', 'Finance',
  'Marketing / Sales', 'HR / Admin',
]

const categoryColors: Record<string, string> = {
  'IT / Software': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Stavebnictví': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  'Gastronomie': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  'Zdravotnictví': 'bg-green-500/10 text-green-400 border-green-500/30',
  'Logistika': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'Elektro / Technik': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  'Finance': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'Marketing / Sales': 'bg-pink-500/10 text-pink-400 border-pink-500/30',
}

export default function SmartApplyPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#0a0a12]" />}>
      <SmartApplyContent />
    </Suspense>
  )
}

function SmartApplyContent() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackError = params.get('error')
  const callbackConnected = params.get('gmail') === 'connected'

  // Gmail state
  const [gmailStatus, setGmailStatus] = useState<GmailStatus>({ state: 'loading' })
  const [gmailBusy, setGmailBusy] = useState(false)

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [canton, setCanton] = useState('')
  const [category, setCategory] = useState('')
  const [jobType, setJobType] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // ===== Gmail =====
  const loadGmailStatus = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login?next=/smart-apply')
      return
    }
    const { data, error } = await supabase
      .from('email_oauth_tokens')
      .select('email, connected_at, revoked')
      .eq('provider', 'gmail')
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      setGmailStatus({ state: 'error', message: error.message })
      return
    }
    if (!data || data.revoked) {
      setGmailStatus({ state: 'not_connected' })
      return
    }
    setGmailStatus({ state: 'connected', email: data.email, connectedAt: data.connected_at })
  }, [router])

  async function handleConnect() {
    setGmailBusy(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')
      const res = await fetch('/api/auth/gmail/connect', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const json = await res.json()
      if (!res.ok || !json.url) throw new Error(json.error || 'Failed to start OAuth')
      window.location.href = json.url
    } catch (err) {
      setGmailStatus({ state: 'error', message: err instanceof Error ? err.message : 'OAuth start failed' })
      setGmailBusy(false)
    }
  }

  // ===== Jobs =====
  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (canton) params.set('canton', canton)
      if (category) params.set('category', category)
      if (jobType) params.set('type', jobType)
      params.set('page', page.toString())
      const res = await fetch(`/api/jobs?${params}`)
      const data = await res.json()
      setJobs(data.jobs || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 0)
    } catch {
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [search, canton, category, jobType, page])

  useEffect(() => { void loadGmailStatus() }, [loadGmailStatus])
  useEffect(() => { void fetchJobs() }, [fetchJobs])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  function clearFilters() {
    setSearch('')
    setSearchInput('')
    setCanton('')
    setCategory('')
    setJobType('')
    setPage(1)
  }

  const hasFilters = !!(search || canton || category || jobType)
  const gmailConnected = gmailStatus.state === 'connected'

  function timeAgo(dateStr: string | null): string {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Dnes'
    if (days === 1) return 'Včera'
    if (days < 7) return `Před ${days} dny`
    if (days < 30) return `Před ${Math.floor(days / 7)} týdny`
    return `Před ${Math.floor(days / 30)} měsíci`
  }

  function sourceLabel(source: string): string {
    const labels: Record<string, string> = {
      michaelpage: 'Michael Page', roberthalf: 'Robert Half',
      jobsch: 'jobs.ch', jooble: 'Jooble', arbeitnow: 'arbeitnow',
    }
    return labels[source] || source
  }

  function handleApply(job: Job) {
    if (!gmailConnected) {
      // Scroll na Gmail setup
      document.getElementById('gmail-setup')?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    // TODO Fáze 2: otevřít draft modal/drawer s AI-generated motivačním emailem
    alert(`Draft generation pro "${job.title}" — coming soon (Fáze 2 AI draft + Gmail send).`)
  }

  return (
    <main
      className="min-h-screen pb-24"
      style={{ background: '#0a0a12', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="max-w-[1100px] mx-auto px-5 lg:px-8 pt-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-2">
            <Sparkles size={26} className="text-[#fb923c]" strokeWidth={1.75} />
            <h1 className="text-white text-2xl font-bold tracking-tight m-0">Smart Apply</h1>
          </div>
          <p className="text-white/50 text-sm m-0">
            Najdeme ti nabídky, vygenerujeme motivační dopis a pošleme přihlášku z tvého Gmailu.
            Jedna aplikace = jedna minuta.
          </p>
        </div>

        {/* OAuth callback banners */}
        {callbackError && (
          <div className="mb-4 p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-red-300 text-sm flex gap-3">
            <AlertCircle size={20} className="flex-shrink-0" />
            <div>
              <strong>OAuth chyba:</strong> {callbackError}
            </div>
          </div>
        )}
        {callbackConnected && (
          <div className="mb-4 p-4 rounded-xl border border-[#fb923c]/30 bg-[#fb923c]/5 text-[#fb923c] text-sm flex gap-3">
            <CheckCircle2 size={20} className="flex-shrink-0" />
            <div>Gmail propojen. Můžeš začít posílat přihlášky.</div>
          </div>
        )}

        {/* Gmail setup card */}
        <div
          id="gmail-setup"
          className="rounded-2xl border p-5 mb-6"
          style={{
            background: gmailConnected ? 'rgba(34,197,94,0.04)' : 'rgba(251,146,60,0.04)',
            borderColor: gmailConnected ? 'rgba(34,197,94,0.2)' : 'rgba(251,146,60,0.25)',
          }}
        >
          {gmailStatus.state === 'loading' && (
            <div className="flex items-center gap-3 text-white/40 text-sm">
              <Loader2 size={18} className="animate-spin" /> Načítám stav Gmailu…
            </div>
          )}
          {gmailStatus.state === 'not_connected' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Mail size={20} className="text-[#fb923c]" strokeWidth={1.75} />
                  <h2 className="text-white text-base font-semibold m-0">Připoj Gmail a začni</h2>
                </div>
                <p className="text-white/55 text-sm m-0">
                  Worker bude posílat z tvé adresy — vyšší reply rate, odpovědi chodí přímo k tobě.
                  Jen <code className="bg-white/10 px-1 py-0.5 rounded text-xs">gmail.send</code> oprávnění, čtení nikdy.
                </p>
              </div>
              <button
                disabled={gmailBusy}
                onClick={handleConnect}
                className="bg-[#fb923c] hover:bg-[#f97316] disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition shrink-0"
              >
                <Mail size={16} /> {gmailBusy ? 'Otevírám…' : 'Připojit Gmail'}
              </button>
            </div>
          )}
          {gmailStatus.state === 'connected' && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <CheckCircle2 size={20} className="text-[#22c55e] shrink-0" strokeWidth={1.75} />
                <div className="min-w-0">
                  <div className="text-white text-sm font-semibold leading-tight">Gmail připojen</div>
                  <div className="text-white/40 text-xs truncate">{gmailStatus.email}</div>
                </div>
              </div>
              <Link
                href="/profil/agent"
                className="text-[#fb923c] hover:text-[#f97316] text-xs font-medium no-underline"
              >
                Nastavit agenta →
              </Link>
            </div>
          )}
          {gmailStatus.state === 'error' && (
            <div className="text-red-400 text-sm flex gap-2">
              <AlertCircle size={18} /> {gmailStatus.message}
            </div>
          )}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search
              size={16}
              strokeWidth={1.75}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Hledej pozici nebo firmu..."
              className="w-full bg-[#111120] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#fb923c]/40 placeholder-white/30"
            />
          </div>
          <button
            type="submit"
            className="bg-[#fb923c] hover:bg-[#f97316] text-white px-5 py-3 rounded-xl text-sm font-semibold transition flex items-center gap-2"
          >
            <Search size={16} /> Hledat
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-2">
          <select
            value={canton}
            onChange={(e) => { setCanton(e.target.value); setPage(1) }}
            className="bg-[#111120] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#fb923c]/40 appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#111120]">Všechny kantony</option>
            {Object.entries(CANTONS).map(([code, name]) => (
              <option key={code} value={code} className="bg-[#111120]">{name}</option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1) }}
            className="bg-[#111120] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#fb923c]/40 appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#111120]">Všechny obory</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-[#111120]">{c}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => { setJobType(jobType === 'remote' ? '' : 'remote'); setPage(1) }}
            className="px-3 py-2 rounded-lg text-xs font-medium border transition flex items-center gap-1.5"
            style={{
              background: jobType === 'remote' ? 'rgba(251,146,60,0.1)' : '#111120',
              borderColor: jobType === 'remote' ? 'rgba(251,146,60,0.3)' : 'rgba(255,255,255,0.08)',
              color: jobType === 'remote' ? '#fb923c' : 'rgba(255,255,255,0.6)',
            }}
          >
            <Home size={12} strokeWidth={1.75} /> Remote
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-white/40 text-xs hover:text-white transition self-center"
            >
              ✕ Vymazat
            </button>
          )}
          <div className="ml-auto self-center text-white/40 text-xs">
            {total > 0 && `${total} nabídek`}
          </div>
        </div>

        {/* Job list */}
        <div className="mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-[#111120] border border-white/[0.06] rounded-2xl p-4 animate-pulse">
                  <div className="h-4 bg-white/[0.06] rounded w-3/4 mb-3" />
                  <div className="h-3 bg-white/[0.06] rounded w-1/2 mb-2" />
                  <div className="h-3 bg-white/[0.06] rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase size={40} className="mx-auto text-white/20 mb-4" strokeWidth={1.5} />
              <h3 className="text-white font-bold text-lg mb-2">Žádné nabídky nenalezeny</h3>
              <p className="text-white/50 text-sm mb-4">Zkus změnit filtry nebo hledaný výraz</p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[#fb923c] text-sm font-bold hover:underline"
                >
                  Vymazat filtry
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  gmailConnected={gmailConnected}
                  onApply={() => handleApply(job)}
                  timeAgo={timeAgo}
                  sourceLabel={sourceLabel}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="bg-[#111120] border border-white/[0.08] text-white px-4 py-2 rounded-xl text-sm disabled:opacity-30 hover:border-white/20 transition"
              >
                ← Předchozí
              </button>
              <span className="text-white/50 text-sm">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="bg-[#111120] border border-white/[0.08] text-white px-4 py-2 rounded-xl text-sm disabled:opacity-30 hover:border-white/20 transition"
              >
                Další →
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

// ============================================================================
// Job card
// ============================================================================
function JobCard({
  job,
  gmailConnected,
  onApply,
  timeAgo,
  sourceLabel,
}: {
  job: Job
  gmailConnected: boolean
  onApply: () => void
  timeAgo: (dateStr: string | null) => string
  sourceLabel: (source: string) => string
}) {
  return (
    <div className="bg-[#111120] border border-white/[0.06] rounded-2xl p-4 hover:border-white/[0.12] transition">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 mr-3 min-w-0">
          <h4 className="text-white font-bold text-base leading-tight mb-1 truncate">{job.title}</h4>
          <p className="text-white/50 text-sm m-0">{job.company}</p>
        </div>
        {job.posted_at && (
          <span className="text-white/30 text-[10px] flex-shrink-0">{timeAgo(job.posted_at)}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="bg-white/[0.03] border border-white/[0.06] text-white/60 rounded-full px-2.5 py-0.5 text-[11px] flex items-center gap-1">
          <MapPin size={10} strokeWidth={2} />
          {job.location}{job.canton ? ` (${job.canton})` : ''}
        </span>
        {job.category && (
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] border ${categoryColors[job.category] || 'bg-white/[0.03] text-white/60 border-white/[0.06]'}`}>
            {job.category}
          </span>
        )}
        {job.remote && (
          <span className="bg-green-500/10 text-green-400 border border-green-500/30 rounded-full px-2.5 py-0.5 text-[11px] flex items-center gap-1">
            <Home size={10} strokeWidth={2} /> Remote
          </span>
        )}
        {job.salary_text && (
          <span className="bg-white/[0.03] border border-white/[0.06] text-white/60 rounded-full px-2.5 py-0.5 text-[11px]">
            💰 {job.salary_text}
          </span>
        )}
        {job.source && job.source !== 'arbeitnow' && (
          <span className="bg-white/[0.03] border border-white/[0.06] text-white/40 rounded-full px-2.5 py-0.5 text-[10px]">
            {sourceLabel(job.source)}
          </span>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={onApply}
          className="flex-1 min-w-[140px] text-white text-center py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"
          style={{
            background: gmailConnected ? 'linear-gradient(135deg, #fb923c, #f97316)' : 'rgba(251,146,60,0.15)',
            color: gmailConnected ? 'white' : '#fb923c',
            border: gmailConnected ? 'none' : '1px solid rgba(251,146,60,0.3)',
          }}
        >
          {gmailConnected ? (
            <>
              <Send size={14} strokeWidth={1.75} /> Pošli za mě
            </>
          ) : (
            <>
              <Mail size={14} strokeWidth={1.75} /> Připoj Gmail pro odeslání
            </>
          )}
        </button>
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0a0a12] border border-white/[0.08] text-white/60 py-2.5 px-4 rounded-xl text-sm font-medium no-underline hover:border-white/20 transition flex items-center gap-1.5"
          >
            <ExternalLink size={12} strokeWidth={1.75} /> Originál
          </a>
        )}
      </div>
    </div>
  )
}
