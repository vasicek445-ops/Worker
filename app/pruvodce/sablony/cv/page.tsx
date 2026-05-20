import { redirect } from 'next/navigation'

// Nový tok: vstupní bod → vyber šablonu → editor.
// Původní 1-page CV builder zachován v page.legacy.tsx.bak pro referenci.
export default function CvIndexPage() {
  redirect('/pruvodce/sablony/cv/vyber-sablonu')
}
