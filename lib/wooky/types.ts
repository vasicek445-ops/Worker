// Wooky Edit Helper — typy. Wooky je on-demand AI asistent v profilu, ktery
// uzivateli pomaha pridat/upravit pole + (u volnych textu) rozsirit kratky
// vstup do bohatsiho profesionalniho textu.
import type { ProfileRow } from '../profile/types'

export type WookyFieldKind = 'simple' | 'expand'

export interface WookyFieldMeta {
  // Klic v ProfileRow (single source of truth pro autofill napric apkou).
  key: keyof ProfileRow
  label: string
  icon: string
  section: 'osobni-udaje' | 'kariera' | 'cil'
  kind: WookyFieldKind
  // Co rikat uzivateli, kdyz vybere toto pole.
  prompt: string
  // Priklad ktery se ukaze v inputu jako placeholder.
  example?: string
  // Hodnotova proklamace — kde se to v aplikaci pouzije.
  valuePitch: string
  // Volitelne — pouze pro `expand` pole: instrukce pro AI rozsiruje.
  expansionInstruction?: string
}

export interface WookyExpandRequest {
  field: string       // WookyFieldMeta.key
  raw: string
  language?: 'cs' | 'sk'
}

export interface WookyExpandResponse {
  expanded: string
}
