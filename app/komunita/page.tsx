'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSubscription } from '../../hooks/useSubscription'
import PaywallOverlay from '../components/PaywallOverlay'
import { supabase } from '../supabase'
import { MessageCircle, Home, Lightbulb, HelpCircle, Target, Hash, Search, X, Sparkles, Send, Plus, Paperclip, FileText, Download, Banknote, KeyRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ICON_STROKE = 1.75

// Slash příkazy — zrcadlí SLASH_COMMANDS v /api/community/route.ts.
// Po napsání "/" vyskočí menu (jako Discord); výběr předvyplní příkaz.
const SLASH_COMMANDS: { cmd: string; label: string; desc: string; Icon: LucideIcon }[] = [
  { cmd: 'ai', label: '/ai', desc: 'Zeptej se AI asistenta na cokoliv', Icon: Sparkles },
  { cmd: 'mzda', label: '/mzda', desc: 'Obvyklá mzda v oboru a kantonu', Icon: Banknote },
  { cmd: 'povoleni', label: '/povoleni', desc: 'Pracovní povolení L / B / C / G', Icon: KeyRound },
  { cmd: 'byt', label: '/byt', desc: 'Tipy na bydlení a obvyklé náklady', Icon: Home },
]

const MAX_UPLOAD = 8 * 1024 * 1024 // 8 MB

const CHANNELS: { id: string; label: string; topic: string; Icon: LucideIcon }[] = [
  { id: 'general', label: 'general', topic: 'Obecná diskuze komunity', Icon: MessageCircle },
  { id: 'spolubydleni', label: 'spolubydlení', topic: 'Hledání spolubydlení a bytů', Icon: Home },
  { id: 'napady', label: 'nápady', topic: 'Nápady na vylepšení Wokeru', Icon: Lightbulb },
  { id: 'dotazy', label: 'dotazy', topic: 'Otázky o práci a životě ve Švýcarsku', Icon: HelpCircle },
  { id: 'tipy', label: 'tipy', topic: 'Tipy a triky z praxe', Icon: Target },
]

interface Message {
  id: string; channel: string; user_name: string; content: string; is_ai: boolean; created_at: string
  attachment_url?: string | null; attachment_type?: string | null; attachment_name?: string | null
  avatar_url?: string | null
}

interface Group { user_name: string; is_ai: boolean; items: Message[] }

interface Member { id: string; name: string; avatar_url: string | null; online: boolean; self: boolean }

export default function KomunitaPage() {
  const { isActive, loading } = useSubscription()
  const [channel, setChannel] = useState('general')
  const [messages, setMessages] = useState<Message[]>([])
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState('')
  const [loadingMsgs, setLoadingMsgs] = useState(true)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [slashOpen, setSlashOpen] = useState(false)
  const [slashIndex, setSlashIndex] = useState(0)
  const [members, setMembers] = useState<Member[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesRef = useRef<Message[]>([])
  messagesRef.current = messages
  const channelRef = useRef(channel)
  channelRef.current = channel
  const scrollRef = useRef<HTMLDivElement>(null)
  const nearBottomRef = useRef(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const activeChannel = CHANNELS.find(c => c.id === channel) || CHANNELS[0]

  // Slash menu: aktivní jen dokud uživatel píše "/slovo" bez mezery
  const slashRe = /^\/(\w*)$/.exec(draft)
  const slashMatches = slashRe ? SLASH_COMMANDS.filter(c => c.cmd.startsWith(slashRe[1].toLowerCase())) : []
  const showSlash = slashOpen && slashMatches.length > 0

  const authHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : null
  }

  const scrollToBottom = (smooth = false) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  }

  // Full load on channel change
  const loadChannel = useCallback(async (ch: string) => {
    setLoadingMsgs(true)
    try {
      const auth = await authHeader()
      if (!auth) return
      const res = await fetch(`/api/community?messages=${ch}`, { headers: auth })
      const data = await res.json()
      if (channelRef.current !== ch) return
      setMessages(data.messages || [])
      nearBottomRef.current = true
      requestAnimationFrame(() => scrollToBottom(false))
    } catch {} finally {
      if (channelRef.current === ch) setLoadingMsgs(false)
    }
  }, [])

  useEffect(() => { if (isActive) loadChannel(channel) }, [isActive, channel, loadChannel])

  // Poll for new messages every 4s (incremental via ?since)
  useEffect(() => {
    if (!isActive) return
    const poll = async () => {
      const ch = channelRef.current
      const last = messagesRef.current[messagesRef.current.length - 1]
      const since = last?.created_at
      try {
        const auth = await authHeader()
        if (!auth) return
        const url = since
          ? `/api/community?messages=${ch}&since=${encodeURIComponent(since)}`
          : `/api/community?messages=${ch}`
        const res = await fetch(url, { headers: auth })
        const data = await res.json()
        if (channelRef.current !== ch) return
        const incoming: Message[] = data.messages || []
        if (incoming.length === 0) return
        setMessages(prev => {
          const seen = new Set(prev.map(m => m.id))
          const merged = [...prev, ...incoming.filter(m => !seen.has(m.id))]
          return merged
        })
      } catch {}
    }
    const t = setInterval(poll, 4000)
    return () => clearInterval(t)
  }, [isActive])

  // Presence heartbeat + seznam členů (online status v pravém railu)
  useEffect(() => {
    if (!isActive) return
    const ping = async () => {
      const auth = await authHeader()
      if (!auth) return
      fetch('/api/community', { method: 'POST', headers: { 'Content-Type': 'application/json', ...auth }, body: JSON.stringify({ action: 'ping' }) }).catch(() => {})
    }
    const loadMembers = async () => {
      const auth = await authHeader()
      if (!auth) return
      try {
        const res = await fetch('/api/community?members=1', { headers: auth })
        const data = await res.json()
        setMembers(data.members || [])
      } catch {}
    }
    ping(); loadMembers()
    const t1 = setInterval(ping, 45000)
    const t2 = setInterval(loadMembers, 30000)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [isActive])

  // Auto-scroll on new messages if user is near bottom
  useEffect(() => {
    if (nearBottomRef.current) requestAnimationFrame(() => scrollToBottom(true))
  }, [messages])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120
  }

  const switchChannel = (id: string) => { if (id === channel) return; setSearch(''); setMessages([]); setChannel(id) }

  const handleSend = async () => {
    const text = draft.trim()
    if (!text || sending) return
    setSending(true)
    setDraft('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    try {
      const auth = await authHeader()
      if (!auth) { setDraft(text); return }
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({ action: 'send_message', channel, content: text }),
      })
      if (!res.ok) { setDraft(text); return }
      const data = await res.json()
      if (data.message) {
        nearBottomRef.current = true
        setMessages(prev => prev.some(m => m.id === data.message.id) ? prev : [...prev, data.message])
      }
    } catch { setDraft(text) }
    finally { setSending(false) }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSlash) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSlashIndex(i => (i + 1) % slashMatches.length); return }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSlashIndex(i => (i - 1 + slashMatches.length) % slashMatches.length); return }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); selectSlash(slashMatches[slashIndex].cmd); return }
      if (e.key === 'Escape') { e.preventDefault(); setSlashOpen(false); return }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const autoGrow = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setDraft(val)
    setSlashOpen(/^\/\w*$/.test(val))
    setSlashIndex(0)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }

  const selectSlash = (cmd: string) => {
    setDraft(`/${cmd} `)
    setSlashOpen(false)
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // umožní vybrat stejný soubor znovu
    if (!file || uploading || locked) return
    if (file.size > MAX_UPLOAD) { alert('Soubor je moc velký (max 8 MB)'); return }
    setUploading(true)
    try {
      const auth = await authHeader()
      if (!auth) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const safe = file.name.replace(/[^\w.\-]+/g, '_')
      const path = `${channel}/${user.id}/${Date.now()}-${safe}`
      const { error: upErr } = await supabase.storage.from('community').upload(path, file, { contentType: file.type })
      if (upErr) { alert('Nahrání selhalo: ' + upErr.message); return }
      const { data: { publicUrl } } = supabase.storage.from('community').getPublicUrl(path)
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth },
        body: JSON.stringify({
          action: 'send_message', channel, content: draft.trim(),
          attachment_url: publicUrl, attachment_type: file.type, attachment_name: file.name,
        }),
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.message) {
        setDraft('')
        nearBottomRef.current = true
        setMessages(prev => prev.some(m => m.id === data.message.id) ? prev : [...prev, data.message])
      }
    } catch { /* noop */ }
    finally { setUploading(false) }
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'teď'
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    return `${Math.floor(hrs / 24)}d`
  }

  const initial = (name: string) => (name || '?').trim().charAt(0).toUpperCase()

  // Smart search (diacritics-insensitive)
  const norm = (s: string) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const q = norm(search.trim())
  const visibleMessages = q
    ? messages.filter(m => norm(m.content).includes(q) || norm(m.user_name).includes(q))
    : messages

  // Group consecutive messages by same author within 5 min
  const groups: Group[] = []
  for (const m of visibleMessages) {
    const last = groups[groups.length - 1]
    const lastItem = last?.items[last.items.length - 1]
    if (last && last.user_name === m.user_name && last.is_ai === m.is_ai && lastItem &&
        new Date(m.created_at).getTime() - new Date(lastItem.created_at).getTime() < 5 * 60000) {
      last.items.push(m)
    } else {
      groups.push({ user_name: m.user_name, is_ai: m.is_ai, items: [m] })
    }
  }

  const locked = !isActive && !loading

  return (
    <main className="h-[100dvh] bg-[#0E0E0E] flex overflow-hidden">

      {/* Levy channel sidebar (desktop) */}
      <aside className="hidden md:flex md:flex-col w-[210px] shrink-0 bg-[#141414] border-r border-gray-800/60 overflow-y-auto px-2.5 py-4">
        <div className="flex items-center gap-2 px-2 pb-3 mb-3 border-b border-gray-800/60">
          <MessageCircle size={18} strokeWidth={ICON_STROKE} className="text-[#fb923c]" />
          <span className="text-white text-sm font-bold">Komunita</span>
        </div>
        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wider mb-1.5 px-2">Kanály</p>
        <nav className="space-y-0.5">
          {CHANNELS.map(c => {
            const active = channel === c.id
            return (
              <button key={c.id} onClick={() => switchChannel(c.id)} className={`w-full flex items-center gap-1.5 text-sm px-2 py-1.5 rounded-md text-left transition ${active ? 'bg-[#f97316]/10 text-[#fb923c] font-medium' : 'text-gray-400 hover:bg-[#1A1A1A] hover:text-gray-200'}`}>
                <Hash size={14} strokeWidth={ICON_STROKE} className={active ? 'text-[#fb923c]' : 'text-gray-600'} />
                <c.Icon size={14} strokeWidth={ICON_STROKE} className={active ? 'text-[#fb923c]' : 'text-gray-500'} />
                {c.label}
              </button>
            )
          })}
        </nav>
        <div className="mt-auto pt-4">
          <div className="bg-[#f97316]/5 border border-[#f97316]/15 rounded-xl p-3">
            <p className="flex items-center gap-1.5 text-[#fb923c] text-xs font-bold mb-1"><Sparkles size={13} strokeWidth={ICON_STROKE} /> Woker AI</p>
            <p className="text-gray-500 text-[11px] leading-relaxed">Napiš <span className="text-gray-300 font-medium">@AI</span> na začátek zprávy a asistent ti odpoví.</p>
          </div>
        </div>
      </aside>

      {/* Stred - header + stream + composer */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Channel header */}
        <header className="shrink-0 bg-[#0E0E0E]/90 backdrop-blur border-b border-gray-800/60 px-4 py-3">
          <div className="flex items-center gap-1.5 min-w-0 pl-14 md:pl-0">
            <Hash size={18} strokeWidth={ICON_STROKE} className="text-gray-600 shrink-0" />
            <activeChannel.Icon size={16} strokeWidth={ICON_STROKE} className="text-[#fb923c] shrink-0" />
            <h1 className="text-white text-sm font-bold truncate">{activeChannel.label}</h1>
            <span className="hidden sm:inline text-gray-600 text-xs truncate border-l border-gray-800 pl-2 ml-1">{activeChannel.topic}</span>
          </div>

          {/* Chytre hledani */}
          <div className="relative mt-3">
            <Search size={15} strokeWidth={ICON_STROKE} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Hledat v #${activeChannel.label}…`} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-lg pl-9 pr-9 py-2 text-white text-sm placeholder-gray-600 focus:border-[#f97316]/50 focus:outline-none transition" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
                <X size={15} strokeWidth={ICON_STROKE} />
              </button>
            )}
          </div>

          {/* Channel pills - mobil */}
          <div className="flex md:hidden gap-2 mt-3 overflow-x-auto pb-1">
            {CHANNELS.map(c => (
              <button key={c.id} onClick={() => switchChannel(c.id)} className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border whitespace-nowrap transition ${channel === c.id ? 'border-[#f97316] bg-[#f97316]/10 text-white' : 'border-gray-700 text-gray-400'}`}>
                <Hash size={11} strokeWidth={ICON_STROKE} className="text-[#fb923c]" /> {c.label}
              </button>
            ))}
          </div>
        </header>

        {/* Message stream */}
        <div className="flex-1 min-h-0 relative">
          <PaywallOverlay isLocked={locked} title="Komunita je součástí Premium" description="Chatuj s ostatními Čechy a Slováky ve Švýcarsku — spolubydlení, dotazy, tipy, nápady">
            <div ref={scrollRef} onScroll={handleScroll} className="absolute inset-0 overflow-y-auto py-3">
              {loadingMsgs ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <span className="w-6 h-6 border-2 border-gray-600 border-t-white rounded-full animate-spin inline-block" />
                  <p className="text-gray-500 text-sm mt-3">Načítám zprávy…</p>
                </div>
              ) : visibleMessages.length === 0 ? (
                q ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <Search size={40} strokeWidth={ICON_STROKE} className="text-gray-600 mb-3" />
                    <p className="text-gray-400 text-sm mb-1">Nic nenalezeno</p>
                    <p className="text-gray-600 text-xs">{`Pro „${search}" tady nejsou žádné zprávy.`}</p>
                    <button onClick={() => setSearch('')} className="mt-4 inline-flex items-center gap-1.5 text-[#fb923c] text-sm hover:underline">
                      <X size={14} strokeWidth={ICON_STROKE} /> Zrušit hledání
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center mb-4">
                      <activeChannel.Icon size={26} strokeWidth={ICON_STROKE} className="text-[#fb923c]" />
                    </div>
                    <p className="text-white text-base font-bold mb-1">Vítej v #{activeChannel.label}</p>
                    <p className="text-gray-500 text-sm max-w-xs">{activeChannel.topic}. Napiš první zprávu — nebo se zeptej <span className="text-[#fb923c] font-medium">@AI</span>.</p>
                  </div>
                )
              ) : (
                <div>
                  {q && <p className="text-gray-600 text-xs px-4 pb-2">{visibleMessages.length} {visibleMessages.length === 1 ? 'zpráva' : visibleMessages.length < 5 ? 'zprávy' : 'zpráv'} pro {`„${search}"`}</p>}
                  {groups.map((g, gi) => (
                    <div key={gi} className="flex gap-3 px-4 py-2 hover:bg-white/[0.015] transition">
                      <div className="shrink-0 mt-0.5">
                        {g.is_ai ? (
                          <div className="w-9 h-9 rounded-full bg-[#f97316]/15 border border-[#f97316]/30 flex items-center justify-center">
                            <Sparkles size={16} strokeWidth={ICON_STROKE} className="text-[#fb923c]" />
                          </div>
                        ) : g.items[0].avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={g.items[0].avatar_url} alt={g.user_name} className="w-9 h-9 rounded-full object-cover border border-gray-700" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#252525] border border-gray-700 flex items-center justify-center text-gray-300 text-sm font-bold">
                            {initial(g.user_name)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className={`text-sm font-semibold ${g.is_ai ? 'text-[#fb923c]' : 'text-gray-200'}`}>{g.is_ai ? 'Woker AI' : g.user_name}</span>
                          {g.is_ai && <span className="text-[9px] uppercase tracking-wider bg-[#f97316]/15 text-[#fb923c] px-1 py-0.5 rounded font-bold">AI</span>}
                          <span className="text-gray-600 text-[10px]">{timeAgo(g.items[0].created_at)}</span>
                        </div>
                        <div className="space-y-1 mt-0.5">
                          {g.items.map(m => (
                            <div key={m.id}>
                              {m.content && <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>}
                              {m.attachment_url && (
                                m.attachment_type?.startsWith('image/') ? (
                                  <a href={m.attachment_url} target="_blank" rel="noopener noreferrer" className="block mt-1 w-fit">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={m.attachment_url} alt={m.attachment_name || 'příloha'} className="max-w-[280px] max-h-[280px] rounded-lg border border-gray-800 object-cover hover:opacity-90 transition" />
                                  </a>
                                ) : (
                                  <a href={m.attachment_url} target="_blank" rel="noopener noreferrer" download className="inline-flex items-center gap-2 mt-1 bg-[#1A1A1A] border border-gray-800 rounded-lg px-3 py-2 hover:border-[#f97316]/40 transition max-w-[280px]">
                                    <FileText size={18} strokeWidth={ICON_STROKE} className="text-[#fb923c] shrink-0" />
                                    <span className="text-gray-300 text-xs truncate flex-1">{m.attachment_name || 'soubor'}</span>
                                    <Download size={14} strokeWidth={ICON_STROKE} className="text-gray-500 shrink-0" />
                                  </a>
                                )
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PaywallOverlay>
        </div>

        {/* Composer */}
        <div className="shrink-0 px-4 pb-4 pt-2 bg-[#0E0E0E] relative">

          {/* Slash menu (Discord-style) */}
          {showSlash && (
            <div className="absolute left-4 right-4 bottom-full mb-2 bg-[#1A1A1A] border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-20">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider px-3 pt-2.5 pb-1.5">Příkazy</p>
              {slashMatches.map((c, i) => (
                <button
                  key={c.cmd}
                  onMouseDown={(e) => { e.preventDefault(); selectSlash(c.cmd) }}
                  onMouseEnter={() => setSlashIndex(i)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left transition ${i === slashIndex ? 'bg-[#f97316]/10' : 'hover:bg-white/[0.03]'}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#252525] border border-gray-700 flex items-center justify-center shrink-0">
                    <c.Icon size={16} strokeWidth={ICON_STROKE} className="text-[#fb923c]" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${i === slashIndex ? 'text-white' : 'text-gray-300'}`}>{c.label}</p>
                    <p className="text-gray-500 text-xs truncate">{c.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={handleFileUpload} className="hidden" />

          <div className={`flex items-end gap-2 bg-[#1A1A1A] border border-gray-800 rounded-2xl px-3 py-2 transition ${locked ? 'opacity-50' : 'focus-within:border-[#f97316]/50'}`}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={locked || uploading || sending}
              title="Nahrát soubor nebo fotku"
              className="shrink-0 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#fb923c] hover:bg-white/[0.04] rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploading ? <span className="w-4 h-4 border-2 border-gray-600 border-t-[#fb923c] rounded-full animate-spin inline-block" /> : <Plus size={20} strokeWidth={ICON_STROKE} />}
            </button>
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={autoGrow}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={locked || sending}
              placeholder={locked ? 'Komunita je Premium' : `Napiš do #${activeChannel.label}…  (/ příkazy, @AI asistent)`}
              className="flex-1 bg-transparent resize-none text-white text-sm placeholder-gray-600 focus:outline-none py-1 max-h-[140px] disabled:cursor-not-allowed"
            />
            <button onClick={handleSend} disabled={locked || sending || !draft.trim()} className="shrink-0 w-9 h-9 flex items-center justify-center bg-[#f97316] text-white rounded-xl hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed">
              {sending ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" /> : <Send size={16} strokeWidth={ICON_STROKE} />}
            </button>
          </div>
          <p className="text-gray-700 text-[10px] mt-1.5 px-1"><span className="text-[#fb923c]/70">/</span> příkazy · <Paperclip size={9} className="inline -mt-0.5" /> nahraj soubor · <span className="text-[#fb923c]/70">@AI</span> zavolá asistenta</p>
        </div>
      </div>

      {/* Pravy rail - info o komunite (lg) */}
      <aside className="hidden lg:flex lg:flex-col w-[250px] shrink-0 gap-4 bg-[#141414] border-l border-gray-800/60 overflow-y-auto px-4 py-4">
        {/* Online členové (Discord-style) */}
        <div>
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wider mb-2">
            Online — {members.filter(m => m.online).length}
          </p>
          <div className="space-y-0.5">
            {members.filter(m => m.online).length === 0 && (
              <p className="text-gray-600 text-xs">Zatím nikdo online</p>
            )}
            {members.filter(m => m.online).slice(0, 12).map(m => (
              <div key={m.id} className="flex items-center gap-2 py-1">
                <div className="relative shrink-0">
                  {m.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.avatar_url} alt={m.name} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#252525] border border-gray-700 flex items-center justify-center text-gray-300 text-[11px] font-bold">{initial(m.name)}</div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#141414]" />
                </div>
                <span className="text-gray-300 text-xs truncate">{m.name}{m.self && <span className="text-gray-600"> (ty)</span>}</span>
              </div>
            ))}
          </div>
          {members.filter(m => !m.online).length > 0 && (
            <>
              <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wider mt-3 mb-2">
                Offline — {members.filter(m => !m.online).length}
              </p>
              <div className="space-y-0.5">
                {members.filter(m => !m.online).slice(0, 8).map(m => (
                  <div key={m.id} className="flex items-center gap-2 py-1 opacity-50">
                    {m.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.avatar_url} alt={m.name} className="w-7 h-7 rounded-full object-cover grayscale" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#252525] border border-gray-700 flex items-center justify-center text-gray-400 text-[11px] font-bold">{initial(m.name)}</div>
                    )}
                    <span className="text-gray-400 text-xs truncate">{m.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wider mb-2">O komunitě</p>
          <p className="text-gray-500 text-xs leading-relaxed">Komunita Woker je o <span className="text-gray-300">vzájemném poznávání a pomoci</span> mezi Čechy a Slováky ve Švýcarsku. Jsem tu osobně hodně aktivní — s řadou věcí ti dokážu poradit individuálně.</p>
          <p className="text-gray-500 text-xs leading-relaxed mt-2">Řeš tu spolubydlení, ptej se na dotazy a sdílej tipy z praxe. Když narazíš na překážku, stačí napsat sem do komunity — <span className="text-[#fb923c]">do 48 hodin ti na dotaz odpovím.</span></p>
        </div>
        <div>
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wider mb-2">Pravidla</p>
          <ul className="text-gray-400 text-xs space-y-1.5">
            <li className="flex gap-1.5"><span className="text-[#fb923c]">•</span> Buď slušný a pomáhej ostatním</li>
            <li className="flex gap-1.5"><span className="text-[#fb923c]">•</span> Žádný spam ani reklama</li>
            <li className="flex gap-1.5"><span className="text-[#fb923c]">•</span> Sdílej reálné zkušenosti ze Švýcarska</li>
          </ul>
        </div>
        <div className="bg-[#f97316]/5 border border-[#f97316]/15 rounded-xl p-3">
          <p className="flex items-center gap-1.5 text-[#fb923c] text-xs font-bold mb-1"><Sparkles size={13} strokeWidth={ICON_STROKE} /> Woker AI asistent</p>
          <p className="text-gray-500 text-[11px] leading-relaxed">Začni zprávu slovem <span className="text-gray-300 font-medium">@AI</span> a expert na švýcarský trh ti odpoví přímo v chatu.</p>
        </div>
      </aside>
    </main>
  )
}
