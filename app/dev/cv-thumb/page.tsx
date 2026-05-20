'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import CVPreview from '../../components/CVPreview'
import { DUMMY_CV_DATA } from '../../../lib/cv/dummy'

// Generic worker silhouette pro thumbnail — neutrální, bez identifikace skutečné osoby
const DUMMY_PHOTO_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 240'>
    <rect width='200' height='240' fill='#cbd5e1'/>
    <circle cx='100' cy='90' r='42' fill='#94a3b8'/>
    <path d='M30 240 Q30 150 100 150 Q170 150 170 240 Z' fill='#94a3b8'/>
  </svg>`)

function CvThumbInner() {
  const params = useSearchParams()
  const template = params.get('template') || 'klassisch'
  const color = params.get('color') || '#1e293b'

  return (
    <>
      {/* Hide everything from parent layout (sidebar, cookie banner, topbars) during thumbnail capture */}
      <style dangerouslySetInnerHTML={{ __html: `
        html, body { background: white !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; }
        body > [data-cookie-consent], body > div[role="dialog"] { display: none !important; }
        body > *:not(:has(#cv-thumb-root)) { display: none !important; }
        /* Schovej action buttons (Stáhnout PDF / Uložit) + footer hint v CVPreview pro thumbnail */
        #cv-thumb-root .flex.gap-3.mb-6 { display: none !important; }
        #cv-thumb-root p.text-gray-500.text-xs.text-center.mt-4 { display: none !important; }
      ` }} />
      <div
        id="cv-thumb-root"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'white',
          zIndex: 99999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            transform: 'scale(0.5)',
            transformOrigin: 'top left',
            width: '200%',
          }}
        >
          <CVPreview
            data={DUMMY_CV_DATA}
            photo={DUMMY_PHOTO_SVG}
            template={template}
            accentColor={color}
          />
        </div>
      </div>
    </>
  )
}

export default function CvThumbPage() {
  return (
    <Suspense fallback={<div style={{ background: 'white', minHeight: '100vh' }} />}>
      <CvThumbInner />
    </Suspense>
  )
}
