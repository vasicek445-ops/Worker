'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  icon: string
  badge?: string | number
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Hlavní',
    items: [
      { href: '/dashboard', label: 'Domů', icon: '🏠' },
      { href: '/nabidky', label: 'Nabídky práce', icon: '💼' },
      { href: '/bydleni', label: 'Bydlení', icon: '🏘️' },
      { href: '/kontakty', label: 'Kontakty', icon: '📇' },
      { href: '/prihlasky', label: 'Moje přihlášky', icon: '📨' },
      { href: '/dokumenty', label: 'Moje dokumenty', icon: '📄' },
      { href: '/profil/gmail', label: 'Smart Apply', icon: '✨' },
    ],
  },
  {
    label: 'Beta',
    items: [
      { href: '/pruvodce', label: 'Nástroje', icon: '🛠️' },
      { href: '/asistent', label: 'AI', icon: '🤖' },
    ],
  },
  {
    label: 'Další',
    items: [
      { href: '/komunita', label: 'Komunita', icon: '💬' },
      { href: '/pro', label: 'Wooky AI', icon: '🦉' },
    ],
  },
]

export default function WokerSidebar() {
  const pathname = usePathname()

  function isActive(href: string): boolean {
    if (!pathname) return false
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside
      aria-label="Hlavní navigace"
      className="hidden lg:flex flex-col shrink-0 sticky top-0 self-start h-screen w-[220px]"
      style={{
        background: '#0a0a12',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-5 h-14 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)' }}
        >
          W
        </span>
        <span className="font-bold text-base tracking-tight" style={{ color: '#fb923c' }}>
          Woker
        </span>
      </Link>

      {/* Nav groups (scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 min-h-0">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5 last:mb-0">
            <div
              className="px-3 mb-1.5 text-[10px] font-semibold uppercase"
              style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}
            >
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-colors"
                      style={{
                        background: active ? 'rgba(251, 146, 60, 0.1)' : 'transparent',
                        color: active ? '#fb923c' : '#e5e5ea',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) e.currentTarget.style.background = '#1a1a26'
                      }}
                      onMouseLeave={(e) => {
                        if (!active) e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <span className="text-sm leading-none w-4 text-center">{item.icon}</span>
                      <span
                        className="text-sm flex-1 truncate"
                        style={{ fontWeight: active ? 600 : 500 }}
                      >
                        {item.label}
                      </span>
                      {item.badge !== undefined && (
                        <span
                          className="text-[10px] font-semibold tabular-nums px-1.5 rounded"
                          style={{
                            color: 'rgba(255,255,255,0.6)',
                            background: 'rgba(255,255,255,0.06)',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Logout (sticky bottom) */}
      <div
        className="shrink-0 px-3 py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors"
            style={{ color: 'rgba(255,255,255,0.65)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1a1a26'
              e.currentTarget.style.color = '#fafafa'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
            }}
          >
            <span className="text-sm leading-none w-4 text-center">↩</span>
            <span className="font-medium">Odhlásit se</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
