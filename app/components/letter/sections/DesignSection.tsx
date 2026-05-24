'use client'

import { Check } from 'lucide-react'
import { LETTER_TEMPLATES, getLetterTemplateById } from '@/lib/letter/templates'

interface DesignSectionProps {
  template: string
  onTemplateChange: (id: string) => void
  accentColor: string
  onColorChange: (color: string) => void
}

export default function DesignSection({
  template,
  onTemplateChange,
  accentColor,
  onColorChange,
}: DesignSectionProps) {
  const activeTpl = getLetterTemplateById(template) || LETTER_TEMPLATES[0]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Vzhled</h2>
        <p className="text-sm text-white/50 mt-1">Šablona a akcentová barva dopisu.</p>
      </div>

      <div>
        <div className="text-xs font-medium text-white/60 mb-3">Šablona</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LETTER_TEMPLATES.map((t) => {
            const isActive = t.id === template
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onTemplateChange(t.id)
                  // Pokud nova sablona neumi current color → fallback na defaultColor.
                  if (!t.availableColors.includes(accentColor)) {
                    onColorChange(t.defaultColor)
                  }
                }}
                className={`relative text-left rounded-2xl border p-4 transition ${
                  isActive
                    ? 'bg-[#fb923c]/[0.08] border-[#fb923c]/40'
                    : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05]'
                }`}
              >
                {/* Mini preview swatch */}
                <div
                  className="aspect-[210/297] rounded-lg mb-3 overflow-hidden border border-white/[0.05]"
                  style={{ backgroundColor: '#fff' }}
                >
                  <div className="h-full w-full p-2 flex flex-col gap-1">
                    {t.headerStyle === 'colored-band' && (
                      <div className="h-3 rounded-sm" style={{ backgroundColor: t.defaultColor }} />
                    )}
                    {t.headerStyle === 'minimal-centered' && (
                      <div className="h-2 mx-auto w-1/2 rounded-sm bg-gray-300" />
                    )}
                    {t.headerStyle === 'din5008' && (
                      <div className="flex justify-end">
                        <div className="h-1.5 w-1/3 bg-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 space-y-1 mt-1">
                      <div className="h-1 bg-gray-300 w-3/4" />
                      <div className="h-1 bg-gray-200 w-full" />
                      <div className="h-1 bg-gray-200 w-full" />
                      <div className="h-1 bg-gray-200 w-5/6" />
                      <div className="h-1 bg-gray-200 w-full" />
                      <div className="h-1 bg-gray-200 w-2/3" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                  {isActive && (
                    <span className="bg-[#fb923c] text-[#0a0a12] rounded-full p-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/45 mt-1.5 leading-relaxed">{t.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div className="text-xs font-medium text-white/60 mb-3">Akcentová barva</div>
        <div className="flex flex-wrap gap-3">
          {activeTpl.availableColors.map((c) => {
            const isActive = c === accentColor
            return (
              <button
                key={c}
                type="button"
                onClick={() => onColorChange(c)}
                aria-label={`Barva ${c}`}
                className="w-10 h-10 rounded-full transition-transform hover:scale-110 relative"
                style={{
                  backgroundColor: c,
                  border: isActive ? '3px solid #fff' : '3px solid transparent',
                  boxShadow: isActive ? '0 0 0 2px #fb923c' : 'none',
                }}
              >
                {isActive && (
                  <Check
                    className="w-4 h-4 absolute inset-0 m-auto"
                    style={{ color: '#fff', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
                  />
                )}
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-[11px] text-white/35">
          Dostupné barvy se mění podle vybrané šablony.
        </p>
      </div>
    </div>
  )
}
