import { redirect } from 'next/navigation'

// Legacy 4-step wizard byl 766 radku a stale referencoval stary LetterTemplate shape.
// Novy editor je v /pruvodce/sablony/motivacni-dopis/editor s parity feature setem
// jako CV builder (50/50 live preview, multi-section nav, AI gen, save, share).
// Backup: page.tsx.bak-legacy
export default function MotivacniDopisRedirect() {
  redirect('/pruvodce/sablony/motivacni-dopis/editor')
}
