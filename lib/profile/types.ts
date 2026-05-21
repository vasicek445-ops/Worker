// Sdílené typy pro profil. Jediný zdroj pravdy o tom co je v `profiles` tabulce.
import type React from 'react'

// Strukturovany zaznam pracovni zkusenosti — ulozeny v profiles.experiences jsonb.
// Shape kompatibilni s CVFormData.experiences (lib/cv/types.ts) pro snadny prefill.
export interface ProfileExperience {
  period?: string
  title?: string
  company?: string
  location?: string
  description?: string
}

export interface ProfileEducation {
  period?: string
  school?: string
  degree?: string
  location?: string
}

export interface ProfileLanguage {
  language: string  // CZ nazev: 'Angličtina', 'Italština', ...
  level: string     // 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Mateřský'
}

export interface ProfileRow {
  id: string

  // Osobní údaje
  full_name?: string | null
  avatar_url?: string | null
  datum_narozeni?: string | null   // 'DD.MM.YYYY' (text, legacy)
  telefon?: string | null
  email?: string | null            // pozn. auth email je v auth.users, tento je profile contact
  nationality?: string | null
  adresa?: string | null
  ridicky_prukaz?: string | null

  // Kariéra
  obor?: string | null
  pozice?: string | null
  zkusenosti?: string | null        // legacy raw text — fallback kdyz experiences[] je prazdne
  vzdelani?: string | null          // legacy raw text — fallback kdyz educations[] je prazdne
  experiences?: ProfileExperience[] | null
  educations?: ProfileEducation[] | null
  dovednosti?: string | null
  nemcina_uroven?: string | null    // 'A1', 'B1', ...
  dalsi_jazyky?: string | null              // legacy text — fallback kdyz dalsi_jazyky_struct prazdne
  dalsi_jazyky_struct?: ProfileLanguage[] | null

  // Cíl
  preferovany_kanton?: string | null
  income_expected?: number | null
  willing_to_relocate?: boolean | null
  employer_current?: string | null
  work_permit_status?: string | null

  // Preference
  profile_locale?: string | null    // 'cs', 'sk', 'en', ...
  notifications?: boolean | null

  // Computed
  profile_complete?: boolean | null
  updated_at?: string | null
}

export type ProfileSectionId =
  | 'osobni-udaje'
  | 'kariera'
  | 'cil'
  | 'dokumenty'
  | 'smart-apply'
  | 'preference'
  | 'nastaveni'

// Lucide icon component type (lazy reference to avoid circular import).
// V sections.ts importujeme konkretni komponenty z 'lucide-react'.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LucideIconComponent = React.ComponentType<any>

export interface ProfileSectionMeta {
  id: ProfileSectionId
  label: string
  Icon: LucideIconComponent         // Lucide ikona (sjednoceno s globalnim Sidebar)
  href: string                      // /profil/osobni-udaje, ...
  description?: string
}
