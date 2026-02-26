'use client'

import { useSubscription } from '../../../../hooks/useSubscription'
import PaywallOverlay from '../../../components/PaywallOverlay'
import GenerateForm from '../../../components/GenerateForm'
import Link from 'next/link'

const FIELDS = [
  { name: 'name', label: 'Tvoje celé jméno', placeholder: 'Jan Novák' },
  { name: 'position', label: 'Jakou pozici hledáš?', placeholder: 'např. Monteur, Küchenhilfe, Lagerist...' },
  { name: 'company', label: 'Komu píšeš? (firma / agentura)', placeholder: 'např. Adecco Zürich, Randstad, nebo konkrétní firma', required: false },
  { name: 'field', label: 'Obor', placeholder: 'Vyber obor', type: 'select' as const, options: ['Stavebnictví', 'Gastronomie / Hotelnictví', 'Logistika / Sklad', 'Zdravotnictví', 'Úklid / Údržba', 'Strojírenství / Technik', 'IT / Software', 'Elektro / Instalatér', 'Řidič / Doprava', 'Jiný obor'] },
  { name: 'experience', label: 'Roky praxe v oboru', placeholder: 'např. 3 roky' },
  { name: 'german', label: 'Úroveň němčiny', placeholder: 'Vyber úroveň', type: 'select' as const, options: ['Žádná – teprve se učím', 'Základy (A1)', 'Základní komunikace (A2)', 'Dorozumím se (B1)', 'Dobrá úroveň (B2)', 'Plynulá (C1/C2)'] },
  { name: 'extra', label: 'Něco navíc? (volitelné)', placeholder: 'např. mohu nastoupit ihned, mám EU občanství...', required: false },
]

export default function EmailSablona() {
  const { isActive, loading } = useSubscription()

  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/pruvodce/sablony" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
          ← Zpět na šablony
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📧</span>
          <div>
            <h1 className="text-white text-xl font-bold">Email pro oslovení firmy</h1>
            <p className="text-gray-400 text-xs">Profesionální email v němčině pro HR / agenturu</p>
          </div>
        </div>
        <PaywallOverlay isLocked={!isActive && !loading} title="AI šablony jsou součástí Premium" description="Získej profesionální email v němčině za 20 sekund">
          <GenerateForm type="email" title="Vyplň údaje česky" subtitle="AI vytvoří krátký profesionální email v němčině + český překlad" fields={FIELDS} />
        </PaywallOverlay>
      </div>
    </main>
  )
}
