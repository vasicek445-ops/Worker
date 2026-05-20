'use client'

import { useEffect, useRef, useState } from 'react'
import type { ScoreBreakdown } from '@/lib/cv/score'

interface WokerScoreProps {
  breakdown: ScoreBreakdown
  compact?: boolean
}

function colorForTotal(total: number): { bar: string; text: string } {
  if (total >= 80) return { bar: '#22c55e', text: '#22c55e' }
  if (total >= 60) return { bar: '#fb923c', text: '#fb923c' }
  return { bar: '#ef4444', text: '#ef4444' }
}

export default function WokerScore({ breakdown, compact = false }: WokerScoreProps) {
  const [open, setOpen] = useState(false)
  const [animatedTotal, setAnimatedTotal] = useState(breakdown.total)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const { bar: barColor, text: textColor } = colorForTotal(breakdown.total)

  useEffect(() => {
    const start = animatedTotal
    const target = breakdown.total
    if (start === target) return
    const startTime = performance.now()
    const duration = 300
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration)
      // ease-out
      const eased = 1 - Math.pow(1 - t, 2)
      const value = Math.round(start + (target - start) * eased)
      setAnimatedTotal(value)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakdown.total])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  if (compact) {
    return (
      <div ref={popoverRef} style={{ position: 'relative', display: 'inline-block' }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          title="Klikni pro detail"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#111120',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            padding: '6px 10px',
            cursor: 'pointer',
            color: '#f3f4f6',
            fontFamily: 'inherit',
            fontSize: 13,
          }}
        >
          <span style={{ fontWeight: 600, color: textColor, fontVariantNumeric: 'tabular-nums' }}>
            {animatedTotal}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>/ 100</span>
          <span
            style={{
              display: 'inline-block',
              width: 100,
              height: 6,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                display: 'block',
                height: '100%',
                width: `${animatedTotal}%`,
                background: barColor,
                transition: 'width 300ms ease-out, background 200ms ease',
              }}
            />
          </span>
        </button>

        {open && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              minWidth: 280,
              background: '#111120',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              padding: 14,
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              zIndex: 50,
              color: '#f3f4f6',
              fontSize: 13,
            }}
          >
            <FullView breakdown={breakdown} embedded />
          </div>
        )}
      </div>
    )
  }

  return <FullView breakdown={breakdown} />
}

function FullView({ breakdown, embedded = false }: { breakdown: ScoreBreakdown; embedded?: boolean }) {
  const { bar: barColor, text: textColor } = colorForTotal(breakdown.total)
  return (
    <div
      style={{
        background: embedded ? 'transparent' : '#111120',
        border: embedded ? 'none' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: embedded ? 0 : 16,
        color: '#f3f4f6',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: textColor, fontVariantNumeric: 'tabular-nums' }}>
          {breakdown.total}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>/ 100 Woker Score</span>
      </div>
      <div
        style={{
          width: '100%',
          height: 8,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 999,
          overflow: 'hidden',
          marginBottom: 14,
        }}
      >
        <span
          style={{
            display: 'block',
            height: '100%',
            width: `${breakdown.total}%`,
            background: barColor,
            transition: 'width 300ms ease-out, background 200ms ease',
          }}
        />
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
        {breakdown.items.map((item) => (
          <li
            key={item.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              padding: '4px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span
                aria-hidden
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 16,
                  height: 16,
                  borderRadius: 999,
                  background: item.passed ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)',
                  color: item.passed ? '#22c55e' : '#ef4444',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {item.passed ? '✓' : '✗'}
              </span>
              <span style={{ opacity: item.passed ? 1 : 0.85 }}>{item.label}</span>
            </span>
            <span
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontVariantNumeric: 'tabular-nums',
                fontSize: 12,
              }}
            >
              {item.got} / {item.max}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
