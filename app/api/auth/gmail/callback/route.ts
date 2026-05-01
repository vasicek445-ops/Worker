import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { exchangeCodeForTokens, getAuthorizedGmail } from '@/lib/gmail'

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

    // Fetch the actual gmail address from Google profile
    const gmail = await getAuthorizedGmail(tokens.access_token!, tokens.refresh_token)
    const profile = await gmail.users.getProfile({ userId: 'me' })
    const email = profile.data.emailAddress!

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
