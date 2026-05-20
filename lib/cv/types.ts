// Sdílené typy pro CV builder. Jeden zdroj pravdy.
// CVData musí zůstat kompatibilní s existujícím CVPreview.tsx.

export interface CVData {
  profil?: string
  personalData: {
    name: string
    birthdate: string
    nationality: string
    address: string
    phone: string
    email: string
    drivingLicense?: string
  }
  experience: Array<{
    period: string
    title: string
    company: string
    location?: string
    tasks: string[]
  }>
  education: Array<{
    period: string
    school: string
    degree: string
    location?: string
  }>
  languages: Array<{ language: string; level: string }>
  skills: { technical: string[]; soft: string[] }
  certifications?: string[]
}

// Form state (pre-AI generation) — flat shape, AI ho rozšíří na CVData.
export interface CVFormData {
  // Personal
  name?: string
  birthdate?: string
  phone?: string
  email?: string
  nationality?: string
  address?: string
  driving?: string

  // Position
  position?: string
  field?: string

  // Experience (raw input — AI rozšíří)
  experience_detail?: string

  // Structured experience (pro F1 sekce — strukturované repeatable)
  experiences?: Array<{
    id: string
    period: string
    title: string
    company: string
    location?: string
    description?: string
  }>

  // Education
  education?: string
  educations?: Array<{
    id: string
    period: string
    school: string
    degree: string
    location?: string
  }>

  // Languages
  german?: string
  other_languages?: string

  // Skills
  skills?: string

  // Custom fields per section (RxResume-style)
  customFields?: Record<string, Array<{ id: string; label: string; value: string; type: 'text' | 'url' | 'date' }>>
}

export type SectionId = 'basics' | 'position' | 'experience' | 'education' | 'languages' | 'skills' | 'design'

export interface SectionMeta {
  id: SectionId
  label: string
  icon: string
}
