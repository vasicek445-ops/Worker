'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../supabase'

type Listing = {
  id: string
  title: string
  address: string
  city: string
  zipcode: string
  canton: string | null
  price: number | null
  price_unit: string
  rooms: number | null
  area_m2: number | null
  object_type: string | null
  is_furnished: boolean
  is_temporary: boolean
  available_from: string | null
  url: string | null
  image_url: string | null
  agency_name: string | null
  agency_contact: string | null
  posted_at: string | null
  source: string | null
}

const CANTONS: Record<string, string> = {
  ZH: 'Zürich', BE: 'Bern', LU: 'Luzern', UR: 'Uri', SZ: 'Schwyz',
  OW: 'Obwalden', NW: 'Nidwalden', GL: 'Glarus', ZG: 'Zug', FR: 'Fribourg',
  SO: 'Solothurn', BS: 'Basel-Stadt', BL: 'Basel-Land', SH: 'Schaffhausen',
  AR: 'Appenzell AR', AI: 'Appenzell AI', SG: 'St. Gallen', GR: 'Graubünden',
  AG: 'Aargau', TG: 'Thurgau', TI: 'Ticino', VD: 'Vaud', VS: 'Valais',
  NE: 'Neuchâtel', GE: 'Genève', JU: 'Jura',
}

const PRICE_RANGES = [
  { label: 'Do 1000 CHF', value: '1000' },
  { label: 'Do 1500 CHF', value: '1500' },
  { label: 'Do 2000 CHF', value: '2000' },
  { label: 'Do 2500 CHF', value: '2500' },
  { label: 'Do 3000 CHF', value: '3000' },
]

const SORT_OPTIONS = [
  { label: 'Nejnovější', value: 'newest' },
  { label: 'Cena ↑', value: 'price_asc' },
  { label: 'Cena ↓', value: 'price_desc' },
  { label: 'Pokoje ↓', value: 'rooms_desc' },
  { label: 'Plocha ↓', value: 'area_desc' },
]

const OBJECT_TYPES = [
  { label: 'Všechny typy', value: '' },
  { label: 'Byt', value: 'Byt' },
  { label: 'Studio', value: 'Studio' },
  { label: 'Spolubydlení (WG)', value: 'Spolubydlení (WG)' },
  { label: 'Penzion / Gasthaus', value: 'Penzion / Gasthaus' },
  { label: 'Monteurzimmer', value: 'Monteurzimmer' },
  { label: 'Hotel / Hostel', value: 'Hotel / Hostel' },
  { label: 'Pokoj', value: 'Pokoj' },
  { label: 'Klášter', value: 'Klášter' },
  { label: 'Seminarhotel', value: 'Seminarhotel' },
  { label: 'Ubytovna', value: 'Ubytovna' },
  { label: 'Poutní dům', value: 'Poutní dům' },
  { label: 'Církevní ubytování', value: 'Církevní ubytování' },
  { label: 'Komunita', value: 'Komunita' },
]

export default function Bydleni() {
  const [listings, setListings] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [canton, setCanton] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minRooms, setMinRooms] = useState('')
  const [furnished, setFurnished] = useState(false)
  const [sort, setSort] = useState('newest')
  const [searchInput, setSearchInput] = useState('')
  const [saved, setSaved] = useState<string[]>([])
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [sourceFilter, setSourceFilter] = useState('')
  const [objectType, setObjectType] = useState('')
  const [hasPrice, setHasPrice] = useState(false)

  // Load saved listings & auto-fill canton from profile
  useEffect(() => {
    const s = JSON.parse(localStorage.getItem('woker_saved_housing') || '[]')
    setSaved(s)

    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('preferovany_kanton').eq('id', user.id).single()
        if (profile?.preferovany_kanton && !profileLoaded) {
          const cantonMap: Record<string, string> = {
            'Zürich': 'ZH', 'Bern': 'BE', 'Luzern': 'LU', 'Basel': 'BS', 'St. Gallen': 'SG',
            'Aargau': 'AG', 'Solothurn': 'SO', 'Thurgau': 'TG', 'Zug': 'ZG', 'Schaffhausen': 'SH',
            'Graubünden': 'GR', 'Ticino': 'TI', 'Vaud': 'VD', 'Valais': 'VS', 'Genève': 'GE', 'Fribourg': 'FR', 'Jura': 'JU',
          }
          const code = cantonMap[profile.preferovany_kanton] || Object.entries(CANTONS).find(([, name]) => name === profile.preferovany_kanton)?.[0]
          if (code) setCanton(code)
          setProfileLoaded(true)
        }
      }
    }
    loadProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (canton) params.set('canton', canton)
      if (maxPrice) params.set('maxPrice', maxPrice)
      if (minRooms) params.set('minRooms', minRooms)
      if (furnished) params.set('furnished', 'true')
      if (sort !== 'newest') params.set('sort', sort)
      if (sourceFilter) params.set('source', sourceFilter)
      if (objectType) params.set('type', objectType)
      if (hasPrice) params.set('hasPrice', 'true')
      params.set('page', page.toString())

      // Pass auth token for premium detection
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      const res = await fetch(`/api/housing?${params}`, { headers })
      const data = await res.json()
      setListings(data.listings || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 0)
    } catch {
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [search, canton, maxPrice, minRooms, furnished, sort, page, sourceFilter, objectType, hasPrice])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const clearFilters = () => {
    setSearch(''); setSearchInput(''); setCanton(''); setMaxPrice('')
    setMinRooms(''); setFurnished(false); setSort('newest'); setPage(1)
    setSourceFilter(''); setObjectType(''); setHasPrice(false)
  }

  const toggleSaved = (id: string) => {
    const updated = saved.includes(id) ? saved.filter(s => s !== id) : [...saved, id]
    setSaved(updated)
    localStorage.setItem('woker_saved_housing', JSON.stringify(updated))
  }

  const hasFilters = search || canton || maxPrice || minRooms || furnished || sourceFilter || objectType || hasPrice

  const [now] = useState(() => Date.now())
  function timeAgo(dateStr: string | null): string {
    if (!dateStr) return ''
    const diff = now - new Date(dateStr).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Dnes'
    if (days === 1) return 'Včera'
    if (days < 7) return `Před ${days} dny`
    if (days < 30) return `Před ${Math.floor(days / 7)} týdny`
    return `Před ${Math.floor(days / 30)} měsíci`
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Ihned'
    const d = new Date(dateStr)
    return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })
  }

  const isGasthaus = (listing: Listing) => listing.source === 'gasthaus-finder' || listing.source === 'kloster-finder'

  const selectClass = "bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#39ff6e]/30 appearance-none flex-shrink-0 transition"

  return (
    <main className="min-h-screen bg-[#0a0a12] pb-24 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      {/* Ambient glow */}
      <div className="fixed w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none z-0 opacity-10 -top-[200px] right-[10%]" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.3), transparent 70%)" }} />
      <div className="fixed w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none z-0 opacity-8 bottom-[200px] -left-[200px]" style={{ background: "radial-gradient(circle, rgba(100,60,255,0.2), transparent 70%)" }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="pt-6 pb-4">
          <Link href="/dashboard" className="text-white/30 hover:text-white text-sm mb-4 inline-block no-underline transition">← Zpět</Link>
          <div className="flex items-center gap-3 mb-1">
            <Image src="/images/3d/house.png" alt="" width={36} height={36} className="drop-shadow-lg" />
            <div>
              <h1 className="text-white text-2xl font-extrabold m-0 tracking-tight">Bydlení ve Švýcarsku</h1>
              <p className="text-white/30 text-sm m-0">
                {total.toLocaleString()} aktuálních nabídek
                {canton && <span className="text-cyan-400"> · {CANTONS[canton]}</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Source toggle tabs */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => { setSourceFilter(''); setPage(1) }}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
              sourceFilter === ''
                ? 'bg-[#39ff6e]/10 text-[#39ff6e] border-[#39ff6e]/30'
                : 'bg-white/[0.04] text-white/40 border-white/[0.08] hover:text-white/60'
            }`}
          >
            Byty
          </button>
          <button
            onClick={() => { setSourceFilter('gasthaus-finder'); setPage(1) }}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
              sourceFilter === 'gasthaus-finder'
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : 'bg-white/[0.04] text-white/40 border-white/[0.08] hover:text-white/60'
            }`}
          >
            Penziony & Gasthaus
          </button>
          <button
            onClick={() => { setSourceFilter('kloster-finder'); setPage(1) }}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
              sourceFilter === 'kloster-finder'
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                : 'bg-white/[0.04] text-white/40 border-white/[0.08] hover:text-white/60'
            }`}
          >
            Ubytovny & Semináře
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Hledej město, adresu..."
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#39ff6e]/30 placeholder-white/20 transition"
            />
            <button type="submit" className="bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] px-5 py-3 rounded-xl text-sm font-extrabold hover:shadow-[0_4px_20px_rgba(57,255,110,0.3)] hover:scale-[1.03] transition-all">
              Hledat
            </button>
          </form>
        </div>

        {/* Info banner for gasthaus/kloster */}
        {(sourceFilter === 'gasthaus-finder' || sourceFilter === 'kloster-finder') && (
          <div className="mb-4 p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <p className="text-white/50 text-xs m-0 leading-relaxed">
              Nabídky se průběžně aktualizují — ověřujeme ceny a dostupnost přímo u poskytovatelů.
              Kde zatím chybí cena, kontaktujte poskytovatele přes telefon, e-mail nebo web pro aktuální informace.
              Nabídky bez ubytování budou postupně odfiltrovány.
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-5 flex flex-col gap-2">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <select value={canton} onChange={(e) => { setCanton(e.target.value); setPage(1) }} className={selectClass}>
              <option value="">Všechny kantony</option>
              {Object.entries(CANTONS).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>

            <select value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1) }} className={selectClass}>
              <option value="">Max. cena</option>
              {PRICE_RANGES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            <select value={minRooms} onChange={(e) => { setMinRooms(e.target.value); setPage(1) }} className={selectClass}>
              <option value="">Pokoje</option>
              <option value="1">1+</option>
              <option value="1.5">1.5+</option>
              <option value="2">2+</option>
              <option value="2.5">2.5+</option>
              <option value="3">3+</option>
              <option value="3.5">3.5+</option>
              <option value="4">4+</option>
            </select>

            <select value={objectType} onChange={(e) => { setObjectType(e.target.value); setPage(1) }} className={selectClass}>
              {OBJECT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <button
              onClick={() => { setFurnished(!furnished); setPage(1) }}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold border flex-shrink-0 transition ${
                furnished
                  ? 'bg-[#39ff6e]/10 text-[#39ff6e] border-[#39ff6e]/30'
                  : 'bg-white/[0.04] text-white/40 border-white/[0.08] hover:text-white/60'
              }`}
            >
              Zařízeno
            </button>

            <button
              onClick={() => { setHasPrice(!hasPrice); setPage(1) }}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold border flex-shrink-0 transition ${
                hasPrice
                  ? 'bg-[#39ff6e]/10 text-[#39ff6e] border-[#39ff6e]/30'
                  : 'bg-white/[0.04] text-white/40 border-white/[0.08] hover:text-white/60'
              }`}
            >
              S cenou
            </button>

            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1) }} className={selectClass}>
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="text-white/30 text-xs hover:text-white transition self-start">
              Vymazat filtry
            </button>
          )}
        </div>

        {/* Listings */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden animate-pulse">
                <div className="h-40 bg-white/[0.04]" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-white/[0.06] rounded w-1/2" />
                  <div className="h-3 bg-white/[0.04] rounded w-3/4" />
                  <div className="h-3 bg-white/[0.04] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <Image src="/images/3d/house.png" alt="" width={64} height={64} className="mx-auto mb-4 opacity-40" />
            <h3 className="text-white font-bold text-lg mb-2">Žádné nabídky nenalezeny</h3>
            <p className="text-white/30 text-sm mb-4">Zkus změnit filtry nebo hledaný výraz</p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-[#39ff6e] text-sm font-bold hover:text-[#39ff6e]/80 transition">
                Vymazat filtry
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] hover:bg-white/[0.04] transition-all group">
                {/* Image / Placeholder */}
                <div className="relative h-40 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 overflow-hidden">
                  {listing.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image src="/images/3d/house.png" alt="" width={48} height={48} className="opacity-20" />
                    </div>
                  )}
                  {/* Overlay badges */}
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    {listing.object_type && (
                      <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        {listing.object_type}
                      </span>
                    )}
                    {listing.is_furnished && (
                      <span className="bg-[#39ff6e]/20 backdrop-blur-sm text-[#39ff6e] text-[10px] font-bold px-2 py-1 rounded-lg">
                        Zařízeno
                      </span>
                    )}
                    {isGasthaus(listing) && (
                      <span className="bg-cyan-500/20 backdrop-blur-sm text-cyan-400 text-[10px] font-bold px-2 py-1 rounded-lg">
                        Penzion
                      </span>
                    )}
                  </div>
                  {/* Save button */}
                  <button
                    onClick={() => toggleSaved(listing.id)}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      saved.includes(listing.id)
                        ? 'bg-[#39ff6e]/20 backdrop-blur-sm text-[#39ff6e]'
                        : 'bg-black/40 backdrop-blur-sm text-white/50 hover:text-white opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {saved.includes(listing.id) ? '★' : '☆'}
                  </button>
                  {/* Time badge */}
                  {listing.posted_at && (
                    <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white/70 text-[9px] font-medium px-2 py-1 rounded-lg">
                      {timeAgo(listing.posted_at)}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  {/* Price */}
                  <div className="flex items-baseline justify-between mb-1.5">
                    {isGasthaus(listing) ? (
                      <h4 className="text-white font-extrabold text-lg m-0 tracking-tight">
                        {listing.price ? (
                          <>
                            <span className="text-[#39ff6e]">CHF {listing.price.toLocaleString()}</span>
                            <span className="text-white/30 font-normal text-sm">/měsíc</span>
                          </>
                        ) : (
                          <span className="text-amber-400">Kontaktujte pro cenu</span>
                        )}
                      </h4>
                    ) : (
                      <h4 className="text-white font-extrabold text-lg m-0 tracking-tight">
                        {listing.price ? `CHF ${listing.price.toLocaleString()}` : 'Na dotaz'}
                        {listing.price_unit === 'monthly' && <span className="text-white/30 font-normal text-sm">/m</span>}
                      </h4>
                    )}
                    {listing.rooms && (
                      <span className="text-cyan-400 text-xs font-bold">{listing.rooms} pok.</span>
                    )}
                  </div>

                  {/* Gasthaus: price hint */}
                  {isGasthaus(listing) && !listing.price && (
                    <p className="text-amber-400/60 text-[11px] m-0 mb-2">
                      Zavolejte nebo napište pro aktuální cenu
                    </p>
                  )}

                  {/* Address */}
                  <p className="text-white/40 text-sm m-0 mb-2.5 truncate">
                    {listing.address || listing.city}
                    {listing.canton && ` · ${CANTONS[listing.canton] || listing.canton}`}
                  </p>

                  {/* Gasthaus: phone & website */}
                  {isGasthaus(listing) && (
                    <div className="flex flex-col gap-1.5 mb-3">
                      {listing.agency_contact && (
                        <a href={`tel:${listing.agency_contact}`} className="flex items-center gap-2 text-cyan-400 text-sm no-underline hover:text-cyan-300 transition">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          <span className="font-semibold">{listing.agency_contact}</span>
                        </a>
                      )}
                      {listing.url && (
                        <a href={listing.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/40 text-xs no-underline hover:text-white/60 transition truncate">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                          <span className="truncate">{listing.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Quick stats */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {listing.area_m2 && (
                      <span className="bg-white/[0.04] border border-white/[0.06] text-white/40 rounded-lg px-2 py-0.5 text-[10px] font-medium">
                        {listing.area_m2} m²
                      </span>
                    )}
                    {listing.is_temporary && (
                      <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg px-2 py-0.5 text-[10px] font-medium">
                        Dočasné
                      </span>
                    )}
                    {listing.available_from && (
                      <span className="bg-white/[0.04] border border-white/[0.06] text-white/40 rounded-lg px-2 py-0.5 text-[10px] font-medium">
                        Od {formatDate(listing.available_from)}
                      </span>
                    )}
                    {listing.agency_name && !isGasthaus(listing) && (
                      <span className="bg-white/[0.04] border border-white/[0.06] text-white/30 rounded-lg px-2 py-0.5 text-[10px] font-medium truncate max-w-[150px]">
                        {listing.agency_name}
                      </span>
                    )}
                    {isGasthaus(listing) && listing.agency_name && (
                      <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg px-2 py-0.5 text-[10px] font-bold truncate max-w-[200px]">
                        {listing.agency_name}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {isGasthaus(listing) ? (
                      <>
                        {listing.url && (
                          <a href={listing.url} target="_blank" rel="noopener noreferrer"
                            className="flex-1 bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] text-center py-2.5 rounded-xl text-sm font-extrabold no-underline hover:shadow-[0_4px_16px_rgba(57,255,110,0.25)] hover:scale-[1.02] transition-all">
                            Zobrazit
                          </a>
                        )}
                        {listing.agency_contact && (
                          <a href={`tel:${listing.agency_contact}`}
                            className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#0a0a12] text-center py-2.5 px-4 rounded-xl text-sm font-extrabold no-underline hover:shadow-[0_4px_16px_rgba(6,182,212,0.3)] hover:scale-[1.02] transition-all flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            Zavolat
                          </a>
                        )}
                      </>
                    ) : (
                      <>
                        {listing.url && (
                          <a href={listing.url} target="_blank" rel="noopener noreferrer"
                            className="flex-1 bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] text-center py-2.5 rounded-xl text-sm font-extrabold no-underline hover:shadow-[0_4px_16px_rgba(57,255,110,0.25)] hover:scale-[1.02] transition-all">
                            Zobrazit
                          </a>
                        )}
                        <Link href="/pruvodce/sablony/bydleni"
                          className="bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white py-2.5 px-3.5 rounded-xl text-sm font-medium no-underline hover:bg-white/[0.08] transition flex items-center gap-1.5">
                          <Image src="/images/3d/document.png" alt="" width={14} height={14} />
                          AI dopis
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="bg-white/[0.04] border border-white/[0.06] text-white px-4 py-2.5 rounded-xl text-sm disabled:opacity-20 hover:bg-white/[0.08] transition">
              ← Předchozí
            </button>
            <span className="text-white/30 text-sm">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="bg-white/[0.04] border border-white/[0.06] text-white px-4 py-2.5 rounded-xl text-sm disabled:opacity-20 hover:bg-white/[0.08] transition">
              Další →
            </button>
          </div>
        )}

        {/* AI Dossier CTA */}
        <div className="mt-6">
          <Link href="/pruvodce/sablony/bydleni" className="block no-underline group">
            <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #111128 0%, #0d1a2e 40%, #0a1a14 100%)" }}>
              <Image src="/images/3d/house.png" alt="" width={80} height={80} className="absolute -right-2 -top-2 opacity-[0.08] group-hover:opacity-[0.15] transition" />
              <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(57,255,110,0.15), transparent 60%)" }} />
              <div className="relative flex items-center gap-4">
                <Image src="/images/3d/document.png" alt="" width={36} height={36} className="drop-shadow-lg" />
                <div>
                  <p className="text-white font-bold text-sm m-0 group-hover:text-[#39ff6e] transition">Potřebuješ napsat dopis pronajímateli?</p>
                  <p className="text-white/30 text-xs m-0 mt-0.5">AI vygeneruje Bewerbungsdossier v němčině + checklist dokumentů</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Saved count */}
        {saved.length > 0 && (
          <div className="mt-4 text-center">
            <span className="text-white/20 text-xs">★ {saved.length} {saved.length === 1 ? 'nabídka uložena' : 'nabídek uloženo'}</span>
          </div>
        )}
      </div>
    </main>
  )
}
