import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/agencies
// Query params: search, region (german/french/italian), canton, industry,
//               hiring_only=1, page=N
//
// Returns: { agencies: AgencyEntry[], total, page, totalPages }
// Filter: defaultne WHERE email IS NOT NULL (Smart Apply mode — bez emailu zbytecne).

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const region = searchParams.get('region') || ''
    const canton = searchParams.get('canton') || ''
    const industry = searchParams.get('industry') || ''
    const hiringOnly = searchParams.get('hiring_only') === '1'
    // require_email=0 zobrazi vsechny agentury vcetne tech bez emailu (pro /kontakty browse).
    // Default true (Smart Apply chce jen emailable).
    const requireEmail = searchParams.get('require_email') !== '0'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('agencies')
      .select(
        'id, company, city, canton, region, email, telephone, website, has_open_positions, current_positions, industry, last_hiring_check_at',
        { count: 'exact' },
      )

    if (requireEmail) {
      query = query.not('email', 'is', null).neq('email', '')
    }

    if (search) {
      query = query.or(`company.ilike.%${search}%,city.ilike.%${search}%`)
    }
    if (region) {
      query = query.eq('region', region)
    }
    if (canton) {
      query = query.eq('canton', canton)
    }
    if (industry) {
      query = query.contains('industry', [industry])
    }
    if (hiringOnly) {
      query = query.eq('has_open_positions', true)
    }

    query = query
      .order('has_open_positions', { ascending: false, nullsFirst: false })
      .order('company', { ascending: true })
      .range(offset, offset + limit - 1)

    const { data, count, error } = await query
    if (error) throw error

    return NextResponse.json({
      agencies: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch agencies'
    console.error('Agencies API error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
