'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { useSubscription } from '../../hooks/useSubscription'
import PaywallOverlay from '../components/PaywallOverlay'
import Link from 'next/link'
import { supabase } from '../supabase'

type Agency = {
  id: number
  company: string
  street: string | null
  zip: string | null
  city: string | null
  canton: string | null
  region: string | null
  telephone: string | null
  email: string | null
  website: string | null
}

const REGIONS = [
  { value: '', label: 'Všechny regiony', flag: '🇨🇭' },
  { value: 'german', label: 'Německy mluvící', flag: '🇩🇪' },
  { value: 'french', label: 'Francouzsky mluvící', flag: '🇫🇷' },
  { value: 'italian', label: 'Italsky mluvící', flag: '🇮🇹' },
]

const CANTONS: Record<string, string> = {
  ZH: 'Zürich', BE: 'Bern', LU: 'Luzern', UR: 'Uri', SZ: 'Schwyz',
  OW: 'Obwalden', NW: 'Nidwalden', GL: 'Glarus', ZG: 'Zug', FR: 'Fribourg',
  SO: 'Solothurn', BS: 'Basel-Stadt', BL: 'Basel-Land', SH: 'Schaffhausen',
  AR: 'Appenzell AR', AI: 'Appenzell AI', SG: 'St. Gallen', GR: 'Graubünden',
  AG: 'Aargau', TG: 'Thurgau', TI: 'Ticino', VD: 'Vaud', VS: 'Valais',
  NE: 'Neuchâtel', GE: 'Genève', JU: 'Jura',
}

export default function Kontakty() {
  const { isActive, loading: subLoading } = useSubscription()
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('')
  const [canton, setCanton] = useState('')
  const [isPending, startTransition] = useTransition()
  const [searchInput, setSearchInput] = useState('')

  const fetchAgencies = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (region) params.set('region', region)
      if (canton) params.set('canton', canton)
      params.set('page', String(page))
      // /kontakty je browse view — zobraz vsechny agentury vc. tech bez emailu (maji aspon telefon).
      params.set('require_email', '0')

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/agencies?${params}`, { headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {} })
      const data = await res.json()

      if (data.error) {
        console.error(data.error)
      } else {
        setAgencies(data.agencies)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } catch (e) {
      console.error('Failed to fetch agencies', e)
    }
  }, [search, region, canton, page])

  useEffect(() => {
    startTransition(async () => {
      await fetchAgencies()
    })
  }, [fetchAgencies])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const handleRegionChange = (value: string) => {
    setRegion(value)
    setCanton('')
    setPage(1)
  }

  const handleCantonChange = (value: string) => {
    setCanton(value)
    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setSearchInput('')
    setRegion('')
    setCanton('')
    setPage(1)
  }

  const formatWebsite = (url: string) => {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }

  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
          ← Zpět
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white text-2xl font-bold mb-1">📇 Databáze agentur</h1>
          <p className="text-gray-400 text-sm">
            1 000+ ověřených švýcarských personálních agentur s přímými kontakty
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] text-[#fb923c] bg-[#f97316]/10 border border-[#f97316]/20 rounded-full px-2.5 py-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Ručně ověřené kontakty · aktualizováno 2026
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-[#fb923c] text-lg font-bold">{total}</p>
            <p className="text-gray-500 text-[10px]">Agentur celkem</p>
          </div>
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-[#fb923c] text-lg font-bold">26</p>
            <p className="text-gray-500 text-[10px]">Kantonů</p>
          </div>
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-[#fb923c] text-lg font-bold">256</p>
            <p className="text-gray-500 text-[10px]">Měst</p>
          </div>
        </div>

        {/* Reality-check: jak fungují Temporärbüra (rozbalovací, ať nezabírá) */}
        <details className="group mb-6 bg-[#1A1A1A] border border-gray-800 rounded-xl overflow-hidden">
          <summary className="flex items-center gap-2 cursor-pointer px-4 py-3 text-sm font-medium text-gray-200 list-none [&::-webkit-details-marker]:hidden">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
            Než zavoláš agentuře — jak Temporärbüra fungují
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto text-gray-500 transition-transform group-open:rotate-180"><polyline points="6 9 12 15 18 9" /></svg>
          </summary>
          <div className="px-4 pb-4 pt-3 border-t border-gray-800 space-y-2.5 text-sm text-gray-400 leading-relaxed">
            <p>I když přes agenturu získáš práci, většina <span className="text-gray-200 font-medium">Temporärbür</span> tě zavolá jen tehdy, když tě zrovna potřebují. Počítej s tím dopředu — příjem nemusí být každý měsíc stejný.</p>
            <p>Existují ale i pozice na <span className="text-gray-200 font-medium">100 % každý den</span>. Když chceš jistotu, ptej se agentury rovnou, jestli jde o práci on-call, nebo o plný úvazek.</p>
            <p>Výhoda Temporärbüra: dostaneš se do <span className="text-gray-200 font-medium">různých firem</span>. Když se osvědčíš, firma si tě po pár měsících často vezme na <span className="text-[#fb923c] font-medium">stálou smlouvu (Festanstellung)</span>.</p>
          </div>
        </details>

        <PaywallOverlay
          isLocked={!isActive && !subLoading}
          title="Odemkni databázi agentur"
          description="Přístup k 1 000+ ověřeným švýcarským agenturám s telefony, e-maily a weby"
        >
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Hledat agenturu nebo město..."
                className="flex-1 bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#f97316]"
              />
              <button
                type="submit"
                className="bg-[#f97316] text-white px-5 rounded-xl hover:opacity-90 transition font-medium text-sm"
              >
                Hledat
              </button>
            </div>
          </form>

          <div className="md:grid md:grid-cols-[230px_1fr] md:gap-6 md:items-start">
            {/* Filter sidebar */}
            <aside className="md:sticky md:top-6">
              {/* Region filter */}
              <div className="flex flex-wrap md:flex-col gap-2 mb-4">
            {REGIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => handleRegionChange(r.value)}
                className={`text-xs px-3 py-2 rounded-full border transition-all ${
                  region === r.value
                    ? 'border-[#f97316] bg-[#f97316]/20 text-white'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {r.flag} {r.label}
              </button>
            ))}
          </div>

          {/* Canton filter */}
          <div className="mb-4">
            <select
              value={canton}
              onChange={(e) => handleCantonChange(e.target.value)}
              className="bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#f97316] w-full appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              <option value="">Všechny kantony</option>
              {Object.entries(CANTONS).sort((a, b) => a[1].localeCompare(b[1])).map(([code, name]) => (
                <option key={code} value={code}>{name} ({code})</option>
              ))}
            </select>
          </div>

          {/* Active filters */}
          {(search || region || canton) && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gray-500 text-xs">Filtry:</span>
              {search && (
                <span className="text-xs px-2 py-1 rounded-full bg-[#252525] text-gray-300">
                  &quot;{search}&quot;
                </span>
              )}
              {region && (
                <span className="text-xs px-2 py-1 rounded-full bg-[#252525] text-gray-300">
                  {REGIONS.find(r => r.value === region)?.label}
                </span>
              )}
              {canton && (
                <span className="text-xs px-2 py-1 rounded-full bg-[#252525] text-gray-300">
                  {CANTONS[canton]}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-[#f97316] hover:underline ml-1"
              >
                Zrušit vše
              </button>
            </div>
          )}
            </aside>

            {/* Results column */}
            <div className="min-w-0">
          {/* Results count */}
          <p className="text-gray-500 text-xs mb-3">
            {isPending ? 'Načítám...' : `${total} ${total === 1 ? 'agentura' : total < 5 ? 'agentury' : 'agentur'}`}
          </p>

          {/* Agency list */}
          <div className="space-y-3">
            {isPending ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-800 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-gray-800 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : agencies.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-2">Žádné agentury nenalezeny</p>
                <p className="text-gray-600 text-sm">Zkus jiné hledání nebo zruš filtry</p>
              </div>
            ) : (
              agencies.map((a) => (
                <div key={a.id} className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 hover:border-[#f97316]/40 transition">
                  <div className="flex items-start gap-3">
                    {/* Monogram */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center text-[#fb923c] font-bold text-sm">
                      {a.company.trim().charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Company name + canton badge */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-white font-semibold text-sm leading-tight">{a.company}</h3>
                        {a.canton && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#252525] text-gray-400 flex-shrink-0">
                            {a.canton}
                          </span>
                        )}
                      </div>

                      {/* Address */}
                      <p className="text-gray-500 text-xs mb-3">
                        {[a.street, `${a.zip || ''} ${a.city || ''}`.trim()].filter(Boolean).join(', ')}
                      </p>

                      {/* Contact buttons */}
                      <div className="flex flex-wrap gap-2">
                        {a.telephone && (
                          <a
                            href={`tel:${a.telephone}`}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#f97316]/10 text-[#fb923c] border border-[#f97316]/20 hover:bg-[#f97316]/20 transition"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                            {a.telephone}
                          </a>
                        )}
                        {a.email && (
                          <a
                            href={`mailto:${a.email}`}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#f97316]/10 text-[#fb923c] border border-[#f97316]/20 hover:bg-[#f97316]/20 transition truncate max-w-[220px]"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" /></svg>
                            {a.email}
                          </a>
                        )}
                        {a.website && (
                          <a
                            href={a.website.startsWith('http') ? a.website : `https://${a.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#252525] text-gray-300 border border-gray-700 hover:border-gray-600 transition truncate max-w-[200px]"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                            {formatWebsite(a.website)}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-[#1A1A1A] border border-gray-800 text-white text-sm disabled:opacity-30 hover:border-gray-600 transition"
              >
                ← Předchozí
              </button>
              <span className="text-gray-400 text-sm">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-[#1A1A1A] border border-gray-800 text-white text-sm disabled:opacity-30 hover:border-gray-600 transition"
              >
                Další →
              </button>
            </div>
          )}
            </div>
          </div>
        </PaywallOverlay>
      </div>
    </main>
  )
}
