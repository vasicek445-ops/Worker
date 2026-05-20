import type { ProfileSectionMeta, ProfileSectionId } from './types'

// Profile tabs — pouze sekce vztahujici se primo k profilu uzivatele.
// Dokumenty a Smart Apply jsou v hlavnim sidebaru (Moje dokumenty, Smart Apply BETA)
// a nemaji co delat v profile tabs.
export const PROFILE_SECTIONS: ProfileSectionMeta[] = [
  { id: 'osobni-udaje', label: 'Osobní údaje',  icon: '👤', href: '/profil/osobni-udaje', description: 'Jméno, foto, kontakt' },
  { id: 'kariera',      label: 'Kariéra',       icon: '💼', href: '/profil/kariera',      description: 'Práce, vzdělání, jazyky, dovednosti' },
  { id: 'cil',          label: 'Cíl',           icon: '🎯', href: '/profil/cil',          description: 'Kam směřuješ — kanton, mzda, povolení' },
  { id: 'preference',   label: 'Preference',    icon: '⚙️', href: '/profil/preference',   description: 'Jazyk UI, notifikace' },
  { id: 'nastaveni',    label: 'Nastavení',     icon: '🔧', href: '/profil/nastaveni',    description: 'Heslo, předplatné, data, smazání účtu' },
]

export function getProfileSection(id: ProfileSectionId): ProfileSectionMeta | undefined {
  return PROFILE_SECTIONS.find((s) => s.id === id)
}
