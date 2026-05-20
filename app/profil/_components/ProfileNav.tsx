'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PROFILE_SECTIONS } from '../../../lib/profile/sections'
import { calculateSectionCompleteness, type TrackedSection } from '../../../lib/profile/completeness'
import { useProfileShell } from './ProfileShell'

const TRACKED_SECTIONS = new Set<string>(['osobni-udaje', 'kariera', 'cil'])

// Horizontal tab groups (Tidal/Flixy/Resend pattern). Visual dividers between groups.
// Profil = ja jako uzivatel (Osobni/Kariera/Cil), Ucet = aplikacni nastaveni (Preference/Nastaveni).
const TAB_GROUPS: Array<{ ids: string[] }> = [
  { ids: ['osobni-udaje', 'kariera', 'cil'] },
  { ids: ['preference', 'nastaveni'] },
]

export default function ProfileNav() {
  const pathname = usePathname()
  const { profile } = useProfileShell()

  function isActive(href: string): boolean {
    if (!pathname) return false
    if (pathname === href) return true
    return pathname.startsWith(href + '/')
  }

  function sectionPercent(id: string): number | null {
    if (!TRACKED_SECTIONS.has(id)) return null
    return calculateSectionCompleteness(profile, id as TrackedSection).percent
  }

  return (
    <nav
      aria-label="Sekce profilu"
      className="relative -mx-4 px-4 lg:mx-0 lg:px-0 overflow-x-auto"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div
        className="flex items-stretch gap-1 lg:gap-1.5 border-b"
        style={{
          borderColor: 'rgba(255,255,255,0.06)',
          minWidth: 'max-content',
        }}
      >
        {TAB_GROUPS.map((group, groupIdx) => (
          <div key={groupIdx} className="flex items-stretch gap-0.5">
            {group.ids.map((id) => {
              const section = PROFILE_SECTIONS.find((s) => s.id === id)
              if (!section) return null
              const active = isActive(section.href)
              const pct = sectionPercent(section.id)
              return (
                <Link
                  key={section.id}
                  href={section.href}
                  className="relative inline-flex items-center gap-1.5 px-3 lg:px-3.5 py-2.5 text-sm whitespace-nowrap transition-colors"
                  style={{
                    color: active ? '#fb923c' : 'rgba(255,255,255,0.65)',
                    fontWeight: active ? 600 : 500,
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.color = '#fafafa'
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
                  }}
                >
                  <span className="text-sm leading-none">{section.icon}</span>
                  <span>{section.label}</span>
                  {pct !== null && <CompletionBadge percent={pct} active={active} />}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-2 right-2 -bottom-px h-0.5 rounded-t"
                      style={{ background: '#fb923c' }}
                    />
                  )}
                </Link>
              )
            })}
            {groupIdx < TAB_GROUPS.length - 1 && (
              <span
                aria-hidden
                className="self-center mx-1 lg:mx-2"
                style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.1)' }}
              />
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}

function CompletionBadge({ percent, active }: { percent: number; active: boolean }) {
  if (percent === 100) {
    return (
      <span
        aria-label="hotovo"
        className="text-[10px] font-semibold tabular-nums"
        style={{ color: active ? '#fb923c' : '#22c55e' }}
      >
        ✓
      </span>
    )
  }
  if (percent === 0) {
    return (
      <span
        aria-label="0 %"
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: 'rgba(255,255,255,0.25)' }}
      />
    )
  }
  return (
    <span
      aria-label={`${percent} %`}
      className="text-[10px] font-medium tabular-nums px-1 rounded"
      style={{
        color: active ? '#fb923c' : 'rgba(255,255,255,0.55)',
        background: active ? 'rgba(251,146,60,0.12)' : 'rgba(255,255,255,0.05)',
      }}
    >
      {percent}%
    </span>
  )
}
