'use client'

import { useState, useRef } from 'react'
import { useSubscription } from '../../../../hooks/useSubscription'
import PaywallOverlay from '../../../components/PaywallOverlay'
import CVPreview from '../../../components/CVPreview'
import { supabase } from '../../../supabase'
import Link from 'next/link'

const FIELD_OPTIONS = {
  fields: ['Stavebnictví', 'Gastronomie / Hotelnictví', 'Logistika / Sklad', 'Zdravotnictví', 'Úklid / Údržba', 'Strojírenství / Technik', 'IT / Software', 'Elektro / Instalatér', 'Řidič / Doprava', 'Jiný obor'],
  german: ['Žádná – teprve se učím', 'Základy (A1)', 'Základní komunikace (A2)', 'Dorozumím se (B1)', 'Dobrá úroveň (B2)', 'Plynulá (C1/C2)'],
}

export default function CVSablona() {
  const { isActive, loading } = useSubscription()
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [photo, setPhoto] = useState<string | null>(null)
  const [cvData, setCvData] = useState<any | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Fotka je příliš velká (max 5 MB)')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    const required = ['name', 'birthdate', 'phone', 'email', 'position', 'field', 'experience_detail', 'education', 'german', 'skills']
    const missing = required.filter((f) => !formData[f]?.trim())
    if (missing.length > 0) {
      setError('Vyplň prosím všechna povinná pole')
      return
    }
    setGenerating(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError('Musíš být přihlášen')
        setGenerating(false)
        return
      }
      const res = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ formData }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generování selhalo')
      setCvData(data.cvData)
    } catch (err: any) {
      setError(err.message || 'Něco se pokazilo')
    } finally {
      setGenerating(false)
    }
  }

  if (cvData) {
    return (
      <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/pruvodce/sablony" className="text-gray-500 hover:text-white text-sm">← Zpět na šablony</Link>
            <button onClick={() => setCvData(null)} className="text-gray-400 hover:text-white text-sm px-3 py-1 border border-gray-700 rounded-lg transition">✏️ Upravit údaje</button>
          </div>
          <CVPreview data={cvData} photo={photo} />
          <button onClick={() => { setCvData(null); setFormData({}); setPhoto(null) }} className="w-full text-gray-400 hover:text-white text-sm py-3 mt-4 transition">🔄 Vygenerovat nový životopis</button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/pruvodce/sablony" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">← Zpět na šablony</Link>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📄</span>
          <div>
            <h1 className="text-white text-xl font-bold">Životopis – švýcarský formát</h1>
            <p className="text-gray-400 text-xs">Profesionální PDF s fotkou, připravený k odeslání</p>
          </div>
        </div>
        <PaywallOverlay isLocked={!isActive && !loading} title="AI šablony jsou součástí Premium" description="Získej profesionální CV ve švýcarském formátu">
          <div className="space-y-4">
            <div className="mb-6">
              <h2 className="text-white text-xl font-bold mb-1">Vyplň údaje česky</h2>
              <p className="text-gray-400 text-sm">AI vytvoří profesionální vizuální CV v němčině</p>
            </div>

            {/* Photo */}
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">Fotka (volitelné)</label>
              <div className="flex items-center gap-4">
                <div onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-xl bg-[#1A1A1A] border border-gray-800 flex items-center justify-center cursor-pointer hover:border-gray-600 transition overflow-hidden flex-shrink-0">
                  {photo ? <img src={photo} alt="Foto" className="w-full h-full object-cover" /> : <span className="text-gray-600 text-2xl">📷</span>}
                </div>
                <div>
                  <button onClick={() => fileInputRef.current?.click()} className="text-[#E8302A] text-sm font-medium hover:opacity-80 transition">{photo ? 'Změnit fotku' : 'Nahrát fotku'}</button>
                  <p className="text-gray-600 text-xs mt-1">JPG nebo PNG, max 5 MB</p>
                  {photo && <button onClick={() => setPhoto(null)} className="text-gray-500 text-xs mt-1 hover:text-white transition">Odstranit</button>}
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} className="hidden" />
              </div>
            </div>

            {/* Personal */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Celé jméno <span className="text-[#E8302A]">*</span></label>
                <input type="text" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} placeholder="Jan Novák" className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              </div>
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Datum narození <span className="text-[#E8302A]">*</span></label>
                <input type="text" value={formData.birthdate || ''} onChange={(e) => handleChange('birthdate', e.target.value)} placeholder="15.03.1990" className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              </div>
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Telefon <span className="text-[#E8302A]">*</span></label>
                <input type="text" value={formData.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+420 123 456 789" className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              </div>
              <div className="col-span-2">
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Email <span className="text-[#E8302A]">*</span></label>
                <input type="text" value={formData.email || ''} onChange={(e) => handleChange('email', e.target.value)} placeholder="jan.novak@email.com" className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              </div>
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Adresa</label>
                <input type="text" value={formData.address || ''} onChange={(e) => handleChange('address', e.target.value)} placeholder="Praha, ČR" className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              </div>
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Řidičský průkaz</label>
                <input type="text" value={formData.driving || ''} onChange={(e) => handleChange('driving', e.target.value)} placeholder="B, C..." className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Cílová pozice <span className="text-[#E8302A]">*</span></label>
                <input type="text" value={formData.position || ''} onChange={(e) => handleChange('position', e.target.value)} placeholder="Monteur, Lagerist..." className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              </div>
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Obor <span className="text-[#E8302A]">*</span></label>
                <select value={formData.field || ''} onChange={(e) => handleChange('field', e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:border-gray-600 focus:outline-none transition appearance-none">
                  <option value="">Vyber obor</option>
                  {FIELD_OPTIONS.fields.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">Pracovní zkušenosti <span className="text-[#E8302A]">*</span></label>
              <textarea value={formData.experience_detail || ''} onChange={(e) => handleChange('experience_detail', e.target.value)} placeholder={'Napiš své zkušenosti, např.:\n2019–2024: Zedník, StavbyPraha – hrubé stavby\n2017–2019: Pomocný dělník, XY firma'} rows={4} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition resize-none" />
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">Vzdělání <span className="text-[#E8302A]">*</span></label>
              <textarea value={formData.education || ''} onChange={(e) => handleChange('education', e.target.value)} placeholder={'např.:\n2014–2017: SOU stavební, Praha – výuční list'} rows={3} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Němčina <span className="text-[#E8302A]">*</span></label>
                <select value={formData.german || ''} onChange={(e) => handleChange('german', e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:border-gray-600 focus:outline-none transition appearance-none">
                  <option value="">Vyber úroveň</option>
                  {FIELD_OPTIONS.german.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Další jazyky</label>
                <input type="text" value={formData.other_languages || ''} onChange={(e) => handleChange('other_languages', e.target.value)} placeholder="Angličtina B1..." className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              </div>
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">Dovednosti <span className="text-[#E8302A]">*</span></label>
              <textarea value={formData.skills || ''} onChange={(e) => handleChange('skills', e.target.value)} placeholder="svařování MIG/MAG, jeřáb, práce ve výškách..." rows={3} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition resize-none" />
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"><p className="text-red-400 text-sm">⚠️ {error}</p></div>}

            <button onClick={handleSubmit} disabled={generating} className="w-full bg-[#E8302A] text-white font-bold py-3.5 px-6 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI generuje životopis...
                </span>
              ) : '🚀 Vygenerovat profesionální CV'}
            </button>
            <p className="text-gray-600 text-xs text-center">Údaje vyplňuj česky – AI přeloží do němčiny a vytvoří vizuální PDF</p>
          </div>
        </PaywallOverlay>
      </div>
    </main>
  )
}
