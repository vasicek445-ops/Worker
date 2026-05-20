import type { ProfileSectionMeta, ProfileSectionId } from './types'

export const PROFILE_SECTIONS: ProfileSectionMeta[] = [
  { id: 'osobni-udaje', label: 'Osobní údaje',  icon: '👤', href: '/profil/osobni-udaje', description: 'Jméno, foto, kontakt' },
  { id: 'kariera',      label: 'Kariéra',       icon: '💼', href: '/profil/kariera',      description: 'Práce, vzdělání, jazyky, dovednosti' },
  { id: 'cil',          label: 'Cíl',           icon: '🎯', href: '/profil/cil',          description: 'Kam směřuješ — kanton, mzda, povolení' },
  { id: 'dokumenty',    label: 'Dokumenty',     icon: '📄', href: '/profil/dokumenty',    description: 'Uložená CV a motivační dopisy' },
  { id: 'smart-apply',  label: 'Smart Apply',   icon: '✨', href: '/profil/gmail',        description: 'Automatické přihlášky přes Gmail' },
  { id: 'preference',   label: 'Preference',    icon: '⚙️', href: '/profil/preference',   description: 'Jazyk UI, notifikace' },
  { id: 'nastaveni',    label: 'Nastavení',     icon: '🔧', href: '/profil/nastaveni',    description: 'Heslo, předplatné, data, smazání účtu' },
]

export function getProfileSection(id: ProfileSectionId): ProfileSectionMeta | undefined {
  return PROFILE_SECTIONS.find((s) => s.id === id)
}
