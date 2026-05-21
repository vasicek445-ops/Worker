'use client'

import { Suspense, useEffect, useState, useCallback, useRef } from 'react'
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
  Building2,
  ChevronLeft,
  Wand2,
  RotateCw,
  Globe,
  Briefcase,
  Flame,
  ExternalLink,
  FileText,
} from 'lucide-react'

interface SavedDoc {
  id: string
  type: 'cv' | 'letter'
  title: string
  updated_at: string
}

// ============================================================================
// Smart Apply — agency-first (po pivotu 2026-05-21). DB-first architektura:
// 946 CH agentur s overenymi HR emaily misto scraping job boardu.
// Listing /api/agencies, AI draft per agency (general motivacni email),
// send pres Gmail OAuth.
// ============================================================================

type AgencyEntry = {
  id: number
  company: string
  city: string | null
  canton: string | null
  region: 'german' | 'french' | 'italian' | string | null
  email: string
  website: string | null
  has_open_positions: boolean | null
  current_positions: string[] | null
  industry: string[] | null
  last_hiring_check_at: string | null
}

type GmailStatus =
  | { state: 'loading' }
  | { state: 'not_connected' }
  | { state: 'connected'; email: string; connectedAt: string }
  | { state: 'error'; message: string }

const REGIONS: Array<{ id: string; label: string; flag: string }> = [
  { id: '', label: 'Všechny regiony', flag: '🇨🇭' },
  { id: 'german', label: 'Německá CH', flag: '🇩🇪' },
  { id: 'french', label: 'Francouzská CH', flag: '🇫🇷' },
  { id: 'italian', label: 'Italská CH', flag: '🇮🇹' },
]

const INDUSTRIES = [
  'Logistika', 'Stavba', 'Gastronomie', 'Péče', 'Úklid', 'Doprava',
  'Výroba', 'Zemědělství', 'Maloobchod', 'Bezpečnost', 'Administrativa',
]

const CANTONS: Record<string, string> = {
  ZH: 'Zürich', BE: 'Bern', LU: 'Luzern', UR: 'Uri', SZ: 'Schwyz',
  OW: 'Obwalden', NW: 'Nidwalden', GL: 'Glarus', ZG: 'Zug', FR: 'Fribourg',
  SO: 'Solothurn', BS: 'Basel-Stadt', BL: 'Basel-Land', SH: 'Schaffhausen',
  AR: 'Appenzell AR', AI: 'Appenzell AI', SG: 'St. Gallen', GR: 'Graubünden',
  AG: 'Aargau', TG: 'Thurgau', TI: 'Ticino', VD: 'Vaud', VS: 'Valais',
  NE: 'Neuchâtel', GE: 'Genève', JU: 'Jura',
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

  const [agencies, setAgencies] = useState<AgencyEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('german') // default = german (Worker target)
  const [canton, setCanton] = useState('')
  const [industry, setIndustry] = useState('')
  const [hiringOnly, setHiringOnly] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [selectedAgency, setSelectedAgency] = useState<AgencyEntry | null>(null)

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

  const fetchAgencies = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (region) params.set('region', region)
      if (canton) params.set('canton', canton)
      if (industry) params.set('industry', industry)
      if (hiringOnly) params.set('hiring_only', '1')
      params.set('page', page.toString())
      const res = await fetch(`/api/agencies?${params}`)
      const data = await res.json()
      const list: AgencyEntry[] = data.agencies || []
      setAgencies(list)
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 0)
      if (!selectedAgency && list.length > 0) {
        setSelectedAgency(list[0])
      } else if (selectedAgency && !list.find((a) => a.id === selectedAgency.id)) {
        setSelectedAgency(list[0] || null)
      }
    } catch {
      setAgencies([])
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, region, canton, industry, hiringOnly, page])

  useEffect(() => { void loadGmailStatus() }, [loadGmailStatus])
  useEffect(() => { void fetchAgencies() }, [fetchAgencies])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  function clearFilters() {
    setSearch('')
    setSearchInput('')
    setRegion('german')
    setCanton('')
    setIndustry('')
    setHiringOnly(false)
    setPage(1)
  }

  const hasFilters = !!(search || canton || industry || hiringOnly || region !== 'german')
  const gmailConnected = gmailStatus.state === 'connected'

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
            946 ověřených CH personálních agentur s HR e-maily. Pošli motivační dopis přímo zaměstnavateli — z tvého Gmailu, AI ho personalizuje za tebe.
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

        {/* Gmail card */}
        <div id="gmail-setup" className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6">
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
                Worker bude posílat tvé pracovní přihlášky z tvého vlastního Gmail účtu — vyšší reply rate, odpovědi chodí přímo k tobě. Jen{' '}
                <code className="bg-white/10 px-1.5 py-0.5 rounded text-[12px]">gmail.send</code> oprávnění, čtení nikdy.
              </p>
              <div className="rounded-xl border border-[#ff8c2b]/25 bg-[#ff8c2b]/[0.06] p-4 mb-5 text-[13px] leading-relaxed text-white/65">
                <strong className="text-white/85">Co tě čeká:</strong> Google ti při přihlášení ukáže obrazovku „Tato aplikace není ověřená Googlem&quot;.{' '}
                <strong className="text-white/85">Je to v pořádku</strong> — klikni <strong className="text-white/85">„Pokročilé&quot;</strong> → <strong className="text-white/85">„Přejít na gowoker.com&quot;</strong>.
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
              <button
                type="button"
                disabled={gmailBusy}
                onClick={handleConnect}
                className="text-white/40 hover:text-white text-xs underline"
              >
                Připojit znovu
              </button>
            </div>
          )}
          {gmailStatus.state === 'error' && (
            <div className="text-red-400 text-sm flex gap-2">
              <AlertCircle size={18} /> {gmailStatus.message}
            </div>
          )}
        </div>

        {/* Split view */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* LEFT: agency list */}
          <div className={selectedAgency ? 'hidden lg:flex' : 'flex'}>
            <div className="w-full flex flex-col">
              <form onSubmit={handleSearch} className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <Search size={14} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Hledej firmu nebo město..."
                    className="w-full bg-[#111120] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fb923c]/40 placeholder-white/30"
                  />
                </div>
              </form>

              {/* Region chips */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {REGIONS.map((r) => {
                  const active = region === r.id
                  return (
                    <button
                      key={r.id || 'all'}
                      type="button"
                      onClick={() => { setRegion(r.id); setPage(1) }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition"
                      style={{
                        background: active ? 'rgba(251,146,60,0.12)' : '#111120',
                        borderColor: active ? 'rgba(251,146,60,0.4)' : 'rgba(255,255,255,0.08)',
                        color: active ? '#fb923c' : 'rgba(255,255,255,0.6)',
                      }}
                    >
                      <span>{r.flag}</span> {r.label}
                    </button>
                  )
                })}
              </div>

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
                  value={industry}
                  onChange={(e) => { setIndustry(e.target.value); setPage(1) }}
                  className="bg-[#111120] border border-white/[0.08] rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none cursor-pointer flex-1 min-w-0"
                >
                  <option value="" className="bg-[#111120]">Všechny obory</option>
                  {INDUSTRIES.map((c) => (
                    <option key={c} value={c} className="bg-[#111120]">{c}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => { setHiringOnly((v) => !v); setPage(1) }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1 shrink-0"
                  style={{
                    background: hiringOnly ? 'rgba(251,146,60,0.1)' : '#111120',
                    borderColor: hiringOnly ? 'rgba(251,146,60,0.3)' : 'rgba(255,255,255,0.08)',
                    color: hiringOnly ? '#fb923c' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  <Flame size={11} strokeWidth={1.75} /> Hire teď
                </button>
              </div>

              <div className="text-white/40 text-xs mb-3 flex items-center gap-2 flex-wrap">
                <span>
                  {total > 0 && (
                    <>
                      <span className="text-white/70 font-semibold">{total}</span> agentur s e-mailem
                    </>
                  )}
                </span>
                {hasFilters && (
                  <button type="button" onClick={clearFilters} className="text-white/40 hover:text-white transition">
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
                ) : agencies.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 size={36} className="mx-auto text-white/20 mb-3" strokeWidth={1.5} />
                    <h3 className="text-white font-semibold text-sm mb-1">Žádné agentury</h3>
                    <p className="text-white/50 text-xs">Zkus změnit filtry</p>
                  </div>
                ) : (
                  agencies.map((a) => (
                    <AgencyCardCompact
                      key={a.id}
                      agency={a}
                      isSelected={selectedAgency?.id === a.id}
                      onClick={() => setSelectedAgency(a)}
                    />
                  ))
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="bg-[#111120] border border-white/[0.08] text-white px-3 py-1.5 rounded-lg text-xs disabled:opacity-30 hover:border-white/20 transition">←</button>
                  <span className="text-white/50 text-xs">{page} / {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="bg-[#111120] border border-white/[0.08] text-white px-3 py-1.5 rounded-lg text-xs disabled:opacity-30 hover:border-white/20 transition">→</button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: detail */}
          <div className={selectedAgency ? 'block' : 'hidden lg:block'}>
            {selectedAgency ? (
              <AgencyDetailPanel
                agency={selectedAgency}
                gmailConnected={gmailConnected}
                onBack={() => setSelectedAgency(null)}
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
function AgencyCardCompact({ agency, isSelected, onClick }: {
  agency: AgencyEntry
  isSelected: boolean
  onClick: () => void
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
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="font-semibold text-sm leading-snug m-0 line-clamp-2" style={{ color: isSelected ? '#fb923c' : '#fafafa' }}>
          {agency.company}
        </h4>
        {agency.has_open_positions && (
          <span title="Aktuálně hire-uje" className="flex-shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c' }}>
            <Flame size={9} strokeWidth={2} /> HOT
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-white/45 mb-1">
        <MapPin size={10} strokeWidth={2} />
        <span className="truncate">{agency.city || '—'}{agency.canton ? ` (${agency.canton})` : ''}</span>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-white/40 truncate">
        <Mail size={10} strokeWidth={2} />
        <span className="truncate">{agency.email}</span>
      </div>
      {agency.industry && agency.industry.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {agency.industry.slice(0, 3).map((ind) => (
            <span key={ind} className="inline-block rounded-full px-1.5 py-0.5 text-[10px] border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
              {ind}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}

// ============================================================================
function AgencyDetailPanel({ agency, gmailConnected, onBack }: {
  agency: AgencyEntry
  gmailConnected: boolean
  onBack: () => void
}) {
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null)
  const [hasCv, setHasCv] = useState<boolean | null>(null)
  const [cvUrl, setCvUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [draftError, setDraftError] = useState<string | null>(null)

  // Saved documents (CV + letter) — user vybere z listu, jinak default (nejnovejsi CV + AI letter)
  const [savedDocs, setSavedDocs] = useState<SavedDoc[]>([])
  const [cvDocId, setCvDocId] = useState<string>('')        // '' = nejnovejsi (default)
  const [letterDocId, setLetterDocId] = useState<string>('') // '' = AI vygenerovany

  // Nacti user-ovy uloznene dokumenty pri mountu
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase
        .from('saved_documents')
        .select('id, type, title, updated_at')
        .eq('user_id', session.user.id)
        .in('type', ['cv', 'letter'])
        .order('updated_at', { ascending: false })
      if (!cancelled && data) setSavedDocs(data as SavedDoc[])
    })()
    return () => { cancelled = true }
  }, [])
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendErrorHint, setSendErrorHint] = useState<string | null>(null)
  const [sent, setSent] = useState<{ messageId: string; attachments: string[] } | null>(null)

  const lastAgencyIdRef = useRef<number | null>(null)
  useEffect(() => {
    if (lastAgencyIdRef.current !== agency.id) {
      lastAgencyIdRef.current = agency.id
      setDraft(null)
      setGenerating(false)
      setDraftError(null)
      setSending(false)
      setSendError(null)
      setSent(null)
    }
  }, [agency.id])

  async function generateDraft() {
    if (generating) return
    setGenerating(true)
    setDraftError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Musíš být přihlášený')
      const res = await fetch('/api/smart-apply/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ agencyId: agency.id }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}`)
      setDraft({ subject: body.subject, body: body.body })
      setHasCv(body.has_cv ?? false)
      setCvUrl(body.cv_url ?? null)
    } catch (e) {
      setDraftError(e instanceof Error ? e.message : 'Generování selhalo')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSend() {
    if (!draft || !gmailConnected) {
      if (!gmailConnected) document.getElementById('gmail-setup')?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    setSending(true)
    setSendError(null)
    setSendErrorHint(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Musíš být přihlášený')
      const res = await fetch('/api/smart-apply/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          agencyId: agency.id,
          to: agency.email,
          subject: draft.subject,
          body: draft.body,
          cv_doc_id: cvDocId || null,
          letter_doc_id: letterDocId || null,
        }),
      })
      const body = await res.json()
      if (!res.ok) {
        setSendError(body?.error || `HTTP ${res.status}`)
        if (body?.hint) setSendErrorHint(body.hint)
        return
      }
      setSent({ messageId: body.message_id, attachments: body.attachments || [] })
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Odeslání selhalo')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d18] lg:sticky lg:top-6 flex flex-col" style={{ maxHeight: 'calc(100vh - 3rem)' }}>
      <button type="button" onClick={onBack} className="lg:hidden flex items-center gap-1.5 px-4 py-2.5 text-white/60 hover:text-white text-sm font-medium border-b border-white/[0.06]">
        <ChevronLeft size={16} strokeWidth={1.75} /> Zpět na seznam
      </button>

      <div className="flex-1 overflow-y-auto p-5 lg:p-6">
        <div className="mb-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="text-white text-xl font-bold leading-tight m-0">{agency.company}</h2>
            {agency.has_open_positions && (
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold" style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c' }}>
                <Flame size={11} strokeWidth={2} /> HOT
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white/55 text-sm">
            {agency.city && (
              <span className="flex items-center gap-1">
                <MapPin size={13} strokeWidth={1.75} />
                {agency.city}{agency.canton ? ` (${agency.canton})` : ''}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Mail size={13} strokeWidth={1.75} />
              <a href={`mailto:${agency.email}`} className="text-[#fb923c] no-underline hover:underline">{agency.email}</a>
            </span>
            {agency.website && (
              <a href={agency.website.startsWith('http') ? agency.website : `https://${agency.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#fb923c] no-underline hover:underline">
                <Globe size={13} strokeWidth={1.75} /> Web
              </a>
            )}
          </div>
        </div>

        {agency.current_positions && agency.current_positions.length > 0 && (
          <div className="rounded-xl border border-[#fb923c]/20 bg-[#fb923c]/[0.04] p-3 mb-5">
            <div className="text-[10px] uppercase font-semibold mb-1.5" style={{ color: 'rgba(251,146,60,0.85)', letterSpacing: '0.08em' }}>
              Aktuálně nabízejí
            </div>
            <ul className="text-white/75 text-sm space-y-0.5 m-0 pl-0 list-none">
              {agency.current_positions.slice(0, 6).map((p, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <Briefcase size={12} className="text-[#fb923c] shrink-0 mt-0.5" strokeWidth={1.75} />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {agency.industry && agency.industry.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {agency.industry.map((ind) => (
              <span key={ind} className="rounded-full px-2.5 py-0.5 text-[11px] border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}>
                {ind}
              </span>
            ))}
          </div>
        )}

        {/* AI motivacni email */}
        <div className="rounded-xl border border-[#fb923c]/20 bg-[#fb923c]/[0.04] p-4 mb-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Wand2 size={16} className="text-[#fb923c]" strokeWidth={1.75} />
              <h3 className="text-white text-sm font-semibold m-0">AI motivační email</h3>
            </div>
            {draft && !generating && (
              <button type="button" onClick={generateDraft} className="inline-flex items-center gap-1 text-white/50 hover:text-white text-xs transition">
                <RotateCw size={11} strokeWidth={1.75} /> Znovu
              </button>
            )}
          </div>

          {!draft && !generating && (
            <>
              <p className="text-white/55 text-xs leading-relaxed mb-3">
                Wooky vygeneruje general motivační email pro tuto agenturu z tvého profilu (zkušenosti, jazyky, povolení). Můžeš upravit před odesláním.
              </p>
              <button type="button" onClick={generateDraft} className="inline-flex items-center gap-1.5 bg-[#fb923c] hover:bg-[#f97316] text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                <Sparkles size={14} strokeWidth={1.75} /> Vygenerovat draft
              </button>
            </>
          )}

          {generating && (
            <div className="flex items-center gap-2.5 text-white/70 text-sm py-2">
              <Loader2 size={16} className="animate-spin text-[#fb923c]" />
              <span>Generuji email… (~7s)</span>
            </div>
          )}

          {draftError && (
            <div className="text-red-400 text-xs mt-2 flex items-start gap-1.5">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              <span>{draftError}</span>
            </div>
          )}

          {draft && (
            <div className="space-y-3 mt-2">
              <div>
                <label className="block text-[10px] uppercase font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>Předmět</label>
                <input type="text" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} className="w-full bg-[#0a0a12] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#fb923c]/40" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>Tělo emailu</label>
                <textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={12} className="w-full bg-[#0a0a12] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm leading-relaxed focus:outline-none focus:border-[#fb923c]/40 resize-y font-[inherit]" />
              </div>
            </div>
          )}
        </div>

        {/* Selector PDF priloh: user vybere konkretni CV + motivacni dopis z /dokumenty.
            Pokud nic nevybere, send pouzije nejnovejsi CV + AI generovany dopis. */}
        {draft !== null && (() => {
          const cvDocs = savedDocs.filter((d) => d.type === 'cv')
          const letterDocs = savedDocs.filter((d) => d.type === 'letter')
          const hasAnyCv = cvDocs.length > 0
          return (
            <div className="rounded-xl border p-4 mb-5" style={{
              background: hasAnyCv ? 'rgba(34,197,94,0.04)' : 'rgba(251,146,60,0.04)',
              borderColor: hasAnyCv ? 'rgba(34,197,94,0.2)' : 'rgba(251,146,60,0.2)',
            }}>
              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} className={hasAnyCv ? 'text-[#22c55e]' : 'text-[#fb923c]'} strokeWidth={1.75} />
                <h3 className="text-white text-sm font-semibold m-0">PDF přílohy k emailu</h3>
              </div>

              {!hasAnyCv ? (
                <div className="text-white/60 text-xs leading-relaxed">
                  Nemáš zatím v <Link href="/dokumenty" className="text-[#fb923c] no-underline hover:underline">Moje dokumenty</Link> uložené žádné CV. Pro CH HR je životopis standard — Email bez něj nelze odeslat.
                  <div className="mt-2">
                    <Link href="/pruvodce/sablony/cv" className="inline-flex items-center gap-1 bg-[#fb923c] hover:bg-[#f97316] text-white text-xs font-semibold px-3 py-1.5 rounded-lg no-underline transition">
                      Vytvořit CV →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] uppercase font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>
                      📄 Životopis (CV)
                    </label>
                    <select
                      value={cvDocId}
                      onChange={(e) => setCvDocId(e.target.value)}
                      className="w-full bg-[#0a0a12] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#fb923c]/40 appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-[#0a0a12]">— nejnovější uložené CV —</option>
                      {cvDocs.map((d) => (
                        <option key={d.id} value={d.id} className="bg-[#0a0a12]">
                          {d.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>
                      ✉️ Motivační dopis
                    </label>
                    <select
                      value={letterDocId}
                      onChange={(e) => setLetterDocId(e.target.value)}
                      className="w-full bg-[#0a0a12] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#fb923c]/40 appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-[#0a0a12]">— AI vygenerovaný z draftu nahoře —</option>
                      {letterDocs.map((d) => (
                        <option key={d.id} value={d.id} className="bg-[#0a0a12]">
                          {d.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-white/40 text-[11px] m-0 mt-2">
                    Spravuj uložené PDF v{' '}
                    <Link href="/dokumenty" className="text-[#fb923c] no-underline hover:underline">Moje dokumenty</Link>.
                    Email odejde s 2 PDF přílohami.
                  </p>
                </div>
              )}
            </div>
          )
        })()}

        {/* Skryta legacy fields aby TS nevolal o nepouzitych state vars */}
        {false && hasCv !== null && cvUrl && <span>{cvUrl}</span>}

        {sent && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/[0.04] p-4 mb-5 flex items-start gap-2.5">
            <CheckCircle2 size={18} className="text-[#22c55e] shrink-0 mt-0.5" strokeWidth={1.75} />
            <div className="text-sm flex-1 min-w-0">
              <div className="text-white font-semibold mb-0.5">Email odeslán s přílohami</div>
              <div className="text-white/60 text-xs mb-1.5">Doručeno na {agency.email}. Odpověď přijde do tvého Inboxu.</div>
              {sent.attachments.length > 0 && (
                <div className="text-white/50 text-xs flex flex-wrap gap-1.5 items-center">
                  <span className="font-medium">Přílohy:</span>
                  {sent.attachments.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1 rounded px-1.5 py-0.5" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                      📎 {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {sendError && sendErrorHint && (
          <div className="rounded-xl border border-[#fb923c]/30 bg-[#fb923c]/[0.05] p-4 mb-5 flex items-start gap-2.5">
            <AlertCircle size={18} className="text-[#fb923c] shrink-0 mt-0.5" strokeWidth={1.75} />
            <div className="text-sm flex-1 min-w-0">
              <div className="text-white font-semibold mb-0.5">{sendError === 'no_cv_pdf' ? 'Chybí životopis' : 'Nepodařilo se odeslat'}</div>
              <div className="text-white/60 text-xs mb-2">{sendErrorHint}</div>
              {sendError === 'no_cv_pdf' && (
                <Link href="/dokumenty" className="inline-flex items-center gap-1 text-[#fb923c] text-xs font-medium no-underline hover:underline">
                  Otevřít Moje dokumenty →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/[0.06] p-4 flex items-center gap-2">
        {agency.website && (
          <a href={agency.website.startsWith('http') ? agency.website : `https://${agency.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition shrink-0" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}>
            <ExternalLink size={13} strokeWidth={1.75} /> Web
          </a>
        )}
        <div className="flex-1 min-w-0">
          {sendError && (
            <div className="text-red-400 text-xs mb-1.5 flex items-center gap-1">
              <AlertCircle size={11} /> {sendError}
            </div>
          )}
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || sent !== null}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition disabled:cursor-not-allowed"
            style={{
              background: !gmailConnected ? 'rgba(251,146,60,0.12)' : sent ? 'rgba(34,197,94,0.15)' : draft ? 'linear-gradient(135deg, #fb923c, #f97316)' : 'rgba(255,255,255,0.04)',
              color: !gmailConnected ? '#fb923c' : sent ? '#22c55e' : draft ? 'white' : 'rgba(255,255,255,0.4)',
              border: !gmailConnected ? '1px solid rgba(251,146,60,0.35)' : sent ? '1px solid rgba(34,197,94,0.4)' : draft ? 'none' : '1px solid rgba(255,255,255,0.06)',
              opacity: sending ? 0.6 : 1,
            }}
          >
            {!gmailConnected ? (<><Mail size={15} strokeWidth={1.75} /> Připoj Gmail</>) :
             sent ? (<><CheckCircle2 size={15} strokeWidth={1.75} /> Odesláno</>) :
             sending ? (<><Loader2 size={15} className="animate-spin" /> Posílám…</>) :
             draft ? (<><Send size={15} strokeWidth={1.75} /> Pošli za mě</>) :
             (<><Wand2 size={15} strokeWidth={1.75} /> Nejdřív vygeneruj draft</>)}
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptyDetailState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] flex flex-col items-center justify-center text-center py-20 px-6 min-h-[400px]">
      <Building2 size={42} className="text-white/20 mb-3" strokeWidth={1.5} />
      <h3 className="text-white text-base font-semibold mb-1">Vyber agenturu</h3>
      <p className="text-white/50 text-sm max-w-sm">
        Klikni na agenturu zleva. Worker pak vygeneruje motivační email a pošle ho přímo zaměstnavateli z tvého Gmailu.
      </p>
    </div>
  )
}

void Link
