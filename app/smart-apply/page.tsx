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
  FileText,
  Building2,
  Calendar,
  ChevronLeft,
  Wand2,
} from 'lucide-react'

// ============================================================================
// Smart Apply — sjednoceny center s split-view layoutem (Teal/Handshake pattern).
// Vlevo: kompaktni job list. Vpravo: detail vybrane nabidky + AI motivacni draft
// + priložene CV + Posli za me CTA. Mobile: stack — list zmizne kdyz je vybrana
// nabidka, zpet sipkou.
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
  description: string | null
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

  const [gmailStatus, setGmailStatus] = useState<GmailStatus>({ state: 'loading' })
  const [gmailBusy, setGmailBusy] = useState(false)

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
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

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
      if (!selectedJob && data.jobs && data.jobs.length > 0) {
        setSelectedJob(data.jobs[0])
      }
    } catch {
      setJobs([])
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <main
      className="min-h-screen pb-12"
      style={{ background: '#0a0a12', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8 pt-6">
        <div className="mb-5">
          <div className="flex items-center gap-2.5 mb-2">
            <Sparkles size={26} className="text-[#fb923c]" strokeWidth={1.75} />
            <h1 className="text-white text-2xl font-bold tracking-tight m-0">Smart Apply</h1>
          </div>
          <p className="text-white/50 text-sm m-0">
            Najdeme ti nabídky, vygenerujeme motivační dopis a pošleme přihlášku z tvého Gmailu.
            Jedna aplikace = jedna minuta.
          </p>
        </div>

        {callbackError && (
          <div className="mb-4 p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-red-300 text-sm flex gap-3">
            <AlertCircle size={20} className="flex-shrink-0" />
            <div><strong>OAuth chyba:</strong> {callbackError}</div>
          </div>
        )}
        {callbackConnected && (
          <div className="mb-4 p-4 rounded-xl border border-[#fb923c]/30 bg-[#fb923c]/5 text-[#fb923c] text-sm flex gap-3">
            <CheckCircle2 size={20} className="flex-shrink-0" />
            <div>Gmail propojen. Můžeš začít posílat přihlášky.</div>
          </div>
        )}

        <div
          id="gmail-setup"
          className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6"
        >
          {gmailStatus.state === 'loading' && (
            <div className="flex items-center gap-3 text-white/40 text-sm">
              <Loader2 size={18} className="animate-spin" /> Načítám stav Gmailu…
            </div>
          )}
          {gmailStatus.state === 'not_connected' && (
            <>
              <div className="flex items-center gap-2.5 mb-2">
                <Mail size={22} className="text-[#fb923c]" strokeWidth={1.75} />
                <h2 className="text-white text-lg font-bold m-0">Připoj Gmail a začni</h2>
              </div>
              <p className="text-white/55 text-sm mb-5 leading-relaxed">
                Worker bude posílat tvé pracovní přihlášky z tvého vlastního Gmail účtu — vyšší reply rate než cold email,
                a všechny odpovědi ti chodí přímo do tvého Inboxu. Worker dostane pouze oprávnění{' '}
                <code className="bg-white/10 px-1.5 py-0.5 rounded text-[12px]">gmail.send</code> (posílání emailů z tvé adresy).
                NIKDY nemáme přístup ke čtení tvých emailů.
              </p>
              <div className="rounded-xl border border-[#ff8c2b]/25 bg-[#ff8c2b]/[0.06] p-4 mb-5 text-[13px] leading-relaxed text-white/65">
                <strong className="text-white/85">Co tě čeká:</strong> Google ti při přihlášení ukáže obrazovku „Tato aplikace není ověřená Googlem&quot;.{' '}
                <strong className="text-white/85">Je to v pořádku</strong> — Worker je nová aplikace a ověření u Googlu právě dokončuje.
                Klikni na <strong className="text-white/85">„Pokročilé&quot;</strong> a pak{' '}
                <strong className="text-white/85">„Přejít na gowoker.com&quot;</strong>.
              </div>
              <button
                disabled={gmailBusy}
                onClick={handleConnect}
                className="bg-[#ff8c2b] hover:bg-[#ff6a1f] disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-xl flex items-center gap-2 transition"
              >
                <Mail size={18} /> {gmailBusy ? 'Otevírám Google…' : 'Připojit Gmail'}
              </button>
            </>
          )}
          {gmailStatus.state === 'connected' && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={22} className="text-[#22c55e]" strokeWidth={1.75} />
                <div>
                  <div className="text-white text-base font-bold leading-tight">Gmail připojen</div>
                  <div className="text-white/50 text-sm">{gmailStatus.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/profil/agent"
                  className="text-[#ff8c2b] hover:text-[#ff6a1f] text-sm font-medium no-underline"
                >
                  Nastavit agenta →
                </Link>
                <button
                  type="button"
                  disabled={gmailBusy}
                  onClick={handleConnect}
                  className="text-white/40 hover:text-white text-xs underline"
                >
                  Připojit znovu
                </button>
              </div>
            </div>
          )}
          {gmailStatus.state === 'error' && (
            <div className="text-red-400 text-sm flex gap-2">
              <AlertCircle size={18} /> {gmailStatus.message}
            </div>
          )}
        </div>

        {/* Split-view: list + detail (Teal/Handshake pattern) */}
        <div className="grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-5">
          {/* LEFT — list (mobile hidden when detail selected) */}
          <div className={selectedJob ? 'hidden lg:flex' : 'flex'}>
            <div className="w-full flex flex-col">
              <form onSubmit={handleSearch} className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <Search size={14} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Hledej pozici nebo firmu..."
                    className="w-full bg-[#111120] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fb923c]/40 placeholder-white/30"
                  />
                </div>
              </form>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <select
                  value={canton}
                  onChange={(e) => { setCanton(e.target.value); setPage(1) }}
                  className="bg-[#111120] border border-white/[0.08] rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none cursor-pointer flex-1 min-w-0"
                >
                  <option value="" className="bg-[#111120]">Všechny kantony</option>
                  {Object.entries(CANTONS).map(([code, name]) => (
                    <option key={code} value={code} className="bg-[#111120]">{name}</option>
                  ))}
                </select>
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setPage(1) }}
                  className="bg-[#111120] border border-white/[0.08] rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none cursor-pointer flex-1 min-w-0"
                >
                  <option value="" className="bg-[#111120]">Všechny obory</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[#111120]">{c}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => { setJobType(jobType === 'remote' ? '' : 'remote'); setPage(1) }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1 shrink-0"
                  style={{
                    background: jobType === 'remote' ? 'rgba(251,146,60,0.1)' : '#111120',
                    borderColor: jobType === 'remote' ? 'rgba(251,146,60,0.3)' : 'rgba(255,255,255,0.08)',
                    color: jobType === 'remote' ? '#fb923c' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  <Home size={11} strokeWidth={1.75} /> Remote
                </button>
              </div>

              <div className="text-white/40 text-xs mb-3">
                {total > 0 && `${total} nabídek`}
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="ml-3 text-white/40 hover:text-white transition"
                  >
                    ✕ Vymazat filtry
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {loading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-[#111120] border border-white/[0.06] rounded-xl p-3 animate-pulse">
                      <div className="h-3 bg-white/[0.06] rounded w-3/4 mb-2" />
                      <div className="h-2.5 bg-white/[0.06] rounded w-1/2 mb-2" />
                      <div className="h-2.5 bg-white/[0.06] rounded w-1/3" />
                    </div>
                  ))
                ) : jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase size={36} className="mx-auto text-white/20 mb-3" strokeWidth={1.5} />
                    <h3 className="text-white font-semibold text-sm mb-1">Žádné nabídky</h3>
                    <p className="text-white/50 text-xs">Zkus změnit filtry</p>
                  </div>
                ) : (
                  jobs.map((job) => (
                    <JobCardCompact
                      key={job.id}
                      job={job}
                      isSelected={selectedJob?.id === job.id}
                      onClick={() => setSelectedJob(job)}
                      timeAgo={timeAgo}
                    />
                  ))
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="bg-[#111120] border border-white/[0.08] text-white px-3 py-1.5 rounded-lg text-xs disabled:opacity-30 hover:border-white/20 transition"
                  >
                    ←
                  </button>
                  <span className="text-white/50 text-xs">{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="bg-[#111120] border border-white/[0.08] text-white px-3 py-1.5 rounded-lg text-xs disabled:opacity-30 hover:border-white/20 transition"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — detail */}
          <div className={selectedJob ? 'block' : 'hidden lg:block'}>
            {selectedJob ? (
              <JobDetailPanel
                job={selectedJob}
                gmailConnected={gmailConnected}
                onBack={() => setSelectedJob(null)}
                timeAgo={timeAgo}
                sourceLabel={sourceLabel}
              />
            ) : (
              <EmptyDetailState />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

// ============================================================================
function JobCardCompact({
  job,
  isSelected,
  onClick,
  timeAgo,
}: {
  job: Job
  isSelected: boolean
  onClick: () => void
  timeAgo: (dateStr: string | null) => string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl p-3 transition-all"
      style={{
        background: isSelected ? 'rgba(251,146,60,0.06)' : '#111120',
        border: isSelected ? '1px solid rgba(251,146,60,0.4)' : '1px solid rgba(255,255,255,0.06)',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4
          className="font-semibold text-sm leading-snug m-0 line-clamp-2"
          style={{ color: isSelected ? '#fb923c' : '#fafafa' }}
        >
          {job.title}
        </h4>
        {job.posted_at && (
          <span className="text-white/30 text-[10px] flex-shrink-0 whitespace-nowrap mt-0.5">
            {timeAgo(job.posted_at)}
          </span>
        )}
      </div>
      <p className="text-white/55 text-xs m-0 mb-2 truncate">{job.company}</p>
      <div className="flex items-center gap-1.5 text-[11px] text-white/45">
        <MapPin size={10} strokeWidth={2} />
        <span className="truncate">{job.location}{job.canton ? ` (${job.canton})` : ''}</span>
        {job.remote && (
          <span className="text-green-400 ml-1 shrink-0">• Remote</span>
        )}
      </div>
      {job.category && (
        <div className="mt-2">
          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] border ${categoryColors[job.category] || 'bg-white/[0.03] text-white/60 border-white/[0.06]'}`}>
            {job.category}
          </span>
        </div>
      )}
    </button>
  )
}

// ============================================================================
function JobDetailPanel({
  job,
  gmailConnected,
  onBack,
  timeAgo,
  sourceLabel,
}: {
  job: Job
  gmailConnected: boolean
  onBack: () => void
  timeAgo: (dateStr: string | null) => string
  sourceLabel: (source: string) => string
}) {
  function handleApply() {
    if (!gmailConnected) {
      document.getElementById('gmail-setup')?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    alert(`Draft generation pro "${job.title}" — coming soon (Fáze 2 AI draft + Gmail send).`)
  }

  return (
    <div
      className="rounded-2xl border border-white/[0.06] bg-[#0d0d18] lg:sticky lg:top-6 flex flex-col"
      style={{ maxHeight: 'calc(100vh - 3rem)' }}
    >
      <button
        type="button"
        onClick={onBack}
        className="lg:hidden flex items-center gap-1.5 px-4 py-2.5 text-white/60 hover:text-white text-sm font-medium border-b border-white/[0.06]"
      >
        <ChevronLeft size={16} strokeWidth={1.75} /> Zpět na seznam
      </button>

      <div className="flex-1 overflow-y-auto p-5 lg:p-6">
        <div className="mb-4">
          <h2 className="text-white text-xl font-bold leading-tight mb-2 m-0">{job.title}</h2>
          <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
            <Building2 size={14} strokeWidth={1.75} />
            <span>{job.company}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white/50 text-xs">
            <span className="flex items-center gap-1">
              <MapPin size={12} strokeWidth={1.75} />
              {job.location}{job.canton ? ` (${job.canton})` : ''}
            </span>
            {job.posted_at && (
              <span className="flex items-center gap-1">
                <Calendar size={12} strokeWidth={1.75} />
                {timeAgo(job.posted_at)}
              </span>
            )}
            {job.source && job.source !== 'arbeitnow' && (
              <span className="text-white/35">via {sourceLabel(job.source)}</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5">
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
        </div>

        {job.description && (
          <div className="mb-5">
            <div className="text-[10px] uppercase font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>
              O pozici
            </div>
            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap m-0">
              {job.description.length > 600 ? job.description.slice(0, 600) + '…' : job.description}
            </p>
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-[#fb923c] text-xs no-underline hover:underline"
              >
                <ExternalLink size={11} strokeWidth={1.75} /> Číst celý inzerát
              </a>
            )}
          </div>
        )}

        <div className="rounded-xl border border-[#fb923c]/20 bg-[#fb923c]/[0.04] p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Wand2 size={16} className="text-[#fb923c]" strokeWidth={1.75} />
            <h3 className="text-white text-sm font-semibold m-0">AI motivační dopis</h3>
          </div>
          <p className="text-white/55 text-xs leading-relaxed mb-3">
            Wooky vygeneruje motivační dopis přesně pro tuto pozici z tvého profilu — pracovní zkušenosti,
            jazyky, kvalifikace. Vidíš preview, můžeš upravit, pak pošleš.
          </p>
          <button
            type="button"
            disabled
            className="text-[#fb923c] text-xs font-medium opacity-60 cursor-not-allowed"
          >
            ✨ Vygenerovat draft — coming soon
          </button>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={16} className="text-white/60" strokeWidth={1.75} />
            <h3 className="text-white text-sm font-semibold m-0">CV příloha</h3>
          </div>
          <p className="text-white/50 text-xs leading-relaxed m-0">
            K přihlášce automaticky přiložíme tvé poslední CV.{' '}
            <Link href="/dokumenty" className="text-[#fb923c] no-underline hover:underline">
              Spravovat CV →
            </Link>
          </p>
        </div>
      </div>

      <div className="border-t border-white/[0.06] p-4 flex items-center gap-2">
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            <ExternalLink size={13} strokeWidth={1.75} /> Originál
          </a>
        )}
        <button
          type="button"
          onClick={handleApply}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition"
          style={{
            background: gmailConnected ? 'linear-gradient(135deg, #fb923c, #f97316)' : 'rgba(251,146,60,0.12)',
            color: gmailConnected ? 'white' : '#fb923c',
            border: gmailConnected ? 'none' : '1px solid rgba(251,146,60,0.35)',
          }}
        >
          {gmailConnected ? (
            <>
              <Send size={15} strokeWidth={1.75} /> Pošli za mě
            </>
          ) : (
            <>
              <Mail size={15} strokeWidth={1.75} /> Připoj Gmail
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function EmptyDetailState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] flex flex-col items-center justify-center text-center py-20 px-6 min-h-[400px]">
      <Briefcase size={42} className="text-white/20 mb-3" strokeWidth={1.5} />
      <h3 className="text-white text-base font-semibold mb-1">Vyber nabídku</h3>
      <p className="text-white/50 text-sm max-w-sm">
        Klikni na nabídku zleva. Worker pak vygeneruje motivační dopis přesně pro tu pozici a přiloží tvé CV.
      </p>
    </div>
  )
}
