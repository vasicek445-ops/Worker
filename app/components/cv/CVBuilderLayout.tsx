'use client'

import { useState } from 'react'
import SectionNav from './SectionNav'
import LivePreview from './LivePreview'
import CustomizePanel from './CustomizePanel'
import WokerScore from './WokerScore'
import { SECTIONS, getNextSection, getPrevSection } from '@/lib/cv/sections'
import { calculateWokerScore } from '@/lib/cv/score'
import { getTemplateById } from '@/lib/cv/templates'
import type { CVData, CVFormData, SectionId } from '@/lib/cv/types'
import Link from 'next/link'

interface CVBuilderLayoutProps {
  // Form state
  formData: CVFormData
  onFormChange: (updates: Partial<CVFormData>) => void
  photo: string | null
  onPhotoChange: (photo: string | null) => void

  // Active section
  activeSection: SectionId
  onSectionChange: (id: SectionId) => void

  // Template + color
  template: string
  onTemplateChange: (id: string) => void
  accentColor: string
  onColorChange: (color: string) => void

  // Optional AI-generated full data
  cvData?: CVData | null

  // Actions
  onSave?: () => void
  onExportPDF?: () => void
  onShare?: () => void
  onSyncFromProfile?: () => void
  syncing?: boolean
  saving?: boolean

  // Content slot — aktivní sekce (form)
  children: React.ReactNode
}

export default function CVBuilderLayout({
  formData,
  onFormChange: _onFormChange,
  photo,
  activeSection,
  onSectionChange,
  template,
  onTemplateChange,
  accentColor,
  onColorChange,
  cvData,
  onSave,
  onExportPDF,
  onShare,
  onSyncFromProfile,
  syncing,
  saving,
  children,
}: CVBuilderLayoutProps) {
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)
  const tpl = getTemplateById(template)
  const score = calculateWokerScore(formData, photo, { atsFriendly: tpl?.atsFriendly ?? false })

  const prevId = getPrevSection(activeSection)
  const nextId = getNextSection(activeSection)
  const isDesignSection = activeSection === 'design'

  return (
    <div className="h-screen bg-[#0a0a12] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 z-40 bg-[#0a0a12]/95 backdrop-blur border-b border-white/[0.05]">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/pruvodce" className="text-white/40 hover:text-white text-sm no-underline transition flex-shrink-0">←</Link>
            <span className="text-white/70 text-sm font-medium truncate">Můj životopis</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <WokerScore breakdown={score} compact />
            </div>
            {onSyncFromProfile && (
              <button
                onClick={onSyncFromProfile}
                disabled={syncing}
                title="Načte aktuální data z tvého profilu a přepíše pole v editoru"
                className="bg-white/[0.04] hover:bg-[#fb923c]/10 border border-white/[0.08] hover:border-[#fb923c]/30 text-white/70 hover:text-[#fb923c] text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {syncing ? '...' : <><span>↻</span><span className="hidden sm:inline">Z profilu</span></>}
              </button>
            )}
            {onSave && (
              <button
                onClick={onSave}
                disabled={saving}
                className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/80 text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
              >
                {saving ? '...' : '💾 Uložit'}
              </button>
            )}
            {onExportPDF && (
              <button
                onClick={onExportPDF}
                className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/80 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
              >
                ⬇ PDF
              </button>
            )}
            {onShare && (
              <button
                onClick={onShare}
                className="bg-[#fb923c]/15 hover:bg-[#fb923c]/25 border border-[#fb923c]/30 text-[#fb923c] text-xs font-semibold px-3 py-1.5 rounded-lg transition"
              >
                Sdílet
              </button>
            )}
          </div>
        </div>
        <div className="sm:hidden px-4 pb-2">
          <WokerScore breakdown={score} compact />
        </div>
      </header>

      {/* Body: 3-column on desktop */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Section nav */}
        <SectionNav active={activeSection} onSelect={onSectionChange} />

        {/* Middle: active section content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 lg:py-8">
          <div className="max-w-2xl mx-auto">
            {isDesignSection ? (
              <div className="lg:hidden">
                {/* Mobile: design tab → ukáže customize panel inline */}
                <CustomizePanel
                  template={template}
                  onTemplateChange={onTemplateChange}
                  accentColor={accentColor}
                  onColorChange={onColorChange}
                />
              </div>
            ) : (
              children
            )}

            {/* Bottom nav prev/next */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.05]">
              {prevId ? (
                <button
                  onClick={() => onSectionChange(prevId)}
                  className="text-white/40 hover:text-white text-sm flex items-center gap-2 transition"
                >
                  ← {SECTIONS.find((s) => s.id === prevId)?.label}
                </button>
              ) : <span />}
              {nextId && (
                <button
                  onClick={() => onSectionChange(nextId)}
                  className="bg-[#fb923c] hover:bg-[#f97316] text-[#0a0a12] text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  {SECTIONS.find((s) => s.id === nextId)?.label} →
                </button>
              )}
            </div>
          </div>
        </main>

        {/* Right: Live preview + Customize panel (desktop only) */}
        <aside className="hidden lg:flex flex-col w-[460px] xl:w-[520px] border-l border-white/[0.05] bg-[#0d0d18] overflow-hidden flex-shrink-0">
          {isDesignSection ? (
            <CustomizePanel
              template={template}
              onTemplateChange={onTemplateChange}
              accentColor={accentColor}
              onColorChange={onColorChange}
            />
          ) : (
            <div className="flex-1 overflow-y-auto p-5">
              <LivePreview
                formData={formData}
                photo={photo}
                template={template}
                accentColor={accentColor}
                cvData={cvData}
              />
              <div className="mt-4 px-2 flex items-center justify-between text-xs">
                <button
                  onClick={() => onSectionChange('design')}
                  className="text-white/50 hover:text-white transition flex items-center gap-2"
                >
                  🎨 <span>{tpl?.name || 'Vybrat šablonu'}</span>
                </button>
                <div className="flex gap-1.5">
                  {tpl?.availableColors.slice(0, 5).map((c) => (
                    <button
                      key={c}
                      onClick={() => onColorChange(c)}
                      aria-label={`Barva ${c}`}
                      className="w-4 h-4 rounded-full transition-transform hover:scale-125"
                      style={{
                        backgroundColor: c,
                        border: accentColor === c ? '2px solid #fff' : '2px solid transparent',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile: floating preview FAB */}
      {!isDesignSection && (
        <button
          onClick={() => setMobilePreviewOpen(true)}
          className="lg:hidden fixed bottom-6 right-5 z-40 bg-[#fb923c] text-[#0a0a12] font-bold px-4 py-3 rounded-full shadow-lg flex items-center gap-2 hover:scale-105 transition"
        >
          📄 Náhled
        </button>
      )}

      {/* Mobile preview modal */}
      {mobilePreviewOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#0a0a12]/95 backdrop-blur overflow-y-auto">
          <div className="sticky top-0 bg-[#0a0a12] border-b border-white/[0.05] px-4 py-3 flex items-center justify-between">
            <span className="text-white/70 text-sm font-medium">Náhled CV</span>
            <button onClick={() => setMobilePreviewOpen(false)} className="text-white/40 hover:text-white text-2xl leading-none">×</button>
          </div>
          <div className="p-4">
            <LivePreview
              formData={formData}
              photo={photo}
              template={template}
              accentColor={accentColor}
              cvData={cvData}
            />
          </div>
        </div>
      )}
    </div>
  )
}
