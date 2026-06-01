import { Resend } from 'resend'
import { supabaseAdmin } from './supabase-admin'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Woker komunita <info@gowoker.com>'
const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://gowoker.com'

type PrefKey = 'notify_mentions' | 'notify_dms' | 'notify_weekly'

/**
 * Pošle e-mail uživateli, pokud má daný typ notifikace zapnutý.
 * E-mail dohledá přes auth admin (profiles.id = auth user id).
 */
export async function emailUser(
  userId: string,
  prefKey: PrefKey,
  subject: string,
  bodyHtml: string,
): Promise<void> {
  try {
    const { data: prof } = await supabaseAdmin
      .from('profiles')
      .select(`${prefKey}, full_name`)
      .eq('id', userId)
      .single()
    // Respektuj opt-out (default true, takže null/undefined = poslat)
    if (prof && (prof as Record<string, unknown>)[prefKey] === false) return

    const { data: u } = await supabaseAdmin.auth.admin.getUserById(userId)
    const email = u?.user?.email
    if (!email) return

    await resend.emails.send({ from: FROM, to: email, subject, html: wrap(bodyHtml) })
  } catch (err) {
    console.error('emailUser error:', err)
  }
}

/** Woker-branded e-mail shell (oranžová, dark-friendly, s odhlášením). */
function wrap(inner: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1a1a1a">
    <div style="font-size:20px;font-weight:800;color:#f97316;margin-bottom:16px">Woker</div>
    ${inner}
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
    <p style="font-size:12px;color:#999">Dostáváš tohle, protože jsi součástí komunity Woker.
      <a href="${BASE}/profil/osobni-udaje" style="color:#f97316">Upravit notifikace</a></p>
  </div>`
}

export function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:600;font-size:14px">${label}</a>`
}

export { BASE }
