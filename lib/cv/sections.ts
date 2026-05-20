import type { SectionId, SectionMeta } from './types'

// Sekce v editoru — pořadí v SectionNav + Next button flow.
// "design" je speciální — neukazuje formulářovou sekci, ale Customize panel.
export const SECTIONS: SectionMeta[] = [
  { id: 'basics',     label: 'Základ',     icon: '👤' },
  { id: 'position',   label: 'Pozice',     icon: '💼' },
  { id: 'experience', label: 'Práce',      icon: '🎓' },
  { id: 'education',  label: 'Vzdělání',   icon: '🎓' },
  { id: 'languages',  label: 'Jazyky',     icon: '🗣' },
  { id: 'skills',     label: 'Dovednosti', icon: '⭐' },
  { id: 'design',     label: 'Vzhled',     icon: '🎨' },
]

export function getNextSection(current: SectionId): SectionId | null {
  const idx = SECTIONS.findIndex((s) => s.id === current)
  if (idx < 0 || idx >= SECTIONS.length - 1) return null
  return SECTIONS[idx + 1].id
}

export function getPrevSection(current: SectionId): SectionId | null {
  const idx = SECTIONS.findIndex((s) => s.id === current)
  if (idx <= 0) return null
  return SECTIONS[idx - 1].id
}

export function getSectionLabel(id: SectionId): string {
  return SECTIONS.find((s) => s.id === id)?.label || ''
}
