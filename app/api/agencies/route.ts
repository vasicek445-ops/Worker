import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const region = searchParams.get('region') || ''
  const canton = searchParams.get('canton') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('agencies')
    .select('*', { count: 'exact' })

  if (search) {
    query = query.or(`company.ilike.%${search}%,city.ilike.%${search}%`)
  }
  if (region) {
    query = query.eq('region', region)
  }
  if (canton) {
    query = query.eq('canton', canton)
  }

  const { data, count, error } = await query
    .order('city', { ascending: true })
    .order('company', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    agencies: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  })
}
