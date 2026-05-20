'use client'

import { useRef, useState } from 'react'
import { useProfileShell } from '../_components/ProfileShell'
import { supabase } from '../../supabase'
import WheelDatePicker from '../../components/cv/WheelDatePicker'

const NATIONALITIES = [
  'Česká', 'Slovenská', 'Polská', 'Ukrajinská', 'Rumunská', 'Bulharská',
  'Maďarská', 'Italská', 'Portugalská', 'Španělská', 'Řecká',
  'Bosna a Hercegovina', 'Severní Makedonie', 'Srbsko', 'Chorvatsko',
  'Albánie', 'Turecko', 'Sýrie', 'Eritrea', 'Vietnam', 'Filipíny',
  'Brazílie', 'Indie', 'Jiné',
]

const inputClass =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fb923c]/40'
const labelClass = 'block text-white/60 text-xs font-medium mb-1.5'
const hintClass = 'text-white/30 text-xs mt-1'

export default function OsobniUdajePage() {
  const { profile, userId, loading, update, saving, savedAt } = useProfileShell()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    if (!file.type.startsWith('image/')) { showToast('Nahraj prosím obrázek'); return }
    if (file.size > 2 * 1024 * 1024) { showToast('Max velikost je 2 MB'); return }
    setUploading(true)
    try {
      const path = `${userId}/avatar`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      const avatarUrl = publicUrl + '?t=' + Date.now()
      await update({ avatar_url: avatarUrl })
      showToast('Fotka nahrána!')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast('Chyba: ' + (err?.message || 'Zkus to znovu'))
    } finally {
      setUploading(false)
    }
  }

  const userInitial = (profile?.full_name || profile?.email || '?').trim().charAt(0).toUpperCase()

  const saveStatus = saving
    ? 'Ukládám…'
    : savedAt
      ? 'Uloženo'
      : ''

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#fb923c] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <div className="max-w-[640px] mx-auto px-5 py-8">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white m-0">Osobní údaje</h1>
            <p className="text-white/40 text-sm mt-1">Základní informace o tobě. Vyplníš jednou, použije se napříč Wokerem.</p>
          </div>
          {saveStatus && (
            <span className="text-[11px] text-white/40 mt-1 whitespace-nowrap">{saveStatus}</span>
          )}
        </header>

        <div className="bg-[#111120] rounded-2xl border border-white/[0.06] p-5 mb-4">
          <label className={labelClass}>Profilová fotka</label>
          <div className="flex items-center gap-4 mt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="relative group"
            >
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-white/[0.08] group-hover:border-[#fb923c]/40 transition"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fb923c] to-[#f97316] flex items-center justify-center text-[#0a0a12] font-black text-3xl border-2 border-white/[0.08] group-hover:border-[#fb923c]/40 transition shadow-[0_0_20px_rgba(251,146,60,0.15)]">
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-[#fb923c] text-sm font-medium hover:underline disabled:opacity-50"
              >
                {profile?.avatar_url ? 'Změnit fotku' : 'Nahrát fotku'}
              </button>
              <p className={hintClass}>JPG/PNG do 2 MB.</p>
            </div>
          </div>
        </div>

        <div className="bg-[#111120] rounded-2xl border border-white/[0.06] p-5 space-y-4">
          <div>
            <label className={labelClass}>Jméno a příjmení</label>
            <input
              type="text"
              value={profile?.full_name || ''}
              onChange={(e) => update({ full_name: e.target.value })}
              className={inputClass}
              placeholder="Jan Novák"
            />
            <p className={hintClass}>Objeví se na CV, v motivačním dopise a v podpisu Smart Apply e-mailů.</p>
          </div>

          <div>
            <label className={labelClass}>Datum narození</label>
            <WheelDatePicker
              value={profile?.datum_narozeni || ''}
              onChange={(val) => update({ datum_narozeni: val })}
              locale="cs"
              outputFormat="eu"
            />
            <p className={hintClass}>Den, měsíc, rok. Použijeme pro výpočet věku v dopisech a žádostech o bydlení.</p>
          </div>

          <div>
            <label className={labelClass}>Telefon</label>
            <input
              type="tel"
              value={profile?.telefon || ''}
              onChange={(e) => update({ telefon: e.target.value })}
              className={inputClass}
              placeholder="+41 79 123 45 67"
            />
            <p className={hintClass}>Kontakt na CV. Použije se i v žádostech o bydlení a v Smart Apply e-mailech.</p>
          </div>

          <div>
            <label className={labelClass}>Kontaktní e-mail</label>
            <input
              type="text"
              value={profile?.email || ''}
              onChange={(e) => update({ email: e.target.value })}
              className={inputClass}
              placeholder="jan.novak@example.com"
            />
            <p className={hintClass}>Tento e-mail uvedeš na CV. Přihlašovací e-mail změníš v Nastavení.</p>
          </div>

          <div>
            <label className={labelClass}>Národnost</label>
            <select
              value={profile?.nationality || ''}
              onChange={(e) => update({ nationality: e.target.value })}
              className={inputClass + ' appearance-none cursor-pointer'}
            >
              <option value="" disabled className="bg-[#111120]">Vyber národnost</option>
              {NATIONALITIES.map((n) => (
                <option key={n} value={n} className="bg-[#111120]">{n}</option>
              ))}
            </select>
            <p className={hintClass}>Důležité pro povolení k práci ve Švýcarsku. Objeví se i v motivačních dopisech.</p>
          </div>

          <div>
            <label className={labelClass}>Adresa</label>
            <input
              type="text"
              value={profile?.adresa || ''}
              onChange={(e) => update({ adresa: e.target.value })}
              className={inputClass}
              placeholder="Ulice 123, 8000 Curych"
            />
            <p className={hintClass}>Aktuální adresa (CH nebo domov). Použije se na CV a v žádostech o bydlení.</p>
          </div>

          <div>
            <label className={labelClass}>Řidičský průkaz</label>
            <input
              type="text"
              value={profile?.ridicky_prukaz || ''}
              onChange={(e) => update({ ridicky_prukaz: e.target.value })}
              className={inputClass}
              placeholder="B, C, vlastní auto"
            />
            <p className={hintClass}>Skupiny + zda máš vlastní auto. Velké plus pro logistiku a stavbu — objeví se v CV i motivačních dopisech.</p>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#111120] border border-white/[0.08] text-white text-sm px-4 py-2.5 rounded-xl shadow-lg z-50">
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}
