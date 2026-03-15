import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Common navigation/menu phrases to filter out (German + English job sites)
const NOISE_PATTERNS = [
  // Navigation items
  /^(Karriere|Career|Jobs|Home|Kontakt|Contact|Login|Registrieren|Register|Sign [Uu]p|Sign [Ii]n|Anmelden|Abmelden|Logout)$/,
  /^(Partner werden|Arbeitgeber|Employer|Anzeige schalten|Post a [Jj]ob|Inserieren)$/,
  /^(Warum |Why |About |Über |Impressum|Datenschutz|Privacy|AGB|Terms|Cookie|Nutzungsbedingungen)/,
  /^(Menü|Menu|Navigation|Suche|Search|Filter|Sortieren|Sort)$/,
  /^(Facebook|Twitter|LinkedIn|Instagram|YouTube|Xing|TikTok|Pinterest|Teilen|Share)$/i,
  /^(Zurück|Back|Weiter|Next|Mehr erfahren|Learn more|Alle (Stellen|Jobs)|See all)$/i,
  /^(Jetzt bewerben|Apply now|Bewerbung|Merken|Save|Speichern|Drucken|Print)$/i,
  // Footer-like content
  /^(©|Copyright|\d{4}\s+(All rights|Alle Rechte))/,
  /^(Folge uns|Follow us|Newsletter|Blog|FAQ|Hilfe|Help|Sitemap)$/i,
  // Cookie banners
  /^(Wir verwenden Cookies|We use cookies|Diese Website|This website uses)/i,
  /^(Akzeptieren|Accept|Ablehnen|Decline|Einstellungen|Settings|Alle akzeptieren)$/i,
]

// Lines that are likely job content (German job posting keywords)
const JOB_CONTENT_MARKERS = [
  /Stellenbeschreibung|Job [Dd]escription|Aufgaben|Anforderungen|Requirements/i,
  /Ihr Profil|Dein Profil|Your [Pp]rofile|Was Sie mitbringen|Was du mitbringst/i,
  /Wir bieten|We offer|Benefits|Unser Angebot|Das erwartet/i,
  /Arbeitsort|Standort|Location|Pensum|Workload|Anstellung|Employment/i,
  /Ihre Aufgaben|Deine Aufgaben|Your [Tt]asks|Responsibilities/i,
  /Qualifikation|Qualification|Erfahrung|Experience|Ausbildung|Education/i,
  /Bewerbungsunterlagen|Kontaktperson|Lohn|Gehalt|Salary|CHF|Branche|Industry/i,
  /Arbeitspensum|Stellenantritt|Start|Vertragsart|Contract/i,
  /(m\/w\/d|m\/f\/d|\(m\/w\)|\(w\/m\))/,
]

function isNoiseLine(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return true
  if (trimmed.length < 3) return true
  if (trimmed.length > 500) return false // Long lines are likely content

  // Filter navigation/menu items
  for (const pattern of NOISE_PATTERNS) {
    if (pattern.test(trimmed)) return true
  }

  // Very short lines that are just single words (likely menu items)
  if (trimmed.length <= 20 && !trimmed.includes(' ') && /^[A-ZÄÖÜ]/.test(trimmed)) {
    // But keep if it looks like a section header in a job posting
    for (const marker of JOB_CONTENT_MARKERS) {
      if (marker.test(trimmed)) return false
    }
    return true
  }

  return false
}

function extractJobContent(html: string): string {
  // Try to find the main content area first
  // Look for common job posting containers
  const mainContentPatterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/gi,
    /<main[^>]*>([\s\S]*?)<\/main>/gi,
    /<div[^>]*class="[^"]*(?:job|vacancy|position|detail|content|description|posting)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<section[^>]*class="[^"]*(?:job|vacancy|position|detail|content|description)[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
  ]

  let contentHtml = ''
  for (const pattern of mainContentPatterns) {
    const matches = html.matchAll(pattern)
    for (const match of matches) {
      contentHtml += match[1] + '\n'
    }
  }

  // If we found targeted content, use it; otherwise fall back to full HTML
  const sourceHtml = contentHtml.length > 200 ? contentHtml : html

  let text = sourceHtml
    // Remove unwanted tags and their content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    // Remove elements with navigation/menu/cookie classes
    .replace(/<[^>]*class="[^"]*(?:nav|menu|sidebar|cookie|banner|popup|modal|footer|header|breadcrumb|social|share|widget|advertisement|ad-)[^"]*"[^>]*>[\s\S]*?<\/(?:div|section|ul|aside|span)>/gi, '')
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Replace structural tags with newlines
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/td>/gi, ' | ')
    .replace(/<\/th>/gi, ' | ')
    // Add bullets for list items
    .replace(/<li[^>]*>/gi, '• ')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Decode HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&auml;/g, 'ä')
    .replace(/&ouml;/g, 'ö')
    .replace(/&uuml;/g, 'ü')
    .replace(/&Auml;/g, 'Ä')
    .replace(/&Ouml;/g, 'Ö')
    .replace(/&Uuml;/g, 'Ü')
    .replace(/&szlig;/g, 'ß')
    .replace(/&#\d+;/g, '') // Remove remaining numeric entities
    // Clean whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n /g, '\n')
    .replace(/ \n/g, '\n')

  // Filter out noise lines
  const lines = text.split('\n')
  const cleanLines: string[] = []
  let hasSeenJobContent = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      if (cleanLines.length > 0 && cleanLines[cleanLines.length - 1] !== '') {
        cleanLines.push('')
      }
      continue
    }

    // Check if this line contains job content markers
    for (const marker of JOB_CONTENT_MARKERS) {
      if (marker.test(trimmed)) { hasSeenJobContent = true; break }
    }

    if (!isNoiseLine(trimmed)) {
      cleanLines.push(trimmed)
    }
  }

  text = cleanLines.join('\n').replace(/\n{3,}/g, '\n\n').trim()

  // If we haven't seen any job content markers, the extraction might have missed
  // the content — return what we have but warn it might be low quality
  if (!hasSeenJobContent && text.length < 200) {
    return ''
  }

  return text
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol')
      }
    } catch {
      return NextResponse.json({ error: 'Neplatná URL adresa' }, { status: 400 })
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'de-CH,de;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Nepodařilo se načíst stránku (${response.status})` }, { status: 400 })
    }

    const html = await response.text()
    let text = extractJobContent(html)

    // Limit to 3500 chars — typical job posting is 1500-2500 chars
    if (text.length > 3500) text = text.substring(0, 3500)

    if (text.length < 50) {
      return NextResponse.json({ error: 'Nepodařilo se extrahovat text inzerátu z této stránky. Zkopíruj text ručně.' }, { status: 400 })
    }

    return NextResponse.json({ text, source: parsedUrl.hostname })
  } catch (error: unknown) {
    console.error('Extract URL error:', error)
    const message = error instanceof Error ? error.message : 'Extraction error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
