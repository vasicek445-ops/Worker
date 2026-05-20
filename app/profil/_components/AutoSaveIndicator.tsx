'use client'

import { useEffect, useState } from 'react'

export interface AutoSaveIndicatorProps {
  saving: boolean
  savedAt: number | null
  saveError?: string | null
}

export default function AutoSaveIndicator({ saving, savedAt, saveError }: AutoSaveIndicatorProps) {
  const [now, setNow] = useState<number>(() => Date.now())

  // Tick once a second only when we have a recent save to render
  useEffect(() => {
    if (!savedAt) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [savedAt])

  if (saveError) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs"
        style={{
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
        title={saveError}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>Uložení selhalo</span>
      </div>
    )
  }

  if (saving) {
    return (
      <div
        className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs"
        style={{
          background: 'rgba(255,255,255,0.04)',
          color: 'rgba(255,255,255,0.7)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <span
          className="inline-block w-3 h-3 rounded-full border-2"
          style={{
            borderColor: 'rgba(255,255,255,0.2)',
            borderTopColor: '#fb923c',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span>Ukládám...</span>
        <style jsx>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  if (savedAt && now - savedAt < 5000) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs"
        style={{
          background: 'rgba(34, 197, 94, 0.1)',
          color: '#22c55e',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>Uloženo</span>
      </div>
    )
  }

  return null
}
