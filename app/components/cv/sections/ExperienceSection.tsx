'use client'

import { useState } from 'react'
import type { CVFormData } from '@/lib/cv/types'
import PhrasePicker from './PhrasePicker'

interface ExperienceSectionProps {
  formData: CVFormData
  onChange: (key: keyof CVFormData, value: CVFormData[keyof CVFormData]) => void
}

type Experience = NonNullable<CVFormData['experiences']>[number]

const inputClass =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fb923c]/40'

const labelClass = 'block text-xs font-medium text-white/60 mb-1.5'

function makeId() {
  return `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function emptyExperience(): Experience {
  return { id: makeId(), period: '', title: '', company: '', location: '', description: '' }
}

export default function ExperienceSection({ formData, onChange }: ExperienceSectionProps) {
  const experiences: Experience[] = formData.experiences && formData.experiences.length > 0
    ? formData.experiences
    : [emptyExperience()]

  const [openPickerId, setOpenPickerId] = useState<string | null>(null)

  const updateExperience = (id: string, key: keyof Experience, value: string) => {
    const next = experiences.map((e) => (e.id === id ? { ...e, [key]: value } : e))
    onChange('experiences', next)
  }

  const addExperience = () => {
    onChange('experiences', [...experiences, emptyExperience()])
  }

  const removeExperience = (id: string) => {
    if (experiences.length <= 1) return
    onChange('experiences', experiences.filter((e) => e.id !== id))
  }

  const insertPhrase = (id: string, deText: string) => {
    const current = experiences.find((e) => e.id === id)
    const existing = current?.description || ''
    const sep = existing && !existing.endsWith('\n') ? '\n' : ''
    updateExperience(id, 'description', existing + sep + '• ' + deText)
  }

  return (
    <div className="space-y-5">
      {experiences.map((exp, index) => (
        <div
          key={exp.id}
          className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Pozice {index + 1}
            </h4>
            {experiences.length > 1 && (
              <button
                type="button"
                onClick={() => removeExperience(exp.id)}
                className="text-xs text-white/40 transition hover:text-red-400"
              >
                🗑 Smazat
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Období</label>
              <input
                type="text"
                value={exp.period}
                onChange={(e) => updateExperience(exp.id, 'period', e.target.value)}
                placeholder="2022 – 2024"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Místo</label>
              <input
                type="text"
                value={exp.location || ''}
                onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                placeholder="Zürich, CH"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Pozice / Profese</label>
            <input
              type="text"
              value={exp.title}
              onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
              placeholder="Maurer / Koch / Lagerist"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Firma / Zaměstnavatel</label>
            <input
              type="text"
              value={exp.company}
              onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
              placeholder="Implenia AG"
              className={inputClass}
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className={labelClass + ' !mb-0'}>Popis činnosti</label>
              <button
                type="button"
                onClick={() => setOpenPickerId(openPickerId === exp.id ? null : exp.id)}
                className="rounded-lg bg-[#fb923c]/15 px-2.5 py-1 text-xs font-medium text-[#fb923c] transition hover:bg-[#fb923c]/25"
              >
                💡 Vlož frázi
              </button>
            </div>
            <textarea
              value={exp.description || ''}
              onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
              placeholder="• Rohbau von Einfamilienhäusern&#10;• Bedienung Turmdrehkran&#10;..."
              rows={5}
              className={inputClass + ' resize-y'}
            />
            {openPickerId === exp.id && (
              <div className="mt-2">
                <PhrasePicker
                  field={formData.field}
                  onInsert={(de) => insertPhrase(exp.id, de)}
                  onClose={() => setOpenPickerId(null)}
                />
              </div>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addExperience}
        className="w-full rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] py-3 text-sm text-white/60 transition hover:border-[#fb923c]/40 hover:bg-[#fb923c]/5 hover:text-[#fb923c]"
      >
        + Přidat další pozici
      </button>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <label className={labelClass}>
          Nebo napiš volně, AI rozšíří
        </label>
        <textarea
          value={formData.experience_detail || ''}
          onChange={(e) => onChange('experience_detail', e.target.value)}
          placeholder="Pracoval jsem 5 let na stavbě v Německu, dělal jsem hrubé stavby, mám certifikát na jeřáb, vyznám se ve čtení plánů..."
          rows={4}
          className={inputClass + ' resize-y'}
        />
        <p className="mt-1.5 text-[11px] text-white/40">
          Pokud nechceš vyplňovat strukturovaně, napiš popis volně. AI z toho udělá CV.
        </p>
      </div>
    </div>
  )
}
