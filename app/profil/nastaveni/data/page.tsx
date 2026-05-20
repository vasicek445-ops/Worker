'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'

export default function DataPage() {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteText, setDeleteText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (cancelled) return
      if (!data.user) { router.replace('/prihlaseni'); return }
      setUser(data.user)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle()
      if (!cancelled) {
        setProfile(profileData)
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [router])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const handleExport = async () => {
    if (!user) return
    setExporting(true)
    try {
      const [savedDocsRes, subRes] = await Promise.all([
        supabase.from('saved_documents').select('*').eq('user_id', user.id),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle(),
      ])
      const data = {
        exported_at: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
        profile,
        saved_documents: savedDocsRes.data || [],
        subscription: subRes.data || null,
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `woker-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      showToast('Data exportována!')
    } catch {
      showToast('Chyba při exportu')
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteText !== 'SMAZAT') return
    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      if (!res.ok) throw new Error('Chyba při mazání')
      await supabase.auth.signOut()
      window.location.href = '/prihlaseni'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast('Chyba: ' + (err?.message || 'Zkus to znovu'))
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#fb923c] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-2xl mx-auto p-6">
        <header className="mb-8">
          <Link href="/profil/nastaveni" className="text-white/40 text-sm hover:text-white/70 transition no-underline">
            ← Zpět na nastavení
          </Link>
          <h1 className="text-2xl font-extrabold text-white m-0 mt-3 flex items-center gap-2">
            <span>📥</span> Data
          </h1>
          <p className="text-white/40 text-sm mt-1">Stáhni si svá data nebo trvale smaž účet.</p>
        </header>

        {/* GDPR Export */}
        <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 mb-4">
          <h2 className="text-white/25 text-[10px] font-bold uppercase tracking-wider m-0 mb-3">Export dat (GDPR)</h2>
          <p className="text-white/60 text-sm m-0 mb-4">
            Stáhni si JSON s profilem, uloženými dokumenty a stavem předplatného.
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="bg-white/[0.06] border border-white/[0.08] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-white/[0.1] transition disabled:opacity-50"
          >
            {exporting ? 'Připravuji...' : '📥 Exportovat moje data'}
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.04] my-6" />

        {/* Danger Zone */}
        <div
          className="rounded-2xl border border-red-500/15 p-5 mb-4"
          style={{ background: 'rgba(239,68,68,0.05)' }}
        >
          <h2 className="text-red-400/60 text-[10px] font-bold uppercase tracking-wider m-0 mb-3">Nebezpečná zóna</h2>

          {!showDeleteConfirm ? (
            <>
              <p className="text-white/60 text-sm m-0 mb-4">
                Trvale smaže tvůj účet, profil, předplatné a všechna uložená data. Nelze vrátit zpět.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-400/80 text-sm font-medium hover:text-red-400 transition"
              >
                🗑️ Smazat účet a všechna data
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-xs font-medium m-0 mb-1">⚠️ Tato akce je nevratná!</p>
                <p className="text-red-400/70 text-[11px] m-0">
                  Tvůj účet, profil, předplatné a všechna data budou trvale smazána.
                </p>
              </div>
              <div>
                <p className="text-white/40 text-xs m-0 mb-1.5">Napiš SMAZAT pro potvrzení:</p>
                <input
                  type="text"
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  placeholder="SMAZAT"
                  className="w-full bg-white/[0.04] border border-red-500/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/40"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteText !== 'SMAZAT' || deleting}
                  className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-30"
                >
                  {deleting ? 'Mažu...' : 'Trvale smazat účet'}
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteText('') }}
                  className="text-white/40 text-xs px-3 py-2 hover:text-white/70 transition"
                >
                  Zrušit
                </button>
              </div>
            </div>
          )}
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
