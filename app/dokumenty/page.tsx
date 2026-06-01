'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../supabase'
import { FileText, Mail, Trash2, Plus } from 'lucide-react'

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
      <div className="fixed w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none z-0 opacity-10 -top-[200px] -right-[100px]" style={{ background: "radial-gradient(circle, rgba(251,146,60,0.25), transparent 70%)" }} />
      <div className="fixed w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none z-0 opacity-10 bottom-[200px] -left-[200px]" style={{ background: "radial-gradient(circle, rgba(100,60,255,0.2), transparent 70%)" }} />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="pt-2 pb-4 mb-2">
          <div className="flex items-center gap-3 mb-1">
            <FileText size={32} strokeWidth={1.75} className="text-[#fb923c] drop-shadow-lg shrink-0" />
            <div>
              <h1 className="text-white text-2xl font-extrabold m-0 tracking-tight">Moje dokumenty</h1>
              <p className="text-white/35 text-sm m-0 mt-1">Uložené životopisy a motivační dopisy</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button onClick={() => setFilter('all')}
            className={`rounded-xl p-3 text-center transition-all border ${filter === 'all' ? 'bg-[#fb923c]/[0.08] border-[#fb923c]/20 shadow-[0_0_15px_rgba(251,146,60,0.06)]' : 'bg-[#111120]/80 border-white/[0.06] hover:border-white/[0.12]'}`}>
            <p className={`text-xl font-extrabold m-0 ${filter === 'all' ? 'text-[#fb923c]' : 'text-white'}`}>{docs.length}</p>
            <p className="text-white/30 text-[10px] m-0 mt-0.5 font-medium">Celkem</p>
          </button>
          <button onClick={() => setFilter('cv')}
            className={`rounded-xl p-3 text-center transition-all border ${filter === 'cv' ? 'bg-[#fb923c]/[0.08] border-[#fb923c]/20 shadow-[0_0_15px_rgba(251,146,60,0.06)]' : 'bg-[#111120]/80 border-white/[0.06] hover:border-white/[0.12]'}`}>
            <p className={`text-xl font-extrabold m-0 ${filter === 'cv' ? 'text-[#fb923c]' : 'text-white'}`}>{cvCount}</p>
            <p className="text-white/30 text-[10px] m-0 mt-0.5 font-medium">Životopisy</p>
          </button>
          <button onClick={() => setFilter('letter')}
            className={`rounded-xl p-3 text-center transition-all border ${filter === 'letter' ? 'bg-[#fb923c]/[0.08] border-[#fb923c]/20 shadow-[0_0_15px_rgba(251,146,60,0.06)]' : 'bg-[#111120]/80 border-white/[0.06] hover:border-white/[0.12]'}`}>
            <p className={`text-xl font-extrabold m-0 ${filter === 'letter' ? 'text-[#fb923c]' : 'text-white'}`}>{letterCount}</p>
            <p className="text-white/30 text-[10px] m-0 mt-0.5 font-medium">Dopisy</p>
          </button>
        </div>

        {/* Documents list */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-white/10 border-t-[#fb923c]/50 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/30 text-sm">Načítání dokumentů...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-8 text-center">
            <FileText size={44} strokeWidth={1.5} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/40 text-sm mb-1">
              {docs.length === 0 ? 'Zatím nemáš žádné uložené dokumenty' : 'Žádné dokumenty v této kategorii'}
            </p>
            <p className="text-white/20 text-xs mb-4">Vytvoř životopis nebo motivační dopis a ulož si ho.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/pruvodce/sablony/cv" className="bg-[#fb923c]/10 border border-[#fb923c]/20 text-[#fb923c] text-sm font-bold px-5 py-2.5 rounded-xl no-underline transition hover:bg-[#fb923c]/20">
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
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${doc.type === 'cv' ? 'bg-[#fb923c]/[0.08]' : 'bg-blue-500/[0.08]'}`}>
                    {doc.type === 'cv'
                      ? <FileText size={18} strokeWidth={1.75} className="text-[#fb923c]" />
                      : <Mail size={18} strokeWidth={1.75} className="text-blue-400" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold m-0 truncate">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${doc.type === 'cv' ? 'bg-[#fb923c]/10 text-[#fb923c]/60' : 'bg-blue-500/10 text-blue-400/60'}`}>
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
                      href={doc.type === 'cv' ? `/pruvodce/sablony/cv/editor?documentId=${doc.id}` : `/pruvodce/sablony/motivacni-dopis?load=${doc.id}`}
                      className="text-[#fb923c]/70 hover:text-[#fb923c] text-xs font-medium px-3 py-1.5 rounded-lg bg-[#fb923c]/[0.06] hover:bg-[#fb923c]/[0.12] transition no-underline">
                      Otevřít
                    </Link>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleting === doc.id}
                      aria-label="Smazat dokument"
                      className="text-white/15 hover:text-red-400 px-2 py-1.5 rounded-lg transition opacity-0 group-hover:opacity-100">
                      {deleting === doc.id ? <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white/50 rounded-full animate-spin inline-block" /> : <Trash2 size={15} strokeWidth={1.75} />}
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
            <Link href="/pruvodce/sablony/cv" className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white/[0.02] border border-white/[0.06] text-white/40 text-sm font-medium py-3 rounded-xl no-underline transition hover:bg-white/[0.05] hover:text-white">
              <Plus size={15} strokeWidth={2} /> Nový životopis
            </Link>
            <Link href="/pruvodce/sablony/motivacni-dopis" className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white/[0.02] border border-white/[0.06] text-white/40 text-sm font-medium py-3 rounded-xl no-underline transition hover:bg-white/[0.05] hover:text-white">
              <Plus size={15} strokeWidth={2} /> Nový dopis
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
