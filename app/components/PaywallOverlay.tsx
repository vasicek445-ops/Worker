'use client'

import Link from 'next/link'

interface PaywallOverlayProps {
  title?: string
  description?: string
  children: React.ReactNode
  isLocked: boolean
  blurAmount?: string
}

export default function PaywallOverlay({
  title = 'Odemkni plný přístup',
  description = 'Získej kontakty na firmy, průvodce procesem a AI asistenta za 9,90 €/měsíc',
  children,
  isLocked,
  blurAmount = '8px',
}: PaywallOverlayProps) {
  if (!isLocked) return <>{children}</>

  return (
    <div className="relative">
      <div
        style={{ filter: `blur(${blurAmount})` }}
        className="pointer-events-none select-none"
        aria-hidden="true"
      >
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-[#1A1A1A]/95 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">{description}</p>
          <Link
            href="/pricing"
            className="inline-block bg-[#E8302A] text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 transition w-full"
          >
            Předplatit za 9,90 €/měsíc
          </Link>
          <p className="text-gray-600 text-xs mt-3">Zrušíš kdykoliv • Testovací období 7 dní</p>
        </div>
      </div>
    </div>
  )
}
