import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cookieToken = req.cookies.get('sb-access-token')?.value

  // Try to get token from cookie or header
  const token = authHeader?.replace('Bearer ', '') || cookieToken

  if (!token) {
    return NextResponse.json({ error: 'No token found', hint: 'Not logged in or no auth cookie' })
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

  if (authError || !user) {
    return NextResponse.json({ error: 'Auth failed', authError: authError?.message, hint: 'Token invalid or expired' })
  }

  const { data: sub, error: subError } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    subscription: sub,
    subError: subError?.message || null,
    isActive: sub?.status === 'active',
  })
}
