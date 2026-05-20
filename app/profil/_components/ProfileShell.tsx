'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { PROFILE_SECTIONS } from '../../../lib/profile/sections'
import { useProfile, type UseProfileResult } from '../../../lib/profile/hooks'
import ProfileNav from './ProfileNav'
import ReadinessSidebar from './ReadinessSidebar'
import AutoSaveIndicator from './AutoSaveIndicator'
import WookyFAB from './WookyFAB'

// Single source of truth: useProfile() is called ONCE here in the shell and exposed
// to all profile pages via context. Pages call useProfileShell() (NOT useProfile())
// to read/update — that way `profile` data is shared with ReadinessSidebar +
// ProfileNav completion badges.
type ProfileShellContextValue = UseProfileResult

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
  const profileData = useProfile()
  const { profile, saving, savedAt, loading, userId, saveError } = profileData
  const pathname = usePathname()
  const current = getCurrentSection(pathname)

  const value = useMemo<ProfileShellContextValue>(
    () => profileData,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile, saving, savedAt, loading, userId],
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
              <AutoSaveIndicator saving={saving} savedAt={savedAt} saveError={saveError} />
            </div>
          </div>

          {/* Horizontal tabs (Tidal/Flixy pattern) */}
          <div className="mb-6">
            <ProfileNav />
          </div>

          {/* 2-col content: main + sticky readiness sidebar */}
          <div className="flex gap-6 lg:gap-8">
            <main className="flex-1 min-w-0">
              {children}
            </main>

            {showReadiness && (
              <div className="hidden lg:block w-[240px] shrink-0">
                <div className="sticky top-6">
                  <ReadinessSidebar profile={profile} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wooky AI floating asistent — jen v /profil/* */}
        <WookyFAB />
      </div>
    </ProfileShellContext.Provider>
  )
}
