'use client'

import { useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import type { LetterData, LetterFormData } from '@/lib/letter/types'

interface ClosingSectionProps {
  formData: LetterFormData
  onChange: (key: keyof LetterFormData, value: LetterFormData[keyof LetterFormData]) => void
  letterData?: LetterData | null
  onLetterDataChange?: (next: LetterData) => void
  signature?: string | null
  onSignatureChange?: (signature: string | null) => void
}

const inputClass =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fb923c]/40'
const selectClass = inputClass + ' appearance-none cursor-pointer'
const labelClass = 'block text-xs font-medium text-white/60 mb-1.5'
const hintClass = 'mt-1 text-[11px] text-white/35'

const SIGN_OFFS = [
  { value: 'Freundliche Grüsse', label: 'Freundliche Grüsse', swiss: true, hint: 'Švýcarský standard — preferovaný' },
  { value: 'Mit herzlichen Grüssen', label: 'Mit herzlichen Grüssen', swiss: true, hint: 'Přátelštější (Swiss)' },
  { value: 'Mit besten Grüssen', label: 'Mit besten Grüssen', swiss: true, hint: 'Formální (Swiss)' },
  { value: 'Mit freundlichen Grüßen', label: 'Mit freundlichen Grüßen', swiss: false, hint: 'NĚMECKÝ tvar — POZOR ve Švýcarsku' },
  { value: 'Hochachtungsvoll', label: 'Hochachtungsvoll', swiss: true, hint: 'Velmi formální (úřady, právníci)' },
]

const BEILAGEN_OPTIONS = [
  { value: 'lebenslauf', label: 'Lebenslauf' },
  { value: 'diplome', label: 'Diplome' },
  { value: 'arbeitszeugnisse', label: 'Arbeitszeugnisse' },
  { value: 'sprachzertifikate', label: 'Sprachzertifikate' },
  { value: 'fuehrerschein', label: 'Führerschein' },
]

export default function ClosingSection({
  formData,
  onChange: _onChange,
  letterData,
  onLetterDataChange,
  signature,
  onSignatureChange,
}: ClosingSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [beilagen, setBeilagen] = useState<Set<string>>(new Set(['lebenslauf']))

  const signOff = letterData?.body.signOff || 'Freundliche Grüsse'
  const selectedSignOff = SIGN_OFFS.find((s) => s.value === signOff)
  const showSwissWarning = selectedSignOff && !selectedSignOff.swiss

  const handleSignOffChange = (val: string) => {
    if (!letterData || !onLetterDataChange) return
    onLetterDataChange({ ...letterData, body: { ...letterData.body, signOff: val } })
  }

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onSignatureChange) return
    const reader = new FileReader()
    reader.onloadend = () => {
      onSignatureChange(typeof reader.result === 'string' ? reader.result : null)
    }
    reader.readAsDataURL(file)
  }

  const toggleBeilage = (value: string) => {
    setBeilagen((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Závěr & podpis</h2>
        <p className="text-sm text-white/50 mt-1">Pozdrav, jméno a přílohy.</p>
      </div>

      <div>
        <label className={labelClass}>Závěrečný pozdrav</label>
        <select
          value={signOff}
          onChange={(e) => handleSignOffChange(e.target.value)}
          className={selectClass}
        >
          {SIGN_OFFS.map((s) => (
            <option key={s.value} value={s.value} className="bg-[#111120]">
              {s.label} {s.swiss ? '' : '⚠'}
            </option>
          ))}
        </select>
        {selectedSignOff && (
          <p className={hintClass}>{selectedSignOff.hint}</p>
        )}
        {showSwissWarning && (
          <div className="mt-2 flex items-start gap-2 bg-[#dc2626]/[0.08] border border-[#dc2626]/30 rounded-lg p-2.5">
            <AlertTriangle className="w-4 h-4 text-[#f87171] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-white/80 leading-relaxed">
              <span className="font-semibold text-[#f87171]">Pozor:</span> ve Švýcarsku se používá „Grüsse“ (ne „Grüße“). Doporučujeme <span className="font-mono">Freundliche Grüsse</span>.
            </p>
          </div>
        )}
      </div>

      <div>
        <label className={labelClass}>Jméno pod podpisem</label>
        <input
          type="text"
          value={formData.senderFullName || ''}
          disabled
          placeholder="Vyplň v sekci Odesílatel"
          className={inputClass + ' opacity-60 cursor-not-allowed'}
        />
        <p className={hintClass}>Automaticky z pole „Jméno a příjmení“ v sekci Odesílatel</p>
      </div>

      <div>
        <label className={labelClass}>Naskenovaný podpis (volitelné)</label>
        <div className="flex items-center gap-3">
          <div className="h-20 w-40 rounded-xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center overflow-hidden">
            {signature ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={signature} alt="Podpis" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-white/30 text-xs">žádný podpis</span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSignatureUpload}
          />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg bg-white/[0.06] hover:bg-white/[0.12] px-3 py-1.5 text-xs text-white/80 transition"
            >
              {signature ? 'Změnit' : 'Nahrát'}
            </button>
            {signature && onSignatureChange && (
              <button
                type="button"
                onClick={() => onSignatureChange(null)}
                className="text-[11px] text-white/40 hover:text-white/70"
              >
                odebrat
              </button>
            )}
          </div>
        </div>
        <p className={hintClass}>PNG s průhledným pozadím vypadá nejlépe</p>
      </div>

      <div>
        <label className={labelClass}>Přílohy (Beilagen)</label>
        <div className="space-y-2">
          {BEILAGEN_OPTIONS.map((b) => (
            <label
              key={b.value}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] cursor-pointer transition"
            >
              <input
                type="checkbox"
                checked={beilagen.has(b.value)}
                onChange={() => toggleBeilage(b.value)}
                className="w-4 h-4 rounded accent-[#fb923c]"
              />
              <span className="text-sm text-white/80">{b.label}</span>
            </label>
          ))}
        </div>
        <p className={hintClass}>Zobrazí se na konci dopisu pod podpisem</p>
      </div>
    </div>
  )
}
