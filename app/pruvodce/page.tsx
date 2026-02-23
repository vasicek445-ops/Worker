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
