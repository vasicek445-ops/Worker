'use client'

import type { LetterFormData } from '@/lib/letter/types'

interface SenderSectionProps {
  formData: LetterFormData
  onChange: (key: keyof LetterFormData, value: LetterFormData[keyof LetterFormData]) => void
}

const inputClass =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fb923c]/40'
const labelClass = 'block text-xs font-medium text-white/60 mb-1.5'
const hintClass = 'mt-1 text-[11px] text-white/35'

export default function SenderSection({ formData, onChange }: SenderSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Odesílatel</h2>
        <p className="text-sm text-white/50 mt-1">Tvoje kontaktní údaje pro hlavičku dopisu.</p>
      </div>

      <div>
        <label className={labelClass}>Jméno a příjmení</label>
        <input
          type="text"
          value={formData.senderFullName || ''}
          onChange={(e) => onChange('senderFullName', e.target.value)}
          placeholder="Jan Novák"
          className={inputClass}
        />
        <p className={hintClass}>Z profilu se předvyplní automaticky</p>
      </div>

      <div>
        <label className={labelClass}>Ulice a číslo</label>
        <input
          type="text"
          value={formData.senderAddress || ''}
          onChange={(e) => onChange('senderAddress', e.target.value)}
          placeholder="Hauptstrasse 12"
          className={inputClass}
        />
        <p className={hintClass}>Z profilu se předvyplní automaticky</p>
      </div>

      <div className="grid grid-cols-[120px_1fr] gap-3">
        <div>
          <label className={labelClass}>PSČ</label>
          <input
            type="text"
            value={formData.senderPostalCode || ''}
            onChange={(e) => onChange('senderPostalCode', e.target.value)}
            placeholder="8000"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Město</label>
          <input
            type="text"
            value={formData.senderCity || ''}
            onChange={(e) => onChange('senderCity', e.target.value)}
            placeholder="Zürich"
            className={inputClass}
          />
        </div>
      </div>
      <p className={hintClass}>Z profilu se předvyplní automaticky</p>

      <div>
        <label className={labelClass}>Telefon</label>
        <input
          type="tel"
          value={formData.senderPhone || ''}
          onChange={(e) => onChange('senderPhone', e.target.value)}
          placeholder="+41 79 123 45 67"
          className={inputClass}
        />
        <p className={hintClass}>Z profilu se předvyplní automaticky</p>
      </div>

      <div>
        <label className={labelClass}>E-mail</label>
        <input
          type="email"
          value={formData.senderEmail || ''}
          onChange={(e) => onChange('senderEmail', e.target.value)}
          placeholder="jan.novak@email.cz"
          className={inputClass}
        />
        <p className={hintClass}>Z profilu se předvyplní automaticky</p>
      </div>
    </div>
  )
}
