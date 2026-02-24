#!/bin/bash
# Upgrade AI Assistant to "Wokee" with modern mascot + professional chat
set -e
echo "🤖 Upgrading to Wokee..."

# 1. Create Wokee mascot SVG
cat > public/wokee-avatar.svg << 'SVGEND'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#E8302A"/>
      <stop offset="100%" style="stop-color:#C42420"/>
    </linearGradient>
    <linearGradient id="headGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#2A2A2A"/>
      <stop offset="100%" style="stop-color:#1A1A1A"/>
    </linearGradient>
    <linearGradient id="visorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#00D4FF"/>
      <stop offset="50%" style="stop-color:#A78BFA"/>
      <stop offset="100%" style="stop-color:#FF3D71"/>
    </linearGradient>
    <linearGradient id="faceplate" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#F5F5F5"/>
      <stop offset="100%" style="stop-color:#E8E8E8"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="softShadow">
      <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000" flood-opacity="0.25"/>
    </filter>
    <clipPath id="circleClip">
      <circle cx="100" cy="100" r="100"/>
    </clipPath>
  </defs>
  <circle cx="100" cy="100" r="100" fill="url(#bg)"/>
  <g opacity="0.06" clip-path="url(#circleClip)">
    <line x1="-10" y1="30" x2="190" y2="30" stroke="white" stroke-width="0.8"/>
    <line x1="-10" y1="60" x2="190" y2="60" stroke="white" stroke-width="0.8"/>
    <line x1="-10" y1="90" x2="190" y2="90" stroke="white" stroke-width="0.8"/>
    <line x1="-10" y1="120" x2="190" y2="120" stroke="white" stroke-width="0.8"/>
    <line x1="-10" y1="150" x2="190" y2="150" stroke="white" stroke-width="0.8"/>
    <line x1="-10" y1="180" x2="190" y2="180" stroke="white" stroke-width="0.8"/>
  </g>
  <rect x="36" y="38" width="128" height="128" rx="40" fill="url(#headGrad)" filter="url(#softShadow)"/>
  <rect x="50" y="68" width="100" height="70" rx="24" fill="url(#faceplate)"/>
  <rect x="54" y="82" width="92" height="28" rx="14" fill="#111"/>
  <rect x="58" y="86" width="84" height="20" rx="10" fill="url(#visorGrad)" filter="url(#glow)" opacity="0.85"/>
  <circle cx="80" cy="96" r="6" fill="white" opacity="0.95"/>
  <circle cx="81" cy="95" r="2.5" fill="white"/>
  <circle cx="120" cy="96" r="6" fill="white" opacity="0.95"/>
  <circle cx="121" cy="95" r="2.5" fill="white"/>
  <path d="M 82 126 Q 100 136 118 126" stroke="#BBBBBB" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <rect x="70" y="46" width="60" height="3.5" rx="1.75" fill="#444"/>
  <rect x="96.5" y="52" width="7" height="14" rx="1.5" fill="#E8302A" opacity="0.5"/>
  <rect x="93" y="55.5" width="14" height="7" rx="1.5" fill="#E8302A" opacity="0.5"/>
  <rect x="97" y="26" width="6" height="16" rx="3" fill="#333"/>
  <circle cx="100" cy="24" r="4.5" fill="url(#visorGrad)" filter="url(#glow)"/>
  <rect x="30" y="88" width="8" height="16" rx="4" fill="#333"/>
  <rect x="162" y="88" width="8" height="16" rx="4" fill="#333"/>
  <circle cx="150" cy="140" r="4.5" fill="#00E676"/>
  <circle cx="150" cy="140" r="7" fill="#00E676" opacity="0.15"/>
</svg>
SVGEND

# 2. Update API route with Wokee branding + correct model
cat > app/api/chat/route.ts << 'ROUTEEND'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `Jsi Wokee – moderní AI průvodce pro Čechy a Slováky, kteří chtějí pracovat ve Švýcarsku.

TVOJE OSOBNOST:
- Jsi přátelský a přímý – mluvíš jako zkušený kamarád
- Jsi konkrétní – vždy uvádíš čísla, ceny, lhůty
- Jsi motivující – pomáháš lidem udělat ten krok

TVOJE ZNALOSTI:
- Pracovní povolení (B, L, G, C permit) a jak je získat
- Švýcarský pracovní trh – platy, obory, kantony
- Dokumenty potřebné pro práci (výpis z RT, potvrzení o zaměstnání, Aufenthaltsbewilligung)
- Zdravotní pojištění (Grundversicherung, KVG)
- Daňový systém (Quellensteuer pro cizince)
- Bydlení (Homegate, Comparis, Immoscout24, kauce = 3 nájmy)
- Pracovní právo (výpovědní lhůty, dovolená min. 4 týdny, 13. plat)
- Životní náklady podle kantonů
- Němčina pro práci – základní fráze a tipy

PRAVIDLA FORMÁTOVÁNÍ:
- Odpovídej VŽDY česky
- ABSOLUTNĚ NIKDY nepoužívej markdown: žádné **, ##, #, ani pomlčkové odrážky
- Místo **tučného** napiš text normálně nebo VELKÝMI PÍSMENY pro důraz
- Místo odrážek s - použij emoji (📌, ✅, 💰) nebo prostě nový řádek
- Toto je KRITICKÉ – markdown znaky se zobrazují jako raw text a vypadá to ošklivě
- Piš přirozeným textem, strukturuj pomocí emoji (📌 💰 📋 ✅ 🏠 📍)
- Když píšeš CV nebo motivační dopis, ptej se na detaily
- Drž odpovědi stručné ale kompletní (max 250 slov)
- Pokud si nejsi jistý, řekni to – nelži

TYPICKÉ PLATY (CHF/měsíc):
📌 Stavebnictví: 5 200–6 800
📌 Gastronomie: 4 200–5 500
📌 IT: 8 000–12 000
📌 Zdravotnictví: 6 500–9 000
📌 Logistika: 5 000–6 500
📌 Úklid: 4 000–4 800
📌 Řemesla: 5 200–6 200`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 })
    }

    const recentMessages = messages.slice(-10)

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: recentMessages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const textBlock = response.content.find((block: any) => block.type === 'text')
    const text = textBlock ? (textBlock as any).text : 'Promiň, něco se mi zamotalo. Zkus to znovu! 🔄'

    return NextResponse.json({ 
      response: text,
      usage: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      }
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error.message || 'AI assistant error' },
      { status: 500 }
    )
  }
}
ROUTEEND

# 3. Update asistent page with Wokee branding + modern chat UI
cat > app/asistent/page.tsx << 'PAGEEND'
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

export default function Asistent() {
  const { isActive, loading: subLoading } = useSubscription()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Ahoj! 👋 Jsem Wokee, tvůj AI průvodce prací ve Švýcarsku. Pomůžu ti se vším – od hledání práce, přes dokumenty, až po napsání CV. Ptej se na cokoliv!',
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
            ? newMessages.slice(1)
            : [userMessage],
        }),
      })

      const data = await res.json()

      if (data.error) {
        setMessages([...newMessages, { role: 'assistant', content: 'Jejda, něco se pokazilo 😅 Zkus to prosím znovu!' }])
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.response }])
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Problém s připojením 📡 Zkontroluj internet a zkus znovu.' }])
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
                <p className={`text-xs ${isLoading ? 'text-yellow-400' : 'text-green-400'}`}>
                  {isLoading ? '✏️ Píše...' : '● Online'}
                </p>
              </div>
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

              {isLoading && (
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
              )}

              {messages.length === 1 && (
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
                  disabled={isLoading}
                  className="flex-1 bg-[#0E0E0E] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#E8302A] focus:ring-1 focus:ring-[#E8302A]/30 disabled:opacity-50 transition"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
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
PAGEEND

echo "✅ Wokee upgrade complete!"
echo ""
echo "Run: git add -A && git commit -m 'feat: Wokee mascot + professional chat UI' && git push"
