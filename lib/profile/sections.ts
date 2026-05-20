import type { ProfileSectionMeta, ProfileSectionId } from './types'
import { User, Briefcase, Target, SlidersHorizontal, Cog } from 'lucide-react'

// Profile tabs — pouze sekce vztahujici se primo k profilu uzivatele.
// Dokumenty a Smart Apply jsou v hlavnim sidebaru.
// Lucide ikony sjednocene s globalnim Sidebar.tsx (#ff8c2b orange accent).
export const PROFILE_SECTIONS: ProfileSectionMeta[] = [
  { id: 'osobni-udaje', label: 'Osobní údaje',  Icon: User,              href: '/profil/osobni-udaje', description: 'Jméno, foto, kontakt' },
  { id: 'kariera',      label: 'Kariéra',       Icon: Briefcase,         href: '/profil/kariera',      description: 'Práce, vzdělání, jazyky, dovednosti' },
  { id: 'cil',          label: 'Cíl',           Icon: Target,            href: '/profil/cil',          description: 'Kam směřuješ — kanton, mzda, povolení' },
  { id: 'preference',   label: 'Preference',    Icon: SlidersHorizontal, href: '/profil/preference',   description: 'Jazyk UI, notifikace' },
  { id: 'nastaveni',    label: 'Nastavení',     Icon: Cog,               href: '/profil/nastaveni',    description: 'Heslo, předplatné, data, smazání účtu' },
]

export function getProfileSection(id: ProfileSectionId): ProfileSectionMeta | undefined {
  return PROFILE_SECTIONS.find((s) => s.id === id)
}
