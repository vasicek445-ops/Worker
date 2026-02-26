'use client'

import { useSubscription } from '../../../../hooks/useSubscription'
import PaywallOverlay from '../../../components/PaywallOverlay'
import GenerateForm from '../../../components/GenerateForm'
import Link from 'next/link'

const FIELDS = [
  { name: 'name', label: 'Celé jméno', placeholder: 'Jan Novák' },
  { name: 'birthdate', label: 'Datum narození', placeholder: 'např. 15.03.1990' },
  { name: 'phone', label: 'Telefonní číslo', placeholder: 'např. +420 123 456 789' },
  { name: 'email', label: 'Emailová adresa', placeholder: 'jan.novak@email.com' },
  { name: 'address', label: 'Adresa (město, země)', placeholder: 'např. Praha, Česká republika', required: false },
  { name: 'position', label: 'Na jakou pozici se hlásíš?', placeholder: 'např. Monteur, Küchenhilfe, Lagerist...' },
  { name: 'field', label: 'Obor', placeholder: 'Vyber obor', type: 'select' as const, options: ['Stavebnictví', 'Gastronomie / Hotelnictví', 'Logistika / Sklad', 'Zdravotnictví', 'Úklid / Údržba', 'Strojírenství / Technik', 'IT / Software', 'Elektro / Instalatér', 'Řidič / Doprava', 'Jiný obor'] },
  { name: 'experience_detail', label: 'Pracovní zkušenosti', placeholder: 'Popiš své zkušenosti, např.:\n2019–2024: Zedník, StavbyPraha s.r.o. – hrubé stavby, obklady\n2017–2019: Pomocný dělník, XY firma – demolice, přípravné práce', type: 'textarea' as const },
  { name: 'education', label: 'Vzdělání', placeholder: 'např.:\n2014–2017: Střední odborné učiliště stavební, Praha – výuční list zedník', type: 'textarea' as const },
  { name: 'german', label: 'Úroveň němčiny', placeholder: 'Vyber úroveň', type: 'select' as const, options: ['Žádná – teprve se učím', 'Základy (A1)', 'Základní komunikace (A2)', 'Dorozumím se (B1)', 'Dobrá úroveň (B2)', 'Plynulá (C1/C2)'] },
  { name: 'other_languages', label: 'Další jazyky (volitelné)', placeholder: 'např. Angličtina B1, Slovenština rodilý mluvčí', required: false },
  { name: 'skills', label: 'Dovednosti a certifikáty', placeholder: 'např. svařování MIG/MAG, obsluha jeřábu, řidičák C, práce ve výškách, MS Office...', type: 'textarea' as const },
  { name: 'driving', label: 'Řidičský průkaz', placeholder: 'např. B, C, CE...', required: false },
  { name: 'extra', label: 'Další informace (volitelné)', placeholder: 'např. ochotný se přestěhovat, nastup ihned, reference k dispozici...', required: false },
]

export default function CVSablona() {
  const { isActive, loading } = useSubscription()

  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/pruvodce/sablony" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
          ← Zpět na šablony
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📄</span>
          <div>
            <h1 className="text-white text-xl font-bold">Životopis – švýcarský formát</h1>
            <p className="text-gray-400 text-xs">Lebenslauf v němčině přizpůsobený švýcarskému trhu</p>
          </div>
        </div>
        <PaywallOverlay isLocked={!isActive && !loading} title="AI šablony jsou součástí Premium" description="Získej profesionální CV ve švýcarském formátu za 45 sekund">
          <GenerateForm type="cv" title="Vyplň údaje česky" subtitle="AI vytvoří kompletní Lebenslauf v němčině + český překlad" fields={FIELDS} />
        </PaywallOverlay>
      </div>
    </main>
  )
}
