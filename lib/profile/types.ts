// Sdílené typy pro profil. Jediný zdroj pravdy o tom co je v `profiles` tabulce.
import type React from 'react'

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
  zkusenosti?: string | null        // raw text — AI rozšíří v CV
  vzdelani?: string | null
  dovednosti?: string | null
  nemcina_uroven?: string | null    // 'A1', 'B1', ...
  dalsi_jazyky?: string | null

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
