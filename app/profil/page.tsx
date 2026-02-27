"use client"

import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabase'
import { useSubscription } from '../../hooks/useSubscription'
import { useLanguage } from '../../lib/i18n/LanguageContext'

export default function Profil() {
  const { isActive, loading: subLoading } = useSubscription()
  const { locale, setLocale } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [savingNotif, setSavingNotif] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const LANGUAGES = [
    { code: 'cs', flag: '🇨🇿', name: 'Čeština' },
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

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profileData) {
        setProfile(profileData)
        setEditName(profileData.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || '')
        setNotifications(profileData.notifications ?? true)
      } else {
        const defaultName = user.user_metadata?.full_name || user.email?.split('@')[0] || ''
        const { data: newProfile } = await supabase.from('profiles').insert({ id: user.id, full_name: defaultName }).select().single()
        setProfile(newProfile)
        setEditName(defaultName)
      }
      setLoading(false)
    }
    load()
  }, [])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (!file.type.startsWith('image/')) { showToast('Nahraj prosím obrázek'); return }
    if (file.size > 2 * 1024 * 1024) { showToast('Max velikost je 2 MB'); return }
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = user.id + '/avatar.' + ext
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      const avatarUrl = publicUrl + '?t=' + Date.now()
      await supabase.from('profiles').update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() }).eq('id', user.id)
      setProfile((prev: any) => ({ ...prev, avatar_url: avatarUrl }))
      showToast('Fotka nahrána!')
    } catch (err: any) { showToast('Chyba: ' + (err.message || 'Zkus to znovu')) }
    finally { setUploading(false) }
  }

  const handleSaveName = async () => {
    if (!user || !editName.trim()) return
    try {
      await supabase.from('profiles').update({ full_name: editName.trim(), updated_at: new Date().toISOString() }).eq('id', user.id)
      setProfile((prev: any) => ({ ...prev, full_name: editName.trim() }))
      setEditingName(false)
      showToast('Jméno uloženo!')
    } catch (err: any) { showToast('Chyba') }
  }

  const handleToggleNotifications = async () => {
    if (!user) return
    setSavingNotif(true)
    const newVal = !notifications
    setNotifications(newVal)
    try {
      await supabase.from('profiles').update({ notifications: newVal, updated_at: new Date().toISOString() }).eq('id', user.id)
      showToast(newVal ? 'Notifikace zapnuty' : 'Notifikace vypnuty')
    } catch { showToast('Chyba') }
    finally { setSavingNotif(false) }
  }

  const handleManageSubscription = async () => {
    if (!user) return
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch { showToast('Něco se pokazilo') }
    finally { setPortalLoading(false) }
  }

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/login' }

  if (loading) {
    return <main className="min-h-screen bg-[#0a0a12] flex items-center justify-center"><div className="animate-pulse text-gray-500">Načítání profilu...</div></main>
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Uživatel'
  const userEmail = user?.email || ''
  const userInitial = displayName.charAt(0).toUpperCase()
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' }) : ''
  const currentLang = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0]

  return (
    <>
      <style jsx global>{'@import url(https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap)'}</style>
      <main className="min-h-screen bg-[#0a0a12] py-8 px-6 relative" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
        {/* Background */}
        <div className="fixed w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none z-0 opacity-15 -top-[200px] -right-[200px]" style={{ background: "radial-gradient(circle, rgba(57,255,110,0.2), transparent 70%)" }} />

        {/* Toast */}
        {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a2e] border border-[#39ff6e]/20 text-[#39ff6e] px-6 py-3 rounded-xl shadow-lg text-sm font-medium">
            {toast}
          </div>
        )}

        <div className="max-w-xl mx-auto relative z-10">
          {/* Header */}
          <h1 className="text-2xl font-extrabold text-white mb-6 tracking-tight">Můj profil</h1>

          {/* Avatar Card */}
          <div className="bg-[#111120] rounded-[20px] border border-white/[0.06] p-6 mb-4">
            <div className="flex items-center gap-5">
              <div className="relative">
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="relative group">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-white/[0.08] group-hover:border-[#39ff6e]/40 transition" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E8302A] to-orange-400 flex items-center justify-center text-white font-black text-3xl border-2 border-white/[0.08] group-hover:border-[#39ff6e]/40 transition">
                      {userInitial}
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <span className="text-white text-lg">📷</span>
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </div>
              <div className="flex-1">
                <h2 className="text-white font-extrabold text-xl m-0">{displayName}</h2>
                <p className="text-white/35 text-sm m-0 mt-0.5">{userEmail}</p>
                {memberSince && <p className="text-white/20 text-xs m-0 mt-1">Člen od {memberSince}</p>}
              </div>
            </div>
          </div>

          {/* Premium */}
          {isActive ? (
            <div className="bg-gradient-to-br from-[#111120] to-[#0f1a14] rounded-[20px] p-5 border border-[#39ff6e]/15 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">⭐</span>
                  <span className="text-white font-extrabold text-sm">Woker Premium</span>
                </div>
                <span className="text-[10px] bg-[#39ff6e]/10 text-[#39ff6e] font-bold px-2.5 py-1 rounded-full">Aktivní</span>
              </div>
              <p className="text-white/35 text-xs mb-3 m-0">Plný přístup ke kontaktům, AI nástrojům a komunitě.</p>
              <button onClick={handleManageSubscription} disabled={portalLoading} className="w-full bg-white/[0.04] border border-white/[0.08] text-white/60 font-medium py-2.5 rounded-xl hover:bg-white/[0.06] transition text-sm">
                {portalLoading ? 'Načítání...' : 'Spravovat předplatné'}
              </button>
            </div>
          ) : (
            <a href="/pricing" className="block mb-4 no-underline">
              <div className="bg-gradient-to-br from-[#111120] to-[#0f1a14] rounded-[20px] p-5 border border-[#39ff6e]/15">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#39ff6e] to-[#2bcc58] flex items-center justify-center">⚡</div>
                  <span className="text-white font-extrabold text-sm">Aktivovat Premium</span>
                </div>
                <p className="text-white/35 text-xs mb-3 m-0">Odemkni 1000+ kontaktů, AI nástroje a komunitu.</p>
                <div className="bg-gradient-to-br from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] py-2.5 rounded-xl text-sm font-extrabold text-center">9,90 EUR/měsíc</div>
              </div>
            </a>
          )}

          {/* Personal Info */}
          <div className="bg-[#111120] rounded-[20px] border border-white/[0.06] p-5 mb-4">
            <h3 className="text-white/25 text-[10px] font-bold uppercase tracking-wider mb-4">Osobní údaje</h3>

            <div className="space-y-0">
              {/* Name */}
              <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                <span className="text-white/40 text-sm">Jméno</span>
                {!editingName ? (
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">{displayName}</span>
                    <button onClick={() => setEditingName(true)} className="text-[#39ff6e] text-xs font-medium hover:text-[#39ff6e]/80 transition">✏️</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white text-sm w-40 focus:outline-none focus:border-[#39ff6e]/30" autoFocus />
                    <button onClick={handleSaveName} className="text-[#39ff6e] text-xs font-bold">✓</button>
                    <button onClick={() => { setEditingName(false); setEditName(displayName) }} className="text-white/30 text-xs">✕</button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                <span className="text-white/40 text-sm">Email</span>
                <span className="text-white text-sm font-medium">{userEmail}</span>
              </div>

              {/* Login method */}
              <div className="flex items-center justify-between py-3">
                <span className="text-white/40 text-sm">Přihlášení</span>
                <span className="text-white text-sm font-medium">
                  {user?.app_metadata?.provider === 'google' ? '🔵 Google' : '📧 Email'}
                </span>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-[#111120] rounded-[20px] border border-white/[0.06] p-5 mb-4">
            <h3 className="text-white/25 text-[10px] font-bold uppercase tracking-wider mb-4">Preference</h3>

            <div className="space-y-0">
              {/* Language */}
              <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                <span className="text-white/40 text-sm">Jazyk aplikace</span>
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as any)}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#39ff6e]/30 appearance-none cursor-pointer"
                >
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code} className="bg-[#111120] text-white">{l.flag} {l.name}</option>
                  ))}
                </select>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="text-white/40 text-sm block">E-mailové notifikace</span>
                  <span className="text-white/20 text-[11px]">Nové pozice, tipy, novinky</span>
                </div>
                <button
                  onClick={handleToggleNotifications}
                  disabled={savingNotif}
                  className={`w-11 h-6 rounded-full transition-colors relative ${notifications ? 'bg-[#39ff6e]' : 'bg-white/[0.1]'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button onClick={handleLogout} className="w-full bg-white/[0.03] border border-red-500/15 text-red-400/80 font-medium py-3 rounded-[16px] hover:bg-red-500/[0.06] transition text-sm mb-4">
            Odhlásit se
          </button>

          <p className="text-white/10 text-xs text-center">Woker v1.0</p>
        </div>
      </main>
    </>
  )
}
