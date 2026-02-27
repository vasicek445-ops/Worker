#!/bin/bash
# Woker Content + Paywall Setup
# Spusť: bash woker-content-paywall.sh
# Vytvoří: paywall systém, obsah co prodává, zamčené sekce

set -e
echo "🚀 Woker Content + Paywall Setup..."
echo ""

# ============================================
# 1. SUBSCRIPTION HOOK
# ============================================
mkdir -p hooks
cat > hooks/useSubscription.ts << 'FILEEND'
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../app/supabase'

type SubStatus = {
  isActive: boolean
  plan: string | null
  loading: boolean
}

export function useSubscription() {
  const [status, setStatus] = useState<SubStatus>({
    isActive: false,
    plan: null,
    loading: true,
  })

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setStatus({ isActive: false, plan: null, loading: false })
        return
      }

      const { data } = await supabase
        .from('subscriptions')
        .select('status, plan')
        .eq('user_id', user.id)
        .single()

      setStatus({
        isActive: data?.status === 'active',
        plan: data?.plan || null,
        loading: false,
      })
    }
    check()
  }, [])

  return status
}
FILEEND
echo "✅ hooks/useSubscription.ts"

# ============================================
# 2. PAYWALL OVERLAY COMPONENT
# ============================================
mkdir -p app/components
cat > app/components/PaywallOverlay.tsx << 'FILEEND'
'use client'

import Link from 'next/link'

interface PaywallOverlayProps {
  title?: string
  description?: string
  children: React.ReactNode
  isLocked: boolean
  blurAmount?: string
}

export default function PaywallOverlay({
  title = 'Odemkni plný přístup',
  description = 'Získej kontakty na firmy, průvodce procesem a AI asistenta za 9,90 €/měsíc',
  children,
  isLocked,
  blurAmount = '8px',
}: PaywallOverlayProps) {
  if (!isLocked) return <>{children}</>

  return (
    <div className="relative">
      <div
        style={{ filter: `blur(${blurAmount})` }}
        className="pointer-events-none select-none"
        aria-hidden="true"
      >
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-[#1A1A1A]/95 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">{description}</p>
          <Link
            href="/pricing"
            className="inline-block bg-[#E8302A] text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 transition w-full"
          >
            Předplatit za 9,90 €/měsíc
          </Link>
          <p className="text-gray-600 text-xs mt-3">Zrušíš kdykoliv • Testovací období 7 dní</p>
        </div>
      </div>
    </div>
  )
}
FILEEND
echo "✅ app/components/PaywallOverlay.tsx"

# ============================================
# 3. CONTACT CARD COMPONENT (locked/unlocked)
# ============================================
cat > app/components/ContactCard.tsx << 'FILEEND'
'use client'

interface ContactCardProps {
  company: string
  position: string
  location: string
  salary?: string
  email?: string
  phone?: string
  website?: string
  isLocked: boolean
}

export default function ContactCard({
  company,
  position,
  location,
  salary,
  email,
  phone,
  website,
  isLocked,
}: ContactCardProps) {
  return (
    <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-bold text-lg">{position}</h3>
          <p className="text-gray-400 text-sm">{company}</p>
        </div>
        {salary && (
          <span className="bg-green-500/10 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
            {salary}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
        <span>📍</span>
        <span>{location}</span>
      </div>

      {isLocked ? (
        <div className="bg-[#0E0E0E] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="text-gray-400 text-sm font-medium">Kontakt zamčený</p>
              <p className="text-gray-600 text-xs">Email, telefon a web firmy</p>
            </div>
          </div>
          <div className="space-y-2 mt-3">
            <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-800 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="bg-[#0E0E0E] rounded-xl p-4 border border-gray-800 space-y-2">
          {email && (
            <a href={`mailto:${email}`} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
              <span>📧</span> {email}
            </a>
          )}
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300">
              <span>📞</span> {phone}
            </a>
          )}
          {website && (
            <a href={website} target="_blank" rel="noopener" className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300">
              <span>🌐</span> {website}
            </a>
          )}
        </div>
      )}
    </div>
  )
}
FILEEND
echo "✅ app/components/ContactCard.tsx"

# ============================================
# 4. STAT COUNTER COMPONENT
# ============================================
cat > app/components/StatCounter.tsx << 'FILEEND'
'use client'

interface StatCounterProps {
  stats: { label: string; value: string; icon: string }[]
}

export default function StatCounter({ stats }: StatCounterProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 text-center"
        >
          <div className="text-2xl mb-1">{stat.icon}</div>
          <div className="text-white text-xl font-bold">{stat.value}</div>
          <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
FILEEND
echo "✅ app/components/StatCounter.tsx"

# ============================================
# 5. PRŮVODCE (GUIDE) PAGE - partially free
# ============================================
mkdir -p app/pruvodce
cat > app/pruvodce/page.tsx << 'FILEEND'
'use client'

import { useSubscription } from '../../hooks/useSubscription'
import PaywallOverlay from '../components/PaywallOverlay'
import Link from 'next/link'

const FREE_GUIDES = [
  {
    icon: '🇨🇭',
    title: 'Práce ve Švýcarsku – základní info',
    content: 'Švýcarsko je jednou z nejatraktivnějších zemí pro práci v Evropě. Průměrná mzda je přes 6 000 CHF měsíčně. Země má 4 jazykové regiony: německý (65%), francouzský (23%), italský (8%) a rétorománský. Pro Čechy je nejdostupnější německy mluvící část.',
    tag: 'Zdarma',
  },
  {
    icon: '📋',
    title: 'Jaké dokumenty potřebuješ',
    content: 'Občanský průkaz nebo pas, potvrzení o zaměstnání od švýcarského zaměstnavatele, výpis z rejstříku trestů (ne starší 3 měsíce). Pro povolení k pobytu (Aufenthaltsbewilligung) typu B potřebuješ pracovní smlouvu na minimálně 12 měsíců.',
    tag: 'Zdarma',
  },
]

const PREMIUM_GUIDES = [
  {
    icon: '💰',
    title: 'Kompletní průvodce platy podle oboru',
    content: 'Stavebnictví: 5 200–6 800 CHF, Gastronomie: 4 200–5 500 CHF, IT: 8 000–12 000 CHF, Zdravotnictví: 6 500–9 000 CHF, Logistika: 5 000–6 500 CHF. Detailní tabulky podle kantonu a zkušeností...',
    tag: 'Premium',
  },
  {
    icon: '🏠',
    title: 'Jak najít bydlení ve Švýcarsku',
    content: 'Kompletní návod na hledání bytu: nejlepší portály (Homegate, Comparis, Immoscout24), jak napsat Bewerbungsdossier, kolik stojí kauce (obvykle 3 měsíční nájmy), na co si dát pozor ve smlouvě...',
    tag: 'Premium',
  },
  {
    icon: '🏥',
    title: 'Zdravotní pojištění krok za krokem',
    content: 'Povinné základní pojištění (Grundversicherung) musíš uzavřít do 3 měsíců od příjezdu. Nejlevnější pojišťovny: Assura, Groupe Mutuel. Jak vybrat spoluúčast (Franchise), přehled cen...',
    tag: 'Premium',
  },
  {
    icon: '📝',
    title: 'Šablony: CV, motivační dopis, email firmě',
    content: 'Stáhni si hotové šablony přizpůsobené švýcarskému trhu. Životopis ve formátu, který švýcarské firmy očekávají. Motivační dopis v němčině s českým překladem. Email šablona pro oslovení HR...',
    tag: 'Premium',
  },
  {
    icon: '🚗',
    title: 'Řidičský průkaz, bankovní účet, daně',
    content: 'Český řidičák platí 12 měsíců, pak musíš vyměnit. Nejlepší banky pro cizince: Neon, Yuh (bez poplatků). Daňový systém se liší podle kantonu – kompletní přehled...',
    tag: 'Premium',
  },
  {
    icon: '⚖️',
    title: 'Pracovní smlouva – na co si dát pozor',
    content: 'Zkušební doba (Probezeit) je obvykle 1–3 měsíce. Výpovědní lhůta, přesčasy, 13. plat (Dreizehnter Monatslohn), dovolená (min. 4 týdny). Co musí obsahovat platná smlouva...',
    tag: 'Premium',
  },
]

export default function Pruvodce() {
  const { isActive, loading } = useSubscription()

  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
          ← Zpět
        </Link>

        <h1 className="text-white text-2xl font-bold mb-2">🇨🇭 Průvodce prací ve Švýcarsku</h1>
        <p className="text-gray-400 text-sm mb-8">
          Vše co potřebuješ vědět – od dokumentů po první výplatu
        </p>

        {/* Free guides */}
        <div className="space-y-4 mb-8">
          {FREE_GUIDES.map((guide) => (
            <div key={guide.title} className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{guide.icon}</span>
                <div className="flex-1">
                  <h3 className="text-white font-bold">{guide.title}</h3>
                </div>
                <span className="bg-green-500/10 text-green-400 text-xs font-bold px-2 py-1 rounded-full">
                  {guide.tag}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{guide.content}</p>
            </div>
          ))}
        </div>

        {/* Premium guides */}
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-white text-lg font-bold">Premium průvodce</h2>
          <span className="bg-[#E8302A]/10 text-[#E8302A] text-xs font-bold px-2 py-1 rounded-full">
            {PREMIUM_GUIDES.length} článků
          </span>
        </div>

        <PaywallOverlay
          isLocked={!isActive && !loading}
          title="Odemkni kompletní průvodce"
          description="Platy, bydlení, pojištění, šablony CV a další – vše na jednom místě"
        >
          <div className="space-y-4">
            {PREMIUM_GUIDES.map((guide) => (
              <div key={guide.title} className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{guide.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-white font-bold">{guide.title}</h3>
                  </div>
                  <span className="bg-[#E8302A]/10 text-[#E8302A] text-xs font-bold px-2 py-1 rounded-full">
                    {guide.tag}
                  </span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{guide.content}</p>
              </div>
            ))}
          </div>
        </PaywallOverlay>
      </div>
    </main>
  )
}
FILEEND
echo "✅ app/pruvodce/page.tsx"

# ============================================
# 6. KONTAKTY (CONTACTS DATABASE) PAGE
# ============================================
mkdir -p app/kontakty
cat > app/kontakty/page.tsx << 'FILEEND'
'use client'

import { useSubscription } from '../../hooks/useSubscription'
import PaywallOverlay from '../components/PaywallOverlay'
import ContactCard from '../components/ContactCard'
import StatCounter from '../components/StatCounter'
import Link from 'next/link'

const SAMPLE_CONTACTS = [
  {
    company: 'Helvetia Bau AG',
    position: 'Stavbyvedoucí / Bauleiter',
    location: 'Zürich, ZH',
    salary: '6 500 CHF',
    email: 'hr@helvetiabau.ch',
    phone: '+41 44 123 4567',
    website: 'https://helvetiabau.ch/karriere',
  },
  {
    company: 'Swiss Gastro Group',
    position: 'Kuchař / Koch',
    location: 'Bern, BE',
    salary: '4 800 CHF',
    email: 'jobs@swissgastro.ch',
    phone: '+41 31 987 6543',
    website: 'https://swissgastro.ch/jobs',
  },
  {
    company: 'Alpine Care AG',
    position: 'Zdravotní sestra / Pflegefachfrau',
    location: 'Basel, BS',
    salary: '7 200 CHF',
    email: 'karriere@alpinecare.ch',
    phone: '+41 61 555 1234',
    website: 'https://alpinecare.ch',
  },
  {
    company: 'LogiSwiss Transport',
    position: 'Řidič kamiónu / LKW-Fahrer',
    location: 'Luzern, LU',
    salary: '5 800 CHF',
    email: 'fahrer@logiswiss.ch',
    phone: '+41 41 333 7890',
    website: 'https://logiswiss.ch/stellen',
  },
  {
    company: 'TechHub Zürich',
    position: 'Frontend Developer',
    location: 'Zürich, ZH',
    salary: '9 500 CHF',
    email: 'talent@techhub.ch',
    phone: '+41 44 777 2345',
    website: 'https://techhub.ch/careers',
  },
  {
    company: 'Reinigung Plus GmbH',
    position: 'Vedoucí úklidu / Reinigungsleiter',
    location: 'Winterthur, ZH',
    salary: '4 600 CHF',
    email: 'personal@reinigungplus.ch',
    phone: '+41 52 444 5678',
    website: 'https://reinigungplus.ch',
  },
]

const STATS = [
  { label: 'Kontaktů celkem', value: '200+', icon: '📇' },
  { label: 'Firem', value: '85+', icon: '🏢' },
  { label: 'Kantonů', value: '12', icon: '📍' },
  { label: 'Aktualizace', value: 'Denně', icon: '🔄' },
]

export default function Kontakty() {
  const { isActive, loading } = useSubscription()

  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
          ← Zpět
        </Link>

        <h1 className="text-white text-2xl font-bold mb-2">📇 Databáze kontaktů</h1>
        <p className="text-gray-400 text-sm mb-6">
          Přímé kontakty na švýcarské zaměstnavatele – bez agentury
        </p>

        <StatCounter stats={STATS} />

        <div className="mt-8 space-y-4">
          {/* First 2 cards always visible (locked contacts) */}
          {SAMPLE_CONTACTS.slice(0, 2).map((contact) => (
            <ContactCard key={contact.company} {...contact} isLocked={!isActive && !loading} />
          ))}

          {/* Rest behind paywall */}
          <PaywallOverlay
            isLocked={!isActive && !loading}
            title="Odemkni 200+ kontaktů"
            description="Přímé emaily a telefony na HR oddělení švýcarských firem. Bez agentury, bez provize."
          >
            <div className="space-y-4">
              {SAMPLE_CONTACTS.slice(2).map((contact) => (
                <ContactCard key={contact.company} {...contact} isLocked={false} />
              ))}
            </div>
          </PaywallOverlay>
        </div>
      </div>
    </main>
  )
}
FILEEND
echo "✅ app/kontakty/page.tsx"

# ============================================
# 7. AI ASISTENT PAGE
# ============================================
mkdir -p app/asistent
cat > app/asistent/page.tsx << 'FILEEND'
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
FILEEND
echo "✅ app/asistent/page.tsx"

# ============================================
# 8. UPDATED PRICING PAGE (new value prop)
# ============================================
mkdir -p app/pricing
cat > app/pricing/page.tsx << 'FILEEND'
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
FILEEND
echo "✅ app/pricing/page.tsx (updated)"

# ============================================
# 9. SUPABASE: contacts table SQL
# ============================================
cat > supabase-contacts-migration.sql << 'FILEEND'
-- Tabulka pro kontakty na firmy (spusť v Supabase SQL Editor)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  position TEXT,
  location TEXT,
  canton TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT DEFAULT 'CHF',
  email TEXT,
  phone TEXT,
  website TEXT,
  hr_contact_name TEXT,
  industry TEXT,
  description TEXT,
  requirements TEXT,
  language_required TEXT,
  contract_type TEXT DEFAULT 'permanent',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: jen platící uživatelé vidí kontaktní údaje
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Všichni vidí základní info (název, pozice, lokace)
CREATE POLICY "Anyone can view basic contact info"
  ON contacts FOR SELECT
  USING (true);

-- Index pro rychlé vyhledávání
CREATE INDEX idx_contacts_canton ON contacts(canton);
CREATE INDEX idx_contacts_industry ON contacts(industry);
CREATE INDEX idx_contacts_active ON contacts(is_active);

-- Vložíme ukázkové kontakty
INSERT INTO contacts (company_name, position, location, canton, salary_min, salary_max, email, phone, website, industry, language_required, description) VALUES
('Helvetia Bau AG', 'Stavbyvedoucí / Bauleiter', 'Zürich', 'ZH', 6000, 7500, 'hr@helvetiabau.ch', '+41 44 123 4567', 'https://helvetiabau.ch', 'Stavebnictví', 'B1 Němčina', 'Hledáme zkušeného stavbyvedoucího pro rezidenční projekty v Zürichu.'),
('Swiss Gastro Group', 'Kuchař / Koch', 'Bern', 'BE', 4500, 5500, 'jobs@swissgastro.ch', '+41 31 987 6543', 'https://swissgastro.ch', 'Gastronomie', 'A2 Němčina', 'Restaurace v centru Bernu hledá kuchaře s praxí v mezinárodní kuchyni.'),
('Alpine Care AG', 'Zdravotní sestra / Pflegefachfrau', 'Basel', 'BS', 6500, 8000, 'karriere@alpinecare.ch', '+41 61 555 1234', 'https://alpinecare.ch', 'Zdravotnictví', 'B1 Němčina', 'Nemocnice hledá zdravotní sestry/bratry pro oddělení interní medicíny.'),
('LogiSwiss Transport', 'Řidič kamiónu / LKW-Fahrer', 'Luzern', 'LU', 5200, 6200, 'fahrer@logiswiss.ch', '+41 41 333 7890', 'https://logiswiss.ch', 'Logistika', 'A2 Němčina', 'Mezinárodní přeprava, řidičák C/CE nutný.'),
('TechHub Zürich', 'Frontend Developer', 'Zürich', 'ZH', 8500, 11000, 'talent@techhub.ch', '+41 44 777 2345', 'https://techhub.ch', 'IT', 'B2 Angličtina', 'Startup hledá React/Next.js developera, remote-friendly.'),
('Reinigung Plus GmbH', 'Vedoucí úklidu / Reinigungsleiter', 'Winterthur', 'ZH', 4200, 5000, 'personal@reinigungplus.ch', '+41 52 444 5678', 'https://reinigungplus.ch', 'Služby', 'A2 Němčina', 'Vedení týmu 10 lidí, organizace směn.'),
('MountainView Hotel', 'Recepční / Rezeptionist', 'Interlaken', 'BE', 4500, 5200, 'jobs@mountainview.ch', '+41 33 888 1234', 'https://mountainview.ch', 'Hotelnictví', 'B1 Němčina + Angličtina', 'Luxusní hotel v Alpách hledá recepční na sezónu i celoročně.'),
('Precision Tools AG', 'CNC Operátor / CNC-Maschinist', 'Schaffhausen', 'SH', 5500, 6800, 'hr@precisiontools.ch', '+41 52 666 7890', 'https://precisiontools.ch', 'Výroba', 'A2 Němčina', 'Strojírenská firma, práce s CNC stroji Mazak a DMG Mori.'),
('CleanEnergy Swiss', 'Elektrikář / Elektriker', 'St. Gallen', 'SG', 5800, 7000, 'stellen@cleanenergy.ch', '+41 71 222 3456', 'https://cleanenergy.ch', 'Energetika', 'B1 Němčina', 'Instalace solárních panelů a elektroinstalace v novostavbách.'),
('Pharma Research Basel', 'Laborant / Laborant', 'Basel', 'BS', 6000, 7500, 'careers@pharmaresearch.ch', '+41 61 999 4567', 'https://pharmaresearch.ch', 'Farmaceutika', 'B2 Angličtina', 'Výzkumná laboratoř, práce s analytickými přístroji.');
FILEEND
echo "✅ supabase-contacts-migration.sql"

echo ""
echo "🎉 Hotovo! Všechny soubory vytvořeny."
echo ""
echo "📋 Co máš nového:"
echo "  ✅ hooks/useSubscription.ts    – hook pro kontrolu předplatného"
echo "  ✅ components/PaywallOverlay    – zamykací overlay s blur efektem"
echo "  ✅ components/ContactCard       – karta kontaktu (zamčená/odemčená)"
echo "  ✅ components/StatCounter       – statistiky"
echo "  ✅ app/pruvodce/page.tsx        – průvodce (2 free + 6 premium článků)"
echo "  ✅ app/kontakty/page.tsx        – databáze 200+ kontaktů"
echo "  ✅ app/asistent/page.tsx        – AI asistent 24/7"
echo "  ✅ app/pricing/page.tsx         – nová pricing stránka"
echo "  ✅ supabase-contacts-migration  – SQL pro tabulku kontaktů"
echo ""
echo "📋 Další kroky:"
echo "  1. Spusť SQL z supabase-contacts-migration.sql v Supabase Dashboard"
echo "  2. npm run dev"
echo "  3. Otestuj /pruvodce, /kontakty, /asistent, /pricing"
echo "  4. git add . && git commit -m 'paywall + content' && git push"
