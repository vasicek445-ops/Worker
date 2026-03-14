"use client"

import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabase'
import { useSubscription } from '../../hooks/useSubscription'
import { useLanguage } from '../../lib/i18n/LanguageContext'

export default function Profil() {
  const { isActive, loading: subLoading } = useSubscription()
  const { locale, setLocale } = useLanguage()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [savingNotif, setSavingNotif] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [newEmail, setNewEmail] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteText, setDeleteText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Pracovní profil
  const [obor, setObor] = useState('')
  const [pozice, setPozice] = useState('')
  const [preferovanyKanton, setPreferovanyKanton] = useState('')
  const [nemcinaUroven, setNemcinaUroven] = useState('')
  const [zkusenosti, setZkusenosti] = useState('')
  const [vzdelani, setVzdelani] = useState('')
  const [dovednosti, setDovednosti] = useState('')
  const [telefon, setTelefon] = useState('')
  const [adresa, setAdresa] = useState('')
  const [datumNarozeni, setDatumNarozeni] = useState('')
  const [ridickyPrukaz, setRidickyPrukaz] = useState('')
  const [dalsiJazyky, setDalsiJazyky] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const OBORY = ['Stavebnictví', 'Gastronomie / Hotelnictví', 'Logistika / Sklad', 'Zdravotnictví', 'Úklid / Údržba', 'Strojírenství / Technik', 'IT / Software', 'Elektro / Instalatér', 'Řidič / Doprava', 'Jiný obor']
  const NEMCINA = ['Žádná – teprve se učím', 'Základy (A1)', 'Základní komunikace (A2)', 'Dorozumím se (B1)', 'Dobrá úroveň (B2)', 'Plynulá (C1/C2)']
  const KANTONY: Record<string, string> = {
    ZH: 'Zürich', BE: 'Bern', LU: 'Luzern', UR: 'Uri', SZ: 'Schwyz',
    OW: 'Obwalden', NW: 'Nidwalden', GL: 'Glarus', ZG: 'Zug', FR: 'Fribourg',
    SO: 'Solothurn', BS: 'Basel-Stadt', BL: 'Basel-Land', SH: 'Schaffhausen',
    AR: 'Appenzell AR', AI: 'Appenzell AI', SG: 'St. Gallen', GR: 'Graubünden',
    AG: 'Aargau', TG: 'Thurgau', TI: 'Ticino', VD: 'Vaud', VS: 'Valais',
    NE: 'Neuchâtel', GE: 'Genève', JU: 'Jura',
  }

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
        // Load work profile fields
        setObor(profileData.obor || '')
        setPozice(profileData.pozice || '')
        setPreferovanyKanton(profileData.preferovany_kanton || '')
        setNemcinaUroven(profileData.nemcina_uroven || '')
        setZkusenosti(profileData.zkusenosti || '')
        setVzdelani(profileData.vzdelani || '')
        setDovednosti(profileData.dovednosti || '')
        setTelefon(profileData.telefon || '')
        setAdresa(profileData.adresa || '')
        setDatumNarozeni(profileData.datum_narozeni || '')
        setRidickyPrukaz(profileData.ridicky_prukaz || '')
        setDalsiJazyky(profileData.dalsi_jazyky || '')
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
      const path = `${user.id}/avatar`
      console.log('[Avatar] Uploading to path:', path)
      const { error: uploadError, data: uploadData } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type })
      console.log('[Avatar] Upload result:', { uploadError, uploadData })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      const avatarUrl = publicUrl + '?t=' + Date.now()
      console.log('[Avatar] Public URL:', avatarUrl)
      const { error: updateError, data: updateData } = await supabase.from('profiles').update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() }).eq('id', user.id).select()
      console.log('[Avatar] DB update result:', { updateError, updateData })
      if (updateError) throw updateError
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setProfile((prev: any) => ({ ...prev, avatar_url: avatarUrl }))
      showToast('Fotka nahrána!')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { console.error('[Avatar] Error:', err); showToast('Chyba: ' + (err.message || 'Zkus to znovu')) }
    finally { setUploading(false) }
  }

  const handleSaveName = async () => {
    if (!user || !editName.trim()) return
    try {
      await supabase.from('profiles').update({ full_name: editName.trim(), updated_at: new Date().toISOString() }).eq('id', user.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setProfile((prev: any) => ({ ...prev, full_name: editName.trim() }))
      setEditingName(false)
      showToast('Jméno uloženo!')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const handleChangeEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) { showToast('Zadej platný email'); return }
    setEmailSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) throw error
      showToast('Potvrzovací email odeslán na ' + newEmail)
      setNewEmail('')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { showToast('Chyba: ' + (err.message || 'Zkus to znovu')) }
    finally { setEmailSaving(false) }
  }

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { showToast('Heslo musí mít min. 6 znaků'); return }
    if (newPassword !== confirmPassword) { showToast('Hesla se neshodují'); return }
    setPasswordSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      showToast('Heslo změněno!')
      setShowPasswordChange(false)
      setNewPassword('')
      setConfirmPassword('')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { showToast('Chyba: ' + (err.message || 'Zkus to znovu')) }
    finally { setPasswordSaving(false) }
  }

  const handleDeleteAccount = async () => {
    if (deleteText !== 'SMAZAT') return
    setDeleting(true)
    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      if (!res.ok) throw new Error('Chyba při mazání')
      await supabase.auth.signOut()
      window.location.href = '/login'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { showToast('Chyba: ' + (err.message || 'Zkus to znovu')); setDeleting(false) }
  }

  const handleSaveWorkProfile = async () => {
    if (!user) return
    setSavingProfile(true)
    const isComplete = !!(obor && pozice && preferovanyKanton && nemcinaUroven && zkusenosti)
    try {
      await supabase.from('profiles').update({
        obor, pozice, preferovany_kanton: preferovanyKanton, nemcina_uroven: nemcinaUroven,
        zkusenosti, vzdelani, dovednosti, telefon, adresa, datum_narozeni: datumNarozeni,
        ridicky_prukaz: ridickyPrukaz, dalsi_jazyky: dalsiJazyky, profile_complete: isComplete,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setProfile((prev: any) => ({ ...prev, obor, pozice, preferovany_kanton: preferovanyKanton, nemcina_uroven: nemcinaUroven, zkusenosti, vzdelani, dovednosti, telefon, adresa, datum_narozeni: datumNarozeni, ridicky_prukaz: ridickyPrukaz, dalsi_jazyky: dalsiJazyky, profile_complete: isComplete }))
      showToast(isComplete ? 'Pracovní profil uložen! Můžeš spustit Smart Matching.' : 'Profil uložen! Vyplň všechna povinná pole pro Smart Matching.')
    } catch { showToast('Chyba při ukládání') }
    finally { setSavingProfile(false) }
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

  const profileFields = [
    { label: 'Jméno', filled: !!(profile?.full_name || editName.trim()) },
    { label: 'Fotka', filled: !!profile?.avatar_url },
    { label: 'Obor', filled: !!obor },
    { label: 'Cílová pozice', filled: !!pozice },
    { label: 'Preferovaný kanton', filled: !!preferovanyKanton },
    { label: 'Úroveň němčiny', filled: !!nemcinaUroven },
    { label: 'Pracovní zkušenosti', filled: !!zkusenosti },
    { label: 'Telefon', filled: !!telefon },
    { label: 'Datum narození', filled: !!datumNarozeni },
  ]
  const filledCount = profileFields.filter(f => f.filled).length
  const completionPct = Math.round((filledCount / profileFields.length) * 100)
  const missingFields = profileFields.filter(f => !f.filled)

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

          {/* Profile Completion */}
          <div className="bg-[#111120] rounded-[20px] border border-white/[0.06] p-5 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm font-semibold">
                Tvůj profil je vyplněný na <span className={completionPct >= 80 ? 'text-[#39ff6e]' : completionPct >= 50 ? 'text-blue-400' : 'text-orange-400'}>{completionPct}%</span>
              </span>
              <span className="text-white/25 text-xs">{filledCount}/{profileFields.length} polí</span>
            </div>
            <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mb-3">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${completionPct}%`,
                  background: completionPct >= 80
                    ? 'linear-gradient(90deg, #2bcc58, #39ff6e)'
                    : completionPct >= 50
                    ? 'linear-gradient(90deg, #3b82f6, #39ff6e)'
                    : 'linear-gradient(90deg, #f97316, #3b82f6)',
                }}
              />
            </div>
            {missingFields.length > 0 && (
              <div>
                <p className="text-white/25 text-[11px] mb-1.5">Chybí vyplnit:</p>
                <div className="flex flex-wrap gap-1.5">
                  {missingFields.map(f => (
                    <span key={f.label} className="text-[11px] bg-white/[0.04] border border-white/[0.07] text-white/40 px-2 py-0.5 rounded-full">
                      {f.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {missingFields.length === 0 && (
              <p className="text-[#39ff6e] text-[11px] font-medium">Profil je kompletní!</p>
            )}
          </div>

          {/* Avatar Card */}
          <div className="bg-[#111120] rounded-[20px] border border-white/[0.06] p-6 mb-4">
            <div className="flex items-center gap-5">
              <div className="relative">
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="relative group">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover border-2 border-white/[0.08] group-hover:border-[#39ff6e]/40 transition"
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }}
                    />
                  ) : null}
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-[#E8302A] to-orange-400 flex items-center justify-center text-white font-black text-3xl border-2 border-white/[0.08] group-hover:border-[#39ff6e]/40 transition ${profile?.avatar_url ? 'hidden' : ''}`}>
                    {userInitial}
                  </div>
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

          {/* Work Profile */}
          <div className="bg-[#111120] rounded-[20px] border border-white/[0.06] p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/25 text-[10px] font-bold uppercase tracking-wider">Pracovní profil</h3>
              {profile?.profile_complete && <span className="text-[10px] bg-[#39ff6e]/10 text-[#39ff6e] font-bold px-2.5 py-1 rounded-full">Kompletní</span>}
            </div>

            <div className="space-y-3">
              {/* Obor */}
              <div>
                <label className="text-white/40 text-xs block mb-1">Obor *</label>
                <select value={obor} onChange={(e) => setObor(e.target.value)} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#39ff6e]/30 appearance-none">
                  <option value="" className="bg-[#111120]">Vyber obor...</option>
                  {OBORY.map(o => <option key={o} value={o} className="bg-[#111120]">{o}</option>)}
                </select>
              </div>

              {/* Pozice */}
              <div>
                <label className="text-white/40 text-xs block mb-1">Cílová pozice *</label>
                <input type="text" value={pozice} onChange={(e) => setPozice(e.target.value)} placeholder="např. Elektriker, Koch, Bauarbeiter..." className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#39ff6e]/30" />
              </div>

              {/* Kanton */}
              <div>
                <label className="text-white/40 text-xs block mb-1">Preferovaný kanton *</label>
                <select value={preferovanyKanton} onChange={(e) => setPreferovanyKanton(e.target.value)} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#39ff6e]/30 appearance-none">
                  <option value="" className="bg-[#111120]">Vyber kanton...</option>
                  {Object.entries(KANTONY).map(([code, name]) => <option key={code} value={code} className="bg-[#111120]">{name} ({code})</option>)}
                </select>
              </div>

              {/* Nemcina */}
              <div>
                <label className="text-white/40 text-xs block mb-1">Úroveň němčiny *</label>
                <select value={nemcinaUroven} onChange={(e) => setNemcinaUroven(e.target.value)} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#39ff6e]/30 appearance-none">
                  <option value="" className="bg-[#111120]">Vyber úroveň...</option>
                  {NEMCINA.map(n => <option key={n} value={n} className="bg-[#111120]">{n}</option>)}
                </select>
              </div>

              {/* Datum narozeni */}
              <div>
                <label className="text-white/40 text-xs block mb-1">Datum narození</label>
                <input type="text" value={datumNarozeni} onChange={(e) => setDatumNarozeni(e.target.value)} placeholder="např. 15.03.1990" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#39ff6e]/30" />
              </div>

              {/* Telefon */}
              <div>
                <label className="text-white/40 text-xs block mb-1">Telefon</label>
                <input type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="+420 ..." className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#39ff6e]/30" />
              </div>

              {/* Adresa */}
              <div>
                <label className="text-white/40 text-xs block mb-1">Adresa</label>
                <input type="text" value={adresa} onChange={(e) => setAdresa(e.target.value)} placeholder="Ulice, město, země" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#39ff6e]/30" />
              </div>

              {/* Zkusenosti */}
              <div>
                <label className="text-white/40 text-xs block mb-1">Pracovní zkušenosti *</label>
                <textarea value={zkusenosti} onChange={(e) => setZkusenosti(e.target.value)} placeholder="Popiš své pracovní zkušenosti, pozice, firmy, období..." rows={4} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#39ff6e]/30 resize-none" />
              </div>

              {/* Vzdelani */}
              <div>
                <label className="text-white/40 text-xs block mb-1">Vzdělání</label>
                <textarea value={vzdelani} onChange={(e) => setVzdelani(e.target.value)} placeholder="Školy, obory, certifikáty..." rows={2} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#39ff6e]/30 resize-none" />
              </div>

              {/* Dovednosti */}
              <div>
                <label className="text-white/40 text-xs block mb-1">Dovednosti</label>
                <textarea value={dovednosti} onChange={(e) => setDovednosti(e.target.value)} placeholder="Technické dovednosti, soft skills, certifikáty..." rows={2} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#39ff6e]/30 resize-none" />
              </div>

              {/* Ridicky prukaz */}
              <div>
                <label className="text-white/40 text-xs block mb-1">Řidičský průkaz</label>
                <input type="text" value={ridickyPrukaz} onChange={(e) => setRidickyPrukaz(e.target.value)} placeholder="např. B, C, D..." className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#39ff6e]/30" />
              </div>

              {/* Dalsi jazyky */}
              <div>
                <label className="text-white/40 text-xs block mb-1">Další jazyky</label>
                <input type="text" value={dalsiJazyky} onChange={(e) => setDalsiJazyky(e.target.value)} placeholder="např. Angličtina B2, Slovenština..." className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#39ff6e]/30" />
              </div>

              {/* Save button */}
              <button onClick={handleSaveWorkProfile} disabled={savingProfile} className="w-full bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 text-sm mt-2">
                {savingProfile ? 'Ukládám...' : 'Uložit pracovní profil'}
              </button>

              <p className="text-white/20 text-[11px] text-center">* povinné pole pro Smart Matching</p>
            </div>
          </div>

          {/* Smart Matching CTA */}
          {profile?.profile_complete && (
            <a href="/pruvodce/matching" className="block mb-4 no-underline">
              <div className="bg-gradient-to-br from-[#111120] to-[#0f1420] rounded-[20px] p-5 border border-blue-500/15">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-lg">🎯</div>
                  <span className="text-white font-extrabold text-sm">Smart Matching</span>
                </div>
                <p className="text-white/35 text-xs mb-3 m-0">AI najde nejlepší agentury pro tvůj profil a odešle přihlášku jedním klikem.</p>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-xl text-sm font-extrabold text-center">Spustit matching →</div>
              </div>
            </a>
          )}

          {/* Preferences */}
          <div className="bg-[#111120] rounded-[20px] border border-white/[0.06] p-5 mb-4">
            <h3 className="text-white/25 text-[10px] font-bold uppercase tracking-wider mb-4">Preference</h3>

            <div className="space-y-0">
              {/* Language */}
              <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                <span className="text-white/40 text-sm">Jazyk aplikace</span>
                <select
                  value={locale}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

          {/* Security */}
          <div className="bg-[#111120] rounded-[20px] border border-white/[0.06] p-5 mb-4">
            <h3 className="text-white/25 text-[10px] font-bold uppercase tracking-wider mb-4">Zabezpečení</h3>

            {/* Change email */}
            <div className="pb-3 mb-3 border-b border-white/[0.04]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/40 text-sm">Změnit email</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Nový email..." className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#39ff6e]/30"
                />
                <button onClick={handleChangeEmail} disabled={emailSaving} className="bg-white/[0.06] border border-white/[0.08] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-white/[0.1] transition disabled:opacity-50">
                  {emailSaving ? '...' : 'Změnit'}
                </button>
              </div>
              <p className="text-white/20 text-[11px] mt-1.5">Na nový email přijde potvrzovací odkaz</p>
            </div>

            {/* Change password */}
            <div className="pb-3 mb-3 border-b border-white/[0.04]">
              {!showPasswordChange ? (
                <button onClick={() => setShowPasswordChange(true)} className="text-white/40 text-sm hover:text-white transition">
                  Změnit heslo →
                </button>
              ) : (
                <div className="space-y-2">
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nové heslo (min. 6 znaků)" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#39ff6e]/30" />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Potvrdit nové heslo" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#39ff6e]/30" />
                  <div className="flex gap-2">
                    <button onClick={handleChangePassword} disabled={passwordSaving} className="bg-[#39ff6e] text-[#0a0a12] text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50">
                      {passwordSaving ? '...' : 'Uložit heslo'}
                    </button>
                    <button onClick={() => { setShowPasswordChange(false); setNewPassword(''); setConfirmPassword('') }} className="text-white/30 text-xs px-3 py-2 hover:text-white/50 transition">
                      Zrušit
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Export data */}
            <div>
              <button onClick={() => {
                const data = { profile, email: userEmail, memberSince, subscription: isActive ? 'Premium' : 'Free' }
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url; a.download = 'woker-data.json'; a.click()
                showToast('Data exportována!')
              }} className="text-white/40 text-sm hover:text-white transition">
                📥 Exportovat moje data (GDPR)
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[#111120] rounded-[20px] border border-red-500/10 p-5 mb-4">
            <h3 className="text-red-400/40 text-[10px] font-bold uppercase tracking-wider mb-3">Nebezpečná zóna</h3>
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} className="text-red-400/60 text-sm hover:text-red-400 transition">
                🗑️ Smazat účet a všechna data
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <p className="text-red-400 text-xs font-medium mb-1">⚠️ Tato akce je nevratná!</p>
                  <p className="text-red-400/60 text-[11px]">Tvůj účet, profil, předplatné a všechna data budou trvale smazána.</p>
                </div>
                <div>
                  <p className="text-white/30 text-xs mb-1.5">Napiš SMAZAT pro potvrzení:</p>
                  <input type="text" value={deleteText} onChange={(e) => setDeleteText(e.target.value)} placeholder="SMAZAT" className="w-full bg-white/[0.04] border border-red-500/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/40" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleDeleteAccount} disabled={deleteText !== 'SMAZAT' || deleting} className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-30">
                    {deleting ? 'Mažu...' : 'Trvale smazat účet'}
                  </button>
                  <button onClick={() => { setShowDeleteConfirm(false); setDeleteText('') }} className="text-white/30 text-xs px-3 py-2 hover:text-white/50 transition">
                    Zrušit
                  </button>
                </div>
              </div>
            )}
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
