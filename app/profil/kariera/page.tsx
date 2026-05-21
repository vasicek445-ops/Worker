'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useProfileShell } from '../_components/ProfileShell'
import type { ProfileExperience, ProfileEducation, ProfileLanguage } from '@/lib/profile/types'

// Top languages relevantni pro CH labor market + CZ/SK speakers
const LANGUAGES = [
  'Angličtina',
  'Italština',
  'Francouzština',
  'Polština',
  'Maďarština',
  'Rumunština',
  'Ukrajinština',
  'Ruština',
  'Španělština',
  'Portugalština',
  'Chorvatština',
  'Srbština',
  'Bulharština',
  'Albánština',
  'Turečtina',
  'Slovenština',
  'Čeština',
  'Jiný',
] as const

const LANG_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Mateřský'] as const

const FIELDS = [
  'Gastronomie',
  'Stavebnictví',
  'Logistika a sklad',
  'Úklid',
  'Zdravotnictví a péče',
  'Výroba a montáž',
  'Řidič',
  'Zemědělství',
  'Hotelnictví',
  'Jiné',
]

const NEMCINA_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const inputClass =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fb923c]/40'
const labelClass = 'block text-white/60 text-xs font-medium mb-1.5'
const hintClass = 'text-white/30 text-xs mt-1'

export default function KarieraPage() {
  const { profile, loading, update, saving, savedAt } = useProfileShell()

  const saveStatus = saving ? 'Ukládám…' : savedAt ? 'Uloženo' : ''

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#fb923c] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <div className="max-w-[640px] mx-auto px-5 py-8">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white m-0">Kariéra</h1>
            <p className="text-white/40 text-sm mt-1">Co umíš a kde jsi pracoval. AI to rozšíří do CV — piš stručně, body stačí.</p>
          </div>
          {saveStatus && (
            <span className="text-[11px] text-white/40 mt-1 whitespace-nowrap">{saveStatus}</span>
          )}
        </header>

        <div className="bg-[#111120] rounded-2xl border border-white/[0.06] p-5 space-y-4">
          <div>
            <label className={labelClass}>Obor</label>
            <select
              value={profile?.obor || ''}
              onChange={(e) => update({ obor: e.target.value })}
              className={inputClass + ' appearance-none cursor-pointer'}
            >
              <option value="" disabled className="bg-[#111120]">Vyber obor</option>
              {FIELDS.map((f) => (
                <option key={f} value={f} className="bg-[#111120]">{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Pozice</label>
            <input
              type="text"
              value={profile?.pozice || ''}
              onChange={(e) => update({ pozice: e.target.value })}
              className={inputClass}
              placeholder="Kuchař, zedník, řidič C+E…"
            />
            <p className={hintClass}>Konkrétní pozice, kterou hledáš.</p>
          </div>

          <div>
            <label className={labelClass}>Úroveň němčiny</label>
            <select
              value={profile?.nemcina_uroven || ''}
              onChange={(e) => update({ nemcina_uroven: e.target.value })}
              className={inputClass + ' appearance-none cursor-pointer'}
            >
              <option value="" disabled className="bg-[#111120]">Vyber úroveň</option>
              {NEMCINA_LEVELS.map((l) => (
                <option key={l} value={l} className="bg-[#111120]">{l}</option>
              ))}
            </select>
            <p className={hintClass}>A1 = začátečník, C2 = rodilý mluvčí.</p>
          </div>

          <LanguageList
            languages={profile?.dalsi_jazyky_struct || []}
            legacyText={profile?.dalsi_jazyky || ''}
            onChange={(dalsi_jazyky_struct) => update({ dalsi_jazyky_struct })}
          />

          <ExperienceList
            experiences={profile?.experiences || []}
            legacyText={profile?.zkusenosti || ''}
            onChange={(experiences) => update({ experiences })}
          />

          <EducationList
            educations={profile?.educations || []}
            legacyText={profile?.vzdelani || ''}
            onChange={(educations) => update({ educations })}
          />

          <div>
            <label className={labelClass}>Dovednosti</label>
            <textarea
              rows={3}
              value={profile?.dovednosti || ''}
              onChange={(e) => update({ dovednosti: e.target.value })}
              className={inputClass + ' resize-y'}
              placeholder="Řízení kuchyně, HACCP, práce pod tlakem, vlastní receptury…"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Multi-row pracovni zkusenosti ─────────────────────────────────────────
function ExperienceList({
  experiences,
  legacyText,
  onChange,
}: {
  experiences: ProfileExperience[]
  legacyText: string
  onChange: (next: ProfileExperience[]) => void
}) {
  const updateRow = (i: number, patch: Partial<ProfileExperience>) => {
    onChange(experiences.map((e, idx) => (idx === i ? { ...e, ...patch } : e)))
  }
  const removeRow = (i: number) => onChange(experiences.filter((_, idx) => idx !== i))
  const addRow = () =>
    onChange([
      ...experiences,
      { period: '', title: '', company: '', location: '', description: '' },
    ])

  return (
    <div>
      <label className={labelClass}>Pracovní zkušenosti</label>

      {experiences.length === 0 && legacyText && (
        <div className="mb-3 rounded-xl bg-[#fb923c]/5 border border-[#fb923c]/15 p-3 text-xs text-white/60">
          <p className="m-0 mb-1.5 font-medium text-[#fb923c]/80">Máš stará data v textovém formátu:</p>
          <p className="m-0 whitespace-pre-line text-white/40">{legacyText}</p>
          <p className="m-0 mt-2 text-white/30">Přidej řádky níže pro nový formát — staré se použije jako fallback.</p>
        </div>
      )}

      <div className="space-y-3">
        {experiences.map((exp, i) => (
          <div
            key={i}
            className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 space-y-2.5 relative"
          >
            <button
              onClick={() => removeRow(i)}
              aria-label="Odstranit zkušenost"
              className="absolute top-2 right-2 text-white/30 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-red-500/10"
            >
              <Trash2 size={14} />
            </button>

            <div className="grid grid-cols-2 gap-2.5 pr-8">
              <input
                type="text"
                value={exp.period || ''}
                onChange={(e) => updateRow(i, { period: e.target.value })}
                className={inputClass}
                placeholder="2020 – 2024"
              />
              <input
                type="text"
                value={exp.title || ''}
                onChange={(e) => updateRow(i, { title: e.target.value })}
                className={inputClass}
                placeholder="Pozice (Kuchař)"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="text"
                value={exp.company || ''}
                onChange={(e) => updateRow(i, { company: e.target.value })}
                className={inputClass}
                placeholder="Firma"
              />
              <input
                type="text"
                value={exp.location || ''}
                onChange={(e) => updateRow(i, { location: e.target.value })}
                className={inputClass}
                placeholder="Místo (Praha)"
              />
            </div>
            <textarea
              rows={2}
              value={exp.description || ''}
              onChange={(e) => updateRow(i, { description: e.target.value })}
              className={inputClass + ' resize-y'}
              placeholder="Co jsi tam dělal — body stačí, AI rozšíří"
            />
          </div>
        ))}
      </div>

      <button
        onClick={addRow}
        className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 hover:border-[#fb923c]/40 hover:bg-[#fb923c]/[0.04] text-white/50 hover:text-[#fb923c] text-sm font-medium py-2.5 transition"
      >
        <Plus size={16} />
        {experiences.length === 0 ? 'Přidat první zkušenost' : 'Přidat další zkušenost'}
      </button>
      <p className={hintClass}>Většina lidí má 2 firmy. Roky, pozici a firmu uveď, popis je nepovinný — AI to rozšíří.</p>
    </div>
  )
}

// ─── Multi-row vzdelani ───────────────────────────────────────────────────
function EducationList({
  educations,
  legacyText,
  onChange,
}: {
  educations: ProfileEducation[]
  legacyText: string
  onChange: (next: ProfileEducation[]) => void
}) {
  const updateRow = (i: number, patch: Partial<ProfileEducation>) => {
    onChange(educations.map((e, idx) => (idx === i ? { ...e, ...patch } : e)))
  }
  const removeRow = (i: number) => onChange(educations.filter((_, idx) => idx !== i))
  const addRow = () =>
    onChange([
      ...educations,
      { period: '', school: '', degree: '', location: '' },
    ])

  return (
    <div>
      <label className={labelClass}>Vzdělání</label>

      {educations.length === 0 && legacyText && (
        <div className="mb-3 rounded-xl bg-[#fb923c]/5 border border-[#fb923c]/15 p-3 text-xs text-white/60">
          <p className="m-0 mb-1.5 font-medium text-[#fb923c]/80">Máš stará data v textovém formátu:</p>
          <p className="m-0 whitespace-pre-line text-white/40">{legacyText}</p>
          <p className="m-0 mt-2 text-white/30">Přidej řádky níže pro nový formát — staré se použije jako fallback.</p>
        </div>
      )}

      <div className="space-y-3">
        {educations.map((edu, i) => (
          <div
            key={i}
            className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 space-y-2.5 relative"
          >
            <button
              onClick={() => removeRow(i)}
              aria-label="Odstranit vzdělání"
              className="absolute top-2 right-2 text-white/30 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-red-500/10"
            >
              <Trash2 size={14} />
            </button>

            <div className="grid grid-cols-2 gap-2.5 pr-8">
              <input
                type="text"
                value={edu.period || ''}
                onChange={(e) => updateRow(i, { period: e.target.value })}
                className={inputClass}
                placeholder="2014 – 2017"
              />
              <input
                type="text"
                value={edu.school || ''}
                onChange={(e) => updateRow(i, { school: e.target.value })}
                className={inputClass}
                placeholder="Škola (SOU gastro)"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="text"
                value={edu.degree || ''}
                onChange={(e) => updateRow(i, { degree: e.target.value })}
                className={inputClass}
                placeholder="Obor / titul"
              />
              <input
                type="text"
                value={edu.location || ''}
                onChange={(e) => updateRow(i, { location: e.target.value })}
                className={inputClass}
                placeholder="Místo (Praha)"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addRow}
        className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 hover:border-[#fb923c]/40 hover:bg-[#fb923c]/[0.04] text-white/50 hover:text-[#fb923c] text-sm font-medium py-2.5 transition"
      >
        <Plus size={16} />
        {educations.length === 0 ? 'Přidat školu/kurz' : 'Přidat další'}
      </button>
    </div>
  )
}

// ─── Multi-row dalsi jazyky (mimo nemciny) ──────────────────────────────────
function LanguageList({
  languages,
  legacyText,
  onChange,
}: {
  languages: ProfileLanguage[]
  legacyText: string
  onChange: (next: ProfileLanguage[]) => void
}) {
  const updateRow = (i: number, patch: Partial<ProfileLanguage>) => {
    onChange(languages.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
  }
  const removeRow = (i: number) => onChange(languages.filter((_, idx) => idx !== i))
  const addRow = () => onChange([...languages, { language: '', level: 'B1' }])

  // Jazyky uz pridane v predchozich radcich vyfiltrujeme z dropdownu aby
  // nevytvarel duplicate (kromé sve vlastni hodnoty pro tento radek).
  const usedLanguages = new Set(languages.map((l) => l.language).filter(Boolean))

  return (
    <div>
      <label className={labelClass}>Další jazyky</label>

      {languages.length === 0 && legacyText && (
        <div className="mb-3 rounded-xl bg-[#fb923c]/5 border border-[#fb923c]/15 p-3 text-xs text-white/60">
          <p className="m-0 mb-1.5 font-medium text-[#fb923c]/80">Máš stará data v textovém formátu:</p>
          <p className="m-0 whitespace-pre-line text-white/40">{legacyText}</p>
          <p className="m-0 mt-2 text-white/30">Přidej jazyky níže pro nový formát — staré se použije jako fallback.</p>
        </div>
      )}

      <div className="space-y-2.5">
        {languages.map((lang, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <select
              value={lang.language || ''}
              onChange={(e) => updateRow(i, { language: e.target.value })}
              className={inputClass + ' appearance-none cursor-pointer flex-1'}
            >
              <option value="" disabled className="bg-[#111120]">Vyber jazyk</option>
              {LANGUAGES.filter((l) => l === lang.language || !usedLanguages.has(l)).map((l) => (
                <option key={l} value={l} className="bg-[#111120]">{l}</option>
              ))}
            </select>
            <select
              value={lang.level || 'B1'}
              onChange={(e) => updateRow(i, { level: e.target.value })}
              className={inputClass + ' appearance-none cursor-pointer w-32 flex-shrink-0'}
            >
              {LANG_LEVELS.map((l) => (
                <option key={l} value={l} className="bg-[#111120]">{l}</option>
              ))}
            </select>
            <button
              onClick={() => removeRow(i)}
              aria-label="Odstranit jazyk"
              className="text-white/30 hover:text-red-400 transition p-2 rounded-lg hover:bg-red-500/10 flex-shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addRow}
        className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 hover:border-[#fb923c]/40 hover:bg-[#fb923c]/[0.04] text-white/50 hover:text-[#fb923c] text-sm font-medium py-2.5 transition"
      >
        <Plus size={16} />
        {languages.length === 0 ? 'Přidat jazyk' : 'Přidat další jazyk'}
      </button>
      <p className={hintClass}>Vyber jazyk + úroveň. Němčina se vyplňuje výše zvlášť.</p>
    </div>
  )
}
