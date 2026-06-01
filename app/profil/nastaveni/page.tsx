'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../supabase'
import { ArrowLeft, ArrowRight, KeyRound, CreditCard, Globe, Database } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type CardDef = {
  href: string
  Icon: LucideIcon
  title: string
  description: string
}

const CARDS: CardDef[] = [
  {
    href: '/profil/nastaveni/ucet',
    Icon: KeyRound,
    title: 'Účet',
    description: 'Email, heslo, přihlášení',
  },
  {
    href: '/profil/nastaveni/predplatne',
    Icon: CreditCard,
    title: 'Předplatné',
    description: 'Plán, faktury, zrušit předplatné',
  },
  {
    href: '/profil/preference',
    Icon: Globe,
    title: 'Preference',
    description: 'Jazyk UI, e-mailové notifikace',
  },
  {
    href: '/profil/nastaveni/data',
    Icon: Database,
    title: 'Data',
    description: 'Export GDPR, smazat účet',
  },
]

export default function NastaveniIndexPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let cancelled = false
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return
      if (!data.user) { router.replace('/prihlaseni'); return }
      setChecking(false)
    })
    return () => { cancelled = true }
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#fb923c] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-2xl mx-auto p-6">
        <header className="mb-8">
          <Link href="/profil" className="inline-flex items-center gap-1.5 text-white/40 text-sm hover:text-white/70 transition no-underline">
            <ArrowLeft size={15} strokeWidth={1.75} /> Zpět na profil
          </Link>
          <h1 className="text-2xl font-extrabold text-white m-0 mt-3">Nastavení</h1>
          <p className="text-white/40 text-sm mt-1">Spravuj svůj účet, předplatné a preference.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group block bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 no-underline transition-all hover:border-[#fb923c]/30 hover:-translate-y-0.5 hover:bg-[#15152a]/80"
            >
              <div className="flex items-center gap-3.5">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-[#fb923c]/10 border border-[#fb923c]/20 flex items-center justify-center group-hover:bg-[#fb923c]/15 transition-colors">
                  <card.Icon size={20} strokeWidth={1.75} className="text-[#fb923c]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-bold text-base m-0 group-hover:text-[#fb923c] transition-colors">
                    {card.title}
                  </h2>
                  <p className="text-white/40 text-xs mt-1 m-0">{card.description}</p>
                </div>
                <ArrowRight size={16} strokeWidth={1.75} className="text-white/20 group-hover:text-[#fb923c] group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
