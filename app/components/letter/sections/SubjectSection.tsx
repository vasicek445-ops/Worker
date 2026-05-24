'use client'

import { Sparkles } from 'lucide-react'
import type { LetterFormData } from '@/lib/letter/types'

interface SubjectSectionProps {
  formData: LetterFormData
  onChange: (key: keyof LetterFormData, value: LetterFormData[keyof LetterFormData]) => void
}

const inputClass =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fb923c]/40'
const selectClass = inputClass + ' appearance-none cursor-pointer'
const textareaClass = inputClass + ' min-h-[120px] resize-y'
const labelClass = 'block text-xs font-medium text-white/60 mb-1.5'
const hintClass = 'mt-1 text-[11px] text-white/35'

const JOB_SOURCES = [
  { value: '', label: 'Vyber zdroj inzerátu' },
  { value: 'jobs.ch', label: 'jobs.ch' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'michaelpage', label: 'Michael Page' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'initiativbewerbung', label: 'Initiativbewerbung (bez inzerátu)' },
]

function todayISO(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function SubjectSection({ formData, onChange }: SubjectSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Pozice & věc</h2>
        <p className="text-sm text-white/50 mt-1">Na jakou pozici se hlásíš.</p>
      </div>

      <div>
        <label className={labelClass}>Pozice</label>
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-sm whitespace-nowrap">Bewerbung als</span>
          <input
            type="text"
            value={formData.jobTitle || ''}
            onChange={(e) => onChange('jobTitle', e.target.value)}
            placeholder="Lagermitarbeiter"
            className={inputClass}
          />
        </div>
        <p className={hintClass}>Bude v Betreff (předmětu) dopisu</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Reference / ID inzerátu</label>
          <input
            type="text"
            value={formData.jobReference || ''}
            onChange={(e) => onChange('jobReference', e.target.value)}
            placeholder="REF-2026-042"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Zdroj inzerátu</label>
          <select
            value={formData.jobSource || ''}
            onChange={(e) => onChange('jobSource', e.target.value)}
            className={selectClass}
          >
            {JOB_SOURCES.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#111120]">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#fb923c]" />
            Text inzerátu
          </span>
        </label>
        <textarea
          value={formData.jobDescription || ''}
          onChange={(e) => onChange('jobDescription', e.target.value)}
          placeholder="Vlož sem celý text inzerátu — AI ho přečte a napíše dopis přesně na míru."
          className={textareaClass}
        />
        <p className={hintClass}>AI bude číst tento text pro lepší dopis</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Místo</label>
          <input
            type="text"
            value={formData.place || ''}
            onChange={(e) => onChange('place', e.target.value)}
            placeholder="Zürich"
            className={inputClass}
          />
          <p className={hintClass}>Z profilu (město)</p>
        </div>
        <div>
          <label className={labelClass}>Datum</label>
          <input
            type="date"
            value={formData.date || todayISO()}
            onChange={(e) => onChange('date', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  )
}
