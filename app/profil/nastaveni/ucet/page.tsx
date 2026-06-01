'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'
import { ArrowLeft, ArrowRight, KeyRound, Mail, LogIn } from 'lucide-react'

export default function UcetPage() {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  // Email change
  const [showEmailChange, setShowEmailChange] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)

  // Password change
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return
      if (!data.user) { router.replace('/prihlaseni'); return }
      setUser(data.user)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [router])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const handleChangeEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) { showToast('Zadej platný email'); return }
    setEmailSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) throw error
      showToast('Potvrzovací email odeslán na ' + newEmail)
      setNewEmail('')
      setShowEmailChange(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { showToast('Chyba: ' + (err?.message || 'Zkus to znovu')) }
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
    } catch (err: any) { showToast('Chyba: ' + (err?.message || 'Zkus to znovu')) }
    finally { setPasswordSaving(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#fb923c] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const userEmail = user?.email || ''
  const provider = user?.app_metadata?.provider
  const providerName = provider === 'google' ? 'Google' : 'Email + heslo'
  const ProviderIcon = provider === 'google' ? LogIn : Mail
  const isOAuth = provider && provider !== 'email'

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-2xl mx-auto p-6">
        <header className="mb-8">
          <Link href="/profil/nastaveni" className="inline-flex items-center gap-1.5 text-white/40 text-sm hover:text-white/70 transition no-underline">
            <ArrowLeft size={15} strokeWidth={1.75} /> Zpět na nastavení
          </Link>
          <h1 className="text-2xl font-extrabold text-white m-0 mt-3 flex items-center gap-2">
            <KeyRound size={22} strokeWidth={1.75} className="text-[#fb923c]" /> Účet
          </h1>
          <p className="text-white/40 text-sm mt-1">Email, heslo a způsob přihlášení.</p>
        </header>

        {/* Email */}
        <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 mb-4">
          <h2 className="text-white/25 text-[10px] font-bold uppercase tracking-wider m-0 mb-3">Email</h2>
          <div className="flex items-center justify-between mb-3">
            <span className="text-white text-sm font-medium">{userEmail}</span>
          </div>
          {!showEmailChange ? (
            <button
              onClick={() => setShowEmailChange(true)}
              className="inline-flex items-center gap-1.5 text-[#fb923c] text-sm font-medium hover:text-[#fb923c]/80 transition"
            >
              Změnit email <ArrowRight size={14} strokeWidth={1.75} />
            </button>
          ) : (
            <div className="space-y-2 pt-2 border-t border-white/[0.04]">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Nový email..."
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#fb923c]/40"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleChangeEmail}
                  disabled={emailSaving}
                  className="bg-[#fb923c] text-[#0a0a12] text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {emailSaving ? '...' : 'Uložit email'}
                </button>
                <button
                  onClick={() => { setShowEmailChange(false); setNewEmail('') }}
                  className="text-white/40 text-xs px-3 py-2 hover:text-white/70 transition"
                >
                  Zrušit
                </button>
              </div>
              <p className="text-white/30 text-[11px]">Na nový email přijde potvrzovací odkaz.</p>
            </div>
          )}
        </div>

        {/* Password */}
        <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 mb-4">
          <h2 className="text-white/25 text-[10px] font-bold uppercase tracking-wider m-0 mb-3">Heslo</h2>
          {isOAuth ? (
            <p className="text-white/40 text-sm m-0">
              Přihlašuješ se přes {providerName}. Heslo se nastavuje u poskytovatele.
            </p>
          ) : !showPasswordChange ? (
            <button
              onClick={() => setShowPasswordChange(true)}
              className="inline-flex items-center gap-1.5 text-[#fb923c] text-sm font-medium hover:text-[#fb923c]/80 transition"
            >
              Změnit heslo <ArrowRight size={14} strokeWidth={1.75} />
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nové heslo (min. 6 znaků)"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#fb923c]/40"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Potvrdit nové heslo"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#fb923c]/40"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleChangePassword}
                  disabled={passwordSaving}
                  className="bg-[#fb923c] text-[#0a0a12] text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {passwordSaving ? '...' : 'Uložit heslo'}
                </button>
                <button
                  onClick={() => { setShowPasswordChange(false); setNewPassword(''); setConfirmPassword('') }}
                  className="text-white/40 text-xs px-3 py-2 hover:text-white/70 transition"
                >
                  Zrušit
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Login method */}
        <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 mb-4">
          <h2 className="text-white/25 text-[10px] font-bold uppercase tracking-wider m-0 mb-3">Přihlášení</h2>
          <p className="inline-flex items-center gap-2 text-white text-sm m-0"><ProviderIcon size={16} strokeWidth={1.75} className="text-[#fb923c]" /> {providerName}</p>
        </div>

        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#111120] border border-[#fb923c]/20 text-[#fb923c] text-sm px-4 py-2.5 rounded-xl shadow-lg z-50">
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}
