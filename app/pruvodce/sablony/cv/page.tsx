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

const TEMPLATES = [
  { id: 'klassisch' as const, name: 'Klassisch', desc: 'Tmavý sidebar, profesionální', icon: '🏢' },
  { id: 'modern' as const, name: 'Modern', desc: 'Čistý, světlý, elegantní', icon: '✨' },
  { id: 'kreativ' as const, name: 'Kreativ', desc: 'Výrazný banner, odvážný', icon: '🎨' },
]

const COLORS = [
  { value: '#2c3e50', name: 'Tmavě modrá' },
  { value: '#1a5276', name: 'Královská modrá' },
  { value: '#1e8449', name: 'Smaragdová' },
  { value: '#922b21', name: 'Vínová' },
  { value: '#6c3483', name: 'Fialová' },
  { value: '#1c1c1c', name: 'Černá' },
  { value: '#2e4053', name: 'Ocelová' },
  { value: '#b9770e', name: 'Zlatá' },
]

export default function CVSablona() {
  const { isActive, loading } = useSubscription()
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [photo, setPhoto] = useState<string | null>(null)
  const [cvData, setCvData] = useState<any | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [template, setTemplate] = useState<'klassisch' | 'modern' | 'kreativ'>('klassisch')
  const [accentColor, setAccentColor] = useState('#2c3e50')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (name: string, value: string) => setFormData((prev) => ({ ...prev, [name]: value }))

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Fotka je příliš velká (max 5 MB)'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    const required = ['name', 'birthdate', 'phone', 'email', 'position', 'field', 'experience_detail', 'education', 'german', 'skills']
    if (required.some((f) => !formData[f]?.trim())) { setError('Vyplň prosím všechna povinná pole'); return }
    setGenerating(true); setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) { setError('Musíš být přihlášen'); setGenerating(false); return }
      const res = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ formData }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generování selhalo')
      setCvData(data.cvData)
    } catch (err: any) { setError(err.message || 'Něco se pokazilo') }
    finally { setGenerating(false) }
  }

  // ─── RESULT VIEW ───
  if (cvData) {
    return (
      <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/pruvodce/sablony" className="text-gray-500 hover:text-white text-sm">← Zpět na šablony</Link>
            <button onClick={() => setCvData(null)} className="text-gray-400 hover:text-white text-sm px-3 py-1 border border-gray-700 rounded-lg transition">✏️ Upravit údaje</button>
          </div>

          {/* Template + color switcher */}
          <div className="bg-[#1A1A1A] rounded-xl p-4 mb-6 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Styl šablony</span>
              <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Barva</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-2">
                {TEMPLATES.map((t) => (
                  <button key={t.id} onClick={() => setTemplate(t.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition ${template === t.id ? 'bg-white text-black' : 'bg-[#252525] text-gray-400 hover:text-white'}`}>
                    {t.icon} {t.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button key={c.value} onClick={() => setAccentColor(c.value)} title={c.name}
                    className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                    style={{ backgroundColor: c.value, border: accentColor === c.value ? '2px solid #fff' : '2px solid transparent', boxShadow: accentColor === c.value ? '0 0 0 2px rgba(255,255,255,0.3)' : 'none' }} />
                ))}
              </div>
            </div>
          </div>

          <CVPreview data={cvData} photo={photo} template={template} accentColor={accentColor} />

          <button onClick={() => { setCvData(null); setFormData({}); setPhoto(null) }} className="w-full text-gray-400 hover:text-white text-sm py-3 mt-4 transition">
            🔄 Vygenerovat nový životopis
          </button>
        </div>
      </main>
    )
  }

  // ─── FORM VIEW ───
  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/pruvodce/sablony" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">← Zpět na šablony</Link>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📄</span>
          <div>
            <h1 className="text-white text-xl font-bold">Životopis – švýcarský formát</h1>
            <p className="text-gray-400 text-xs">Profesionální PDF s fotkou a výběrem stylu</p>
          </div>
        </div>

        <PaywallOverlay isLocked={!isActive && !loading} title="AI šablony jsou součástí Premium" description="Získej profesionální CV ve švýcarském formátu">
          <div className="space-y-4">

            {/* Step 1: Template selection */}
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">1. Vyber styl šablony</label>
              <div className="grid grid-cols-3 gap-3">
                {TEMPLATES.map((t) => (
                  <button key={t.id} onClick={() => setTemplate(t.id)}
                    className={`p-3 rounded-xl border text-left transition ${template === t.id ? 'border-[#E8302A] bg-[#E8302A]/10' : 'border-gray-800 bg-[#1A1A1A] hover:border-gray-600'}`}>
                    <span className="text-xl mb-1 block">{t.icon}</span>
                    <span className="text-white text-sm font-semibold block">{t.name}</span>
                    <span className="text-gray-500 text-xs">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Color selection */}
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">2. Vyber barvu</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button key={c.value} onClick={() => setAccentColor(c.value)} title={c.name}
                    className="w-9 h-9 rounded-full transition-transform hover:scale-110"
                    style={{ backgroundColor: c.value, border: accentColor === c.value ? '3px solid #E8302A' : '3px solid #333', boxShadow: accentColor === c.value ? '0 0 0 2px rgba(232,48,42,0.3)' : 'none' }} />
                ))}
              </div>
            </div>

            {/* Step 3: Photo */}
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">3. Fotka (volitelné)</label>
              <div className="flex items-center gap-4">
                <div onClick={() => fileInputRef.current?.click()} className="w-16 h-16 rounded-xl bg-[#1A1A1A] border border-gray-800 flex items-center justify-center cursor-pointer hover:border-gray-600 transition overflow-hidden flex-shrink-0">
                  {photo ? <img src={photo} alt="Foto" className="w-full h-full object-cover" /> : <span className="text-gray-600 text-xl">📷</span>}
                </div>
                <div>
                  <button onClick={() => fileInputRef.current?.click()} className="text-[#E8302A] text-sm font-medium hover:opacity-80 transition">{photo ? 'Změnit' : 'Nahrát fotku'}</button>
                  {photo && <button onClick={() => setPhoto(null)} className="text-gray-500 text-xs ml-3 hover:text-white transition">Odstranit</button>}
                  <p className="text-gray-600 text-xs mt-0.5">JPG/PNG, max 5 MB</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} className="hidden" />
              </div>
            </div>

            <div className="h-px bg-gray-800 my-2" />

            {/* Step 4: Personal data */}
            <label className="text-gray-300 text-sm font-medium block">4. Osobní údaje</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <input type="text" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} placeholder="Celé jméno *" className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              </div>
              <input type="text" value={formData.birthdate || ''} onChange={(e) => handleChange('birthdate', e.target.value)} placeholder="Datum narození *" className="bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              <input type="text" value={formData.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} placeholder="Telefon *" className="bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              <input type="text" value={formData.email || ''} onChange={(e) => handleChange('email', e.target.value)} placeholder="Email *" className="col-span-2 bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              <input type="text" value={formData.address || ''} onChange={(e) => handleChange('address', e.target.value)} placeholder="Adresa" className="bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              <input type="text" value={formData.driving || ''} onChange={(e) => handleChange('driving', e.target.value)} placeholder="Řidičský průkaz" className="bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
            </div>

            {/* Step 5: Job target */}
            <label className="text-gray-300 text-sm font-medium block">5. Cílová pozice</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={formData.position || ''} onChange={(e) => handleChange('position', e.target.value)} placeholder="Pozice (Monteur, Lagerist...) *" className="bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              <select value={formData.field || ''} onChange={(e) => handleChange('field', e.target.value)} className="bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:border-gray-600 focus:outline-none transition appearance-none">
                <option value="">Obor *</option>
                {FIELD_OPTIONS.fields.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Step 6: Experience */}
            <label className="text-gray-300 text-sm font-medium block">6. Pracovní zkušenosti</label>
            <textarea value={formData.experience_detail || ''} onChange={(e) => handleChange('experience_detail', e.target.value)} placeholder={'Napiš své zkušenosti – AI je rozšíří a vylepší:\n2019–2024: Zedník, StavbyPraha – hrubé stavby\n2017–2019: Pomocný dělník, XY firma'} rows={4} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition resize-none" />

            {/* Step 7: Education */}
            <label className="text-gray-300 text-sm font-medium block">7. Vzdělání</label>
            <textarea value={formData.education || ''} onChange={(e) => handleChange('education', e.target.value)} placeholder={'2014–2017: SOU stavební, Praha – výuční list'} rows={2} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition resize-none" />

            {/* Step 8: Languages */}
            <label className="text-gray-300 text-sm font-medium block">8. Jazyky</label>
            <div className="grid grid-cols-2 gap-3">
              <select value={formData.german || ''} onChange={(e) => handleChange('german', e.target.value)} className="bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:border-gray-600 focus:outline-none transition appearance-none">
                <option value="">Úroveň němčiny *</option>
                {FIELD_OPTIONS.german.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <input type="text" value={formData.other_languages || ''} onChange={(e) => handleChange('other_languages', e.target.value)} placeholder="Další jazyky" className="bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
            </div>

            {/* Step 9: Skills */}
            <label className="text-gray-300 text-sm font-medium block">9. Dovednosti</label>
            <textarea value={formData.skills || ''} onChange={(e) => handleChange('skills', e.target.value)} placeholder="svařování MIG/MAG, jeřáb, práce ve výškách... (AI doplní další)" rows={2} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition resize-none" />

            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"><p className="text-red-400 text-sm">⚠️ {error}</p></div>}

            <button onClick={handleSubmit} disabled={generating} className="w-full bg-[#E8302A] text-white font-bold py-3.5 px-6 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI generuje profesionální CV...
                </span>
              ) : '🚀 Vygenerovat profesionální CV'}
            </button>
            <p className="text-gray-600 text-xs text-center">AI přeloží do němčiny, rozšíří texty a vytvoří vizuální PDF</p>
          </div>
        </PaywallOverlay>
      </div>
    </main>
  )
}
