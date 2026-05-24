'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PaywallOverlay from '../../../../components/PaywallOverlay'
import LetterPreview from '../../../../components/LetterPreview'
import { useSubscription } from '../../../../../hooks/useSubscription'
import { supabase } from '../../../../supabase'
import { LETTER_TEMPLATES, getLetterTemplateById } from '../../../../../lib/letter/templates'
import type { LetterData } from '../../../../../lib/letter/types'

const DEFAULT_TEMPLATE_ID = 'klassisch'
const NEXT_PATH = '/pruvodce/sablony/motivacni-dopis/vyber-sablonu'

// Demo data pro preview cards (jen ukazka layoutu — uzivatel pak vyplni vlastni)
const PREVIEW_DATA: LetterData = {
  sender: {
    fullName: 'Petr Novák',
    address: 'Bahnhofstrasse 12',
    postalCode: '8001',
    city: 'Zürich',
    phone: '+41 79 123 45 67',
    email: 'petr.novak@example.com',
  },
  recipient: {
    company: 'Migros Verteilbetrieb AG',
    contactPerson: 'Frau Anna Keller',
    address: 'Industriestrasse 5',
    postalCode: '8957',
    city: 'Spreitenbach',
  },
  meta: {
    place: 'Zürich',
    date: '24. Mai 2026',
    subject: 'Bewerbung als Lagermitarbeiter',
    reference: 'Inserat vom 20.05.2026',
    jobSource: 'jobs.ch',
  },
  body: {
    opening: 'Sehr geehrte Frau Keller',
    paragraphs: [
      { id: '1', type: 'motivation', text: 'Auf jobs.ch habe ich Ihre Stelle als Lagermitarbeiter entdeckt und bewerbe mich mit grossem Interesse. Migros überzeugt mich durch die langfristigen Arbeitsverhältnisse und die moderne Logistik in Spreitenbach.' },
      { id: '2', type: 'experience', text: 'In den letzten vier Jahren habe ich in einem DHL-Verteilzentrum in Bratislava gearbeitet — Kommissionierung, Stapler (Schein vorhanden) und Wareneingang. Schichtarbeit und körperlich anspruchsvolle Tätigkeiten sind für mich Alltag.' },
      { id: '3', type: 'skills', text: 'Meine Stärken sind Zuverlässigkeit, Teamfähigkeit und schnelle Auffassungsgabe. Deutschkenntnisse liegen bei B1 (im Lernfortschritt).' },
      { id: '4', type: 'closing', text: 'Als EU-Bürger benötige ich keine Arbeitsbewilligung und kann ab dem 1. Juli 2026 starten. Über eine Einladung zu einem Gespräch freue ich mich.' },
    ],
    signOff: 'Freundliche Grüsse',
  },
  design: {
    templateId: 'klassisch',
    accentColor: '#1a1a1a',
  },
}

export default function LetterVyberSablonuPage() {
  const router = useRouter()
  const { isActive, loading: subLoading } = useSubscription()

  const [authChecked, setAuthChecked] = useState(false)
  const [selectedId, setSelectedId] = useState<'klassisch' | 'modern' | 'minimal' | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return
      if (!session) {
        router.replace(`/prihlaseni?next=${encodeURIComponent(NEXT_PATH)}`)
        return
      }
      setAuthChecked(true)
    })()
    return () => { cancelled = true }
  }, [router])

  const selectedTemplate = useMemo(
    () => (selectedId ? getLetterTemplateById(selectedId) : undefined),
    [selectedId]
  )

  const handleContinue = () => {
    if (!selectedId) return
    router.push(`/pruvodce/sablony/motivacni-dopis/editor?template=${encodeURIComponent(selectedId)}`)
  }

  const handleSkip = () => {
    router.push(`/pruvodce/sablony/motivacni-dopis/editor?template=${DEFAULT_TEMPLATE_ID}`)
  }

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-[#0a0a12] flex items-center justify-center px-4">
        <div className="flex items-center gap-3 text-white/40 text-sm">
          <span className="w-5 h-5 border-2 border-white/20 border-t-[#fb923c] rounded-full animate-spin" />
          Načítám…
        </div>
      </main>
    )
  }

  const isLocked = !subLoading && !isActive

  return (
    <main
      className="min-h-screen bg-[#0a0a12] relative overflow-hidden pb-32"
      style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}
    >
      <div
        className="fixed w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none z-0 opacity-[0.12] -top-[200px] right-[5%]"
        style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.35), transparent 70%)' }}
      />
      <div
        className="fixed w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none z-0 opacity-[0.08] bottom-[100px] -left-[200px]"
        style={{ background: 'radial-gradient(circle, rgba(100,60,255,0.3), transparent 70%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center justify-between mb-10">
          <Link
            href="/pruvodce"
            className="text-white/40 hover:text-white text-sm no-underline transition flex items-center gap-2"
          >
            <span aria-hidden="true">←</span>
            <span className="hidden sm:inline">Zpět na nástroje</span>
            <span className="sm:hidden">Zpět</span>
          </Link>
          <button
            type="button"
            onClick={handleSkip}
            className="text-white/40 hover:text-[#fb923c] text-sm transition flex items-center gap-1"
          >
            Přeskočit
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fb923c]/[0.08] border border-[#fb923c]/20 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#fb923c] animate-pulse" />
            <span className="text-[#fb923c] text-xs font-semibold uppercase tracking-wider">
              Krok 1 z 2
            </span>
          </div>
          <h1 className="text-white text-4xl sm:text-5xl font-extrabold m-0 tracking-tight leading-tight">
            Vyber šablonu dopisu
          </h1>
          <p className="text-white/50 text-base sm:text-lg mt-4 leading-relaxed">
            Vybereš si vzhled motivačního dopisu, AI ti vygeneruje obsah.{' '}
            <span className="text-white/35">Můžeš to později kdykoli změnit.</span>
          </p>
          <p className="text-white/25 text-xs mt-3">
            {LETTER_TEMPLATES.length} švýcarských šablon · DIN 5008 · ATS friendly
          </p>
        </div>

        <PaywallOverlay
          isLocked={isLocked}
          title="Šablony dopisu jsou součástí Premium"
          description="Získej přístup k profesionálním Anschreiben šablonám a AI generování"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {LETTER_TEMPLATES.map((tpl) => {
              const isSelected = selectedId === tpl.id
              return (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedId(tpl.id)}
                  className={`group text-left rounded-2xl overflow-hidden transition-all border ${
                    isSelected
                      ? 'border-[#fb923c]/60 shadow-[0_4px_40px_rgba(251,146,60,0.25)] scale-[1.02]'
                      : 'border-white/[0.08] hover:border-white/[0.18]'
                  }`}
                >
                  {/* Mini preview (scaled LetterPreview rendrovaný v aspect-ratio bunce) */}
                  <div className="relative bg-[#0a0a12] overflow-hidden" style={{ aspectRatio: '210/297' }}>
                    <div
                      style={{
                        transform: 'scale(0.32)',
                        transformOrigin: 'top left',
                        width: '312.5%',
                        height: '312.5%',
                        pointerEvents: 'none',
                      }}
                    >
                      <LetterPreview
                        data={{ ...PREVIEW_DATA, design: { ...PREVIEW_DATA.design, templateId: tpl.id, accentColor: tpl.defaultColor } }}
                        template={tpl.id}
                        accentColor={tpl.defaultColor}
                      />
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#fb923c] text-[#0a0a12] flex items-center justify-center text-sm font-bold shadow-lg">
                        ✓
                      </div>
                    )}
                  </div>
                  {/* Metadata pod kartou */}
                  <div className="p-4 bg-[#111120]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className={`text-base font-bold m-0 ${isSelected ? 'text-[#fb923c]' : 'text-white'}`}>
                        {tpl.name}
                      </h3>
                      {tpl.atsFriendly && (
                        <span className="text-[9px] bg-[#22c55e]/15 text-[#22c55e] font-bold px-1.5 py-0.5 rounded">
                          ATS
                        </span>
                      )}
                    </div>
                    <p className="text-white/40 text-xs leading-relaxed m-0">{tpl.description}</p>
                    {/* Dostupne barvy */}
                    <div className="flex items-center gap-1.5 mt-3">
                      {tpl.availableColors.slice(0, 5).map((c) => (
                        <span
                          key={c}
                          className="w-3 h-3 rounded-full border border-white/10"
                          style={{ backgroundColor: c }}
                          aria-label={`Barva ${c}`}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </PaywallOverlay>
      </div>

      <div
        className={`fixed bottom-0 left-0 md:left-[240px] right-0 z-20 transition-transform duration-300 ${
          selectedId ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-[#0a0a12]/95 backdrop-blur-xl border-t border-white/[0.06] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-white/40 text-xs m-0 uppercase tracking-wider font-semibold">
                Vybraná šablona
              </p>
              <p className="text-white text-base font-bold m-0 mt-0.5 truncate">
                {selectedTemplate?.name ?? '—'}
                {selectedTemplate?.description && (
                  <span className="text-white/35 text-sm font-normal ml-2 hidden sm:inline">
                    {selectedTemplate.description.slice(0, 60)}
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedId || isLocked}
              className="flex-shrink-0 bg-gradient-to-r from-[#fb923c] to-[#f97316] text-[#0a0a12] font-extrabold py-3 px-5 sm:px-7 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_4px_30px_rgba(251,146,60,0.35)] hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base flex items-center gap-2"
            >
              <span className="hidden sm:inline">
                Pokračovat s {selectedTemplate?.name ?? 'šablonou'}
              </span>
              <span className="sm:hidden">Pokračovat</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
