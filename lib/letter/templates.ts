// 3 minimalisticke templates pro Swiss Anschreiben.
// Pro blue-collar pozice oracle research doporucil minimal/traditional —
// over-designed sablony pusobi neserioxne na CH SME.

export interface LetterTemplate {
  id: 'klassisch' | 'modern' | 'minimal'
  name: string
  description: string
  // Vychozi accent color
  defaultColor: string
  // Dostupne barvy pro tuto sablonu
  availableColors: string[]
  // Font stack
  fontFamily: string
  // Header style: 'din5008' (klasicke svycarske), 'colored-band', 'minimal-centered'
  headerStyle: 'din5008' | 'colored-band' | 'minimal-centered'
  // Pro ATS - true = jen text, zadne grafiky
  atsFriendly: boolean
}

export const LETTER_TEMPLATES: LetterTemplate[] = [
  {
    id: 'klassisch',
    name: 'Klassisch',
    description: 'DIN 5008 — tradiční švýcarský standard. Sender vpravo nahoře, recipient vlevo. Serifový font.',
    defaultColor: '#1a1a1a',
    availableColors: ['#1a1a1a', '#0f172a', '#3f3f46', '#1e3a8a', '#7c2d12'],
    fontFamily: "'Lora', 'Times New Roman', serif",
    headerStyle: 'din5008',
    atsFriendly: true,
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Barevný pás v záhlaví, sans-serif. Vhodné pro logistiku, gastronomii, retail.',
    defaultColor: '#f97316',
    availableColors: ['#f97316', '#fb923c', '#2563eb', '#059669', '#dc2626', '#7c3aed'],
    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
    headerStyle: 'colored-band',
    atsFriendly: true,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Maximum bílého prostoru, tenké linky. Centrované jméno. Vhodné pro vyšší pozice.',
    defaultColor: '#525252',
    availableColors: ['#525252', '#171717', '#0c4a6e', '#581c87', '#831843'],
    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
    headerStyle: 'minimal-centered',
    atsFriendly: true,
  },
]

export function getLetterTemplateById(id: string): LetterTemplate | undefined {
  return LETTER_TEMPLATES.find((t) => t.id === id)
}
