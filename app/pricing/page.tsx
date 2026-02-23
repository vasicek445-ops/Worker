"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../supabase'

const PLANS = {
  monthly: {
    name: 'Měsíční',
    price: '€9,90',
    period: '/ měsíc',
    popular: true,
    badge: null,
    features: [
      'Neomezený přístup k nabídkám',
      'AI matching na tvůj profil',
      'Přímé kontakty na firmy',
      'Průvodce procesem',
      'Sledování přihlášek',
      'Denní nové nabídky',
    ],
  },
  yearly: {
    name: 'Roční',
    price: '€99,90',
    period: '/ rok',
    popular: false,
    badge: 'Ušetříte 19 €',
    features: [
      'Vše z měsíčního plánu',
      'Prioritní podpora',
      'Prémiové nabídky jako první',
      'Šablony životopisů pro CH',
      'Prémiový AI matching',
      '2 měsíce zdarma',
    ],
  },
}

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  const handleCheckout = async (planKey: string) => {
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
    <main className="min-h-screen bg-[#0E0E0E] px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <p className="text-gray-400 text-center mb-10 text-lg">
          Začni zdarma, plať jen když ti to dává smysl.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(PLANS).map(([key, plan]) => (
            <div
              key={key}
              className={`bg-[#1A1A1A] border rounded-2xl p-6 flex flex-col ${
                plan.popular ? 'border-[#E8302A]' : 'border-gray-800'
              }`}
            >
              {plan.popular && (
                <span className="bg-[#E8302A] text-white text-xs font-bold px-3 py-1 rounded-full self-start mb-3">
                  Populární
                </span>
              )}

              {plan.badge && (
                <span className="bg-[#E8302A] text-white text-xs font-bold px-3 py-1 rounded-full self-start mb-3">
                  {plan.badge}
                </span>
              )}

              <h2 className="text-white text-xl font-bold">{plan.name}</h2>
              <p className="mt-2">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-sm text-gray-400 ml-1">{plan.period}</span>
              </p>

              <ul className="mt-6 flex flex-col gap-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-gray-300 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(key)}
                disabled={loading === key}
                className={`mt-6 w-full py-3 rounded-xl font-bold transition text-lg ${
                  plan.popular
                    ? 'bg-[#E8302A] text-white hover:opacity-90'
                    : 'bg-white text-black hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {loading === key ? 'Načítání...' : 'Začít 7 dní zdarma'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
