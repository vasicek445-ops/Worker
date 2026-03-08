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
    const category = searchParams.get('category') || ''
    const jobType = searchParams.get('type') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('jobs')
      .select('id, title, company, location, canton, salary_text, job_type, category, url, remote, posted_at, tags, source', { count: 'exact' })

    // Filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%`)
    }
    if (canton) {
      query = query.eq('canton', canton)
    }
    if (category) {
      query = query.eq('category', category)
    }
    if (jobType === 'remote') {
      query = query.eq('remote', true)
    }

    // Sort and paginate
    query = query
      .order('posted_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) throw error

    return NextResponse.json({
      jobs: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error: any) {
    console.error('Jobs API error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch jobs' }, { status: 500 })
  }
}
