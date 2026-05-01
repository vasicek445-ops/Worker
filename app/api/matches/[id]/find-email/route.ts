import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractRecipientEmail } from '@/lib/matching/extract'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function getUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return null
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  return error || !user ? null : user
}

export const maxDuration = 30

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

/**
 * Fetch the job's redirect_url, follow redirects to the real company page,
 * and try to extract a hiring email from the HTML body.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params

  const { data: match, error } = await supabaseAdmin
    .from('daily_matches')
    .select('job_url')
    .eq('id', id)
    .eq('member_id', user.id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!match?.job_url) return NextResponse.json({ error: 'no_job_url' }, { status: 400 })

  let html = ''
  let finalUrl = match.job_url
  try {
    const res = await fetch(match.job_url, {
      headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15_000),
    })
    finalUrl = res.url
    html = await res.text()
  } catch (err) {
    return NextResponse.json({
      error: 'fetch_failed',
      message: (err as Error).message,
      hint: 'Inzerát nelze načíst — doplň email ručně',
    }, { status: 502 })
  }

  // Decode HTML entities + strip tags + look for emails
  const decoded = html
    .replace(/&#0*64;/g, '@')
    .replace(/&#x40;/gi, '@')
    .replace(/&amp;/g, '&')
    .replace(/\(at\)/gi, '@')
    .replace(/\s\[at\]\s/gi, '@')
    .replace(/<[^>]+>/g, ' ')

  const email = extractRecipientEmail(decoded)
  if (!email) {
    return NextResponse.json({
      ok: false,
      reason: 'not_found',
      hint: 'V inzerátu nebyl email — firma nejspíš přijímá jen přes portál. Otevři inzerát a zkontroluj.',
      final_url: finalUrl,
    })
  }

  // Persist
  await supabaseAdmin
    .from('daily_matches')
    .update({ recipient_email: email })
    .eq('id', id)
    .eq('member_id', user.id)

  return NextResponse.json({ ok: true, email, final_url: finalUrl })
}
