'use client'

import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { ProfileRow } from '../../../lib/profile/types'
import { PROFILE_SECTIONS } from '../../../lib/profile/sections'
import ProfileNav from './ProfileNav'
import ReadinessSidebar from './ReadinessSidebar'
import AutoSaveIndicator from './AutoSaveIndicator'

interface ProfileShellContextValue {
  profile: ProfileRow | null
  setProfile: (p: ProfileRow | null) => void
  saving: boolean
  setSaving: (v: boolean) => void
  savedAt: number | null
  setSavedAt: (t: number | null) => void
}

const ProfileShellContext = createContext<ProfileShellContextValue | null>(null)

export function useProfileShell(): ProfileShellContextValue {
  const ctx = useContext(ProfileShellContext)
  if (!ctx) throw new Error('useProfileShell must be used inside ProfileShell')
  return ctx
}

export interface ProfileShellProps {
  children: ReactNode
  showReadiness?: boolean
}

function getCurrentSection(pathname: string | null) {
  if (!pathname) return null
  return (
    PROFILE_SECTIONS.find((s) => pathname === s.href || pathname.startsWith(s.href + '/')) || null
  )
}

export default function ProfileShell({ children, showReadiness = true }: ProfileShellProps) {
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const pathname = usePathname()
  const current = getCurrentSection(pathname)

  const value = useMemo<ProfileShellContextValue>(
    () => ({ profile, setProfile, saving, setSaving, savedAt, setSavedAt }),
    [profile, saving, savedAt],
  )

  return (
    <ProfileShellContext.Provider value={value}>
      <div
        className="min-h-screen"
        style={{
          background: '#0a0a12',
          color: '#e5e5ea',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-5 lg:py-8">
          {/* Header — breadcrumb + tight title (Linear pattern) */}
          <div className="flex items-end justify-between gap-4 mb-5">
            <div className="min-w-0">
              <nav
                aria-label="Drobečková navigace"
                className="text-[11px] font-medium mb-1.5"
                style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.02em' }}
              >
                <Link
                  href="/profil/osobni-udaje"
                  className="hover:text-white transition-colors"
                  style={{ color: 'inherit' }}
                >
                  Profil
                </Link>
                {current && (
                  <>
                    <span className="mx-1.5" aria-hidden>›</span>
                    <span style={{ color: 'rgba(255,255,255,0.65)' }}>{current.label}</span>
                  </>
                )}
              </nav>
              <h1
                className="text-[22px] font-semibold tracking-tight truncate"
                style={{ color: '#fafafa', letterSpacing: '-0.01em' }}
              >
                {current ? current.label : 'Profil'}
              </h1>
            </div>
            <div className="shrink-0 pb-1">
              <AutoSaveIndicator saving={saving} savedAt={savedAt} />
            </div>
          </div>

          {/* Horizontal tabs (Tidal/Flixy pattern) */}
          <div className="mb-6">
            <ProfileNav />
          </div>

          {/* 2-col content: main + optional readiness sidebar */}
          <div className="flex gap-6 lg:gap-10">
            <main className="flex-1 min-w-0">
              {children}
            </main>

            {showReadiness && <ReadinessSidebar profile={profile} />}
          </div>
        </div>
      </div>
    </ProfileShellContext.Provider>
  )
}
