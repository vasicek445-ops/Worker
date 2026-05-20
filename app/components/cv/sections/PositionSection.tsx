'use client'

import type { CVFormData } from '@/lib/cv/types'

interface PositionSectionProps {
  formData: CVFormData
  onChange: (key: keyof CVFormData, value: CVFormData[keyof CVFormData]) => void
}

const FIELDS = [
  'Stavebnictví',
  'Gastronomie / Hotelnictví',
  'Logistika / Sklad',
  'Zdravotnictví',
  'Úklid / Údržba',
  'Strojírenství / Technik',
  'IT / Software',
  'Elektro / Instalatér',
  'Řidič / Doprava',
  'Jiný obor',
]

const inputClass =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fb923c]/40'

const selectClass = inputClass + ' appearance-none cursor-pointer'

const labelClass = 'block text-xs font-medium text-white/60 mb-1.5'

export default function PositionSection({ formData, onChange }: PositionSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>O jakou pozici máš zájem?</label>
        <input
          type="text"
          value={formData.position || ''}
          onChange={(e) => onChange('position', e.target.value)}
          placeholder="např. Maurer, Koch, Lagerist, Reinigungskraft"
          className={inputClass}
        />
        <p className="mt-1.5 text-[11px] text-white/40">
          Napiš název pozice klidně německy — pomůže to zaměstnavateli i AI.
        </p>
      </div>

      <div>
        <label className={labelClass}>Obor</label>
        <select
          value={formData.field || ''}
          onChange={(e) => onChange('field', e.target.value)}
          className={selectClass}
        >
          <option value="" className="bg-[#111120]">
            Vyber obor
          </option>
          {FIELDS.map((f) => (
            <option key={f} value={f} className="bg-[#111120]">
              {f}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-[11px] text-white/40">
          Obor odemkne připravené německé fráze v sekci „Praxe&quot; a „Dovednosti&quot;.
        </p>
      </div>
    </div>
  )
}
