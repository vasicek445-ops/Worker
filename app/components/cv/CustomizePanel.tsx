'use client'

import { useState } from 'react'
import TemplateGallery from './TemplateGallery'
import { getTemplateById } from '@/lib/cv/templates'

type CustomizeTab = 'template' | 'text' | 'layout'

interface CustomizePanelProps {
  template: string
  onTemplateChange: (id: string) => void
  accentColor: string
  onColorChange: (color: string) => void
  onClose?: () => void
}

const QUICK_COLORS = [
  '#1e293b', '#0f766e', '#7c3aed', '#dc2626',
  '#ea580c', '#0284c7', '#fb923c', '#22c55e',
  '#eab308', '#ec4899', '#06b6d4', '#0f172a',
]

export default function CustomizePanel({ template, onTemplateChange, accentColor, onColorChange, onClose }: CustomizePanelProps) {
  const [tab, setTab] = useState<CustomizeTab>('template')
  const currentTpl = getTemplateById(template)

  return (
    <div className="bg-[#0d0d18] border-l border-white/[0.05] flex flex-col h-full overflow-hidden">
      {/* Header s tabs */}
      <div className="border-b border-white/[0.05] flex items-center justify-between px-4 pt-3">
        <div className="flex gap-1">
          <TabBtn active={tab === 'template'} onClick={() => setTab('template')}>Šablona a barva</TabBtn>
          <TabBtn active={tab === 'text'} onClick={() => setTab('text')}>Text</TabBtn>
          <TabBtn active={tab === 'layout'} onClick={() => setTab('layout')}>Rozložení</TabBtn>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/30 hover:text-white text-lg leading-none pb-1" aria-label="Zavřít">×</button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'template' && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Šablona</span>
                {currentTpl && <span className="text-[#fb923c] text-xs font-semibold">{currentTpl.name}</span>}
              </div>
              <TemplateGallery
                selectedId={template}
                onSelect={onTemplateChange}
                columns={2}
                showCategories={false}
                showColorDots={true}
                compact={true}
              />
            </div>

            <div className="border-t border-white/[0.05] pt-4">
              <span className="text-white/50 text-xs font-bold uppercase tracking-wider block mb-3">Barva</span>
              <div className="flex flex-wrap gap-2 mb-3">
                {QUICK_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => onColorChange(c)}
                    aria-label={`Vybrat barvu ${c}`}
                    className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      border: accentColor === c ? '2.5px solid #fff' : '2.5px solid transparent',
                      boxShadow: accentColor === c ? '0 0 0 2px rgba(255,255,255,0.3)' : 'none',
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="w-10 h-10 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                  aria-label="Vlastní barva"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onColorChange(e.target.value) }}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-white text-xs font-mono w-24 focus:border-[#fb923c]/40 focus:outline-none"
                  maxLength={7}
                />
                <div className="h-6 flex-1 rounded-lg" style={{ backgroundColor: accentColor }} />
              </div>
            </div>
          </div>
        )}

        {tab === 'text' && (
          <div className="space-y-3 text-white/50 text-sm">
            <p className="font-medium text-white/70">Typografie</p>
            <p className="text-xs">Volby fontu a velikosti přijdou v další verzi. Šablony mají optimalizovanou typografii pro švýcarské recruitery — doporučujeme nechat defaultní.</p>
          </div>
        )}

        {tab === 'layout' && (
          <div className="space-y-3 text-white/50 text-sm">
            <p className="font-medium text-white/70">Rozložení</p>
            <p className="text-xs">Pokročilé nastavení margins a spacing přijde v další verzi. Vyber jinou šablonu pro jiný layout (sidebar, top, two-col).</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition ${
        active
          ? 'border-[#fb923c] text-white'
          : 'border-transparent text-white/40 hover:text-white/70'
      }`}
    >
      {children}
    </button>
  )
}
