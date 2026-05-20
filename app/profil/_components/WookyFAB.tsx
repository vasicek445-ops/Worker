'use client'

import { useState } from 'react'
import WookyDrawer from './WookyDrawer'

// Floating Action Button — fixed bottom-right, vidi se jen v /profil/* (vnoreno do ProfileShell).
// Klik otevre WookyDrawer (AI asistent pro upravy profilu).
export default function WookyFAB() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Otevřít Wooky AI asistenta"
        className="fixed bottom-6 right-6 z-[80] group flex items-center gap-2 pl-4 pr-5 py-3 rounded-full shadow-lg transition-all hover:scale-[1.03] active:scale-[0.98]"
        style={{
          background: 'linear-gradient(135deg, #fb923c, #f97316)',
          color: 'white',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          boxShadow:
            '0 8px 32px rgba(251,146,60,0.35), 0 0 0 1px rgba(255,255,255,0.1) inset',
        }}
      >
        <span className="text-lg leading-none">✨</span>
        <span className="text-sm font-semibold">Pomoz mi, Wooky</span>
      </button>

      <WookyDrawer open={open} onClose={() => setOpen(false)} />
    </>
  )
}
