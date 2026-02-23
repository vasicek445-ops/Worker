'use client'

import { useState } from 'react'
import { useSubscription } from '../../hooks/useSubscription'
import PaywallOverlay from '../components/PaywallOverlay'
import Link from 'next/link'

const SAMPLE_QUESTIONS = [
  'Jak získat pracovní povolení B?',
  'Kolik vydělá kuchař v Zürichu?',
  'Pomoz mi napsat motivační dopis',
  'Jaké dokumenty potřebuji?',
  'Jak najít bydlení v Bernu?',
  'Vysvětli mi švýcarský daňový systém',
]

export default function Asistent() {
  const { isActive, loading } = useSubscription()
  const [selectedQ, setSelectedQ] = useState<string | null>(null)

  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
          ← Zpět
        </Link>

        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🤖</div>
          <h1 className="text-white text-2xl font-bold mb-2">AI Asistent</h1>
          <p className="text-gray-400 text-sm">
            Tvůj osobní poradce pro práci ve Švýcarsku – dostupný 24/7
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {[
            { icon: '📝', title: 'Napíše ti CV', desc: 'Přizpůsobené švýcarskému trhu' },
            { icon: '💬', title: 'Odpoví na vše', desc: 'Povolení, smlouvy, daně' },
            { icon: '🇩🇪', title: 'Pomůže s NJ', desc: 'Přeloží a vysvětlí dokumenty' },
          ].map((f) => (
            <div key={f.title} className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="text-white text-sm font-bold">{f.title}</h3>
              <p className="text-gray-500 text-xs mt-1">{f.desc}</p>
            </div>
          ))}
        </div>

        <PaywallOverlay
          isLocked={!isActive && !loading}
          title="Odemkni AI asistenta"
          description="Dostupný 24/7 – pomůže s CV, motivačním dopisem, otázkami o práci ve Švýcarsku"
        >
          {/* Chat interface */}
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl overflow-hidden">
            {/* Chat header */}
            <div className="bg-[#151515] px-4 py-3 border-b border-gray-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E8302A] flex items-center justify-center text-white text-sm font-bold">
                W
              </div>
              <div>
                <p className="text-white text-sm font-bold">Woker AI</p>
                <p className="text-green-400 text-xs">● Online</p>
              </div>
            </div>

            {/* Messages area */}
            <div className="p-4 space-y-4 min-h-[300px]">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#E8302A] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                  W
                </div>
                <div className="bg-[#252525] rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%]">
                  <p className="text-gray-200 text-sm">
                    Ahoj! 👋 Jsem tvůj AI asistent pro práci ve Švýcarsku. Můžu ti pomoct s čímkoliv – od hledání práce, přes dokumenty, až po napsání CV. Na co se chceš zeptat?
                  </p>
                </div>
              </div>

              {/* Quick questions */}
              <div className="flex flex-wrap gap-2 ml-10">
                {SAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => setSelectedQ(q)}
                    className={`text-xs px-3 py-2 rounded-full border transition ${
                      selectedQ === q
                        ? 'bg-[#E8302A] border-[#E8302A] text-white'
                        : 'border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div className="px-4 py-3 border-t border-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Napiš svou otázku..."
                  className="flex-1 bg-[#0E0E0E] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#E8302A]"
                />
                <button className="bg-[#E8302A] text-white px-4 rounded-xl hover:opacity-90 transition">
                  →
                </button>
              </div>
            </div>
          </div>
        </PaywallOverlay>
      </div>
    </main>
  )
}
