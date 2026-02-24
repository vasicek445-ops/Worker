'use client'

import { useState, useRef, useEffect } from 'react'
import { useSubscription } from '../../hooks/useSubscription'
import PaywallOverlay from '../components/PaywallOverlay'
import Link from 'next/link'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_QUESTIONS = [
  '📋 Jak získat pracovní povolení?',
  '💰 Kolik vydělám ve Švýcarsku?',
  '📝 Pomoz mi napsat CV',
  '🏠 Jak najít bydlení?',
  '🏥 Zdravotní pojištění',
  '💼 Napsat motivační dopis',
]

export default function Asistent() {
  const { isActive, loading: subLoading } = useSubscription()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Ahoj! 👋 Jsem tvůj AI asistent pro práci ve Švýcarsku. Můžu ti pomoct s čímkoliv – od hledání práce, přes dokumenty, až po napsání CV nebo motivačního dopisu. Na co se chceš zeptat?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const cleanText = text.replace(/^[^\w\sáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]+\s*/, '')
    const userMessage: Message = { role: 'user', content: cleanText }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.filter((m) => m.role !== 'assistant' || newMessages.indexOf(m) !== 0).length > 0
            ? newMessages.slice(1) // skip initial greeting
            : [userMessage],
        }),
      })

      const data = await res.json()

      if (data.error) {
        setMessages([...newMessages, { role: 'assistant', content: '❌ Omlouvám se, něco se pokazilo. Zkus to prosím znovu.' }])
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.response }])
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: '❌ Chyba připojení. Zkontroluj internet a zkus znovu.' }])
    }

    setIsLoading(false)
    inputRef.current?.focus()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
          ← Zpět
        </Link>

        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🤖</div>
          <h1 className="text-white text-2xl font-bold mb-1">AI Asistent</h1>
          <p className="text-gray-400 text-sm">
            Tvůj osobní poradce pro práci ve Švýcarsku – 24/7
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
          title="Odemkni AI asistenta"
          description="Dostupný 24/7 – pomůže s CV, motivačním dopisem, otázkami o práci ve Švýcarsku"
        >
          {/* Chat interface */}
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl overflow-hidden flex flex-col" style={{ height: '500px' }}>
            {/* Chat header */}
            <div className="bg-[#151515] px-4 py-3 border-b border-gray-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E8302A] flex items-center justify-center text-white text-sm font-bold">
                W
              </div>
              <div>
                <p className="text-white text-sm font-bold">Woker AI</p>
                <p className={`text-xs ${isLoading ? 'text-yellow-400' : 'text-green-400'}`}>
                  {isLoading ? '● Píše...' : '● Online'}
                </p>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-[#E8302A] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                      W
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-[#E8302A] text-white rounded-tr-md'
                        : 'bg-[#252525] text-gray-200 rounded-tl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#E8302A] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                    W
                  </div>
                  <div className="bg-[#252525] rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Quick questions - show only at start */}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 ml-10">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-xs px-3 py-2 rounded-full border border-gray-700 text-gray-400 hover:border-[#E8302A] hover:text-white transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-gray-800">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Napiš svou otázku..."
                  disabled={isLoading}
                  className="flex-1 bg-[#0E0E0E] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#E8302A] disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-[#E8302A] text-white px-4 rounded-xl hover:opacity-90 transition disabled:opacity-50 font-bold"
                >
                  →
                </button>
              </div>
            </form>
          </div>
        </PaywallOverlay>
      </div>
    </main>
  )
}
