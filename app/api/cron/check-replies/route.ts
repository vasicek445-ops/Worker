import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthorizedGmail } from '@/lib/gmail'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

/**
 * Detekce odpovědí od zaměstnavatelů.
 * Projde nezodpovězené odeslané emaily (email_send_log), pro každý zkontroluje
 * Gmail thread — pokud v něm je zpráva od někoho jiného než uživatele, je to
 * odpověď → označí replied = true. Dashboard z toho počítá funnel statistik.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: logs, error } = await supabase
    .from('email_send_log')
    .select('id, member_id, thread_id')
    .eq('replied', false)
    .not('thread_id', 'is', null)
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!logs || logs.length === 0) {
    return NextResponse.json({ checked: 0, replied: 0 })
  }

  // seskupit podle člena — každý má vlastní Gmail token
  const byMember = new Map<string, typeof logs>()
  for (const l of logs) {
    const arr = byMember.get(l.member_id) ?? []
    arr.push(l)
    byMember.set(l.member_id, arr)
  }

  let checked = 0
  let repliedFound = 0

  for (const [memberId, memberLogs] of byMember) {
    const { data: oauth } = await supabase
      .from('email_oauth_tokens')
      .select('access_token, refresh_token, email, revoked')
      .eq('member_id', memberId)
      .eq('provider', 'gmail')
      .single()

    if (!oauth || oauth.revoked || !oauth.refresh_token) continue

    let gmail
    try {
      gmail = await getAuthorizedGmail(oauth.access_token ?? '', oauth.refresh_token)
    } catch {
      continue
    }

    const userEmail = (oauth.email || '').toLowerCase()

    for (const log of memberLogs) {
      checked++
      try {
        const thread = await gmail.users.threads.get({
          userId: 'me',
          id: log.thread_id as string,
          format: 'metadata',
          metadataHeaders: ['From'],
        })
        const messages = thread.data.messages || []
        // odpověď = zpráva v threadu, jejíž From není uživatel
        const hasReply = messages.some((m) => {
          const from = (
            m.payload?.headers?.find((h) => h.name === 'From')?.value || ''
          ).toLowerCase()
          return from !== '' && !from.includes(userEmail)
        })
        if (hasReply) {
          await supabase
            .from('email_send_log')
            .update({ replied: true })
            .eq('id', log.id)
          repliedFound++
        }
      } catch {
        // thread nenalezen / API chyba — přeskoč
      }
    }
  }

  return NextResponse.json({ checked, replied: repliedFound })
}
