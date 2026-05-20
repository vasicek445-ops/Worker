// URL slug utilities pro publikované CV stránky.
// woker.ch/cv/{slug} — sdílecí veřejná URL.

const DIACRITIC_MAP: Record<string, string> = {
  // české + slovenské
  á: 'a', č: 'c', ď: 'd', é: 'e', ě: 'e', í: 'i', ň: 'n',
  ó: 'o', ř: 'r', š: 's', ť: 't', ú: 'u', ů: 'u', ý: 'y', ž: 'z',
  ľ: 'l', ĺ: 'l', ŕ: 'r', ä: 'a', ô: 'o', ě̌: 'e',
  // polské
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ś: 's', ź: 'z', ż: 'z',
  // německé
  ö: 'o', ü: 'u', ß: 'ss',
  // španělské / portugalské / italské / francouzské
  à: 'a', â: 'a', ã: 'a', å: 'a', æ: 'ae',
  ç: 'c', è: 'e', ê: 'e', ë: 'e', ì: 'i', î: 'i', ï: 'i',
  ñ: 'n', ò: 'o', õ: 'o', ø: 'o', ù: 'u', û: 'u', ÿ: 'y', œ: 'oe',
}

function stripDiacritics(input: string): string {
  // Nejdřív NFD → odstraň combining marks (rychlá cesta pro většinu znaků).
  const normalized = input.normalize('NFD').replace(/[̀-ͯ]/g, '')
  // Fallback mapování pro znaky, které NFD neřeší (ł, ß, ø, ...).
  return normalized
    .split('')
    .map((ch) => DIACRITIC_MAP[ch] ?? DIACRITIC_MAP[ch.toLowerCase()] ?? ch)
    .join('')
}

function slugify(input: string): string {
  if (!input) return ''
  const stripped = stripDiacritics(input.toLowerCase())
  return stripped
    .replace(/[^a-z0-9\s-]/g, '') // jenom písmena, čísla, mezery, pomlčky
    .replace(/\s+/g, '-') // mezery → pomlčky
    .replace(/-+/g, '-') // víc pomlček → jedna
    .replace(/^-|-$/g, '') // trim okrajových pomlček
}

const MAX_SLUG_LENGTH = 60

function clampSlug(slug: string): string {
  if (slug.length <= MAX_SLUG_LENGTH) return slug
  return slug.slice(0, MAX_SLUG_LENGTH).replace(/-+$/, '')
}

export function makeSlug(name: string, profession?: string): string {
  const namePart = slugify(name || '')
  const profPart = profession ? slugify(profession) : ''

  let combined = profPart ? `${namePart}-${profPart}` : namePart
  combined = combined.replace(/-+/g, '-').replace(/^-|-$/g, '')
  combined = clampSlug(combined)

  // Pokud po vyčištění nic nezbylo (např. čínské znaky), použij fallback.
  if (!combined) return 'cv'
  return combined
}

export function ensureUniqueSlug(base: string, existing: string[]): string {
  const taken = new Set(existing)
  if (!taken.has(base)) return base
  let i = 2
  while (i < 1000) {
    const candidate = clampSlug(`${base}-${i}`)
    if (!taken.has(candidate)) return candidate
    i++
  }
  // V krajním případě (1000 kolizí) přidej náhodný suffix.
  const suffix = Math.random().toString(36).slice(2, 8)
  return clampSlug(`${base}-${suffix}`)
}
