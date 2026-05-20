// 15 konsolidovaných šablon — názvy jako švýcarská města + profession hint.
// Každá `id` odpovídá kombinaci v PARAM_TEMPLATES v CVPreview.tsx.
// Vybráno z původních 80 podle: vizuální kvalita, pokrytí typů (sidebar / top / two-col / single), kontrast (light/dark).

export type TemplateCategory =
  | 'populární'
  | 'profesionální'
  | 's-fotkou'
  | 'ats-friendly'
  | 'tmavé'
  | 'minimální'

export interface Template {
  id: string                // odpovídá klíči v PARAM_TEMPLATES (CVPreview.tsx)
  name: string              // švýcarské město
  hint: string              // profession hint („pro stavbaře", „pro gastronoma")
  categories: TemplateCategory[]
  hasPhoto: boolean
  atsFriendly: boolean
  defaultColor: string      // doporučená barva (hex)
  availableColors: string[] // 5-6 dot colors pro gallery preview
}

export const TEMPLATES: Template[] = [
  {
    id: 'klassisch',
    name: 'Zürich',
    hint: 'klasika pro každý obor',
    categories: ['populární', 'profesionální', 's-fotkou'],
    hasPhoto: true,
    atsFriendly: true,
    defaultColor: '#1e293b',
    availableColors: ['#1e293b', '#0f766e', '#7c3aed', '#dc2626', '#ea580c', '#0284c7'],
  },
  {
    id: 'modern',
    name: 'Genf',
    hint: 'pro pozice s francouzštinou',
    categories: ['populární', 'minimální', 'ats-friendly'],
    hasPhoto: true,
    atsFriendly: true,
    defaultColor: '#0f766e',
    availableColors: ['#0f766e', '#1e293b', '#7c3aed', '#0284c7', '#ea580c'],
  },
  {
    id: 'elegant',
    name: 'Bern',
    hint: 'formální, pro úředníky',
    categories: ['profesionální', 's-fotkou'],
    hasPhoto: true,
    atsFriendly: true,
    defaultColor: '#7c3aed',
    availableColors: ['#7c3aed', '#1e293b', '#0f766e', '#dc2626'],
  },
  {
    id: 'kreativ',
    name: 'Basel',
    hint: 'pro kreativní obory',
    categories: ['populární'],
    hasPhoto: true,
    atsFriendly: false,
    defaultColor: '#ea580c',
    availableColors: ['#ea580c', '#7c3aed', '#0f766e', '#dc2626', '#0284c7'],
  },
  {
    id: 'swiss',
    name: 'Luzern',
    hint: 'tabulkový švýcarský formát',
    categories: ['profesionální', 'ats-friendly'],
    hasPhoto: true,
    atsFriendly: true,
    defaultColor: '#dc2626',
    availableColors: ['#dc2626', '#1e293b', '#0f766e', '#7c3aed'],
  },
  {
    id: 'minimal',
    name: 'Lausanne',
    hint: 'čistá typografie',
    categories: ['minimální', 'ats-friendly'],
    hasPhoto: false,
    atsFriendly: true,
    defaultColor: '#1e293b',
    availableColors: ['#1e293b', '#0f766e', '#7c3aed', '#ea580c'],
  },
  {
    id: 'executive',
    name: 'St. Gallen',
    hint: 'pro vedoucí pozice',
    categories: ['profesionální', 'tmavé', 's-fotkou'],
    hasPhoto: true,
    atsFriendly: true,
    defaultColor: '#0f172a',
    availableColors: ['#0f172a', '#1e293b', '#7c3aed', '#dc2626'],
  },
  {
    id: 'timeline',
    name: 'Lugano',
    hint: 'vizuální časová osa',
    categories: ['populární'],
    hasPhoto: true,
    atsFriendly: false,
    defaultColor: '#0284c7',
    availableColors: ['#0284c7', '#0f766e', '#7c3aed', '#ea580c'],
  },
  {
    id: 'compact',
    name: 'Winterthur',
    hint: 'hustý, hodně obsahu na 1 stranu',
    categories: ['profesionální', 's-fotkou'],
    hasPhoto: true,
    atsFriendly: true,
    defaultColor: '#1e293b',
    availableColors: ['#1e293b', '#0f766e', '#dc2626', '#ea580c'],
  },
  {
    id: 'dark',
    name: 'Chur',
    hint: 'tmavý motiv, výrazný',
    categories: ['tmavé', 'populární'],
    hasPhoto: true,
    atsFriendly: false,
    defaultColor: '#fb923c',
    availableColors: ['#fb923c', '#0f766e', '#7c3aed', '#dc2626', '#0284c7'],
  },
  {
    id: 'bold',
    name: 'Sion',
    hint: 'výrazný gradient',
    categories: ['populární'],
    hasPhoto: true,
    atsFriendly: false,
    defaultColor: '#ea580c',
    availableColors: ['#ea580c', '#dc2626', '#7c3aed', '#0284c7'],
  },
  {
    id: 'nordic',
    name: 'Davos',
    hint: 'skandinávský styl',
    categories: ['minimální', 's-fotkou'],
    hasPhoto: true,
    atsFriendly: true,
    defaultColor: '#0f766e',
    availableColors: ['#0f766e', '#1e293b', '#7c3aed', '#0284c7'],
  },
  {
    id: 'pro-classic',
    name: 'Schaffhausen',
    hint: 'klasický sidebar',
    categories: ['profesionální', 's-fotkou'],
    hasPhoto: true,
    atsFriendly: true,
    defaultColor: '#1e293b',
    availableColors: ['#1e293b', '#0f766e', '#7c3aed', '#dc2626'],
  },
  {
    id: 'twin-classic',
    name: 'Fribourg',
    hint: 'dva rovné sloupce',
    categories: ['profesionální', 'ats-friendly'],
    hasPhoto: true,
    atsFriendly: true,
    defaultColor: '#1e293b',
    availableColors: ['#1e293b', '#0f766e', '#7c3aed', '#0284c7'],
  },
  {
    id: 'single-classic',
    name: 'Solothurn',
    hint: 'jednosloupcový klasik',
    categories: ['minimální', 'ats-friendly'],
    hasPhoto: false,
    atsFriendly: true,
    defaultColor: '#1e293b',
    availableColors: ['#1e293b', '#0f766e', '#7c3aed', '#dc2626'],
  },
]

export const CATEGORY_LABELS: Record<TemplateCategory | 'vse', string> = {
  vse: 'Vše',
  'populární': 'Populární',
  'profesionální': 'Profesionální',
  's-fotkou': 'S fotkou',
  'ats-friendly': 'ATS friendly',
  'tmavé': 'Tmavé',
  'minimální': 'Minimální',
}

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id)
}

export function getTemplatesByCategory(cat: TemplateCategory | 'vse'): Template[] {
  if (cat === 'vse') return TEMPLATES
  return TEMPLATES.filter((t) => t.categories.includes(cat))
}
