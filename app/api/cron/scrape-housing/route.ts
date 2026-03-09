import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Swiss 4-digit ZIP to canton mapping (first 2 digits)
const ZIPCODE_TO_CANTON: Record<string, string> = {
  '10': 'VD', '11': 'VD', '12': 'GE', '13': 'VD',
  '14': 'VD', '15': 'FR', '16': 'FR', '17': 'FR', '18': 'VS',
  '19': 'VS', '20': 'NE', '21': 'NE', '22': 'NE', '23': 'NE',
  '24': 'NE', '25': 'JU', '26': 'JU', '27': 'BE', '28': 'BE',
  '29': 'SO', '30': 'BE', '31': 'BE', '32': 'BE', '33': 'BE',
  '34': 'BE', '35': 'LU', '36': 'BE', '37': 'BE', '38': 'BE',
  '40': 'BS', '41': 'BL', '42': 'BL', '43': 'SO', '44': 'SO',
  '45': 'SO', '46': 'SO', '47': 'AG', '48': 'AG', '49': 'AG',
  '50': 'AG', '51': 'AG', '52': 'ZH', '53': 'ZH', '54': 'AG',
  '55': 'AG', '56': 'AG', '57': 'AG', '58': 'AG', '59': 'AG',
  '60': 'LU', '61': 'LU', '62': 'OW', '63': 'NW', '64': 'UR',
  '65': 'TI', '66': 'TI', '67': 'SZ', '68': 'TI', '69': 'TI',
  '70': 'GR', '71': 'GR', '72': 'GR', '73': 'GR', '74': 'GR',
  '75': 'GR', '76': 'GR', '77': 'SG', '78': 'SH',
  '80': 'ZH', '81': 'ZH', '82': 'ZH', '83': 'ZH', '84': 'ZH',
  '85': 'ZH', '86': 'ZH', '87': 'ZH', '88': 'TG', '89': 'TG',
  '90': 'SG', '91': 'AR', '92': 'AI', '93': 'SG', '94': 'SG',
  '95': 'TG', '96': 'TG',
}

function detectCantonFromZip(zipcode: string | number): string | null {
  const zip = String(zipcode)
  if (zip.length < 4) return null
  const prefix2 = zip.substring(0, 2)
  return ZIPCODE_TO_CANTON[prefix2] || null
}

const CITY_TO_CANTON: Record<string, string> = {
  "zurich": "ZH", "zürich": "ZH", "winterthur": "ZH", "kloten": "ZH", "dübendorf": "ZH", "uster": "ZH",
  "bern": "BE", "thun": "BE", "biel": "BE", "burgdorf": "BE", "langenthal": "BE",
  "basel": "BS", "riehen": "BS",
  "lucerne": "LU", "luzern": "LU", "emmen": "LU", "kriens": "LU",
  "geneva": "GE", "genève": "GE", "carouge": "GE", "vernier": "GE", "meyrin": "GE",
  "lausanne": "VD", "nyon": "VD", "montreux": "VD", "vevey": "VD", "morges": "VD", "yverdon": "VD", "renens": "VD",
  "lugano": "TI", "bellinzona": "TI", "locarno": "TI", "mendrisio": "TI",
  "zug": "ZG", "baar": "ZG", "cham": "ZG",
  "st. gallen": "SG", "rapperswil": "SG", "wil": "SG",
  "aarau": "AG", "baden": "AG", "wettingen": "AG", "brugg": "AG",
  "schaffhausen": "SH",
  "chur": "GR", "davos": "GR",
  "solothurn": "SO", "olten": "SO", "grenchen": "SO",
  "fribourg": "FR", "bulle": "FR",
  "sion": "VS", "sierre": "VS", "brig": "VS", "visp": "VS", "martigny": "VS", "zermatt": "VS",
  "neuchâtel": "NE", "neuchatel": "NE", "la chaux-de-fonds": "NE",
  "delémont": "JU",
  "liestal": "BL", "allschwil": "BL", "reinach": "BL", "muttenz": "BL",
  "frauenfeld": "TG", "kreuzlingen": "TG",
  "appenzell": "AI",
  "herisau": "AR",
  "sarnen": "OW",
  "stans": "NW",
  "altdorf": "UR",
  "schwyz": "SZ", "einsiedeln": "SZ",
  "glarus": "GL",
}

function detectCanton(city: string, zipcode?: string | number): string | null {
  if (city) {
    const lower = city.toLowerCase()
    for (const [name, canton] of Object.entries(CITY_TO_CANTON)) {
      if (lower.includes(name)) return canton
    }
  }
  if (zipcode) return detectCantonFromZip(String(zipcode))
  return null
}

const RESIDENTIAL_CATEGORIES = new Set(['APARTMENT', 'SHARED', 'HOUSE'])
const RESIDENTIAL_TYPES = new Set([
  'FLAT', 'STUDIO', 'ATTIC', 'PENTHOUSE', 'MAISONETTE', 'LOFT',
  'SHARED_FLAT', 'FURNISHED_FLAT', 'SINGLE_HOUSE', 'ROW_HOUSE',
  'DUPLEX', 'TERRACE_HOUSE', 'VILLA', 'CHALET', 'RUSTICO',
  'GRANNY_FLAT', 'CASTLE',
])

function isResidential(listing: any): boolean {
  if (RESIDENTIAL_CATEGORIES.has(listing.object_category)) return true
  if (RESIDENTIAL_TYPES.has(listing.object_type)) return true
  if (listing.number_of_rooms && listing.number_of_rooms >= 1) return true
  return false
}

function translateObjectType(type: string): string {
  const map: Record<string, string> = {
    'FLAT': 'Byt',
    'STUDIO': 'Studio',
    'ATTIC': 'Podkrovní byt',
    'PENTHOUSE': 'Penthouse',
    'MAISONETTE': 'Mezonet',
    'LOFT': 'Loft',
    'SHARED_FLAT': 'Spolubydlení (WG)',
    'FURNISHED_FLAT': 'Zařízený byt',
    'SINGLE_HOUSE': 'Rodinný dům',
    'ROW_HOUSE': 'Řadový dům',
    'DUPLEX': 'Duplex',
    'VILLA': 'Vila',
    'CHALET': 'Chalet',
  }
  return map[type] || type
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let added = 0
    let skipped = 0
    const seenIds = new Set<string>()

    // Flatfox API - paginate through listings, filter residential
    const maxPages = 50 // 50 * 100 = 5000 listings checked
    const pageSize = 100

    for (let offset = 0; offset < maxPages * pageSize; offset += pageSize) {
      try {
        const res = await fetch(
          `https://flatfox.ch/api/v1/public-listing/?ordering=-published&limit=${pageSize}&offset=${offset}`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (compatible; WokerBot/1.0)',
            },
            signal: AbortSignal.timeout(15000),
          }
        )

        if (!res.ok) break
        const data = await res.json()
        const results = data.results || []
        if (results.length === 0) break

        let residentialOnPage = 0
        for (const listing of results) {
          if (!isResidential(listing)) continue
          residentialOnPage++

          const pk = String(listing.pk)
          if (seenIds.has(pk)) continue
          seenIds.add(pk)

          const city = (listing.city || '').trim()
          const zipcode = listing.zipcode ? String(listing.zipcode) : ''
          const canton = detectCanton(city, zipcode)

          const price = listing.price_display || listing.rent_gross || listing.rent_net || null
          const agency = listing.agency || {}

          let imageUrl = null
          if (listing.cover_image) {
            imageUrl = `https://flatfox.ch/api/v1/public-listing/${pk}/image/${listing.cover_image}/?w=600`
          }

          let postedAt = null
          if (listing.published) {
            try { postedAt = new Date(listing.published).toISOString() } catch {}
          }

          let availableFrom = null
          if (listing.moving_date) {
            try { availableFrom = new Date(listing.moving_date).toISOString() } catch {}
          }

          try {
            await supabaseAdmin.from('housing').upsert({
              external_id: pk,
              source: 'flatfox',
              title: listing.public_title || listing.short_title || `${city} - ${translateObjectType(listing.object_type)}`,
              description: (listing.description || '').substring(0, 3000),
              address: listing.public_address || listing.street || '',
              city,
              zipcode,
              canton,
              latitude: listing.latitude || null,
              longitude: listing.longitude || null,
              price: price && price > 0 ? Math.round(price) : null,
              price_unit: listing.price_unit || 'monthly',
              rooms: listing.number_of_rooms || null,
              area_m2: listing.surface_living ? Math.round(listing.surface_living) : null,
              object_type: translateObjectType(listing.object_type || ''),
              is_furnished: listing.is_furnished || false,
              is_temporary: listing.is_temporary || false,
              available_from: availableFrom,
              url: `https://flatfox.ch${listing.url || `/en/flat/${listing.slug}/${pk}/`}`,
              image_url: imageUrl,
              agency_name: [agency.name, agency.name_2].filter(Boolean).join(' - ') || null,
              agency_contact: [agency.street, agency.zipcode, agency.city].filter(Boolean).join(', ') || null,
              posted_at: postedAt,
            }, { onConflict: 'source,external_id' })
            added++
          } catch {
            skipped++
          }
        }

        // If very few residential listings on this page, we're past the good data
        if (residentialOnPage === 0 && offset > 500) break

      } catch (err) {
        console.error(`Flatfox page offset ${offset} error:`, err)
        break
      }
    }

    console.log(`Flatfox housing: +${added} listings (${skipped} skipped)`)

    // Cleanup — remove listings older than 14 days
    let cleaned = 0
    try {
      const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      const { count } = await supabaseAdmin
        .from('housing')
        .delete({ count: 'exact' })
        .lt('posted_at', cutoff)
      cleaned = count || 0
    } catch {}

    try {
      const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      const { count } = await supabaseAdmin
        .from('housing')
        .delete({ count: 'exact' })
        .is('posted_at', null)
        .lt('created_at', cutoff)
      cleaned += (count || 0)
    } catch {}

    console.log(`Housing cleanup: removed ${cleaned} expired listings`)

    return NextResponse.json({
      success: true,
      added,
      skipped,
      cleaned,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Housing scrape cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
