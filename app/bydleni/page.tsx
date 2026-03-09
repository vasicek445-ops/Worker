'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import AppShell from '../components/AppShell'

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
  const [searchInput, setSearchInput] = useState('')

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (canton) params.set('canton', canton)
      if (maxPrice) params.set('maxPrice', maxPrice)
      if (minRooms) params.set('minRooms', minRooms)
      if (furnished) params.set('furnished', 'true')
      params.set('page', page.toString())

      const res = await fetch(`/api/housing?${params}`)
      const data = await res.json()
      setListings(data.listings || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 0)
    } catch {
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [search, canton, maxPrice, minRooms, furnished, page])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setSearchInput('')
    setCanton('')
    setMaxPrice('')
    setMinRooms('')
    setFurnished(false)
    setPage(1)
  }

  const hasFilters = search || canton || maxPrice || minRooms || furnished

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

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Ihned'
    const d = new Date(dateStr)
    return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <AppShell>
      <main className="min-h-screen bg-[#0E0E0E] pb-24">
        <div className="px-5 pt-6 pb-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-white text-sm mb-4 inline-block no-underline">← Zpět</Link>
          <h1 className="text-white text-2xl font-black mb-1">🏠 Bydlení ve Švýcarsku</h1>
          <p className="text-gray-500 text-sm">
            {total} aktuálních nabídek bydlení
          </p>
        </div>

        {/* Search */}
        <div className="px-5 mb-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Hledej město, adresu..."
              className="flex-1 bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gray-600 placeholder-gray-600"
            />
            <button type="submit" className="bg-[#E8302A] text-white px-5 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition">
              🔍
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="px-5 mb-4 flex flex-col gap-2">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <select
              value={canton}
              onChange={(e) => { setCanton(e.target.value); setPage(1) }}
              className="bg-[#1A1A1A] border border-gray-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none appearance-none flex-shrink-0"
            >
              <option value="">Všechny kantony</option>
              {Object.entries(CANTONS).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>

            <select
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setPage(1) }}
              className="bg-[#1A1A1A] border border-gray-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none appearance-none flex-shrink-0"
            >
              <option value="">Max. cena</option>
              {PRICE_RANGES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            <select
              value={minRooms}
              onChange={(e) => { setMinRooms(e.target.value); setPage(1) }}
              className="bg-[#1A1A1A] border border-gray-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none appearance-none flex-shrink-0"
            >
              <option value="">Pokoje</option>
              <option value="1">1+</option>
              <option value="1.5">1.5+</option>
              <option value="2">2+</option>
              <option value="2.5">2.5+</option>
              <option value="3">3+</option>
              <option value="3.5">3.5+</option>
              <option value="4">4+</option>
            </select>

            <button
              onClick={() => { setFurnished(!furnished); setPage(1) }}
              className={`px-3 py-2 rounded-lg text-xs font-medium border flex-shrink-0 transition ${
                furnished
                  ? 'bg-[#E8302A]/10 text-[#E8302A] border-[#E8302A]/30'
                  : 'bg-[#1A1A1A] text-gray-400 border-gray-800'
              }`}
            >
              🪑 Zařízeno
            </button>
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="text-gray-500 text-xs hover:text-white transition self-start">
              ✕ Vymazat filtry
            </button>
          )}
        </div>

        {/* Listings */}
        <div className="px-5">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-4 animate-pulse">
                  <div className="h-32 bg-gray-800 rounded-xl mb-3" />
                  <div className="h-4 bg-gray-800 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-800 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-800 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-white font-bold text-lg mb-2">Žádné nabídky nenalezeny</h3>
              <p className="text-gray-500 text-sm mb-4">Zkus změnit filtry nebo hledaný výraz</p>
              {hasFilters && (
                <button onClick={clearFilters} className="text-[#E8302A] text-sm font-bold">
                  Vymazat filtry
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-[#1A1A1A] border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition">
                  {/* Image */}
                  {listing.image_url && (
                    <div className="h-40 bg-gray-900 overflow-hidden">
                      <img
                        src={listing.image_url}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 mr-3">
                        <h4 className="text-white font-bold text-base leading-tight mb-1">
                          {listing.price ? `CHF ${listing.price.toLocaleString()}` : 'Cena na dotaz'}
                          {listing.price_unit === 'monthly' && <span className="text-gray-500 font-normal text-sm">/měsíc</span>}
                        </h4>
                        <p className="text-gray-400 text-sm">{listing.address || `${listing.city}${listing.zipcode ? ` ${listing.zipcode}` : ''}`}</p>
                      </div>
                      {listing.posted_at && (
                        <span className="text-gray-600 text-[10px] flex-shrink-0">{timeAgo(listing.posted_at)}</span>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {listing.rooms && (
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full px-2.5 py-0.5 text-[11px]">
                          🛏️ {listing.rooms} pokojů
                        </span>
                      )}
                      {listing.area_m2 && (
                        <span className="bg-[#111] border border-gray-800 text-gray-400 rounded-full px-2.5 py-0.5 text-[11px]">
                          📐 {listing.area_m2} m²
                        </span>
                      )}
                      {listing.object_type && (
                        <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-full px-2.5 py-0.5 text-[11px]">
                          {listing.object_type}
                        </span>
                      )}
                      {listing.canton && (
                        <span className="bg-[#111] border border-gray-800 text-gray-400 rounded-full px-2.5 py-0.5 text-[11px]">
                          📍 {CANTONS[listing.canton] || listing.canton}
                        </span>
                      )}
                      {listing.is_furnished && (
                        <span className="bg-green-500/10 text-green-400 border border-green-500/30 rounded-full px-2.5 py-0.5 text-[11px]">
                          🪑 Zařízeno
                        </span>
                      )}
                      {listing.is_temporary && (
                        <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-full px-2.5 py-0.5 text-[11px]">
                          ⏰ Dočasné
                        </span>
                      )}
                      {listing.available_from && (
                        <span className="bg-[#111] border border-gray-800 text-gray-400 rounded-full px-2.5 py-0.5 text-[11px]">
                          📅 Od {formatDate(listing.available_from)}
                        </span>
                      )}
                    </div>

                    {/* Agency info */}
                    {listing.agency_name && (
                      <div className="bg-[#111] border border-gray-800 rounded-xl px-3 py-2 mb-3">
                        <p className="text-gray-300 text-xs font-medium m-0">🏢 {listing.agency_name}</p>
                        {listing.agency_contact && (
                          <p className="text-gray-500 text-[10px] m-0 mt-0.5">{listing.agency_contact}</p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {listing.url && (
                        <a
                          href={listing.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-[#E8302A] text-white text-center py-2.5 rounded-xl text-sm font-bold no-underline hover:opacity-90 transition"
                        >
                          Zobrazit nabídku →
                        </a>
                      )}
                      <Link
                        href="/pruvodce/sablony/bydleni"
                        className="bg-[#111] border border-gray-800 text-gray-400 py-2.5 px-4 rounded-xl text-sm font-medium no-underline hover:border-gray-600 transition"
                      >
                        🤖 AI dopis
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="bg-[#1A1A1A] border border-gray-800 text-white px-4 py-2 rounded-xl text-sm disabled:opacity-30 hover:border-gray-600 transition"
              >
                ← Předchozí
              </button>
              <span className="text-gray-500 text-sm">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="bg-[#1A1A1A] border border-gray-800 text-white px-4 py-2 rounded-xl text-sm disabled:opacity-30 hover:border-gray-600 transition"
              >
                Další →
              </button>
            </div>
          )}
        </div>

        {/* AI Housing Dossier CTA */}
        <div className="px-5 mt-6">
          <Link href="/pruvodce/sablony/bydleni" className="block no-underline">
            <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-4 text-center">
              <p className="text-blue-400 text-sm font-bold m-0">🤖 Potřebuješ napsat dopis pronajímateli?</p>
              <p className="text-gray-500 text-xs m-0 mt-1">AI ti vygeneruje Bewerbungsdossier v němčině + checklist dokumentů</p>
            </div>
          </Link>
        </div>
      </main>
    </AppShell>
  )
}
