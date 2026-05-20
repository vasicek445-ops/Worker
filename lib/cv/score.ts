// Woker Score — 0-100 gamifikace completion CV.
// Žádné side effecty, pure funkce. Self-contained.

import type { CVFormData } from './types'

export interface ScoreItem {
  key: string
  label: string
  got: number
  max: number
  passed: boolean
}

export interface ScoreBreakdown {
  total: number // 0-100
  items: ScoreItem[]
}

const PHONE_REGEX = /^\+(41|49|420)[\s0-9-]{6,}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function score(condition: boolean, key: string, label: string, max: number): ScoreItem {
  return { key, label, got: condition ? max : 0, max, passed: condition }
}

function hasMinChars(value: string | undefined, min: number): boolean {
  return typeof value === 'string' && value.trim().length >= min
}

export function calculateWokerScore(
  formData: CVFormData,
  photo: string | null,
  template: { atsFriendly: boolean }
): ScoreBreakdown {
  const items: ScoreItem[] = []

  // 1. Foto (10)
  items.push(score(photo !== null && photo !== '', 'photo', 'Profilová fotka', 10))

  // 2. DE jazyk uveden (15)
  const germanOk = Boolean(
    formData.german && formData.german.trim() !== '' && formData.german !== 'Žádná – teprve se učím'
  )
  items.push(score(germanOk, 'german', 'Uvedená úroveň němčiny', 15))

  // 3. Telefon CH/DE/CZ formát (10)
  const phone = (formData.phone || '').replace(/\s+/g, '').trim()
  const phoneOk = PHONE_REGEX.test(phone) || /^\+(41|49|420)\d{6,}$/.test(phone)
  items.push(score(phoneOk, 'phone', 'Telefon v CH/DE/CZ formátu', 10))

  // 4. Adresa (5)
  items.push(score(hasMinChars(formData.address, 3), 'address', 'Adresa vyplněná', 5))

  // 5. Min 1 work entry (15)
  const hasStructuredExp = Array.isArray(formData.experiences) && formData.experiences.length >= 1
  const hasTextExp = hasMinChars(formData.experience_detail, 30)
  items.push(score(hasStructuredExp || hasTextExp, 'experience', 'Min. 1 pracovní zkušenost', 15))

  // 6. Min 1 education entry (10)
  const hasStructuredEdu = Array.isArray(formData.educations) && formData.educations.length >= 1
  const hasTextEdu = hasMinChars(formData.education, 10)
  items.push(score(hasStructuredEdu || hasTextEdu, 'education', 'Min. 1 vzdělání', 10))

  // 7. Email validní (10)
  items.push(score(EMAIL_REGEX.test((formData.email || '').trim()), 'email', 'Validní e-mail', 10))

  // 8. ATS-friendly šablona (10)
  items.push(score(template.atsFriendly === true, 'ats', 'ATS-friendly šablona', 10))

  // 9. Pozice + obor (10)
  const positionFieldOk = hasMinChars(formData.position, 2) && hasMinChars(formData.field, 2)
  items.push(score(positionFieldOk, 'position', 'Pozice a obor vyplněné', 10))

  // 10. Dovednosti (5)
  const skillsStr = (formData.skills || '').trim()
  items.push(score(skillsStr.length >= 2, 'skills', 'Aspoň 1 dovednost', 5))

  const total = Math.min(100, items.reduce((sum, item) => sum + item.got, 0))
  return { total, items }
}
