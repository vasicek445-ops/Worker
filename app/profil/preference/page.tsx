'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../supabase'
import { useProfileShell } from '../_components/ProfileShell'
import { useLanguage } from '../../../lib/i18n/LanguageContext'
import { ArrowLeft, Globe, AtSign, MessageCircle, CalendarDays, Megaphone } from 'lucide-react'

type Locale = 'cs' | 'sk' | 'en' | 'pl' | 'uk' | 'ro' | 'hu' | 'it' | 'pt' | 'es' | 'el'

const LANGUAGES: { code: Locale; flag: string; name: string }[] = [
  { code: 'cs', flag: '🇨🇿', name: 'Čeština' },
  { code: 'sk', flag: '🇸🇰', name: 'Slovenčina' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'pl', flag: '🇵🇱', name: 'Polski' },
  { code: 'uk', flag: '🇺🇦', name: 'Українська' },
  { code: 'ro', flag: '🇷🇴', name: 'Română' },
  { code: 'hu', flag: '🇭🇺', name: 'Magyar' },
  { code: 'it', flag: '🇮🇹', name: 'Italiano' },
  { code: 'pt', flag: '🇵🇹', name: 'Português' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'el', flag: '🇬🇷', name: 'Ελληνικά' },
]

function Toggle({ on, onClick, label, desc, Icon }: { on: boolean; onClick: () => void; label: string; desc?: string; Icon?: typeof Globe }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="min-w-0 pr-4 flex items-start gap-2.5">
        {Icon && <Icon size={16} strokeWidth={1.75} className="text-[#fb923c] mt-0.5 shrink-0" />}
        <div className="min-w-0">
          <p className="text-white text-sm m-0">{label}</p>
          {desc && <p className="text-white/40 text-xs m-0 mt-0.5">{desc}</p>}
        </div>
      </div>
      <button
        onClick={onClick}
        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${on ? 'bg-[#fb923c]' : 'bg-white/[0.1]'}`}
        aria-pressed={on}
        aria-label={label}
      >
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

export default function PreferencePage() {
  const router = useRouter()
  const { profile, loading, update, saving, savedAt } = useProfileShell()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { locale, setLocale } = useLanguage() as any
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return
      if (!data.user) { router.replace('/prihlaseni'); return }
      setAuthChecked(true)
    })
    return () => { cancelled = true }
  }, [router])

  const handleLanguageChange = (newCode: Locale) => {
    setLocale(newCode)
    update({ profile_locale: newCode })
  }

  const handleToggleNotifications = () => {
    const current = profile?.notifications ?? true
    update({ notifications: !current })
  }

  const toggleField = (field: string, current: boolean) => update({ [field]: !current })

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#fb923c] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentLocale = (profile?.profile_locale as Locale | undefined) || locale || 'cs'
  const notificationsOn = profile?.notifications ?? true
  const saveStatus = saving ? 'Ukládám…' : savedAt ? 'Uloženo' : ''

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-2xl mx-auto p-6">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <Link href="/profil/nastaveni" className="inline-flex items-center gap-1.5 text-white/40 text-sm hover:text-white/70 transition no-underline">
              <ArrowLeft size={15} strokeWidth={1.75} /> Zpět na nastavení
            </Link>
            <h1 className="text-2xl font-extrabold text-white m-0 mt-3 flex items-center gap-2">
              <Globe size={22} strokeWidth={1.75} className="text-[#fb923c]" /> Preference
            </h1>
            <p className="text-white/40 text-sm mt-1">Jazyk aplikace a notifikace.</p>
          </div>
          {saveStatus && (
            <span className="text-[11px] text-white/40 mt-1 whitespace-nowrap">{saveStatus}</span>
          )}
        </header>

        {/* Language */}
        <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 mb-4">
          <h2 className="text-white/25 text-[10px] font-bold uppercase tracking-wider m-0 mb-3">Jazyk aplikace</h2>
          <select
            value={currentLocale}
            onChange={(e) => handleLanguageChange(e.target.value as Locale)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fb923c]/40 appearance-none cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-[#111120]">
                {l.flag} {l.name}
              </option>
            ))}
          </select>
          <p className="text-white/30 text-xs mt-2">Použije se v UI a v generovaných dokumentech.</p>
        </div>

        {/* Notifications */}
        <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 mb-4">
          <h2 className="text-white/25 text-[10px] font-bold uppercase tracking-wider m-0 mb-3">E-mailové notifikace</h2>
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-4">
              <p className="text-white text-sm m-0">Nové pozice, tipy, novinky</p>
              <p className="text-white/40 text-xs m-0 mt-0.5">Můžeš kdykoli vypnout.</p>
            </div>
            <button
              onClick={handleToggleNotifications}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${notificationsOn ? 'bg-[#fb923c]' : 'bg-white/[0.1]'}`}
              aria-pressed={notificationsOn}
              aria-label="Přepnout e-mailové notifikace"
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notificationsOn ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        </div>

        {/* Komunitní e-maily */}
        <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 mb-4">
          <h2 className="text-white/25 text-[10px] font-bold uppercase tracking-wider m-0 mb-1 flex items-center gap-1.5"><Megaphone size={12} strokeWidth={2} /> Komunitní e-maily</h2>
          <p className="text-white/30 text-xs m-0 mb-2">Kdy ti přijde e-mail z komunity. Vše můžeš vypnout.</p>
          <Toggle Icon={AtSign} label="Když mě někdo @zmíní" on={profile?.notify_mentions ?? true} onClick={() => toggleField('notify_mentions', profile?.notify_mentions ?? true)} />
          <Toggle Icon={MessageCircle} label="Nová soukromá zpráva" desc="Jen když jsi offline." on={profile?.notify_dms ?? true} onClick={() => toggleField('notify_dms', profile?.notify_dms ?? true)} />
          <Toggle Icon={CalendarDays} label="Týdenní souhrn komunity" on={profile?.notify_weekly ?? true} onClick={() => toggleField('notify_weekly', profile?.notify_weekly ?? true)} />
        </div>
      </div>
    </div>
  )
}
