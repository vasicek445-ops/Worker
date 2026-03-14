'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSubscription } from '../../hooks/useSubscription'
import PaywallOverlay from '../components/PaywallOverlay'
import Link from 'next/link'

type Message = {
  role: 'user' | 'assistant'
  content: string
  chips?: string[]
}

const STORAGE_KEY = 'wokee-chat-history'

const QUICK_QUESTIONS = [
  '📋 Jak získat pracovní povolení?',
  '💰 Kolik vydělám ve Švýcarsku?',
  '📝 Pomoz mi napsat CV',
  '🏠 Jak najít bydlení?',
  '🏥 Zdravotní pojištění',
  '💼 Napsat motivační dopis',
]

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: 'Ahoj! 👋 Jsem Wokee, tvůj AI průvodce prací ve Švýcarsku. Pomůžu ti se vším – od hledání práce, přes dokumenty, až po napsání CV. Ptej se na cokoliv!',
  chips: ['Jak začít pracovat ve Švýcarsku?', 'Kolik budu vydělávat?', 'Potřebuju němčinu?'],
}

function WokeeAvatar({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/wokee-avatar.svg"
      alt="Wokee"
      width={size}
      height={size}
      className="rounded-full flex-shrink-0"
    />
  )
}

function parseChips(text: string): { cleanText: string; chips: string[] } {
  const match = text.match(/\[CHIPS:\s*(.+?)\]\s*$/)
  if (!match) return { cleanText: text, chips: [] }

  const cleanText = text.replace(/\[CHIPS:\s*.+?\]\s*$/, '').trimEnd()
  const chips = match[1].split('|').map((c) => c.trim()).filter(Boolean)
  return { cleanText, chips }
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <WokeeAvatar size={28} />
      <div className="bg-[#252525] rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-[#E8302A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-[#E8302A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-[#E8302A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

export default function Asistent() {
  const { isActive, loading: subLoading } = useSubscription()
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
        }
      }
    } catch { /* ignore */ }
  }, [])

  // Save to sessionStorage on change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch { /* ignore */ }
  }, [messages])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return

    const cleanText = text.replace(/^[^\w\sáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]+\s*/, '')
    const userMessage: Message = { role: 'user', content: cleanText }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsStreaming(true)
    setStreamingText('')

    // Abort previous stream if any
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const apiMessages = newMessages
        .filter((_, i) => i !== 0) // Skip initial greeting
        .map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages.length > 0 ? apiMessages : [{ role: 'user', content: cleanText }],
          stream: true,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Chyba serveru' }))
        throw new Error(errData.error || 'Chyba')
      }

      const contentType = res.headers.get('content-type') || ''

      if (contentType.includes('text/event-stream')) {
        // Stream the response
        const reader = res.body?.getReader()
        if (!reader) throw new Error('No body')

        const decoder = new TextDecoder()
        let fullText = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue
              try {
                const parsed = JSON.parse(data)
                if (parsed.text) {
                  fullText += parsed.text
                  setStreamingText(fullText)
                }
              } catch { /* skip */ }
            }
          }
        }

        // Parse chips from final text
        const { cleanText: finalText, chips } = parseChips(fullText)
        setMessages([...newMessages, { role: 'assistant', content: finalText, chips }])
      } else {
        // JSON fallback
        const data = await res.json()
        const { cleanText: finalText, chips } = parseChips(data.response || '')
        setMessages([...newMessages, { role: 'assistant', content: finalText, chips }])
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Jejda, něco se pokazilo 😅 Zkus to prosím znovu!' },
      ])
    } finally {
      setIsStreaming(false)
      setStreamingText('')
      abortRef.current = null
      inputRef.current?.focus()
    }
  }, [messages, isStreaming])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE])
    sessionStorage.removeItem(STORAGE_KEY)
  }

  // Find chips from the last assistant message
  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant')
  const showChips = !isStreaming && lastAssistantMsg?.chips && lastAssistantMsg.chips.length > 0
  const showQuickQuestions = !isStreaming && messages.length === 1

  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
          ← Zpět
        </Link>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <WokeeAvatar size={80} />
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0E0E0E]" />
          </div>
          <h1 className="text-white text-2xl font-bold mb-1">Wokee</h1>
          <p className="text-gray-400 text-sm">
            Tvůj AI průvodce prací ve Švýcarsku – 24/7
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: '📝', title: 'CV & dopisy', desc: 'Švýcarský formát' },
            { icon: '💬', title: 'Vše o práci', desc: 'Povolení, daně' },
            { icon: '🇩🇪', title: 'Němčina', desc: 'Překlady, fráze' },
          ].map((f) => (
            <div key={f.title} className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 text-center">
              <div className="text-xl mb-1">{f.icon}</div>
              <h3 className="text-white text-xs font-bold">{f.title}</h3>
              <p className="text-gray-500 text-[10px] mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>

        <PaywallOverlay
          isLocked={!isActive && !subLoading}
          title="Odemkni Wokee asistenta"
          description="Dostupný 24/7 – pomůže s CV, motivačním dopisem, otázkami o práci ve Švýcarsku"
        >
          {/* Chat */}
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl overflow-hidden flex flex-col" style={{ height: '500px' }}>
            {/* Header */}
            <div className="bg-[#151515] px-4 py-3 border-b border-gray-800 flex items-center gap-3">
              <WokeeAvatar size={36} />
              <div className="flex-1">
                <p className="text-white text-sm font-bold">Wokee</p>
                <p className={`text-xs ${isStreaming ? 'text-yellow-400' : 'text-green-400'}`}>
                  {isStreaming ? '✏️ Píše...' : '● Online'}
                </p>
              </div>
              {messages.length > 1 && (
                <button
                  onClick={handleClearChat}
                  className="text-[10px] text-gray-600 hover:text-gray-400 bg-[#0E0E0E] px-2 py-1 rounded-full transition"
                  title="Vymazat historii"
                >
                  🗑️ Nový chat
                </button>
              )}
              <span className="text-[10px] text-gray-600 bg-[#0E0E0E] px-2 py-1 rounded-full">AI asistent</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'assistant' && <WokeeAvatar size={28} />}
                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-[#E8302A] text-white rounded-tr-md'
                        : 'bg-[#252525] text-gray-200 rounded-tl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}

              {/* Streaming text */}
              {isStreaming && streamingText && (
                <div className="flex gap-3">
                  <WokeeAvatar size={28} />
                  <div className="bg-[#252525] rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%]">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed text-gray-200">
                      {streamingText}
                      <span className="inline-block w-0.5 h-4 bg-[#E8302A] ml-0.5 animate-pulse align-text-bottom" />
                    </p>
                  </div>
                </div>
              )}

              {/* Typing indicator (before stream starts) */}
              {isStreaming && !streamingText && <TypingIndicator />}

              {/* Quick questions (first message only) */}
              {showQuickQuestions && (
                <div className="flex flex-wrap gap-2 ml-10">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-xs px-3 py-2 rounded-full border border-gray-700 text-gray-400 hover:border-[#E8302A] hover:text-white hover:bg-[#E8302A]/10 transition-all duration-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Suggestion chips after last assistant message */}
              {showChips && (
                <div className="flex flex-wrap gap-2 ml-10 animate-[fadeSlideIn_0.3s_ease-out]">
                  {lastAssistantMsg!.chips!.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => sendMessage(chip)}
                      className="text-xs px-3 py-2 rounded-full border border-gray-700 text-gray-400 hover:border-[#E8302A] hover:text-white hover:bg-[#E8302A]/10 transition-all duration-200"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-gray-800 bg-[#151515]">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Zeptej se Wokeeho..."
                  disabled={isStreaming}
                  className="flex-1 bg-[#0E0E0E] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#E8302A] focus:ring-1 focus:ring-[#E8302A]/30 disabled:opacity-50 transition"
                />
                <button
                  type="submit"
                  disabled={isStreaming || !input.trim()}
                  className="bg-[#E8302A] text-white w-12 rounded-xl hover:opacity-90 transition disabled:opacity-30 font-bold flex items-center justify-center"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </PaywallOverlay>
      </div>
    </main>
  )
}
