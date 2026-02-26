'use client'

import { useSubscription } from '../../../../hooks/useSubscription'
import PaywallOverlay from '../../../components/PaywallOverlay'
import GenerateForm from '../../../components/GenerateForm'
import Link from 'next/link'

const FIELDS = [
  { name: 'name', label: 'Tvoje celé jméno', placeholder: 'Jan Novák' },
  { name: 'position', label: 'Na jakou pozici se hlásíš?', placeholder: 'např. Monteur, Küchenhilfe, Lagerist, Maurer...' },
  { name: 'company', label: 'Název firmy nebo agentury', placeholder: 'např. Adecco, Randstad, nebo konkrétní firma', required: false },
  { name: 'field', label: 'Obor', placeholder: 'Vyber obor', type: 'select' as const, options: ['Stavebnictví', 'Gastronomie / Hotelnictví', 'Logistika / Sklad', 'Zdravotnictví', 'Úklid / Údržba', 'Strojírenství / Technik', 'IT / Software', 'Elektro / Instalatér', 'Řidič / Doprava', 'Jiný obor'] },
  { name: 'experience', label: 'Kolik let praxe máš v oboru?', placeholder: 'např. 5 let' },
  { name: 'skills', label: 'Hlavní dovednosti a zkušenosti', placeholder: 'např. svařování, obsluha CNC, řidičák C, práce ve výškách...', type: 'textarea' as const },
  { name: 'german', label: 'Úroveň němčiny', placeholder: 'Vyber úroveň', type: 'select' as const, options: ['Žádná – teprve se učím', 'Základy – pár frází (A1)', 'Základní komunikace (A2)', 'Dorozumím se (B1)', 'Dobrá úroveň (B2)', 'Plynulá (C1/C2)'] },
  { name: 'motivation', label: 'Proč chceš pracovat ve Švýcarsku?', placeholder: 'např. lepší podmínky, zkušenosti v zahraničí, profesní růst...', required: false },
  { name: 'extra', label: 'Něco navíc? (volitelné)', placeholder: 'např. mám rodinu ve Švýcarsku, jsem ochotný se přestěhovat ihned...', required: false },
]

export default function MotivacniDopis() {
  const { isActive, loading } = useSubscription()

  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/pruvodce/sablony" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
          ← Zpět na šablony
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">✉️</span>
          <div>
            <h1 className="text-white text-xl font-bold">Motivační dopis v němčině</h1>
            <p className="text-gray-400 text-xs">Bewerbungsschreiben pro švýcarský trh</p>
          </div>
        </div>
        <PaywallOverlay isLocked={!isActive && !loading} title="AI šablony jsou součástí Premium" description="Získej profesionální motivační dopis v němčině za 30 sekund">
          <GenerateForm type="motivacni-dopis" title="Vyplň údaje česky" subtitle="AI vytvoří profesionální dopis v němčině + přidá český překlad" fields={FIELDS} />
        </PaywallOverlay>
      </div>
    </main>
  )
}
