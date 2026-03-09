import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const canton = searchParams.get('canton') || ''
    const city = searchParams.get('city') || ''
    const maxPrice = parseInt(searchParams.get('maxPrice') || '0')
    const minRooms = parseFloat(searchParams.get('minRooms') || '0')
    const objectType = searchParams.get('type') || ''
    const furnished = searchParams.get('furnished') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('housing')
      .select('id, title, address, city, zipcode, canton, price, price_unit, rooms, area_m2, object_type, is_furnished, is_temporary, available_from, url, image_url, agency_name, agency_contact, posted_at', { count: 'exact' })

    if (search) {
      query = query.or(`title.ilike.%${search}%,city.ilike.%${search}%,address.ilike.%${search}%`)
    }
    if (canton) {
      query = query.eq('canton', canton)
    }
    if (city) {
      query = query.ilike('city', `%${city}%`)
    }
    if (maxPrice > 0) {
      query = query.lte('price', maxPrice)
    }
    if (minRooms > 0) {
      query = query.gte('rooms', minRooms)
    }
    if (objectType) {
      query = query.ilike('object_type', `%${objectType}%`)
    }
    if (furnished === 'true') {
      query = query.eq('is_furnished', true)
    }

    query = query
      .order('posted_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) throw error

    return NextResponse.json({
      listings: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error: any) {
    console.error('Housing API error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch housing' }, { status: 500 })
  }
}
