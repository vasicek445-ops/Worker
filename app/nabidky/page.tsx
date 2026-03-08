'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

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

export default function Nabidky() {
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

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setSearchInput('')
    setCanton('')
    setCategory('')
    setJobType('')
    setPage(1)
  }

  const hasFilters = search || canton || category || jobType

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
      michaelpage: 'Michael Page',
      roberthalf: 'Robert Half',
      jooble: 'Jooble',
      arbeitnow: 'arbeitnow',
    }
    return labels[source] || source
  }

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

  return (
    <main className="min-h-screen bg-[#0E0E0E] pb-24">
      <div className="px-5 pt-6 pb-4">
        <Link href="/dashboard" className="text-gray-500 hover:text-white text-sm mb-4 inline-block no-underline">← Zpět</Link>
        <h1 className="text-white text-2xl font-black mb-1">💼 Nabídky práce</h1>
        <p className="text-gray-500 text-sm">
          {total} aktuálních pozic ve Švýcarsku
        </p>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Hledej pozici nebo firmu..."
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
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1) }}
            className="bg-[#1A1A1A] border border-gray-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none appearance-none flex-shrink-0"
          >
            <option value="">Všechny obory</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={() => { setJobType(jobType === 'remote' ? '' : 'remote'); setPage(1) }}
            className={`px-3 py-2 rounded-lg text-xs font-medium border flex-shrink-0 transition ${
              jobType === 'remote'
                ? 'bg-[#E8302A]/10 text-[#E8302A] border-[#E8302A]/30'
                : 'bg-[#1A1A1A] text-gray-400 border-gray-800'
            }`}
          >
            🏠 Remote
          </button>
        </div>

        {hasFilters && (
          <button onClick={clearFilters} className="text-gray-500 text-xs hover:text-white transition self-start">
            ✕ Vymazat filtry
          </button>
        )}
      </div>

      {/* Job List */}
      <div className="px-5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-4 animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-800 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-800 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
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
            {jobs.map((job) => (
              <div key={job.id} className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 mr-3">
                    <h4 className="text-white font-bold text-base leading-tight mb-1">{job.title}</h4>
                    <p className="text-gray-500 text-sm">{job.company}</p>
                  </div>
                  {job.posted_at && (
                    <span className="text-gray-600 text-[10px] flex-shrink-0">{timeAgo(job.posted_at)}</span>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="bg-[#111] border border-gray-800 text-gray-400 rounded-full px-2.5 py-0.5 text-[11px]">
                    📍 {job.location}{job.canton ? ` (${job.canton})` : ''}
                  </span>
                  {job.category && (
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] border ${categoryColors[job.category] || 'bg-gray-500/10 text-gray-400 border-gray-500/30'}`}>
                      {job.category}
                    </span>
                  )}
                  {job.remote && (
                    <span className="bg-green-500/10 text-green-400 border border-green-500/30 rounded-full px-2.5 py-0.5 text-[11px]">
                      🏠 Remote
                    </span>
                  )}
                  {job.salary_text && (
                    <span className="bg-[#111] border border-gray-800 text-gray-400 rounded-full px-2.5 py-0.5 text-[11px]">
                      💰 {job.salary_text}
                    </span>
                  )}
                  {job.source && job.source !== 'arbeitnow' && (
                    <span className="bg-[#111] border border-gray-800 text-gray-500 rounded-full px-2.5 py-0.5 text-[10px]">
                      {sourceLabel(job.source)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {job.url && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[#E8302A] text-white text-center py-2.5 rounded-xl text-sm font-bold no-underline hover:opacity-90 transition"
                    >
                      Zobrazit nabídku →
                    </a>
                  )}
                  <Link
                    href={`/pruvodce/sablony/analyza`}
                    className="bg-[#111] border border-gray-800 text-gray-400 py-2.5 px-4 rounded-xl text-sm font-medium no-underline hover:border-gray-600 transition"
                  >
                    🤖 AI analýza
                  </Link>
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

      {/* Smart Matching CTA */}
      <div className="px-5 mt-6">
        <Link href="/pruvodce/matching" className="block no-underline">
          <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-4 text-center">
            <p className="text-blue-400 text-sm font-bold m-0">🎯 Nechceš hledat ručně?</p>
            <p className="text-gray-500 text-xs m-0 mt-1">Smart Matching ti najde nejlepší agentury a přihlásí tě jedním klikem</p>
          </div>
        </Link>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0E0E0E] border-t border-gray-800 px-6 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          {[
            { name: "Discover", icon: "🔍", href: "/dashboard", active: false },
            { name: "Nabídky", icon: "💼", href: "/nabidky", active: true },
            { name: "Průvodce", icon: "📋", href: "/pruvodce", active: false },
            { name: "Přihlášky", icon: "✉️", href: "/prihlasky", active: false },
            { name: "Profil", icon: "👤", href: "/profil", active: false },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center gap-1 no-underline"
            >
              <span className="text-lg">{item.icon}</span>
              <span className={`text-xs ${item.active ? "text-[#E8302A] font-bold" : "text-gray-600"}`}>
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
