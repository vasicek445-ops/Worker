// LetterData — single source of truth pro Cover Letter builder.
// Shape kompatibilni s tim co AI vraci z /api/generate-letter (po refactoru)
// a co LetterPreview komponent ocekava pro render.

export interface LetterPersonalData {
  fullName: string
  address?: string         // ulice + cislo
  postalCode?: string      // PSC / PLZ
  city?: string
  phone?: string
  email?: string
}

export interface LetterRecipient {
  company: string
  contactPerson?: string   // "Frau Anna Keller" nebo undefined → fallback "Sehr geehrte Damen und Herren"
  address?: string
  postalCode?: string
  city?: string
}

export interface LetterMeta {
  place?: string           // "Zürich" — mesto pro hlavicku
  date?: string            // "24. Mai 2026" (CZ ze profil-locale)
  subject: string          // Betreff — "Bewerbung als Lagermitarbeiter"
  reference?: string       // optional reference id z inzerátu
  jobSource?: string       // "jobs.ch", "indeed", "Initiativbewerbung"
}

export interface LetterParagraph {
  // Cely paragraph je editovatelny text — bez nested struktury (lepsi UX pro inline editaci).
  // type je pouzity AI promptem pro generovani spravneho obsahu per paragraph.
  id: string
  type: 'motivation' | 'experience' | 'skills' | 'closing' | 'custom'
  text: string
}

export interface LetterBody {
  opening: string          // "Sehr geehrte Frau Keller" / "Sehr geehrte Damen und Herren"
  paragraphs: LetterParagraph[]   // 3-4 paragraphs, kazdy 400-600 znaku
  signOff: string          // "Freundliche Grüsse" (Swiss) — NE "Mit freundlichen Grüssen" (DE)
}

export interface LetterDesign {
  templateId: 'klassisch' | 'modern' | 'minimal'
  accentColor: string      // hex barva pro template highlights
  fontFamily?: string      // optional override
}

// Hlavni datovy typ — co se uklada do saved_documents.document_data pro type='letter'.
export interface LetterData {
  sender: LetterPersonalData
  recipient: LetterRecipient
  meta: LetterMeta
  body: LetterBody
  design: LetterDesign
}

// FormData shape pouzivany v editoru behem editace (flat — usnadnuje binding).
// Po Generate se mapuje na LetterData. Tlacitko "Z profilu" pulluje data sem.
export interface LetterFormData {
  // Sender (z profilu autofill)
  senderFullName?: string
  senderAddress?: string
  senderPostalCode?: string
  senderCity?: string
  senderPhone?: string
  senderEmail?: string

  // Recipient
  recipientCompany?: string
  recipientContactPerson?: string
  recipientAddress?: string
  recipientPostalCode?: string
  recipientCity?: string

  // Job context (input pro AI)
  jobTitle?: string             // "Lagermitarbeiter"
  jobReference?: string         // ID z inzerátu
  jobSource?: string            // "jobs.ch"
  jobDescription?: string       // raw text inzerátu pro AI context
  motivation?: string           // user vlastni motivace (proc tahle firma)

  // Meta
  place?: string
  date?: string

  // Profile context (uses for AI - autofill z profilu)
  germanLevel?: string          // A1-C2
  permitStatus?: string         // "EU/EFTA — bez omezení" atd.
  experiences?: Array<{ title?: string; company?: string; period?: string; description?: string }>

  // Design
  templateId?: 'klassisch' | 'modern' | 'minimal'
  accentColor?: string
}

export type LetterSectionId =
  | 'sender'
  | 'recipient'
  | 'subject'
  | 'body'
  | 'closing'
  | 'design'

export interface LetterSectionMeta {
  id: LetterSectionId
  label: string
  description?: string
}

export const LETTER_SECTIONS: LetterSectionMeta[] = [
  { id: 'sender', label: 'Odesílatel', description: 'Tvoje kontaktní údaje' },
  { id: 'recipient', label: 'Adresát', description: 'Komu dopis posíláš' },
  { id: 'subject', label: 'Pozice & věc', description: 'Na jakou pozici se hlásíš' },
  { id: 'body', label: 'Tělo dopisu', description: 'Hlavní text — AI rozšíří' },
  { id: 'closing', label: 'Závěr & podpis', description: 'Pozdrav a podpis' },
  { id: 'design', label: 'Vzhled', description: 'Šablona a barva' },
]
