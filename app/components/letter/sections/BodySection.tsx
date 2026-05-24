'use client'

import { Sparkles } from 'lucide-react'
import type { LetterData, LetterFormData, LetterParagraph } from '@/lib/letter/types'

interface BodySectionProps {
  formData: LetterFormData
  onChange: (key: keyof LetterFormData, value: LetterFormData[keyof LetterFormData]) => void
  letterData?: LetterData | null
  onLetterDataChange?: (next: LetterData) => void
  onGenerate?: () => void
  generating?: boolean
}

const inputClass =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fb923c]/40'
const textareaClass = inputClass + ' min-h-[100px] resize-y'
const labelClass = 'block text-xs font-medium text-white/60 mb-1.5'
const hintClass = 'mt-1 text-[11px] text-white/35'

const PARAGRAPH_LABELS: Record<LetterParagraph['type'], string> = {
  motivation: 'Motivace',
  experience: 'Zkušenosti',
  skills: 'Dovednosti',
  closing: 'Závěr',
  custom: 'Vlastní',
}

export default function BodySection({
  formData,
  onChange,
  letterData,
  onLetterDataChange,
  onGenerate,
  generating,
}: BodySectionProps) {
  const updateParagraph = (id: string, text: string) => {
    if (!letterData || !onLetterDataChange) return
    onLetterDataChange({
      ...letterData,
      body: {
        ...letterData.body,
        paragraphs: letterData.body.paragraphs.map((p) => (p.id === id ? { ...p, text } : p)),
      },
    })
  }

  const updateOpening = (text: string) => {
    if (!letterData || !onLetterDataChange) return
    onLetterDataChange({ ...letterData, body: { ...letterData.body, opening: text } })
  }

  const updateSignOff = (text: string) => {
    if (!letterData || !onLetterDataChange) return
    onLetterDataChange({ ...letterData, body: { ...letterData.body, signOff: text } })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Tělo dopisu</h2>
        <p className="text-sm text-white/50 mt-1">Hlavní text. AI ti pomůže s formulací.</p>
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={generating}
        className="w-full bg-gradient-to-r from-[#fb923c] to-[#f97316] hover:from-[#f97316] hover:to-[#ea580c] disabled:opacity-50 text-[#0a0a12] font-bold text-sm px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-[#fb923c]/20"
      >
        <Sparkles className="w-4 h-4" />
        {generating ? 'Generuji…' : 'Vygenerovat AI dopis'}
      </button>

      <div>
        <label className={labelClass}>Tvoje osobní motivace</label>
        <textarea
          value={formData.motivation || ''}
          onChange={(e) => onChange('motivation', e.target.value)}
          placeholder="Proč právě tahle firma? Co tě na pozici láká? Něco osobního — AI z toho udělá silný úvod."
          className={textareaClass}
        />
        <p className={hintClass}>2-3 věty stačí. AI tohle rozšíří do plnohodnotného paragraph.</p>
      </div>

      {letterData && (
        <div className="space-y-4 pt-4 border-t border-white/[0.05]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#fb923c]" />
            <span className="text-sm font-semibold text-white">Vygenerovaný dopis</span>
            <span className="text-[11px] text-white/40">— uprav podle sebe</span>
          </div>

          <div>
            <label className={labelClass}>Oslovení</label>
            <input
              type="text"
              value={letterData.body.opening}
              onChange={(e) => updateOpening(e.target.value)}
              className={inputClass}
            />
          </div>

          {letterData.body.paragraphs.map((p, idx) => (
            <div key={p.id}>
              <label className={labelClass}>
                {idx + 1}. {PARAGRAPH_LABELS[p.type] || 'Paragraph'}
              </label>
              <textarea
                value={p.text}
                onChange={(e) => updateParagraph(p.id, e.target.value)}
                className={textareaClass}
              />
            </div>
          ))}

          <div>
            <label className={labelClass}>Závěrečný pozdrav</label>
            <input
              type="text"
              value={letterData.body.signOff}
              onChange={(e) => updateSignOff(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      )}
    </div>
  )
}
