"use client"

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../supabase'

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null)
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  const handleCheckout = async (planKey: string) => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    setLoading(planKey)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planKey,
          userId: user.id,
          email: user.email,
        }),
      })
      const data = await res.json()

      if (data.error) {
        alert(data.error)
        return
      }

      window.location.href = data.url
    } catch {
      alert('Něco se pokazilo')
    } finally {
      setLoading(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-8 pb-24">
      <div className="max-w-lg mx-auto">
        <Link href="/dashboard" className="text-gray-500 hover:text-white mb-8 inline-block text-sm">
          ← Zpět
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-white text-3xl font-bold mb-3">
            Najdi práci ve Švýcarsku
          </h1>
          <p className="text-gray-400">
            Bez agentury. Bez provize. Přímo ty a zaměstnavatel.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              billing === 'monthly'
                ? 'bg-[#E8302A] text-white'
                : 'bg-[#1A1A1A] text-gray-400'
            }`}
          >
            Měsíčně
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              billing === 'yearly'
                ? 'bg-[#E8302A] text-white'
                : 'bg-[#1A1A1A] text-gray-400'
            }`}
          >
            Ročně
            <span className="ml-1 text-xs opacity-75">-17%</span>
          </button>
        </div>

        {/* Plan card */}
        <div className="bg-[#1A1A1A] border-2 border-[#E8302A] rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-bold">Woker Premium</h2>
            <span className="bg-[#E8302A] text-white text-xs font-bold px-3 py-1 rounded-full">
              Nejoblíbenější
            </span>
          </div>

          <div className="mb-6">
            {billing === 'monthly' ? (
              <div className="flex items-baseline gap-1">
                <span className="text-white text-4xl font-bold">9,90</span>
                <span className="text-gray-400">€ / měsíc</span>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-white text-4xl font-bold">99,90</span>
                  <span className="text-gray-400">€ / rok</span>
                </div>
                <p className="text-green-400 text-sm mt-1">Ušetříš 18,90 € ročně</p>
              </div>
            )}
          </div>

          <div className="space-y-3 mb-6">
            {[
              { icon: '📇', text: '200+ přímých kontaktů na švýcarské firmy', highlight: true },
              { icon: '🔄', text: 'Denně aktualizované pracovní nabídky', highlight: true },
              { icon: '🤖', text: 'AI asistent 24/7 – CV, dopisy, otázky', highlight: true },
              { icon: '📚', text: 'Kompletní průvodce (povolení, pojištění, daně)', highlight: false },
              { icon: '📝', text: 'Šablony CV a motivačních dopisů', highlight: false },
              { icon: '🔔', text: 'Upozornění na nové nabídky', highlight: false },
              { icon: '💬', text: 'Prioritní podpora', highlight: false },
            ].map((feature) => (
              <div key={feature.text} className="flex items-start gap-3">
                <span className="text-lg">{feature.icon}</span>
                <span className={`text-sm ${feature.highlight ? 'text-white font-medium' : 'text-gray-400'}`}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => handleCheckout(billing)}
            disabled={loading !== null}
            className="w-full bg-[#E8302A] text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? 'Načítání...' : billing === 'monthly' ? 'Začít za 9,90 €/měsíc' : 'Začít za 99,90 €/rok'}
          </button>

          <p className="text-gray-600 text-xs text-center mt-3">
            Zrušíš kdykoliv • Bezpečná platba přes Stripe
          </p>
        </div>

        {/* Free vs Premium comparison */}
        <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 text-center">Co dostaneš navíc?</h3>

          <div className="space-y-3">
            {[
              { feature: 'Pracovní nabídky', free: 'Název + firma', premium: 'Plný detail + kontakt' },
              { feature: 'Kontakty na firmy', free: '❌', premium: '✅ Email + telefon' },
              { feature: 'Průvodce procesem', free: '2 články', premium: 'Kompletní (8+ článků)' },
              { feature: 'AI asistent', free: '❌', premium: '✅ 24/7' },
              { feature: 'Šablony CV', free: '❌', premium: '✅ V ČJ i NJ' },
              { feature: 'Upozornění', free: '❌', premium: '✅ Denně' },
            ].map((row) => (
              <div key={row.feature} className="grid grid-cols-3 gap-2 text-xs">
                <span className="text-gray-400">{row.feature}</span>
                <span className="text-gray-600 text-center">{row.free}</span>
                <span className="text-green-400 text-center font-medium">{row.premium}</span>
              </div>
            ))}

            <div className="grid grid-cols-3 gap-2 text-xs border-t border-gray-800 pt-2 mt-2">
              <span className="text-gray-600" />
              <span className="text-gray-600 text-center">Zdarma</span>
              <span className="text-[#E8302A] text-center font-bold">Premium</span>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs">
            Už 50+ lidí hledá práci ve Švýcarsku přes Woker
          </p>
        </div>
      </div>
    </main>
  )
}
