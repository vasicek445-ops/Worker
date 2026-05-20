'use client'

import Link from 'next/link'
import CVPreview, { CVData } from '../../components/CVPreview'

interface PublishedCVViewProps {
  data: CVData
  photo: string | null
  template: string
  accentColor: string
}

// Klient wrapper kolem CVPreview — public view bez save/edit akcí.
// CVPreview je 'use client' (používá useRef/useState), takže ho voláme z client komponenty.
export default function PublishedCVView({ data, photo, template, accentColor }: PublishedCVViewProps) {
  return (
    <main
      className="min-h-screen w-full"
      style={{
        background: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        padding: '40px 16px',
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: '820px',
          width: '100%',
        }}
      >
        {/* Bez onSave → render-only mód */}
        <CVPreview
          data={data}
          photo={photo}
          template={template || 'pro-classic'}
          accentColor={accentColor || '#2c3e50'}
        />

        {/* Passive marketing footer */}
        <footer
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#94a3b8',
          }}
        >
          <p style={{ margin: 0 }}>
            Vytvořeno přes{' '}
            <Link
              href="https://woker.ch"
              style={{ color: '#fb923c', fontWeight: 600, textDecoration: 'none' }}
              target="_blank"
              rel="noopener"
            >
              Woker
            </Link>
            {' '}— práce a bydlení ve Švýcarsku
          </p>
        </footer>
      </div>
    </main>
  )
}
