'use client'

import { useSubscription } from '../../../hooks/useSubscription'
import PaywallOverlay from '../../components/PaywallOverlay'
import Link from 'next/link'

const TEMPLATES = [
  {
    icon: '✉️',
    title: 'Motivační dopis v němčině',
    description: 'AI vytvoří profesionální Bewerbungsschreiben přizpůsobený švýcarskému trhu. Vyplníš 5 polí, dostaneš hotový dopis v němčině + český překlad.',
    href: '/pruvodce/sablony/motivacni-dopis',
    tag: '🔥 Nejoblíbenější',
    tagColor: 'bg-orange-500/10 text-orange-400',
    time: '~30 sekund',
  },
  {
    icon: '📧',
    title: 'Email pro oslovení firmy / agentury',
    description: 'Krátký, profesionální email v němčině, kterým oslovíš HR oddělení nebo pracovní agenturu. Zaujmeš hned prvním emailem.',
    href: '/pruvodce/sablony/email',
    tag: 'Rychlý výsledek',
    tagColor: 'bg-blue-500/10 text-blue-400',
    time: '~20 sekund',
  },
  {
    icon: '📄',
    title: 'Životopis (Lebenslauf) švýcarský formát',
    description: 'CV ve formátu, který švýcarské firmy očekávají. Tabulkový styl, správné sekce, němčina. Úplně jiný než český životopis.',
    href: '/pruvodce/sablony/cv',
    tag: 'Kompletní CV',
    tagColor: 'bg-green-500/10 text-green-400',
    time: '~45 sekund',
  },
]

export default function Sablony() {
  const { isActive, loading } = useSubscription()

  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/pruvodce" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
          ← Zpět na průvodce
        </Link>

        <h1 className="text-white text-2xl font-bold mb-2">📝 AI Šablony pro Švýcarsko</h1>
        <p className="text-gray-400 text-sm mb-2">
          Vyplň pár údajů a AI ti vytvoří profesionální dokument v němčině + český překlad
        </p>
        <div className="flex items-center gap-2 mb-8">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs font-medium">Poháněno umělou inteligencí</span>
        </div>

        <PaywallOverlay
          isLocked={!isActive && !loading}
          title="AI šablony jsou součástí Premium"
          description="Nech AI vytvořit profesionální dokumenty v němčině za tebe"
        >
          <div className="space-y-4">
            {TEMPLATES.map((t) => (
              <Link key={t.href} href={t.href}>
                <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-5 hover:border-gray-600 transition-colors cursor-pointer mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{t.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">{t.title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{t.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${t.tagColor}`}>
                      {t.tag}
                    </span>
                    <span className="text-gray-600 text-xs">⏱ {t.time}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </PaywallOverlay>

        <div className="mt-8 bg-[#1A1A1A] border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-4">Jak to funguje?</h3>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Vyber typ dokumentu (dopis, email nebo CV)' },
              { step: '2', text: 'Vyplň základní údaje česky (5–10 polí)' },
              { step: '3', text: 'AI vygeneruje profesionální dokument v němčině' },
              { step: '4', text: 'Zkopíruj, uprav a pošli – hotovo!' },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <span className="bg-[#E8302A] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  {s.step}
                </span>
                <span className="text-gray-300 text-sm">{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
