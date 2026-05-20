'use client'

import Link from 'next/link'
import type { ProfileRow } from '../../../lib/profile/types'
import { calculateCompleteness } from '../../../lib/profile/completeness'
import { getProfileSection } from '../../../lib/profile/sections'

export interface ReadinessSidebarProps {
  profile: ProfileRow | null
}

export default function ReadinessSidebar({ profile }: ReadinessSidebarProps) {
  const { percent, filledCount, totalCount, missing } = calculateCompleteness(profile)
  const visibleMissing = missing.slice(0, 5)

  // Circular progress geometry
  const size = 96
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (percent / 100) * circumference

  return (
    <aside
      aria-label="Připravenost profilu"
      className="hidden lg:flex flex-col gap-4 w-[220px] shrink-0"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Progress card */}
      <div
        className="rounded-xl p-5"
        style={{
          background: '#111120',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={stroke}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#fb923c"
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold" style={{ color: '#fb923c' }}>
                {percent}%
              </span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold" style={{ color: '#e5e5ea' }}>
              Připravenost
            </div>
            <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {filledCount} z {totalCount} polí vyplněno
            </div>
          </div>
        </div>

        {visibleMissing.length > 0 && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Doplň pro lepší match
            </div>
            <ul className="space-y-1">
              {visibleMissing.map((item) => {
                const section = getProfileSection(item.section)
                const href = section?.href || '/profil/osobni-udaje'
                return (
                  <li key={String(item.key)}>
                    <Link
                      href={href}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors"
                      style={{ color: '#e5e5ea' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1a1a26'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: '#fb923c' }}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {missing.length === 0 && (
          <div className="mt-4 pt-4 border-t text-sm" style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#22c55e' }}>
            Profil je kompletní.
          </div>
        )}
      </div>

    </aside>
  )
}
