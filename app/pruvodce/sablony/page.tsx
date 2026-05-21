// AI Sablony hub byl duplicate s /pruvodce (Nastroje). Sub-routes
// (cv, motivacni-dopis, email, bydleni, analyza, smlouva, pohovor) zustavaji
// — user se na ne dostane z /pruvodce. Hub redirect zachova back-compat odkazy.
import { redirect } from 'next/navigation'

export default function SablonyRedirect() {
  redirect('/pruvodce')
}
