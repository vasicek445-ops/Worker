import { redirect } from 'next/navigation'

// Letter flow: vyber-sablonu (krok 1) → editor (krok 2). Picker je dobry entry
// point, user vidi 3 varianty pred nez zacne psat.
export default function MotivacniDopisRedirect() {
  redirect('/pruvodce/sablony/motivacni-dopis/vyber-sablonu')
}
