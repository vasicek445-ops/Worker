'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TemplateGallery from '../../../../components/cv/TemplateGallery'
import PaywallOverlay from '../../../../components/PaywallOverlay'
import { useSubscription } from '../../../../../hooks/useSubscription'
import { supabase } from '../../../../supabase'
import { TEMPLATES, getTemplateById } from '../../../../../lib/cv/templates'

const DEFAULT_TEMPLATE_ID = 'klassisch'
const NEXT_PATH = '/pruvodce/sablony/cv/vyber-sablonu'

export default function VyberSablonuPage() {
  const router = useRouter()
  const { isActive, loading: subLoading } = useSubscription()

  const [authChecked, setAuthChecked] = useState(false)
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)

  // Auth gate: must be signed in. Otherwise → /prihlaseni?next=...
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (cancelled) return
      if (!session) {
        router.replace(`/prihlaseni?next=${encodeURIComponent(NEXT_PATH)}`)
        return
      }
      setAuthChecked(true)
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  const selectedTemplate = useMemo(
    () => (selectedId ? getTemplateById(selectedId) : undefined),
    [selectedId]
  )

  const handleContinue = () => {
    if (!selectedId) return
    router.push(`/pruvodce/sablony/cv/editor?template=${encodeURIComponent(selectedId)}`)
  }

  const handleSkip = () => {
    router.push(`/pruvodce/sablony/cv/editor?template=${DEFAULT_TEMPLATE_ID}`)
  }

  // Loading state while auth check runs
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
      {/* Ambient gradient blurs */}
      <div
        className="fixed w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none z-0 opacity-[0.12] -top-[200px] right-[5%]"
        style={{
          background:
            'radial-gradient(circle, rgba(251,146,60,0.35), transparent 70%)',
        }}
      />
      <div
        className="fixed w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none z-0 opacity-[0.08] bottom-[100px] -left-[200px]"
        style={{
          background:
            'radial-gradient(circle, rgba(100,60,255,0.3), transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Top bar: back + skip */}
        <div className="flex items-center justify-between mb-10">
          <Link
            href="/pruvodce"
            className="text-white/40 hover:text-white text-sm no-underline transition flex items-center gap-2"
          >
            <span aria-hidden="true">←</span>
            <span className="hidden sm:inline">Zpět na šablony</span>
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

        {/* Hero header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fb923c]/[0.08] border border-[#fb923c]/20 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#fb923c] animate-pulse" />
            <span className="text-[#fb923c] text-xs font-semibold uppercase tracking-wider">
              Krok 1 z 2
            </span>
          </div>
          <h1 className="text-white text-4xl sm:text-5xl font-extrabold m-0 tracking-tight leading-tight">
            Vyber svou šablonu
          </h1>
          <p className="text-white/50 text-base sm:text-lg mt-4 leading-relaxed">
            Vybereš si vzhled CV, pak ho vyplníš.{' '}
            <span className="text-white/35">Můžeš to později kdykoli změnit.</span>
          </p>
          <p className="text-white/25 text-xs mt-3">
            {TEMPLATES.length} profesionálních šablon · švýcarský formát · ATS friendly
          </p>
        </div>

        {/* Gallery (gated by paywall) */}
        <PaywallOverlay
          isLocked={isLocked}
          title="Šablony CV jsou součástí Premium"
          description="Získej přístup ke všem profesionálním šablonám a AI generování"
        >
          <TemplateGallery
            selectedId={selectedId}
            onSelect={setSelectedId}
            columns={4}
            showCategories={true}
            showColorDots={true}
            showFormatBadges={false}
          />
        </PaywallOverlay>
      </div>

      {/* Sticky bottom CTA bar */}
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
                {selectedTemplate?.hint && (
                  <span className="text-white/35 text-sm font-normal ml-2 hidden sm:inline">
                    {selectedTemplate.hint}
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
