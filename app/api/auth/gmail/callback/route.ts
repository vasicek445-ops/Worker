import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { exchangeCodeForTokens, decodeIdToken } from '@/lib/gmail'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

/**
 * Google redirects the user here after consent.
 * We exchange the code for tokens, fetch the user's gmail address, and store
 * the refresh_token tied to their Woker member id.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const stateParam = req.nextUrl.searchParams.get('state') ?? ''
  const errorParam = req.nextUrl.searchParams.get('error')

  if (errorParam) {
    return redirectToApp(req, `error=${encodeURIComponent(errorParam)}`)
  }
  if (!code) return redirectToApp(req, 'error=missing_code')

  const [statePart, memberIdPart] = stateParam.split('.')
  const cookieState = req.cookies.get('gmail_oauth_state')?.value

  if (!statePart || !cookieState || statePart !== cookieState) {
    return redirectToApp(req, 'error=state_mismatch')
  }
  if (!memberIdPart) return redirectToApp(req, 'error=missing_member')

  try {
    const redirectUri = `${getBaseUrl(req)}/api/auth/gmail/callback`
    const tokens = await exchangeCodeForTokens(code, redirectUri)
    if (!tokens.refresh_token) {
      return redirectToApp(req, 'error=no_refresh_token&hint=revoke_in_google_account_first')
    }

    // Get email from id_token (no extra Gmail scope required — `email` OIDC scope covers it)
    const idTokenPayload = tokens.id_token ? decodeIdToken(tokens.id_token) : {}
    const email = idTokenPayload.email
    if (!email) {
      return redirectToApp(req, 'error=missing_email_in_id_token')
    }

    // Upsert into email_oauth_tokens (one row per member+provider)
    const { error: dbError } = await supabaseAdmin
      .from('email_oauth_tokens')
      .upsert({
        member_id: memberIdPart,
        provider: 'gmail',
        email,
        refresh_token: tokens.refresh_token,
        access_token: tokens.access_token,
        expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        scopes: tokens.scope?.split(' ') ?? [],
        connected_at: new Date().toISOString(),
        revoked: false,
      }, { onConflict: 'member_id,provider' })

    if (dbError) {
      console.error('Token upsert failed', dbError)
      return redirectToApp(req, 'error=token_save_failed')
    }

    const res = redirectToApp(req, `gmail=connected&email=${encodeURIComponent(email)}`)
    res.cookies.delete('gmail_oauth_state')
    return res
  } catch (err) {
    console.error('Gmail OAuth callback error', err)
    return redirectToApp(req, 'error=callback_failed')
  }
}

function redirectToApp(req: NextRequest, query: string) {
  const url = new URL('/profil/gmail?' + query, getBaseUrl(req))
  return NextResponse.redirect(url)
}

function getBaseUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_BASE_URL || `${req.nextUrl.protocol}//${req.headers.get('host')}`
}
