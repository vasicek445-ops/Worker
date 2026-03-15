'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '../supabase'

type SavedDoc = {
  id: string
  type: 'cv' | 'letter'
  title: string
  template: string
  accent_color: string
  created_at: string
  updated_at: string
}

export default function Dokumenty() {
  const [docs, setDocs] = useState<SavedDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'cv' | 'letter'>('all')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadDocs()
  }, [])

  const loadDocs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return
      const res = await fetch('/api/documents', { headers: { Authorization: `Bearer ${session.access_token}` } })
      if (res.ok) {
        const { documents } = await res.json()
        setDocs(documents || [])
      }
    } catch {}
    finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return
      const res = await fetch(`/api/documents?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${session.access_token}` } })
      if (res.ok) setDocs(prev => prev.filter(d => d.id !== id))
    } catch {}
    finally { setDeleting(null) }
  }

  const filtered = filter === 'all' ? docs : docs.filter(d => d.type === filter)
  const cvCount = docs.filter(d => d.type === 'cv').length
  const letterCount = docs.filter(d => d.type === 'letter').length

  return (
    <main className="min-h-screen bg-[#0a0a12] px-4 py-6 pb-24 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      {/* Ambient effects */}
      <div className="fixed w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none z-0 opacity-10 -top-[200px] -right-[100px]" style={{ background: "radial-gradient(circle, rgba(57,255,110,0.25), transparent 70%)" }} />
      <div className="fixed w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none z-0 opacity-10 bottom-[200px] -left-[200px]" style={{ background: "radial-gradient(circle, rgba(100,60,255,0.2), transparent 70%)" }} />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Hero header */}
        <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #111128 0%, #0d1a2e 40%, #0a1a14 100%)" }}>
          <Image src="/images/3d/document.png" alt="" width={120} height={120} className="absolute -right-4 -bottom-4 opacity-[0.08]" />
          <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(57,255,110,0.15), transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(100,60,255,0.1), transparent 60%)" }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <pattern id="docsGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="white"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#docsGrid)"/>
          </svg>
          <div className="relative flex items-center gap-4">
            <Image src="/images/3d/document.png" alt="" width={56} height={56} className="drop-shadow-[0_4px_20px_rgba(57,255,110,0.3)]" />
            <div>
              <h1 className="text-white text-2xl font-extrabold m-0 tracking-tight">Moje dokumenty</h1>
              <p className="text-white/35 text-sm m-0 mt-1">Uložené životopisy a motivační dopisy · změň design bez AI</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button onClick={() => setFilter('all')}
            className={`rounded-xl p-3 text-center transition-all border ${filter === 'all' ? 'bg-[#39ff6e]/[0.08] border-[#39ff6e]/20 shadow-[0_0_15px_rgba(57,255,110,0.06)]' : 'bg-[#111120]/80 border-white/[0.06] hover:border-white/[0.12]'}`}>
            <p className={`text-xl font-extrabold m-0 ${filter === 'all' ? 'text-[#39ff6e]' : 'text-white'}`}>{docs.length}</p>
            <p className="text-white/30 text-[10px] m-0 mt-0.5 font-medium">Celkem</p>
          </button>
          <button onClick={() => setFilter('cv')}
            className={`rounded-xl p-3 text-center transition-all border ${filter === 'cv' ? 'bg-[#39ff6e]/[0.08] border-[#39ff6e]/20 shadow-[0_0_15px_rgba(57,255,110,0.06)]' : 'bg-[#111120]/80 border-white/[0.06] hover:border-white/[0.12]'}`}>
            <p className={`text-xl font-extrabold m-0 ${filter === 'cv' ? 'text-[#39ff6e]' : 'text-white'}`}>{cvCount}</p>
            <p className="text-white/30 text-[10px] m-0 mt-0.5 font-medium">Životopisy</p>
          </button>
          <button onClick={() => setFilter('letter')}
            className={`rounded-xl p-3 text-center transition-all border ${filter === 'letter' ? 'bg-[#39ff6e]/[0.08] border-[#39ff6e]/20 shadow-[0_0_15px_rgba(57,255,110,0.06)]' : 'bg-[#111120]/80 border-white/[0.06] hover:border-white/[0.12]'}`}>
            <p className={`text-xl font-extrabold m-0 ${filter === 'letter' ? 'text-[#39ff6e]' : 'text-white'}`}>{letterCount}</p>
            <p className="text-white/30 text-[10px] m-0 mt-0.5 font-medium">Dopisy</p>
          </button>
        </div>

        {/* Documents list */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-white/10 border-t-[#39ff6e]/50 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/30 text-sm">Načítání dokumentů...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-8 text-center">
            <Image src="/images/3d/document.png" alt="" width={48} height={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-white/40 text-sm mb-1">
              {docs.length === 0 ? 'Zatím nemáš žádné uložené dokumenty' : 'Žádné dokumenty v této kategorii'}
            </p>
            <p className="text-white/20 text-xs mb-4">Vytvoř životopis nebo motivační dopis a ulož ho tlačítkem 💾</p>
            <div className="flex gap-3 justify-center">
              <Link href="/pruvodce/sablony/cv" className="bg-[#39ff6e]/10 border border-[#39ff6e]/20 text-[#39ff6e] text-sm font-bold px-5 py-2.5 rounded-xl no-underline transition hover:bg-[#39ff6e]/20">
                Vytvořit CV
              </Link>
              <Link href="/pruvodce/sablony/motivacni-dopis" className="bg-white/[0.04] border border-white/[0.08] text-white/50 text-sm font-medium px-5 py-2.5 rounded-xl no-underline transition hover:bg-white/[0.08] hover:text-white">
                Vytvořit dopis
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((doc) => (
              <div key={doc.id} className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-4 hover:border-white/[0.12] transition group">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${doc.type === 'cv' ? 'bg-[#39ff6e]/[0.08]' : 'bg-blue-500/[0.08]'}`}>
                    <span className="text-lg">{doc.type === 'cv' ? '📄' : '✉️'}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold m-0 truncate">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${doc.type === 'cv' ? 'bg-[#39ff6e]/10 text-[#39ff6e]/60' : 'bg-blue-500/10 text-blue-400/60'}`}>
                        {doc.type === 'cv' ? 'CV' : 'DOPIS'}
                      </span>
                      <span className="text-white/20 text-[10px]">{new Date(doc.updated_at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {doc.accent_color && (
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: doc.accent_color }} />
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={doc.type === 'cv' ? `/pruvodce/sablony/cv?load=${doc.id}` : `/pruvodce/sablony/motivacni-dopis?load=${doc.id}`}
                      className="text-[#39ff6e]/70 hover:text-[#39ff6e] text-xs font-medium px-3 py-1.5 rounded-lg bg-[#39ff6e]/[0.06] hover:bg-[#39ff6e]/[0.12] transition no-underline">
                      Otevřít
                    </Link>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleting === doc.id}
                      className="text-white/15 hover:text-red-400 text-xs px-2 py-1.5 rounded-lg transition opacity-0 group-hover:opacity-100">
                      {deleting === doc.id ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        {docs.length > 0 && (
          <div className="mt-6 flex gap-3">
            <Link href="/pruvodce/sablony/cv" className="flex-1 bg-white/[0.02] border border-white/[0.06] text-white/40 text-sm font-medium py-3 rounded-xl text-center no-underline transition hover:bg-white/[0.05] hover:text-white">
              + Nový životopis
            </Link>
            <Link href="/pruvodce/sablony/motivacni-dopis" className="flex-1 bg-white/[0.02] border border-white/[0.06] text-white/40 text-sm font-medium py-3 rounded-xl text-center no-underline transition hover:bg-white/[0.05] hover:text-white">
              + Nový dopis
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
