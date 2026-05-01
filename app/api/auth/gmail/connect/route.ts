import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildAuthUrl } from '@/lib/gmail'
import { randomBytes } from 'node:crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

/**
 * Initiate Gmail OAuth — generates a random state, stores it in a short-lived
 * cookie, and redirects the user to Google's consent screen.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const state = randomBytes(16).toString('hex')
  const redirectUri = `${getBaseUrl(req)}/api/auth/gmail/callback`
  const url = buildAuthUrl(`${state}.${user.id}`, redirectUri)

  const res = NextResponse.json({ url })
  res.cookies.set('gmail_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return res
}

function getBaseUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_BASE_URL || `${req.nextUrl.protocol}//${req.headers.get('host')}`
}
