// Wooky Edit Helper — typy. Wooky je on-demand AI asistent v profilu, ktery
// uzivateli pomaha pridat/upravit pole + (u volnych textu) rozsirit kratky
// vstup do bohatsiho profesionalniho textu.
import type { ProfileRow, LucideIconComponent } from '../profile/types'

export type WookyFieldKind =
  | 'simple'      // free text input → direct save
  | 'expand'      // free text → AI expansion → preview → save
  | 'choice'      // chips s pevnymi moznostmi (single nebo multi)
  | 'languages'   // special UI: list of (jazyk + uroven) rows

export interface WookyChoiceOption {
  value: string
  label: string
  hint?: string
}

export interface WookyFieldMeta {
  // Klic v ProfileRow (single source of truth pro autofill napric apkou).
  key: keyof ProfileRow
  label: string
  Icon: LucideIconComponent          // Lucide ikona (sjednoceno s brandem)
  section: 'osobni-udaje' | 'kariera' | 'cil'
  kind: WookyFieldKind
  // Co rikat uzivateli, kdyz vybere toto pole.
  prompt: string
  // Priklad ktery se ukaze v inputu jako placeholder.
  example?: string
  // Hodnotova proklamace — kde se to v aplikaci pouzije.
  valuePitch: string
  // ===== Pole pro 'expand' kind =====
  expansionInstruction?: string
  // ===== Pole pro 'choice' kind =====
  options?: WookyChoiceOption[]
  multi?: boolean         // multichoice toggle (save jako "A, B, C")
  customAllowed?: boolean // navic povolit volny text
  // ===== Pole pro 'languages' kind =====
  languageOptions?: string[]
  levelOptions?: WookyChoiceOption[]
}

export interface WookyExpandRequest {
  field: string       // WookyFieldMeta.key
  raw: string
  language?: 'cs' | 'sk'
}

export interface WookyExpandResponse {
  expanded: string
}

// Parsed structure pro languages kind: "Angličtina B2, Polština C1" <-> [{lang, level}]
export interface LanguageEntry {
  lang: string
  level: string
}

export function parseLanguages(raw: string | null | undefined): LanguageEntry[] {
  if (!raw || typeof raw !== 'string') return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      // "Jazyk Level" — posledni slovo je level pokud matchuje CEFR/native
      const m = s.match(/^(.+?)\s+(A1|A2|B1|B2|C1|C2|Mateřský|Začátečník)$/i)
      if (m) return { lang: m[1].trim(), level: m[2] }
      return { lang: s, level: '' }
    })
}

export function stringifyLanguages(entries: LanguageEntry[]): string {
  return entries
    .filter((e) => e.lang.trim().length > 0)
    .map((e) => (e.level ? `${e.lang.trim()} ${e.level}` : e.lang.trim()))
    .join(', ')
}
