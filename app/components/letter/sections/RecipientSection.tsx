'use client'

import { Info } from 'lucide-react'
import type { LetterFormData } from '@/lib/letter/types'

interface RecipientSectionProps {
  formData: LetterFormData
  onChange: (key: keyof LetterFormData, value: LetterFormData[keyof LetterFormData]) => void
}

const inputClass =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fb923c]/40'
const labelClass = 'block text-xs font-medium text-white/60 mb-1.5'
const hintClass = 'mt-1 text-[11px] text-white/35'

export default function RecipientSection({ formData, onChange }: RecipientSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Adresát</h2>
        <p className="text-sm text-white/50 mt-1">Komu dopis posíláš.</p>
      </div>

      <div className="flex items-start gap-2 bg-[#fb923c]/[0.06] border border-[#fb923c]/20 rounded-xl p-3">
        <Info className="w-4 h-4 text-[#fb923c] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-white/70 leading-relaxed">
          <span className="font-semibold text-[#fb923c]">Tipy:</span> hledej HR kontakt na LinkedIn / firemním webu — osobní oslovení zvyšuje šanci 2×.
        </p>
      </div>

      <div>
        <label className={labelClass}>
          Firma <span className="text-[#fb923c]">*</span>
        </label>
        <input
          type="text"
          value={formData.recipientCompany || ''}
          onChange={(e) => onChange('recipientCompany', e.target.value)}
          placeholder="Migros AG"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Kontaktní osoba</label>
        <input
          type="text"
          value={formData.recipientContactPerson || ''}
          onChange={(e) => onChange('recipientContactPerson', e.target.value)}
          placeholder="Frau Anna Keller"
          className={inputClass}
        />
        <p className={hintClass}>Pokud znáš jméno — jinak nech prázdné (použije se „Sehr geehrte Damen und Herren“)</p>
      </div>

      <div>
        <label className={labelClass}>Ulice a číslo</label>
        <input
          type="text"
          value={formData.recipientAddress || ''}
          onChange={(e) => onChange('recipientAddress', e.target.value)}
          placeholder="Limmatstrasse 152"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-[120px_1fr] gap-3">
        <div>
          <label className={labelClass}>PSČ</label>
          <input
            type="text"
            value={formData.recipientPostalCode || ''}
            onChange={(e) => onChange('recipientPostalCode', e.target.value)}
            placeholder="8005"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Město</label>
          <input
            type="text"
            value={formData.recipientCity || ''}
            onChange={(e) => onChange('recipientCity', e.target.value)}
            placeholder="Zürich"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  )
}
