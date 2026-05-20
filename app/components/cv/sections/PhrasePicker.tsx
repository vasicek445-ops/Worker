'use client'

import { useState } from 'react'
import { getPhrasesForField, type Phrase } from '@/lib/cv/phrases-de'

interface PhrasePickerProps {
  field?: string
  onInsert: (deText: string) => void
  onClose?: () => void
}

const CATEGORY_LABEL: Record<Phrase['category'], string> = {
  task: 'Úkoly',
  achievement: 'Úspěchy',
  'soft-skill': 'Soft skills',
}

export default function PhrasePicker({ field, onInsert, onClose }: PhrasePickerProps) {
  const phrases = getPhrasesForField(field)
  const [filter, setFilter] = useState<Phrase['category'] | 'all'>('all')

  if (!field) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-white/60">
        Nejdřív vyber obor v sekci „Pozice&quot;.
      </div>
    )
  }

  if (phrases.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-white/60">
        Pro obor <span className="text-white/80">{field}</span> zatím nemáme připravené fráze. Napiš popis volně níže.
      </div>
    )
  }

  const filtered = filter === 'all' ? phrases : phrases.filter((p) => p.category === filter)

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0f0f1c] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'task', 'achievement', 'soft-skill'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`rounded-lg px-2.5 py-1 text-xs transition ${
                filter === cat
                  ? 'bg-[#fb923c] text-black'
                  : 'bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white/90'
              }`}
            >
              {cat === 'all' ? 'Vše' : CATEGORY_LABEL[cat]}
            </button>
          ))}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-white/40 hover:text-white/80"
          >
            zavřít
          </button>
        )}
      </div>

      <div className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
        {filtered.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onInsert(p.de)}
            className="group grid w-full grid-cols-2 gap-3 rounded-lg border border-transparent bg-white/[0.02] px-3 py-2 text-left transition hover:border-[#fb923c]/30 hover:bg-white/[0.05]"
          >
            <div className="text-xs text-white/50 group-hover:text-white/70">{p.cs}</div>
            <div className="text-xs font-semibold text-white group-hover:text-[#fb923c]">{p.de}</div>
          </button>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-white/40">
        Klikni na frázi a vloží se do popisu jako německý text.
      </p>
    </div>
  )
}
