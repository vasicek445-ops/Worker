// REDIRECT only — Gmail setup bylo sjednoceno do /smart-apply.
// OAuth callback (?gmail=connected, ?error=...) se nyni resi tam.
// Predchozi 281-radkova implementace je v git historii.
import { redirect } from 'next/navigation'

export default function GmailRedirect() {
  redirect('/smart-apply')
}
