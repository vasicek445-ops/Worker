'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────

type Message = {
  role: 'user' | 'assistant'
  content: string
  chips?: string[]
}

// ─── Chat Widget ─────────────────────────────────────────

function parseChips(text: string): { cleanText: string; chips: string[] } {
  const match = text.match(/\[CHIPS:\s*(.+?)\]\s*$/)
  if (!match) return { cleanText: text, chips: [] }
  const cleanText = text.replace(/\[CHIPS:\s*.+?\]\s*$/, '').trimEnd()
  const chips = match[1].split('|').map((c) => c.trim()).filter(Boolean)
  return { cleanText, chips }
}

function AgencyChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Guten Tag! 👋 Ich bin der Woker-Assistent für Personalagenturen. Ich helfe Ihnen, tschechische und slowakische Kandidaten für Ihre offenen Stellen zu finden. Wie kann ich Ihnen helfen?',
      chips: ['Welche Berufe sind verfügbar?', 'Wie funktioniert Woker?', 'Kandidaten für Bau suchen'],
    },
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [messageCount, setMessageCount] = useState(0)
  const [leadCaptured, setLeadCaptured] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return

    const userMessage: Message = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsStreaming(true)
    setStreamingText('')
    const newCount = messageCount + 1
    setMessageCount(newCount)

    // Check for lead info in message
    let leadInfo: { email?: string; agencyName?: string } | undefined
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/)
    if (emailMatch && !leadCaptured) {
      leadInfo = { email: emailMatch[0] }
      // Try to extract company name from previous messages
      const prevTexts = newMessages.filter(m => m.role === 'user').map(m => m.content).join(' ')
      const companyPatterns = prevTexts.match(/(?:firma|company|agentur|agentury?)\s*[:=]?\s*([A-Z][\w\s&.-]+)/i)
      if (companyPatterns) leadInfo.agencyName = companyPatterns[1].trim()
      setLeadCaptured(true)
    }

    try {
      const apiMessages = newMessages
        .filter((_, i) => i !== 0)
        .map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/agency-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages.length > 0 ? apiMessages : [{ role: 'user', content: text }],
          stream: true,
          ...(leadInfo ? { leadInfo } : {}),
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Fehler' }))
        throw new Error(errData.error || 'Fehler')
      }

      const contentType = res.headers.get('content-type') || ''

      if (contentType.includes('text/event-stream')) {
        const reader = res.body?.getReader()
        if (!reader) throw new Error('No body')

        const decoder = new TextDecoder()
        let fullText = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          for (const line of chunk.split('\n')) {
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

        const { cleanText, chips } = parseChips(fullText)
        setMessages([...newMessages, { role: 'assistant', content: cleanText, chips }])
      } else {
        const data = await res.json()
        const { cleanText, chips } = parseChips(data.response || '')
        setMessages([...newMessages, { role: 'assistant', content: cleanText, chips }])
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Entschuldigung, ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' },
      ])
    } finally {
      setIsStreaming(false)
      setStreamingText('')
      inputRef.current?.focus()
    }
  }, [messages, isStreaming, messageCount, leadCaptured])

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant')
  const showChips = !isStreaming && lastAssistant?.chips && lastAssistant.chips.length > 0

  // Floating button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-[#E8302A] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50"
        aria-label="Chat öffnen"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0a12] animate-pulse" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-[380px] h-[520px] bg-[#1A1A1A] border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-[fadeSlideIn_0.2s_ease-out]">
      {/* Header */}
      <div className="bg-[#E8302A] px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">W</div>
        <div className="flex-1">
          <p className="text-white text-sm font-bold">Woker Recruiting</p>
          <p className="text-white/70 text-xs">Online — antwortet sofort</p>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 bg-[#E8302A] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">W</div>
            )}
            <div className={`rounded-xl px-3 py-2 max-w-[75%] ${
              msg.role === 'user'
                ? 'bg-[#E8302A] text-white rounded-tr-sm'
                : 'bg-[#252525] text-gray-200 rounded-tl-sm'
            }`}>
              <p className="text-[13px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {isStreaming && streamingText && (
          <div className="flex gap-2">
            <div className="w-7 h-7 bg-[#E8302A] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">W</div>
            <div className="bg-[#252525] rounded-xl rounded-tl-sm px-3 py-2 max-w-[75%]">
              <p className="text-[13px] whitespace-pre-wrap leading-relaxed text-gray-200">
                {streamingText}
                <span className="inline-block w-0.5 h-3.5 bg-[#E8302A] ml-0.5 animate-pulse align-text-bottom" />
              </p>
            </div>
          </div>
        )}

        {isStreaming && !streamingText && (
          <div className="flex gap-2">
            <div className="w-7 h-7 bg-[#E8302A] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">W</div>
            <div className="bg-[#252525] rounded-xl rounded-tl-sm px-3 py-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-[#E8302A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-[#E8302A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-[#E8302A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {showChips && (
          <div className="flex flex-wrap gap-1.5 ml-9">
            {lastAssistant!.chips!.map((chip) => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                className="text-[11px] px-2.5 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:border-[#E8302A] hover:text-white hover:bg-[#E8302A]/10 transition-all"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
        className="px-3 py-2.5 border-t border-gray-800 bg-[#151515]"
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nachricht schreiben..."
            disabled={isStreaming}
            className="flex-1 bg-[#0E0E0E] border border-gray-800 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#E8302A] disabled:opacity-50 transition"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="bg-[#E8302A] text-white w-10 rounded-lg hover:opacity-90 transition disabled:opacity-30 flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-gray-600 text-center mt-1.5">Powered by Woker AI</p>
      </form>
    </div>
  )
}

// ─── Stats Counter ───────────────────────────────────────

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-extrabold text-white mb-1">{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────

export default function ProPage() {
  return (
    <main className="min-h-screen bg-[#0a0a12]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-white font-extrabold text-xl tracking-tight">
          Woker<span className="text-[#E8302A]">.</span>pro
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/kontakty" className="text-gray-400 hover:text-white text-sm transition">Agenturen-DB</Link>
          <Link href="/pricing" className="text-gray-400 hover:text-white text-sm transition">Preise</Link>
          <a href="#demo" className="bg-[#E8302A] text-white text-sm font-bold px-5 py-2 rounded-lg hover:opacity-90 transition">
            Demo starten
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-16 pb-20 text-center max-w-4xl mx-auto">
        <div className="inline-block bg-[#E8302A]/10 text-[#E8302A] text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wide">
          FUR PERSONALAGENTUREN IN DER SCHWEIZ
        </div>
        <h1 className="text-white text-4xl md:text-5xl font-extrabold leading-tight mb-6 tracking-tight">
          Finden Sie tschechische<br />
          Kandidaten <span className="text-[#E8302A]">in Minuten</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Woker verbindet Schweizer Personalagenturen mit qualifizierten Fachkraften aus Tschechien und der Slowakei.
          10&apos;000+ Kandidaten, AI-Matching, sofort einsatzbereit.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a href="#demo" className="bg-[#E8302A] text-white font-bold px-8 py-3.5 rounded-xl hover:opacity-90 transition text-lg">
            Kostenlos testen
          </a>
          <a href="#features" className="border border-gray-700 text-gray-300 font-medium px-8 py-3.5 rounded-xl hover:border-gray-500 hover:text-white transition text-lg">
            Mehr erfahren
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-12 border-y border-gray-800/50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard value="10'000+" label="Kandidaten" />
          <StatCard value="1'007" label="Agenturen" />
          <StatCard value="26" label="Kantone" />
          <StatCard value="2-3 Wo." label="Vermittlungszeit" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-white text-3xl font-extrabold text-center mb-4 tracking-tight">
          Warum Agenturen Woker nutzen
        </h2>
        <p className="text-gray-500 text-center mb-14 max-w-2xl mx-auto">
          Schneller besetzen, weniger Aufwand, bessere Kandidaten.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '🤖',
              title: 'AI Kandidaten-Matching',
              desc: 'Unser AI analysiert Ihre Anforderungen und findet passende Kandidaten in Sekunden. Beruf, Sprachkenntnisse, Verfugbarkeit — alles automatisch.',
            },
            {
              icon: '📊',
              title: 'Kandidaten-Datenbank',
              desc: '10\'000+ verifizierte Fachkrafte aus CZ/SK. Bau, Gastro, Logistik, Pflege, Reinigung, Industrie. EU-Burger mit Freizugigkeit.',
            },
            {
              icon: '📧',
              title: 'Direkte Vermittlung',
              desc: 'Kontaktieren Sie Kandidaten direkt. Kein Mittelsmann, keine versteckten Gebuhren. Sie zahlen nur fur erfolgreiche Vermittlungen.',
            },
            {
              icon: '🌐',
              title: 'Mehrsprachig',
              desc: 'Plattform auf Deutsch, Tschechisch und Slowakisch. Kandidaten verstehen Ihre Anforderungen, Sie verstehen ihre Profile.',
            },
            {
              icon: '⚡',
              title: 'Sofort einsatzbereit',
              desc: 'Kein Setup, kein Onboarding. Starten Sie den Chatbot, beschreiben Sie Ihren Bedarf, erhalten Sie Kandidatenvorschlage sofort.',
            },
            {
              icon: '🔒',
              title: 'DSGVO-konform',
              desc: 'Alle Daten in der Schweiz gehostet. nDSG-konform. Kandidaten haben der Datenweitergabe zugestimmt.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-[#111120] border border-gray-800/50 rounded-2xl p-6 hover:border-gray-700 transition">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 bg-[#0d0d18]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-white text-3xl font-extrabold text-center mb-14 tracking-tight">
            So funktioniert&apos;s
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Bedarf beschreiben', desc: 'Sagen Sie unserem AI-Chatbot, welche Positionen Sie besetzen mochten. Beruf, Kanton, Sprachkenntnisse.' },
              { step: '2', title: 'Kandidaten erhalten', desc: 'AI durchsucht unsere Datenbank und prasentiert passende Profile. Mit Qualifikationen, Verfugbarkeit und Kontaktdaten.' },
              { step: '3', title: 'Direkt kontaktieren', desc: 'Wahlen Sie die besten Kandidaten aus und kontaktieren Sie sie direkt. Vermittlung in 2-3 Wochen.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 bg-[#E8302A] rounded-2xl flex items-center justify-center text-white text-xl font-extrabold mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-white text-3xl font-extrabold text-center mb-14 tracking-tight">
          Branchen mit sofort verfugbaren Kandidaten
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🏗️', name: 'Bau', count: '3\'200+' },
            { icon: '🍽️', name: 'Gastro', count: '2\'100+' },
            { icon: '📦', name: 'Logistik', count: '1\'800+' },
            { icon: '🏥', name: 'Pflege', count: '900+' },
            { icon: '🧹', name: 'Reinigung', count: '700+' },
            { icon: '⚙️', name: 'Industrie', count: '1\'100+' },
            { icon: '🚛', name: 'Transport', count: '500+' },
            { icon: '💻', name: 'IT/Tech', count: '300+' },
          ].map((s) => (
            <div key={s.name} className="bg-[#111120] border border-gray-800/50 rounded-xl p-4 text-center hover:border-[#E8302A]/30 transition">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-white font-bold text-sm">{s.name}</div>
              <div className="text-[#E8302A] text-xs font-bold mt-1">{s.count} Kandidaten</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA + Demo anchor */}
      <section id="demo" className="px-6 py-20 bg-[#0d0d18]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-white text-3xl font-extrabold mb-4 tracking-tight">
            Jetzt kostenlos testen
          </h2>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            Klicken Sie auf den Chat-Button unten rechts und beschreiben Sie, welche Kandidaten Sie suchen.
            Unser AI-Assistent hilft Ihnen sofort — ohne Registrierung.
          </p>
          <div className="inline-flex items-center gap-3 bg-[#E8302A]/10 border border-[#E8302A]/30 rounded-xl px-6 py-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white font-medium">Chat-Assistent ist online</span>
            <span className="text-gray-500">—</span>
            <span className="text-gray-400 text-sm">unten rechts klicken</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-800/50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-600 text-sm">
            Woker.pro — Recruiting-Plattform fur Schweizer Agenturen
          </div>
          <div className="flex items-center gap-6 text-gray-600 text-sm">
            <Link href="/podminky" className="hover:text-gray-400 transition">AGB</Link>
            <Link href="/ochrana-udaju" className="hover:text-gray-400 transition">Datenschutz</Link>
            <Link href="/" className="hover:text-gray-400 transition">Woker.com</Link>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <AgencyChatWidget />
    </main>
  )
}
