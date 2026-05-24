'use client'

import { useRef } from 'react'
import type { CVFormData } from '@/lib/cv/types'
import WheelDatePicker from '../WheelDatePicker'

interface BasicsSectionProps {
  formData: CVFormData
  onChange: (key: keyof CVFormData, value: CVFormData[keyof CVFormData]) => void
  photo: string | null
  onPhotoChange: (photo: string | null) => void
}

// Sjednoceno s Wooky NATIONALITIES — adjektivum (matchuje profile.nationality).
const NATIONALITIES = [
  'Česká',
  'Slovenská',
  'Polská',
  'Ukrajinská',
  'Rumunská',
  'Bulharská',
  'Maďarská',
  'Chorvatská',
  'Srbská',
  'Italská',
  'Portugalská',
  'Španělská',
  'Albánská',
  'Severomakedonská',
  'Bosna a Hercegovina',
  'Turecká',
  'Vietnamská',
  'Filipínská',
  'Jiná',
]

const inputClass =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fb923c]/40'

const selectClass = inputClass + ' appearance-none cursor-pointer'

const labelClass = 'block text-xs font-medium text-white/60 mb-1.5'

export default function BasicsSection({ formData, onChange, photo, onPhotoChange }: BasicsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      onPhotoChange(typeof reader.result === 'string' ? reader.result : null)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-2">
          <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
            {photo ? (
              <img src={photo} alt="Profilová fotka" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/30 text-xs">
                bez fotky
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/[0.12]"
          >
            {photo ? 'Změnit' : 'Nahrát'}
          </button>
          {photo && (
            <button
              type="button"
              onClick={() => onPhotoChange(null)}
              className="text-[11px] text-white/40 hover:text-white/70"
            >
              odebrat
            </button>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <label className={labelClass}>Jméno a příjmení</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Jan Novák"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Datum narození</label>
            <WheelDatePicker
              value={formData.birthdate || ''}
              onChange={(val) => onChange('birthdate', val)}
              locale="cs"
              outputFormat="eu"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Telefon</label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="+41 79 123 45 67"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>E-mail</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="jan.novak@email.cz"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Národnost</label>
        <select
          value={formData.nationality || ''}
          onChange={(e) => onChange('nationality', e.target.value)}
          className={selectClass}
        >
          <option value="" className="bg-[#111120]">
            Vyber národnost
          </option>
          {NATIONALITIES.map((n) => (
            <option key={n} value={n} className="bg-[#111120]">
              {n}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Adresa</label>
        <input
          type="text"
          value={formData.address || ''}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="Hauptstrasse 12, 8000 Zürich"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Řidičský průkaz</label>
        <input
          type="text"
          value={formData.driving || ''}
          onChange={(e) => onChange('driving', e.target.value)}
          placeholder="např. B, C, vlastní auto"
          className={inputClass}
        />
      </div>
    </div>
  )
}
