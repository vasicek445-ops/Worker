'use client'

import type { CVFormData } from '@/lib/cv/types'

interface LanguagesSectionProps {
  formData: CVFormData
  onChange: (key: keyof CVFormData, value: CVFormData[keyof CVFormData]) => void
}

const GERMAN_LEVELS = [
  'Žádná – teprve se učím',
  'Základy (A1)',
  'Základní komunikace (A2)',
  'Dorozumím se (B1)',
  'Dobrá úroveň (B2)',
  'Plynulá (C1/C2)',
]

const inputClass =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fb923c]/40'

const selectClass = inputClass + ' appearance-none cursor-pointer'

const labelClass = 'block text-xs font-medium text-white/60 mb-1.5'

export default function LanguagesSection({ formData, onChange }: LanguagesSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Němčina</label>
        <select
          value={formData.german || ''}
          onChange={(e) => onChange('german', e.target.value)}
          className={selectClass}
        >
          <option value="" className="bg-[#111120]">
            Vyber úroveň
          </option>
          {GERMAN_LEVELS.map((level) => (
            <option key={level} value={level} className="bg-[#111120]">
              {level}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-[11px] text-white/40">
          Buď upřímný — zaměstnavatel ocení reálné zhodnocení.
        </p>
      </div>

      <div>
        <label className={labelClass}>Další jazyky</label>
        <input
          type="text"
          value={formData.other_languages || ''}
          onChange={(e) => onChange('other_languages', e.target.value)}
          placeholder="např. Angličtina B1, Polština rodilý"
          className={inputClass}
        />
        <p className="mt-1.5 text-[11px] text-white/40">
          Odděl jazyky čárkou. Uvedení úrovně (A1-C2) je výhodou.
        </p>
      </div>
    </div>
  )
}
