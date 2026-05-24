import type { LetterSectionId } from './types'
import { LETTER_SECTIONS } from './types'

export function getNextLetterSection(current: LetterSectionId): LetterSectionId | null {
  const idx = LETTER_SECTIONS.findIndex((s) => s.id === current)
  if (idx < 0 || idx >= LETTER_SECTIONS.length - 1) return null
  return LETTER_SECTIONS[idx + 1].id
}

export function getPrevLetterSection(current: LetterSectionId): LetterSectionId | null {
  const idx = LETTER_SECTIONS.findIndex((s) => s.id === current)
  if (idx <= 0) return null
  return LETTER_SECTIONS[idx - 1].id
}

export function getLetterSectionLabel(id: LetterSectionId): string {
  return LETTER_SECTIONS.find((s) => s.id === id)?.label || ''
}
