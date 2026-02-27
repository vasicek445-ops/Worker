"use client"

import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabase'
import { useSubscription } from '../../hooks/useSubscription'
import Link from 'next/link'
import BottomNav from '../components/BottomNav'

const COUNTRIES = [
  { code: 'CH', flag: '🇨🇭', name: 'Švýcarsko' },
  { code: 'DE', flag: '🇩🇪', name: 'Německo' },
  { code: 'AT', flag: '🇦🇹', name: 'Rakousko' },
  { code: 'NL', flag: '🇳🇱', name: 'Nizozemsko' },
  { code: 'NO', flag: '🇳🇴', name: 'Norsko' },
]

const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'contract', label: 'Kontrakt' },
]

export default function Profil() {
  const { isActive, loading: subLoading } = useSubscription()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editCountry, setEditCountry] = useState('CH')
  const [editSalary, setEditSalary] = useState(3500)
  const [editJobType, setEditJobType] = useState('full-time')
  const [editNotifications, setEditNotifications] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUser(user)

      // Load or create profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setEditName(profileData.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || '')
        setEditCountry(profileData.target_country || 'CH')
        setEditSalary(profileData.min_salary || 3500)
        setEditJobType(profileData.job_type || 'full-time')
        setEditNotifications(profileData.notifications ?? true)
      } else {
        // Create profile if it doesnt exist (for existing users)
        const defaultName = user.user_metadata?.full_name || user.email?.split('@')[0] || ''
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({ id: user.id, full_name: defaultName })
          .select()
          .single()
        setProfile(newProfile)
        setEditName(defaultName)
      }

      setLoading(false)
    }
    load()
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate
    if (!file.type.startsWith('image/')) {
      showToast('Nahraj prosím obrázek')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('Max velikost je 2 MB')
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      // Add cache buster
      const avatarUrl = `${publicUrl}?t=${Date.now()}`

      // Update profile
      await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      setProfile((prev: any) => ({ ...prev, avatar_url: avatarUrl }))
      showToast('Fotka nahrána!')
    } catch (err: any) {
      showToast('Chyba: ' + (err.message || 'Zkus to znovu'))
    } finally {
      setUploading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editName,
          target_country: editCountry,
          min_salary: editSalary,
          job_type: editJobType,
          notifications: editNotifications,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile((prev: any) => ({
        ...prev,
        full_name: editName,
        target_country: editCountry,
        min_salary: editSalary,
        job_type: editJobType,
        notifications: editNotifications,
      }))
      setEditMode(false)
      showToast('Nastavení uloženo!')
    } catch (err: any) {
      showToast('Chyba: ' + (err.message || 'Zkus to znovu'))
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleManageSubscription = async () => {
    if (!user) return
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      showToast('Něco se pokazilo')
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0E0E0E] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Načítání profilu...</div>
      </main>
    )
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Uživatel'
  const userEmail = user?.email || ''
  const userInitial = displayName.charAt(0).toUpperCase()
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })
    : ''
  const country = COUNTRIES.find(c => c.code === (profile?.target_country || 'CH'))

  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">

        {/* Toast */}
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] border border-gray-700 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium animate-pulse">
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="text-gray-500 hover:text-white text-sm">
            {"<-"} Zpět
          </Link>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 text-sm font-medium"
          >
            Odhlásit se
          </button>
        </div>

        {/* Avatar + Name Card */}
        <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-5">
            {/* Avatar with upload */}
            <div className="relative">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="relative group"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-700 group-hover:border-[#E8302A] transition"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E8302A] to-orange-400 flex items-center justify-center text-white font-black text-3xl border-2 border-gray-700 group-hover:border-[#E8302A] transition">
                    {userInitial}
                  </div>
                )}
                {/* Camera overlay */}
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <span className="text-white text-lg">📷</span>
                </div>
                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            {/* Name + info */}
            <div className="flex-1">
              <h1 className="text-white font-black text-xl">{displayName}</h1>
              <p className="text-gray-500 text-sm">{userEmail}</p>
              {memberSince && (
                <p className="text-gray-600 text-xs mt-1">Člen od {memberSince}</p>
              )}
            </div>
          </div>
        </div>

        {/* Subscription status */}
        {isActive ? (
          <div className="bg-gradient-to-r from-[rgba(232,48,42,0.15)] to-[rgba(232,48,42,0.05)] border border-[rgba(232,48,42,0.3)] rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <span className="text-[#E8302A] font-black">Woker Premium</span>
              </div>
              <span className="bg-green-500/10 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                Aktivní
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Plný přístup ke kontaktům, průvodci, AI asistentovi a všem funkcím.
            </p>
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="w-full bg-[#0E0E0E] border border-gray-700 text-gray-300 font-medium py-3 rounded-xl hover:border-gray-500 transition text-sm"
            >
              {portalLoading ? 'Načítání...' : 'Spravovat předplatné'}
            </button>
          </div>
        ) : (
          <Link href="/pricing" className="block mb-6">
            <div className="bg-gradient-to-r from-[#E8302A] to-orange-600 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="text-white font-bold">Woker Premium</p>
                  <p className="text-white/70 text-xs">200+ kontaktů, AI asistent, průvodce</p>
                </div>
              </div>
              <div className="bg-white/20 rounded-full px-3 py-1.5">
                <span className="text-white text-xs font-bold">9,90 EUR/měsíc</span>
              </div>
            </div>
          </Link>
        )}

        {/* Settings Card */}
        <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold text-base">Nastavení profilu</h2>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="text-[#E8302A] text-sm font-medium hover:text-red-400 transition"
              >
                Upravit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditMode(false)}
                  className="text-gray-500 text-sm hover:text-white transition"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="bg-[#E8302A] text-white text-sm font-bold px-4 py-1.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {saving ? '...' : 'Uložit'}
                </button>
              </div>
            )}
          </div>

          {!editMode ? (
            /* View mode */
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Jméno</span>
                <span className="text-white text-sm font-medium">{displayName}</span>
              </div>
              <div className="border-t border-gray-800" />
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Cílová země</span>
                <span className="text-white text-sm font-medium">{country?.flag} {country?.name}</span>
              </div>
              <div className="border-t border-gray-800" />
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Minimální plat</span>
                <span className="text-white text-sm font-medium">{(profile?.min_salary || 3500).toLocaleString()} CHF</span>
              </div>
              <div className="border-t border-gray-800" />
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Typ úvazku</span>
                <span className="text-white text-sm font-medium">
                  {JOB_TYPES.find(j => j.value === (profile?.job_type || 'full-time'))?.label}
                </span>
              </div>
              <div className="border-t border-gray-800" />
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Notifikace</span>
                <span className={`text-sm font-medium ${profile?.notifications !== false ? 'text-green-400' : 'text-gray-600'}`}>
                  {profile?.notifications !== false ? 'Zapnuté' : 'Vypnuté'}
                </span>
              </div>
            </div>
          ) : (
            /* Edit mode */
            <div className="flex flex-col gap-5">
              {/* Name */}
              <div>
                <label className="text-gray-500 text-xs mb-1.5 block">Jméno</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#0E0E0E] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E8302A] transition"
                  placeholder="Tvoje jméno"
                />
              </div>

              {/* Country */}
              <div>
                <label className="text-gray-500 text-xs mb-1.5 block">Cílová země</label>
                <div className="grid grid-cols-5 gap-2">
                  {COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => setEditCountry(c.code)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition text-center ${
                        editCountry === c.code
                          ? 'border-[#E8302A] bg-[#E8302A]/10'
                          : 'border-gray-800 bg-[#0E0E0E] hover:border-gray-600'
                      }`}
                    >
                      <span className="text-xl">{c.flag}</span>
                      <span className="text-[10px] text-gray-400">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary */}
              <div>
                <label className="text-gray-500 text-xs mb-1.5 block">
                  Minimální plat: <span className="text-white font-bold">{editSalary.toLocaleString()} CHF</span>
                </label>
                <input
                  type="range"
                  min={2000}
                  max={15000}
                  step={500}
                  value={editSalary}
                  onChange={(e) => setEditSalary(Number(e.target.value))}
                  className="w-full accent-[#E8302A]"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>2 000</span>
                  <span>15 000 CHF</span>
                </div>
              </div>

              {/* Job type */}
              <div>
                <label className="text-gray-500 text-xs mb-1.5 block">Typ úvazku</label>
                <div className="grid grid-cols-2 gap-2">
                  {JOB_TYPES.map((jt) => (
                    <button
                      key={jt.value}
                      onClick={() => setEditJobType(jt.value)}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition ${
                        editJobType === jt.value
                          ? 'border-[#E8302A] bg-[#E8302A]/10 text-white'
                          : 'border-gray-800 bg-[#0E0E0E] text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {jt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">Notifikace</p>
                  <p className="text-gray-600 text-xs">Upozornění na nové nabídky</p>
                </div>
                <button
                  onClick={() => setEditNotifications(!editNotifications)}
                  className={`w-12 h-7 rounded-full transition-colors relative ${
                    editNotifications ? 'bg-[#E8302A]' : 'bg-gray-700'
                  }`}
                >
                  <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    editNotifications ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="space-y-2 mb-6">
          <h2 className="text-white font-bold text-base mb-3">Rychlé odkazy</h2>
          {[
            { icon: "📇", label: "Databáze kontaktů", href: "/kontakty", desc: "200+ přímých kontaktů na firmy" },
            { icon: "🤖", label: "AI Asistent", href: "/asistent", desc: "Pomoc s CV, dopisy, otázky 24/7" },
            { icon: "📚", label: "Průvodce", href: "/pruvodce", desc: "Dokumenty, pojištění, daně" },
            { icon: "🇩🇪", label: "Němčina pro práci", href: "/jazyky", desc: "Fráze a slovíčka podle oboru" },
          ].map((link) => (
            <Link key={link.href} href={link.href}>
              <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-gray-700 transition">
                <span className="text-xl">{link.icon}</span>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{link.label}</p>
                  <p className="text-gray-500 text-xs">{link.desc}</p>
                </div>
                <span className="text-gray-600 text-sm">{"->"}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Account section */}
        <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-5 mb-6">
          <h2 className="text-white font-bold mb-4">Účet</h2>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Email</span>
              <span className="text-white text-sm">{userEmail}</span>
            </div>
            <div className="border-t border-gray-800" />
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Přihlášení přes</span>
              <span className="text-white text-sm">
                {user?.app_metadata?.provider === 'google' ? '🔵 Google' : '📧 Email'}
              </span>
            </div>
            <div className="border-t border-gray-800" />
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Předplatné</span>
              <span className={`text-sm font-medium ${isActive ? 'text-green-400' : 'text-gray-600'}`}>
                {isActive ? 'Premium' : 'Zdarma'}
              </span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full border border-red-500/30 text-red-400 font-medium py-3 rounded-xl hover:bg-red-500/10 transition text-sm"
        >
          Odhlásit se
        </button>

        {/* Version */}
        <p className="text-gray-700 text-xs text-center mt-6">
          Woker v1.0
        </p>
      </div>
      <BottomNav active="profile" />
    </main>
  )
}
