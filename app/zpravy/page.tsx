'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSubscription } from '../../hooks/useSubscription'
import PaywallOverlay from '../components/PaywallOverlay'
import { supabase } from '../supabase'
import { MessageCircle, Search, Send, ArrowLeft, Plus, X } from 'lucide-react'

const ICON_STROKE = 1.75

interface Conversation { id: string; name: string; avatar_url: string | null; online: boolean; last_content: string; last_at: string; last_from_me: boolean; unread: number }
interface DM { id: string; sender_id: string; recipient_id: string; content: string; created_at: string }
interface Partner { id: string; name: string; avatar_url: string | null; online: boolean }
interface Member { id: string; name: string; avatar_url: string | null; online: boolean; self: boolean }

export default function ZpravyPage() {
  const { isActive, loading } = useSubscription()
  const [meId, setMeId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [partner, setPartner] = useState<Partner | null>(null)
  const [messages, setMessages] = useState<DM[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [memberSearch, setMemberSearch] = useState('')

  const activeRef = useRef<string | null>(null); activeRef.current = activeId
  const messagesRef = useRef<DM[]>([]); messagesRef.current = messages
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const authHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : null
  }

  const scrollToBottom = (smooth = false) => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  }

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setMeId(data.user?.id || null)) }, [])

  const loadConversations = useCallback(async () => {
    const auth = await authHeader()
    if (!auth) return
    try {
      const res = await fetch('/api/dm', { headers: auth })
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch {}
  }, [])

  const loadMembers = useCallback(async () => {
    const auth = await authHeader()
    if (!auth) return
    try {
      const res = await fetch('/api/community?members=1', { headers: auth })
      const data = await res.json()
      setMembers((data.members || []).filter((m: Member) => !m.self))
    } catch {}
  }, [])

  const openConversation = useCallback(async (id: string) => {
    setActiveId(id)
    setPickerOpen(false)
    setMessages([])
    const auth = await authHeader()
    if (!auth) return
    try {
      const res = await fetch(`/api/dm?with=${id}`, { headers: auth })
      const data = await res.json()
      if (activeRef.current !== id) return
      setMessages(data.messages || [])
      setPartner(data.partner || null)
      requestAnimationFrame(() => scrollToBottom(false))
      loadConversations() // refresh unread badges
    } catch {}
  }, [loadConversations])

  // Init: subscription gate + ?with= deeplink + presence ping
  useEffect(() => {
    if (!isActive) return
    loadConversations()
    loadMembers()
    const withId = new URLSearchParams(window.location.search).get('with')
    if (withId) openConversation(withId)
    const ping = async () => {
      const auth = await authHeader()
      if (auth) fetch('/api/community', { method: 'POST', headers: { 'Content-Type': 'application/json', ...auth }, body: JSON.stringify({ action: 'ping' }) }).catch(() => {})
    }
    ping()
    const t1 = setInterval(ping, 45000)
    const t2 = setInterval(loadConversations, 10000)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [isActive, loadConversations, loadMembers, openConversation])

  // Poll messages in open conversation
  useEffect(() => {
    if (!isActive || !activeId) return
    const poll = async () => {
      const auth = await authHeader()
      if (!auth) return
      try {
        const res = await fetch(`/api/dm?with=${activeId}`, { headers: auth })
        const data = await res.json()
        if (activeRef.current !== activeId) return
        const incoming: DM[] = data.messages || []
        if (incoming.length !== messagesRef.current.length) {
          setMessages(incoming)
          requestAnimationFrame(() => scrollToBottom(true))
        }
      } catch {}
    }
    const t = setInterval(poll, 4000)
    return () => clearInterval(t)
  }, [isActive, activeId])

  const handleSend = async () => {
    const text = draft.trim()
    if (!text || sending || !activeId) return
    setSending(true)
    setDraft('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    try {
      const auth = await authHeader()
      if (!auth) { setDraft(text); return }
      const res = await fetch('/api/dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ recipient_id: activeId, content: text }),
      })
      if (!res.ok) { setDraft(text); return }
      const data = await res.json()
      if (data.message) {
        setMessages(prev => [...prev, data.message])
        requestAnimationFrame(() => scrollToBottom(true))
        loadConversations()
      }
    } catch { setDraft(text) }
    finally { setSending(false) }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const autoGrow = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }

  const initial = (name: string) => (name || '?').trim().charAt(0).toUpperCase()
  const norm = (s: string) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
    if (mins < 1) return 'teď'
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    return `${Math.floor(hrs / 24)}d`
  }

  const locked = !isActive && !loading
  const mq = norm(memberSearch.trim())
  const filteredMembers = mq ? members.filter(m => norm(m.name).includes(mq)) : members

  const Avatar = ({ url, name, online, size = 40 }: { url: string | null; name: string; online?: boolean; size?: number }) => (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="rounded-full object-cover w-full h-full" />
      ) : (
        <div className="rounded-full bg-[#252525] border border-gray-700 flex items-center justify-center text-gray-300 font-bold w-full h-full" style={{ fontSize: size * 0.4 }}>{initial(name)}</div>
      )}
      {online && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#141414]" />}
    </div>
  )

  return (
    <main className="h-[100dvh] bg-[#0E0E0E] flex overflow-hidden">

      {/* Levý panel — konverzace */}
      <aside className={`${activeId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[320px] shrink-0 bg-[#141414] border-r border-gray-800/60`}>
        <div className="shrink-0 flex items-center justify-between px-4 py-4 border-b border-gray-800/60 pl-14 md:pl-4">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} strokeWidth={ICON_STROKE} className="text-[#fb923c]" />
            <span className="text-white text-sm font-bold">Zprávy</span>
          </div>
          <button onClick={() => { setPickerOpen(true); loadMembers() }} title="Nová zpráva" className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1A1A1A] border border-gray-800 text-gray-400 hover:text-[#fb923c] hover:border-[#f97316]/40 transition">
            <Plus size={17} strokeWidth={ICON_STROKE} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <PaywallOverlay isLocked={locked} title="Soukromé zprávy jsou Premium" description="Piš si soukromě s ostatními členy komunity">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center px-6 py-16">
                <MessageCircle size={36} strokeWidth={ICON_STROKE} className="text-gray-700 mb-3" />
                <p className="text-gray-400 text-sm mb-1">Zatím žádné zprávy</p>
                <p className="text-gray-600 text-xs">Klikni na <span className="text-[#fb923c]">+</span> a napiš někomu z komunity.</p>
              </div>
            ) : conversations.map(c => (
              <button key={c.id} onClick={() => openConversation(c.id)} className={`w-full flex items-center gap-3 px-3 py-3 text-left transition border-l-2 ${activeId === c.id ? 'bg-[#f97316]/[0.07] border-[#f97316]' : 'border-transparent hover:bg-white/[0.02]'}`}>
                <Avatar url={c.avatar_url} name={c.name} online={c.online} size={42} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-200 text-sm font-semibold truncate">{c.name}</span>
                    <span className="text-gray-600 text-[10px] shrink-0">{timeAgo(c.last_at)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs truncate ${c.unread ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>{c.last_from_me && 'Ty: '}{c.last_content}</span>
                    {c.unread > 0 && <span className="shrink-0 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[#f97316] text-white text-[10px] font-bold rounded-full">{c.unread}</span>}
                  </div>
                </div>
              </button>
            ))}
          </PaywallOverlay>
        </div>
      </aside>

      {/* Pravý panel — aktivní konverzace */}
      <div className={`${activeId ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>
        {activeId && partner ? (
          <>
            <header className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-800/60 bg-[#0E0E0E]/90 backdrop-blur">
              <button onClick={() => { setActiveId(null); setPartner(null) }} className="md:hidden text-gray-400 hover:text-white"><ArrowLeft size={20} strokeWidth={ICON_STROKE} /></button>
              <Avatar url={partner.avatar_url} name={partner.name} online={partner.online} size={36} />
              <div className="min-w-0">
                <p className="text-white text-sm font-bold truncate">{partner.name}</p>
                <p className="text-[11px] text-gray-500">{partner.online ? <span className="text-green-500">● online</span> : 'offline'}</p>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Avatar url={partner.avatar_url} name={partner.name} size={56} />
                  <p className="text-white text-base font-bold mt-3">{partner.name}</p>
                  <p className="text-gray-500 text-sm mt-1">Tohle je začátek vaší konverzace.</p>
                </div>
              ) : messages.map(m => {
                const mine = m.sender_id === meId
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${mine ? 'bg-[#f97316] text-white rounded-br-md' : 'bg-[#1F1F1F] text-gray-200 rounded-bl-md'}`}>
                      {m.content}
                      <span className={`block text-[9px] mt-1 ${mine ? 'text-white/60' : 'text-gray-500'}`}>{timeAgo(m.created_at)}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="shrink-0 px-4 pb-4 pt-2 bg-[#0E0E0E]">
              <div className="flex items-end gap-2 bg-[#1A1A1A] border border-gray-800 rounded-2xl px-3 py-2 focus-within:border-[#f97316]/50 transition">
                <textarea ref={textareaRef} value={draft} onChange={autoGrow} onKeyDown={handleKeyDown} rows={1} disabled={sending} placeholder={`Napiš ${partner.name}…`} className="flex-1 bg-transparent resize-none text-white text-sm placeholder-gray-600 focus:outline-none py-1 max-h-[140px]" />
                <button onClick={handleSend} disabled={sending || !draft.trim()} className="shrink-0 w-9 h-9 flex items-center justify-center bg-[#f97316] text-white rounded-xl hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed">
                  {sending ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" /> : <Send size={16} strokeWidth={ICON_STROKE} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center mb-4">
              <MessageCircle size={30} strokeWidth={ICON_STROKE} className="text-[#fb923c]" />
            </div>
            <p className="text-white text-lg font-bold mb-1">Tvoje soukromé zprávy</p>
            <p className="text-gray-500 text-sm max-w-xs">Vyber konverzaci vlevo, nebo klikni na <span className="text-[#fb923c]">+</span> a napiš někomu z komunity.</p>
          </div>
        )}
      </div>

      {/* Picker členů — nová zpráva */}
      {pickerOpen && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm" onClick={() => setPickerOpen(false)}>
          <div className="w-full max-w-md bg-[#141414] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60">
              <span className="text-white text-sm font-bold">Nová zpráva</span>
              <button onClick={() => setPickerOpen(false)} className="text-gray-500 hover:text-white"><X size={18} strokeWidth={ICON_STROKE} /></button>
            </div>
            <div className="p-3">
              <div className="relative">
                <Search size={15} strokeWidth={ICON_STROKE} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input autoFocus value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder="Hledat člena…" className="w-full bg-[#1A1A1A] border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder-gray-600 focus:border-[#f97316]/50 focus:outline-none" />
              </div>
            </div>
            <div className="max-h-[50vh] overflow-y-auto pb-2">
              {filteredMembers.length === 0 ? (
                <p className="text-gray-600 text-xs text-center py-6">Nikdo nenalezen</p>
              ) : filteredMembers.map(m => (
                <button key={m.id} onClick={() => { setMemberSearch(''); openConversation(m.id) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.03] transition">
                  <Avatar url={m.avatar_url} name={m.name} online={m.online} size={36} />
                  <span className="text-gray-200 text-sm truncate">{m.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
