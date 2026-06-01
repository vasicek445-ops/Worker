'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'
import { ArrowLeft, Database, Trash2, AlertTriangle, FileDown } from 'lucide-react'

const PROFILE_LABELS: Record<string, string> = {
  full_name: 'Jméno', telefon: 'Telefon', datum_narozeni: 'Datum narození', adresa: 'Adresa',
  nationality: 'Národnost', ridicky_prukaz: 'Řidičský průkaz', pozice: 'Pozice', obor: 'Obor',
  zkusenosti: 'Zkušenosti', vzdelani: 'Vzdělání', dovednosti: 'Dovednosti', nemcina_uroven: 'Němčina',
  preferovany_kanton: 'Preferovaný kanton', avatar_url: 'Profilová fotka', dalsi_jazyky: 'Další jazyky',
}
const PROFILE_SKIP = ['id', 'last_seen_at', 'notify_mentions', 'notify_dms', 'notify_weekly', 'user_email_step']

const esc = (s: unknown) => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] || c))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fmtVal(v: any): string | null {
  if (v == null || v === '') return null
  if (typeof v === 'boolean') return v ? 'Ano' : 'Ne'
  if (Array.isArray(v)) return v.length ? v.map(x => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(', ') : null
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildExportHtml(user: any, profile: any, docs: any[], sub: any): string {
  const th = 'padding:7px 0;color:#888;font-size:12px;width:38%;vertical-align:top'
  const td = 'padding:7px 0;color:#1a1a1a;font-size:12px;font-weight:500'
  const section = (title: string) => `<h2 style="font-size:11px;font-weight:800;color:#f97316;text-transform:uppercase;letter-spacing:.06em;margin:26px 0 6px;border-bottom:1px solid #eee;padding-bottom:6px">${esc(title)}</h2>`
  const row = (label: string, val: string | null) => val == null ? '' : `<tr><td style="${th}">${esc(label)}</td><td style="${td}">${esc(val)}</td></tr>`

  const accountRows = [
    row('E-mail', user.email),
    row('ID účtu', user.id),
    row('Registrace', user.created_at ? new Date(user.created_at).toLocaleDateString('cs-CZ') : null),
  ].join('')

  const profileRows = Object.entries(profile || {})
    .filter(([k]) => !PROFILE_SKIP.includes(k))
    .map(([k, v]) => row(PROFILE_LABELS[k] || k, k === 'avatar_url' && v ? 'nahraná fotka' : fmtVal(v)))
    .join('')

  const docsRows = (docs || []).length
    ? (docs || []).map(d => `<tr><td style="${td}" colspan="2">• ${esc(d.title || d.name || d.type || 'Dokument')}${d.created_at ? ` <span style="color:#aaa">(${new Date(d.created_at).toLocaleDateString('cs-CZ')})</span>` : ''}</td></tr>`).join('')
    : `<tr><td style="${td};color:#aaa" colspan="2">Žádné uložené dokumenty</td></tr>`

  const subRows = sub
    ? [row('Stav', sub.status), row('Plán', sub.plan || sub.price_id), row('Platné do', sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString('cs-CZ') : null)].join('')
    : `<tr><td style="${td};color:#aaa" colspan="2">Bez předplatného</td></tr>`

  return `<div style="width:794px;box-sizing:border-box;padding:48px 56px;background:#fff;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif">
    <div style="display:flex;align-items:baseline;justify-content:space-between;border-bottom:2px solid #f97316;padding-bottom:14px">
      <span style="font-size:26px;font-weight:800;color:#f97316">Woker</span>
      <span style="font-size:12px;color:#999">Export dat (GDPR)</span>
    </div>
    <p style="font-size:12px;color:#999;margin:10px 0 0">Vygenerováno ${esc(new Date().toLocaleString('cs-CZ'))}</p>
    ${section('Účet')}<table style="width:100%;border-collapse:collapse">${accountRows}</table>
    ${section('Profil')}<table style="width:100%;border-collapse:collapse">${profileRows || `<tr><td style="${td};color:#aaa">Profil není vyplněný</td></tr>`}</table>
    ${section('Uložené dokumenty')}<table style="width:100%;border-collapse:collapse">${docsRows}</table>
    ${section('Předplatné')}<table style="width:100%;border-collapse:collapse">${subRows}</table>
    <p style="font-size:10px;color:#bbb;margin-top:34px;border-top:1px solid #eee;padding-top:12px">Toto je kompletní export osobních dat uložených na platformě Woker (gowoker.com).</p>
  </div>`
}

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

  const exportRef = useRef<HTMLDivElement>(null)

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

  const fetchAllData = async () => {
    const [savedDocsRes, subRes] = await Promise.all([
      supabase.from('saved_documents').select('*').eq('user_id', user.id),
      supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle(),
    ])
    return { docs: savedDocsRes.data || [], sub: subRes.data || null }
  }

  // Hlavní export — čitelné PDF (přes html2canvas, ať sedí česká diakritika)
  const handleExport = async () => {
    if (!user || exporting) return
    setExporting(true)
    try {
      const { docs, sub } = await fetchAllData()
      const el = exportRef.current
      if (!el) throw new Error('no container')
      el.innerHTML = buildExportHtml(user, profile, docs, sub)
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r(null))))

      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', windowWidth: 794 })
      el.innerHTML = ''

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
      const pageW = 210, pageH = 297
      const imgW = pageW
      const imgH = (canvas.height * imgW) / canvas.width
      const img = canvas.toDataURL('image/jpeg', 0.95)
      let heightLeft = imgH
      let position = 0
      pdf.addImage(img, 'JPEG', 0, position, imgW, imgH)
      heightLeft -= pageH
      while (heightLeft > 0) {
        position = heightLeft - imgH
        pdf.addPage()
        pdf.addImage(img, 'JPEG', 0, position, imgW, imgH)
        heightLeft -= pageH
      }
      pdf.save(`woker-data-${new Date().toISOString().split('T')[0]}.pdf`)
      showToast('Data stažena jako PDF!')
    } catch {
      showToast('Chyba při exportu')
    } finally {
      setExporting(false)
    }
  }

  // Záložní strojově čitelný export (GDPR portabilita)
  const handleExportJson = async () => {
    if (!user) return
    try {
      const { docs, sub } = await fetchAllData()
      const data = {
        exported_at: new Date().toISOString(),
        user: { id: user.id, email: user.email, created_at: user.created_at },
        profile, saved_documents: docs, subscription: sub,
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `woker-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      showToast('Chyba při exportu')
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
          <Link href="/profil/nastaveni" className="inline-flex items-center gap-1.5 text-white/40 text-sm hover:text-white/70 transition no-underline">
            <ArrowLeft size={15} strokeWidth={1.75} /> Zpět na nastavení
          </Link>
          <h1 className="text-2xl font-extrabold text-white m-0 mt-3 flex items-center gap-2">
            <Database size={22} strokeWidth={1.75} className="text-[#fb923c]" /> Data
          </h1>
          <p className="text-white/40 text-sm mt-1">Stáhni si svá data nebo trvale smaž účet.</p>
        </header>

        {/* GDPR Export */}
        <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 mb-4">
          <h2 className="text-white/25 text-[10px] font-bold uppercase tracking-wider m-0 mb-3">Export dat (GDPR)</h2>
          <p className="text-white/60 text-sm m-0 mb-4">
            Stáhni si přehledné PDF s profilem, uloženými dokumenty a stavem předplatného.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-white/[0.1] transition disabled:opacity-50"
            >
              {exporting
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" /> Připravuji…</>
                : <><FileDown size={16} strokeWidth={1.75} /> Stáhnout PDF</>}
            </button>
            <button onClick={handleExportJson} className="text-white/35 text-xs hover:text-white/60 transition underline underline-offset-2">
              nebo jako JSON
            </button>
          </div>
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
                className="inline-flex items-center gap-2 text-red-400/80 text-sm font-medium hover:text-red-400 transition"
              >
                <Trash2 size={15} strokeWidth={1.75} /> Smazat účet a všechna data
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="inline-flex items-center gap-1.5 text-red-400 text-xs font-medium m-0 mb-1"><AlertTriangle size={13} strokeWidth={2} /> Tato akce je nevratná!</p>
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

        {/* Off-screen kontejner — sem se renderuje obsah PDF před html2canvas */}
        <div ref={exportRef} aria-hidden style={{ position: 'fixed', left: -10000, top: 0, width: 794, pointerEvents: 'none' }} />

        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#111120] border border-[#fb923c]/20 text-[#fb923c] text-sm px-4 py-2.5 rounded-xl shadow-lg z-50">
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}
