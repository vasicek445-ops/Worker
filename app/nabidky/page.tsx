// REDIRECT only — nabidky bylo sjednoceno do /smart-apply.
// Predchozi 318-radkova implementace je v git historii (pred commitem 6fbb3ff).
import { redirect } from 'next/navigation'

export default function NabidkyRedirect() {
  redirect('/smart-apply')
}
