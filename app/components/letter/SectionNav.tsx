'use client'

import { User, Building2, FileText, Type, Signature, Palette } from 'lucide-react'
import { LETTER_SECTIONS } from '@/lib/letter/types'
import type { LetterSectionId } from '@/lib/letter/types'

interface SectionNavProps {
  active: LetterSectionId
  onSelect: (id: LetterSectionId) => void
  completedSections?: Set<LetterSectionId>
}

const ICONS: Record<LetterSectionId, React.ComponentType<{ className?: string }>> = {
  sender: User,
  recipient: Building2,
  subject: FileText,
  body: Type,
  closing: Signature,
  design: Palette,
}

export default function SectionNav({ active, onSelect, completedSections }: SectionNavProps) {
  return (
    <>
      {/* Desktop: vertical sidebar 64px */}
      <nav className="hidden lg:flex flex-col w-16 bg-[#0a0a12] border-r border-white/[0.05] py-4 gap-1 flex-shrink-0">
        {LETTER_SECTIONS.map((s) => {
          const Icon = ICONS[s.id]
          const isActive = active === s.id
          const isDone = completedSections?.has(s.id)
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              title={s.label}
              className={`relative mx-2 h-12 rounded-xl flex items-center justify-center transition-all group ${
                isActive
                  ? 'bg-[#fb923c]/15 border border-[#fb923c]/40 text-[#fb923c]'
                  : 'text-white/60 hover:bg-white/[0.04] hover:text-white/90'
              }`}
            >
              <Icon className="w-5 h-5" />
              {isDone && !isActive && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#22c55e] border-2 border-[#0a0a12]" />
              )}
              {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-[#fb923c]" />}
              <span className="absolute left-full ml-3 px-2 py-1 rounded-md bg-[#1f1f2e] text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 text-white/80">
                {s.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Mobile: horizontal scroll tabs */}
      <nav className="lg:hidden sticky top-[57px] z-30 bg-[#0a0a12] border-b border-white/[0.05] overflow-x-auto">
        <div className="flex gap-1 px-3 py-2 min-w-max">
          {LETTER_SECTIONS.map((s) => {
            const Icon = ICONS[s.id]
            const isActive = active === s.id
            const isDone = completedSections?.has(s.id)
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#fb923c]/15 text-[#fb923c] border border-[#fb923c]/30'
                    : 'text-white/50 border border-white/[0.06] hover:text-white/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{s.label}</span>
                {isDone && !isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
