import type { ProfileRow } from './types'

export interface CompletenessItem {
  key: keyof ProfileRow
  label: string
  filled: boolean
  section: 'osobni-udaje' | 'kariera' | 'cil'
}

export interface ProfileCompleteness {
  percent: number            // 0-100
  filledCount: number
  totalCount: number
  missing: CompletenessItem[]
  items: CompletenessItem[]
}

// 14 polí — držet sync s `profile_complete` triggerem v DB pokud existuje.
const TRACKED: Array<{ key: keyof ProfileRow; label: string; section: CompletenessItem['section'] }> = [
  { key: 'full_name',          label: 'Jméno',               section: 'osobni-udaje' },
  { key: 'avatar_url',         label: 'Fotka',               section: 'osobni-udaje' },
  { key: 'datum_narozeni',     label: 'Datum narození',      section: 'osobni-udaje' },
  { key: 'telefon',            label: 'Telefon',             section: 'osobni-udaje' },
  { key: 'nationality',        label: 'Národnost',           section: 'osobni-udaje' },
  { key: 'adresa',             label: 'Adresa',              section: 'osobni-udaje' },
  { key: 'obor',               label: 'Obor',                section: 'kariera' },
  { key: 'pozice',             label: 'Cílová pozice',       section: 'kariera' },
  { key: 'nemcina_uroven',     label: 'Úroveň němčiny',      section: 'kariera' },
  { key: 'zkusenosti',         label: 'Pracovní zkušenosti', section: 'kariera' },
  { key: 'vzdelani',           label: 'Vzdělání',            section: 'kariera' },
  { key: 'dovednosti',         label: 'Dovednosti',          section: 'kariera' },
  { key: 'preferovany_kanton', label: 'Preferovaný kanton',  section: 'cil' },
  { key: 'work_permit_status', label: 'Pracovní povolení',   section: 'cil' },
]

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'boolean') return true
  if (typeof value === 'number') return true
  return Boolean(value)
}

export function calculateCompleteness(profile: ProfileRow | null | undefined): ProfileCompleteness {
  const items: CompletenessItem[] = TRACKED.map((t) => ({
    key: t.key,
    label: t.label,
    section: t.section,
    filled: profile ? isFilled(profile[t.key]) : false,
  }))
  const filledCount = items.filter((i) => i.filled).length
  const totalCount = items.length
  const percent = Math.round((filledCount / totalCount) * 100)
  const missing = items.filter((i) => !i.filled)
  return { percent, filledCount, totalCount, missing, items }
}

export type TrackedSection = CompletenessItem['section']

export interface SectionCompleteness {
  percent: number
  filled: number
  total: number
}

export function calculateSectionCompleteness(
  profile: ProfileRow | null | undefined,
  section: TrackedSection,
): SectionCompleteness {
  const inSection = TRACKED.filter((t) => t.section === section)
  const total = inSection.length
  if (total === 0) return { percent: 0, filled: 0, total: 0 }
  const filled = inSection.filter((t) => (profile ? isFilled(profile[t.key]) : false)).length
  const percent = Math.round((filled / total) * 100)
  return { percent, filled, total }
}
