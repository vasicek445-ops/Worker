import { google } from 'googleapis'

export const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.send']

export function getOAuthClient(redirectUri?: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set in env')
  }
  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri ?? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/auth/gmail/callback`,
  )
}

export function buildAuthUrl(state: string, redirectUri?: string) {
  const client = getOAuthClient(redirectUri)
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: GMAIL_SCOPES,
    state,
    include_granted_scopes: true,
  })
}

export async function exchangeCodeForTokens(code: string, redirectUri?: string) {
  const client = getOAuthClient(redirectUri)
  const { tokens } = await client.getToken(code)
  return tokens
}

export async function getAuthorizedGmail(accessToken: string, refreshToken: string) {
  const client = getOAuthClient()
  client.setCredentials({ access_token: accessToken, refresh_token: refreshToken })
  return google.gmail({ version: 'v1', auth: client })
}

/**
 * Build a base64url-encoded RFC 822 message and send it via the member's Gmail.
 */
export async function sendGmailMessage(params: {
  accessToken: string
  refreshToken: string
  fromName: string
  fromEmail: string
  to: string
  subject: string
  bodyHtml: string
  replyTo?: string
}) {
  const gmail = await getAuthorizedGmail(params.accessToken, params.refreshToken)
  const headers: string[] = [
    `From: "${params.fromName}" <${params.fromEmail}>`,
    `To: ${params.to}`,
    `Subject: ${encodeMimeHeader(params.subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
  ]
  if (params.replyTo) headers.push(`Reply-To: ${params.replyTo}`)
  const raw = [...headers, '', params.bodyHtml].join('\r\n')
  const encoded = Buffer.from(raw, 'utf8').toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const result = await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encoded } })
  return result.data
}

function encodeMimeHeader(text: string) {
  // RFC 2047 — only encode non-ASCII (Czech diacritics)
  if (/^[\x00-\x7F]*$/.test(text)) return text
  return `=?UTF-8?B?${Buffer.from(text, 'utf8').toString('base64')}?=`
}
