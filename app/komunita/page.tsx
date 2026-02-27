'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSubscription } from '../../hooks/useSubscription'
import PaywallOverlay from '../components/PaywallOverlay'
import { supabase } from '../supabase'
import Link from 'next/link'

const CATEGORIES = [
  { id: 'all', label: 'Vše', icon: '📋' },
  { id: 'spolubydleni', label: 'Spolubydlení', icon: '🏠' },
  { id: 'feature', label: 'Nápady', icon: '💡' },
  { id: 'dotaz', label: 'Dotazy', icon: '❓' },
  { id: 'tip', label: 'Tipy', icon: '🎯' },
]

const REGIONS = ['Zürich', 'Bern', 'Basel', 'Luzern', 'St. Gallen', 'Aargau', 'Solothurn', 'Thurgau', 'Zug', 'Schaffhausen', 'Graubünden', 'Wallis', 'Waadt', 'Genf', 'Ticino']

interface Post {
  id: string; user_name: string; category: string; title: string; content: string
  region?: string; budget?: string; move_date?: string; looking_for?: string
  images?: string[]
  upvotes: number; comments_count: number; is_pinned: boolean
  created_at: string; hasUpvoted: boolean
}

interface Comment {
  id: string; user_name: string; content: string; is_ai: boolean; created_at: string
}

export default function KomunitaPage() {
  const { isActive, loading } = useSubscription()
  const [posts, setPosts] = useState<Post[]>([])
  const [category, setCategory] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState<Record<string, string>>({ category: 'dotaz' })
  const [formImages, setFormImages] = useState<string[]>([])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) { setError('Max. velikost obrázku je 5 MB'); return }
      const reader = new FileReader()
      reader.onloadend = () => setFormImages(prev => [...prev, reader.result as string])
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return
      const res = await fetch(`/api/community?category=${category}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      setPosts(data.posts || [])
    } catch {} finally { setLoadingPosts(false) }
  }, [category])

  useEffect(() => { if (isActive) fetchPosts() }, [isActive, fetchPosts])

  const fetchPost = async (post: Post) => {
    setSelectedPost(post)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return
      const res = await fetch(`/api/community?postId=${post.id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      setComments(data.comments || [])
    } catch {}
  }

  const handleUpvote = async (postId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'upvote', post_id: postId }),
      })
      const data = await res.json()
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, hasUpvoted: data.upvoted, upvotes: p.upvotes + (data.upvoted ? 1 : -1) } : p))
    } catch {}
  }

  const handleCreatePost = async () => {
    if (!form.title?.trim() || !form.content?.trim() || !form.category) { setError('Vyplň nadpis a obsah'); return }
    setSubmitting(true); setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'create_post', ...form, images: formImages.length > 0 ? formImages : undefined }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setShowForm(false); setForm({ category: 'dotaz' }); setFormImages([]); fetchPosts()
    } catch (err: any) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const handleComment = async () => {
    if (!newComment.trim() || !selectedPost) return
    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'comment', post_id: selectedPost.id, content: newComment }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      const data = await res.json()
      setComments(prev => [...prev, data.comment])
      setNewComment('')
      setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, comments_count: p.comments_count + 1 } : p))
    } catch {}
    finally { setSubmitting(false) }
  }

  const catMeta = (cat: string) => {
    const m: Record<string, { icon: string; color: string; bg: string }> = {
      spolubydleni: { icon: '🏠', color: 'text-green-400', bg: 'bg-green-500/10' },
      feature: { icon: '💡', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
      dotaz: { icon: '❓', color: 'text-blue-400', bg: 'bg-blue-500/10' },
      tip: { icon: '🎯', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    }
    return m[cat] || m.dotaz
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    return `${Math.floor(hrs / 24)}d`
  }

  // ─── POST DETAIL ───
  if (selectedPost) {
    const cm = catMeta(selectedPost.category)
    return (
      <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => { setSelectedPost(null); setComments([]) }} className="text-gray-500 hover:text-white text-sm mb-4 inline-block">← Zpět na komunitu</button>

          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-5 mb-4">
            <div className="flex items-start gap-3 mb-3">
              <span className={`text-xs px-2 py-0.5 rounded-full ${cm.bg} ${cm.color}`}>{cm.icon} {selectedPost.category}</span>
              {selectedPost.is_pinned && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">📌</span>}
            </div>
            <h1 className="text-white text-lg font-bold mb-2">{selectedPost.title}</h1>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>

            {selectedPost.category === 'spolubydleni' && (
              <div className="flex gap-3 mt-3 flex-wrap">
                {selectedPost.region && <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full">📍 {selectedPost.region}</span>}
                {selectedPost.budget && <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full">💰 {selectedPost.budget}</span>}
                {selectedPost.move_date && <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded-full">📅 {selectedPost.move_date}</span>}
              </div>
            )}

            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-800">
              <span className="text-gray-500 text-xs">{selectedPost.user_name}</span>
              <span className="text-gray-600 text-xs">{timeAgo(selectedPost.created_at)}</span>
            </div>
          </div>

          {/* Comments */}
          <h2 className="text-white text-sm font-bold mb-3">💬 Komentáře ({comments.length})</h2>

          {comments.length === 0 && <p className="text-gray-600 text-sm mb-4">Zatím žádné komentáře. Buď první!</p>}

          <div className="space-y-2 mb-4">
            {comments.map(c => (
              <div key={c.id} className={`rounded-xl p-3 ${c.is_ai ? 'bg-blue-500/5 border border-blue-500/15' : 'bg-[#1A1A1A] border border-gray-800'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold ${c.is_ai ? 'text-blue-400' : 'text-gray-400'}`}>
                    {c.is_ai ? '🤖 AI Woker' : c.user_name}
                  </span>
                  <span className="text-gray-600 text-[10px]">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{c.content}</p>
              </div>
            ))}
          </div>

          {/* New comment */}
          <div className="flex gap-2">
            <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleComment()} placeholder="Napiš komentář..." className="flex-1 bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
            <button onClick={handleComment} disabled={submitting || !newComment.trim()} className="bg-[#E8302A] text-white font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-50 text-sm">
              {submitting ? '...' : '→'}
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ─── NEW POST FORM ───
  if (showForm) {
    return (
      <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white text-sm mb-4 inline-block">← Zpět</button>

          <h1 className="text-white text-xl font-bold mb-4">✏️ Nový příspěvek</h1>

          <div className="space-y-4">
            {/* Category */}
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">Kategorie *</label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <button key={c.id} onClick={() => setForm(f => ({ ...f, category: c.id }))} className={`text-sm px-3 py-1.5 rounded-full border transition ${form.category === c.id ? 'border-[#E8302A] bg-[#E8302A]/10 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">Nadpis *</label>
              <input type="text" value={form.title || ''} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder={form.category === 'spolubydleni' ? 'Hledám spolubydlícího v Zürichu' : form.category === 'feature' ? 'Návrh: přidejte...' : 'Tvůj nadpis'} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">Obsah *</label>
              <textarea value={form.content || ''} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Popiš svůj příspěvek..." rows={4} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition resize-none" />
            </div>

            {/* Spolubydlení extra fields */}
            {form.category === 'spolubydleni' && (
              <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-4 space-y-3">
                <p className="text-green-400 text-xs font-bold">🏠 Detaily spolubydlení</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Region</label>
                    <select value={form.region || ''} onChange={(e) => setForm(f => ({ ...f, region: e.target.value }))} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:border-gray-600 focus:outline-none transition appearance-none">
                      <option value="">Vyber region</option>
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Budget / osoba</label>
                    <input type="text" value={form.budget || ''} onChange={(e) => setForm(f => ({ ...f, budget: e.target.value }))} placeholder="CHF 800" className="w-full bg-[#1A1A1A] border border-gray-800 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Stěhování od</label>
                    <input type="text" value={form.move_date || ''} onChange={(e) => setForm(f => ({ ...f, move_date: e.target.value }))} placeholder="1.4.2026" className="w-full bg-[#1A1A1A] border border-gray-800 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Hledám</label>
                    <select value={form.looking_for || ''} onChange={(e) => setForm(f => ({ ...f, looking_for: e.target.value }))} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:border-gray-600 focus:outline-none transition appearance-none">
                      <option value="">Vyber</option>
                      <option value="spolubydlici">Spolubydlícího</option>
                      <option value="byt">Byt pro WG</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Image upload */}
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">📷 Přidat obrázek (volitelné)</label>
              <label className="w-full bg-[#1A1A1A] border border-dashed border-gray-600 rounded-xl p-3 text-center cursor-pointer hover:border-gray-400 transition block">
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                <span className="text-gray-400 text-sm">Klikni pro nahrání fotky</span>
              </label>
              {formImages.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {formImages.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-700" />
                      <button onClick={() => setFormImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"><p className="text-red-400 text-sm">⚠️ {error}</p></div>}

            <button onClick={handleCreatePost} disabled={submitting} className="w-full bg-[#E8302A] text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition disabled:opacity-50">
              {submitting ? 'Publikuji...' : '✏️ Publikovat'}
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ─── POST LIST ───
  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-xl font-bold">💬 Komunita</h1>
            <p className="text-gray-500 text-xs">Spolubydlení, nápady, dotazy, tipy</p>
          </div>
          {isActive && (
            <button onClick={() => setShowForm(true)} className="bg-[#E8302A] text-white font-bold text-sm px-4 py-2 rounded-xl hover:opacity-90 transition">
              ✏️ Nový
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)} className={`text-sm px-3 py-1.5 rounded-full border whitespace-nowrap transition ${category === c.id ? 'border-[#E8302A] bg-[#E8302A]/10 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        <PaywallOverlay isLocked={!isActive && !loading} title="Komunita je součástí Premium" description="Spolubydlení, nápady, dotazy od ostatních Čechů ve Švýcarsku">

          {loadingPosts ? (
            <div className="text-center py-12">
              <span className="w-6 h-6 border-2 border-gray-600 border-t-white rounded-full animate-spin inline-block" />
              <p className="text-gray-500 text-sm mt-3">Načítám příspěvky...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl block mb-3">📭</span>
              <p className="text-gray-400 text-sm mb-1">Zatím žádné příspěvky</p>
              <p className="text-gray-600 text-xs">Buď první kdo napíše!</p>
              <button onClick={() => setShowForm(true)} className="mt-4 bg-[#E8302A] text-white font-bold text-sm px-4 py-2 rounded-xl hover:opacity-90 transition">
                ✏️ Napsat příspěvek
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map(post => {
                const cm = catMeta(post.category)
                return (
                  <div key={post.id} onClick={() => fetchPost(post)} className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition cursor-pointer">
                    <div className="flex items-start gap-3">
                      {/* Upvote */}
                      <button onClick={(e) => { e.stopPropagation(); handleUpvote(post.id) }} className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg transition ${post.hasUpvoted ? 'bg-[#E8302A]/10 text-[#E8302A]' : 'text-gray-500 hover:bg-gray-800'}`}>
                        <span className="text-sm">{post.hasUpvoted ? '▲' : '△'}</span>
                        <span className="text-xs font-bold">{post.upvotes}</span>
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${cm.bg} ${cm.color}`}>{cm.icon} {post.category}</span>
                          {post.is_pinned && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400">📌</span>}
                          {post.category === 'spolubydleni' && post.region && <span className="text-[10px] text-green-400">📍 {post.region}</span>}
                          {post.category === 'spolubydleni' && post.budget && <span className="text-[10px] text-blue-400">💰 {post.budget}</span>}
                        </div>
                        <h3 className="text-white text-sm font-semibold mb-0.5 truncate">{post.title}</h3>
                        <p className="text-gray-500 text-xs line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-3 mt-2 text-gray-600 text-[10px]">
                          <span>{post.user_name}</span>
                          <span>{timeAgo(post.created_at)}</span>
                          <span>💬 {post.comments_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </PaywallOverlay>
      </div>
    </main>
  )
}
