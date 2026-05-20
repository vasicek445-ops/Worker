import { google } from 'googleapis'

export const GMAIL_SCOPES = [
  'openid',
  'email',
  'https://www.googleapis.com/auth/gmail.send',
]

/**
 * Decode an unverified Google id_token payload — Google already signs/verifies it,
 * we only need the email + sub claim.
 */
export function decodeIdToken(idToken: string): { email?: string; sub?: string } {
  const [, payload] = idToken.split('.')
  if (!payload) return {}
  return JSON.parse(Buffer.from(payload, 'base64').toString('utf8'))
}

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
  attachments?: { filename: string; mimeType: string; contentBase64: string }[]
}) {
  const gmail = await getAuthorizedGmail(params.accessToken, params.refreshToken)

  // From display name — RFC 2047 zakódování pro diakritiku (jinak mojibake u příjemce)
  const fromDisplay = /^[\x00-\x7F]*$/.test(params.fromName)
    ? `"${params.fromName}"`
    : encodeMimeHeader(params.fromName)
  const baseHeaders: string[] = [
    `From: ${fromDisplay} <${params.fromEmail}>`,
    `To: ${params.to}`,
    `Subject: ${encodeMimeHeader(params.subject)}`,
    'MIME-Version: 1.0',
  ]
  if (params.replyTo) baseHeaders.push(`Reply-To: ${params.replyTo}`)

  let raw: string
  if (params.attachments?.length) {
    // multipart/mixed — HTML tělo + přílohy (CV PDF)
    const boundary = `woker_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
    const bodyPart = [
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      params.bodyHtml,
    ].join('\r\n')
    const attParts = params.attachments.map((att) =>
      [
        `--${boundary}`,
        `Content-Type: ${att.mimeType}; name="${att.filename}"`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${att.filename}"`,
        '',
        att.contentBase64.replace(/(.{76})/g, '$1\r\n'),
      ].join('\r\n'),
    )
    raw = [
      ...baseHeaders,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      bodyPart,
      ...attParts,
      `--${boundary}--`,
    ].join('\r\n')
  } else {
    raw = [
      ...baseHeaders,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      params.bodyHtml,
    ].join('\r\n')
  }

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
