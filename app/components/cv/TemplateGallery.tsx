'use client'

import { useMemo, useState } from 'react'
import {
  TEMPLATES,
  CATEGORY_LABELS,
  getTemplatesByCategory,
  type Template,
  type TemplateCategory,
} from '../../../lib/cv/templates'

export interface TemplateGalleryProps {
  selectedId?: string
  onSelect: (templateId: string) => void
  columns?: 2 | 3 | 4
  showCategories?: boolean
  showColorDots?: boolean
  showFormatBadges?: boolean
  compact?: boolean
}

type CategoryKey = TemplateCategory | 'vse'

const ALL_CATEGORIES: CategoryKey[] = [
  'vse',
  'populární',
  'profesionální',
  's-fotkou',
  'ats-friendly',
  'tmavé',
  'minimální',
]

function ThumbImage({ id, name }: { id: string; name: string }) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    return (
      <div
        className="w-full aspect-[3/4] bg-gradient-to-br from-white/[0.04] to-white/[0.01] border-b border-white/[0.04] flex items-center justify-center"
        aria-label={`${name} náhled`}
      >
        <div className="flex flex-col items-center gap-2 px-3 text-center">
          <div className="w-10 h-12 rounded-md bg-white/[0.06] border border-white/[0.08]" />
          <span className="text-white/30 text-[10px] font-medium uppercase tracking-wider truncate max-w-full">
            {name}
          </span>
        </div>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/cv-thumbs/${id}.png`}
      alt={`${name} náhled šablony`}
      className="w-full aspect-[3/4] object-cover bg-white/[0.02]"
      loading="lazy"
      onError={() => setErrored(true)}
    />
  )
}

function ColorDots({ colors, compact }: { colors: string[]; compact?: boolean }) {
  const size = compact ? 8 : 12
  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      {colors.slice(0, 6).map((c, i) => (
        <span
          key={`${c}-${i}`}
          className="rounded-full border border-white/[0.08] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)]"
          style={{ width: size, height: size, backgroundColor: c }}
        />
      ))}
    </div>
  )
}

export default function TemplateGallery({
  selectedId,
  onSelect,
  columns = 4,
  showCategories = true,
  showColorDots = true,
  showFormatBadges = false,
  compact = false,
}: TemplateGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('vse')

  const visibleTemplates: Template[] = useMemo(
    () => getTemplatesByCategory(activeCategory),
    [activeCategory]
  )

  // Responsive grid: collapses to 2 cols on mobile regardless of `columns` prop.
  const gridColsClass =
    columns === 2
      ? 'grid-cols-2'
      : columns === 3
        ? 'grid-cols-2 md:grid-cols-3'
        : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'

  return (
    <div className="w-full">
      {showCategories && (
        <div
          className="flex gap-1.5 mb-5 overflow-x-auto pb-1 -mx-1 px-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {ALL_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-[#fb923c]/[0.12] text-[#fb923c] border-[#fb923c]/40 shadow-[0_0_15px_rgba(251,146,60,0.12)]'
                    : 'bg-white/[0.03] text-white/40 hover:text-white/70 border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            )
          })}
        </div>
      )}

      <div className={`grid ${gridColsClass} gap-4`}>
        {visibleTemplates.map((tpl) => {
          const isSelected = selectedId === tpl.id
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onSelect(tpl.id)}
              className={`group relative text-left rounded-2xl overflow-hidden bg-[#111120] border transition-all duration-200 ${
                isSelected
                  ? 'border-[#fb923c]/60'
                  : 'border-white/[0.06] hover:border-white/[0.14] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]'
              }`}
              style={
                isSelected
                  ? {
                      boxShadow:
                        '0 0 0 2px #fb923c, 0 0 30px rgba(251,146,60,0.3)',
                      transform: 'translateY(-2px)',
                    }
                  : undefined
              }
              aria-pressed={isSelected}
              aria-label={`Vybrat šablonu ${tpl.name}`}
            >
              {/* Thumbnail */}
              <div className="relative">
                <ThumbImage id={tpl.id} name={tpl.name} />

                {/* Selected checkmark */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#fb923c] text-[#0a0a12] flex items-center justify-center shadow-[0_4px_12px_rgba(251,146,60,0.5)]">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}

                {/* PDF format badge */}
                {showFormatBadges && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#fb923c]/90 text-[#0a0a12] text-[10px] font-bold uppercase tracking-wider">
                    PDF
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className={`${compact ? 'p-2.5' : 'p-3'} border-t border-white/[0.04]`}>
                {showColorDots && (
                  <div className="mb-2">
                    <ColorDots colors={tpl.availableColors} compact={compact} />
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-2">
                  <h3
                    className={`text-white font-bold m-0 truncate ${
                      compact ? 'text-sm' : 'text-base'
                    }`}
                  >
                    {tpl.name}
                  </h3>
                </div>
                <p
                  className={`text-white/40 m-0 mt-0.5 truncate ${
                    compact ? 'text-[10px]' : 'text-xs'
                  }`}
                >
                  {tpl.hint}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {visibleTemplates.length === 0 && (
        <div className="text-center py-12 text-white/30 text-sm">
          V této kategorii zatím nejsou žádné šablony.
        </div>
      )}
    </div>
  )
}
