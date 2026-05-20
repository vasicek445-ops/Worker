'use client'

import type { CVFormData } from '@/lib/cv/types'

interface EducationSectionProps {
  formData: CVFormData
  onChange: (key: keyof CVFormData, value: CVFormData[keyof CVFormData]) => void
}

type Education = NonNullable<CVFormData['educations']>[number]

const inputClass =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fb923c]/40'

const labelClass = 'block text-xs font-medium text-white/60 mb-1.5'

function makeId() {
  return `edu-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function emptyEducation(): Education {
  return { id: makeId(), period: '', school: '', degree: '', location: '' }
}

export default function EducationSection({ formData, onChange }: EducationSectionProps) {
  const educations: Education[] = formData.educations && formData.educations.length > 0
    ? formData.educations
    : [emptyEducation()]

  const updateEducation = (id: string, key: keyof Education, value: string) => {
    const next = educations.map((e) => (e.id === id ? { ...e, [key]: value } : e))
    onChange('educations', next)
  }

  const addEducation = () => {
    onChange('educations', [...educations, emptyEducation()])
  }

  const removeEducation = (id: string) => {
    if (educations.length <= 1) return
    onChange('educations', educations.filter((e) => e.id !== id))
  }

  return (
    <div className="space-y-5">
      {educations.map((edu, index) => (
        <div
          key={edu.id}
          className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Vzdělání {index + 1}
            </h4>
            {educations.length > 1 && (
              <button
                type="button"
                onClick={() => removeEducation(edu.id)}
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
                value={edu.period}
                onChange={(e) => updateEducation(edu.id, 'period', e.target.value)}
                placeholder="2015 – 2019"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Místo</label>
              <input
                type="text"
                value={edu.location || ''}
                onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                placeholder="Brno, CZ"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Škola / Instituce</label>
            <input
              type="text"
              value={edu.school}
              onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
              placeholder="SOU stavební"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Obor / Titul</label>
            <input
              type="text"
              value={edu.degree}
              onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
              placeholder="Zedník, výuční list"
              className={inputClass}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addEducation}
        className="w-full rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] py-3 text-sm text-white/60 transition hover:border-[#fb923c]/40 hover:bg-[#fb923c]/5 hover:text-[#fb923c]"
      >
        + Přidat další vzdělání
      </button>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <label className={labelClass}>Nebo napiš volně</label>
        <textarea
          value={formData.education || ''}
          onChange={(e) => onChange('education', e.target.value)}
          placeholder="SOU stavební, výuční list zedník, 2015-2019, Brno..."
          rows={3}
          className={inputClass + ' resize-y'}
        />
        <p className="mt-1.5 text-[11px] text-white/40">
          Pokud nechceš vyplňovat strukturovaně, napiš to volně.
        </p>
      </div>
    </div>
  )
}
