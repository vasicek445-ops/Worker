'use client'

import { useState, useRef, useEffect } from 'react'
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
  { id: 'klassisch' as const, name: 'Klassisch', desc: 'Tmavý sidebar', icon: '🏢' },
  { id: 'modern' as const, name: 'Modern', desc: 'Čistý, elegantní', icon: '✨' },
  { id: 'kreativ' as const, name: 'Kreativ', desc: 'Výrazný banner', icon: '🎨' },
  { id: 'elegant' as const, name: 'Elegant', desc: 'Jemný, sofistikovaný', icon: '💎' },
  { id: 'minimal' as const, name: 'Minimal', desc: 'Čistá typografie', icon: '📐' },
  { id: 'executive' as const, name: 'Executive', desc: 'Tmavá hlavička', icon: '👔' },
  { id: 'swiss' as const, name: 'Swiss', desc: 'Formální, tabulkový', icon: '🇨🇭' },
  { id: 'timeline' as const, name: 'Timeline', desc: 'Vizuální časová osa', icon: '📊' },
  { id: 'corporate' as const, name: 'Corporate', desc: 'Pravý sidebar', icon: '🏛️' },
  { id: 'bold' as const, name: 'Bold', desc: 'Výrazný, gradient', icon: '🔥' },
]

const QUICK_COLORS = [
  '#1a3a5c', '#2471a3', '#5dade2',
  '#0e4429', '#1e8449', '#2ecc71',
  '#641e16', '#c0392b', '#e74c3c',
  '#4a235a', '#8e44ad', '#c39bd3',
  '#1c1c1c', '#2c3e50', '#b9770e',
]

type TemplateType = 'klassisch' | 'modern' | 'kreativ' | 'elegant' | 'minimal' | 'executive' | 'swiss' | 'timeline' | 'corporate' | 'bold'

export default function CVSablona() {
  const { isActive, loading } = useSubscription()
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [photo, setPhoto] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cvData, setCvData] = useState<any | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [template, setTemplate] = useState<TemplateType>('klassisch')
  const [accentColor, setAccentColor] = useState('#2c3e50')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [prefilled, setPrefilled] = useState(false)

  // Auto-prefill from user profile
  useEffect(() => {
    if (prefilled) return
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (profile) {
          const prefillData: Record<string, string> = {}
          if (profile.full_name) prefillData.name = profile.full_name
          if (profile.datum_narozeni) prefillData.birthdate = profile.datum_narozeni
          if (profile.telefon) prefillData.phone = profile.telefon
          if (user.email) prefillData.email = user.email
          if (profile.adresa) prefillData.address = profile.adresa
          if (profile.ridicky_prukaz) prefillData.driving = profile.ridicky_prukaz
          if (profile.pozice) prefillData.position = profile.pozice
          if (profile.obor) prefillData.field = profile.obor
          if (profile.zkusenosti) prefillData.experience_detail = profile.zkusenosti
          if (profile.vzdelani) prefillData.education = profile.vzdelani
          if (profile.nemcina_uroven) prefillData.german = profile.nemcina_uroven
          if (profile.dalsi_jazyky) prefillData.other_languages = profile.dalsi_jazyky
          if (profile.dovednosti) prefillData.skills = profile.dovednosti
          setFormData(prev => ({ ...prev, ...prefillData }))
          // Use profile avatar as default photo
          if (profile.avatar_url && !photo) setPhoto(profile.avatar_url)
        }
        // Also check URL prefill params
        const params = new URLSearchParams(window.location.search)
        const p = params.get('prefill')
        if (p) {
          const data = JSON.parse(decodeURIComponent(p))
          setFormData(prev => ({
            ...prev,
            ...(data.position && { position: data.position }),
            ...(data.skills && { skills: data.skills }),
          }))
        }
      } catch {}
      setPrefilled(true)
    }
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilled])

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            <div className="mb-3">
              <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Styl šablony</span>
              <div className="flex gap-1.5 flex-wrap mt-2">
                {TEMPLATES.map((t) => (
                  <button key={t.id} onClick={() => setTemplate(t.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${template === t.id ? 'bg-white text-black' : 'bg-[#252525] text-gray-400 hover:text-white'}`}>
                    {t.icon} {t.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-800 pt-3">
              <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Barva</span>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_COLORS.map((c) => (
                    <button key={c} onClick={() => setAccentColor(c)}
                      className="w-6 h-6 rounded-full transition-transform hover:scale-125"
                      style={{ backgroundColor: c, border: accentColor === c ? '2px solid #fff' : '2px solid transparent', boxShadow: accentColor === c ? '0 0 0 2px rgba(255,255,255,0.3)' : 'none' }} />
                  ))}
                </div>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-full cursor-pointer border-0 p-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-2 [&::-webkit-color-swatch]:border-gray-600"
                />
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
            <p className="text-gray-400 text-xs">10 profesionálních stylů · libovolná barva · fotka · PDF ke stažení</p>
          </div>
        </div>

        <PaywallOverlay isLocked={!isActive && !loading} title="AI šablony jsou součástí Premium" description="Získej profesionální CV ve švýcarském formátu">
          <div className="space-y-4">

            {/* Profile prefill banner */}
            {prefilled && Object.keys(formData).length > 2 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-2">
                <span className="text-green-400 text-sm">✓ Údaje vyplněny z tvého profilu. Uprav co potřebuješ.</span>
              </div>
            )}

            {/* Step 1: Template */}
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">1. Vyber styl šablony</label>
              <div className="grid grid-cols-5 gap-2">
                {TEMPLATES.map((t) => (
                  <button key={t.id} onClick={() => setTemplate(t.id)}
                    className={`p-2.5 rounded-xl border text-center transition ${template === t.id ? 'border-[#E8302A] bg-[#E8302A]/10' : 'border-gray-800 bg-[#1A1A1A] hover:border-gray-600'}`}>
                    <span className="text-lg block">{t.icon}</span>
                    <span className="text-white text-xs font-semibold block">{t.name}</span>
                    <span className="text-gray-500 text-[10px] leading-tight">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Color picker */}
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">2. Vyber barvu</label>
              <div className="bg-[#1A1A1A] rounded-xl p-3 border border-gray-800">
                {/* Quick preset colors */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {QUICK_COLORS.map((c) => (
                    <button key={c} onClick={() => setAccentColor(c)}
                      className="w-7 h-7 rounded-full transition-transform hover:scale-110 flex-shrink-0"
                      style={{ backgroundColor: c, border: accentColor === c ? '2.5px solid #fff' : '2.5px solid transparent', boxShadow: accentColor === c ? '0 0 0 2px rgba(255,255,255,0.3)' : 'none' }} />
                  ))}
                </div>
                {/* Custom color picker */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded-full cursor-pointer border-0 p-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-2 [&::-webkit-color-swatch]:border-gray-600 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-2 [&::-moz-color-swatch]:border-gray-600"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-500 text-[10px] mb-1">Vlastní barva</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setAccentColor(e.target.value) }}
                        className="bg-[#252525] border border-gray-700 rounded-lg px-2.5 py-1 text-white text-xs font-mono w-20 focus:border-gray-500 focus:outline-none"
                        maxLength={7}
                      />
                      <div className="h-6 w-16 rounded-md" style={{ backgroundColor: accentColor }} />
                    </div>
                  </div>
                </div>
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

            {/* Step 4: Personal */}
            <label className="text-gray-300 text-sm font-medium block">4. Osobní údaje</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} placeholder="Celé jméno *" className="col-span-2 bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              <input type="text" value={formData.birthdate || ''} onChange={(e) => handleChange('birthdate', e.target.value)} placeholder="Datum narození *" className="bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              <input type="text" value={formData.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} placeholder="Telefon *" className="bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              <input type="text" value={formData.email || ''} onChange={(e) => handleChange('email', e.target.value)} placeholder="Email *" className="bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              <select value={formData.nationality || ''} onChange={(e) => handleChange('nationality', e.target.value)} className="bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:border-gray-600 focus:outline-none transition appearance-none">
                <option value="">Národnost</option>
                <option value="Česká">Česká</option>
                <option value="Slovenská">Slovenská</option>
                <option value="Polská">Polská</option>
                <option value="Ukrajinská">Ukrajinská</option>
                <option value="Rumunská">Rumunská</option>
                <option value="Maďarská">Maďarská</option>
                <option value="Italská">Italská</option>
                <option value="Portugalská">Portugalská</option>
                <option value="Španělská">Španělská</option>
                <option value="Řecká">Řecká</option>
              </select>
              <input type="text" value={formData.address || ''} onChange={(e) => handleChange('address', e.target.value)} placeholder="Adresa" className="bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              <input type="text" value={formData.driving || ''} onChange={(e) => handleChange('driving', e.target.value)} placeholder="Řidičský průkaz (B, C...)" className="col-span-2 bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
            </div>

            {/* Step 5 */}
            <label className="text-gray-300 text-sm font-medium block">5. Cílová pozice</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={formData.position || ''} onChange={(e) => handleChange('position', e.target.value)} placeholder="Pozice *" className="bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              <select value={formData.field || ''} onChange={(e) => handleChange('field', e.target.value)} className="bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:border-gray-600 focus:outline-none transition appearance-none">
                <option value="">Obor *</option>
                {FIELD_OPTIONS.fields.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Step 6 */}
            <label className="text-gray-300 text-sm font-medium block">6. Pracovní zkušenosti</label>
            <textarea value={formData.experience_detail || ''} onChange={(e) => handleChange('experience_detail', e.target.value)} placeholder={'Napiš zkušenosti – AI je rozšíří:\n2019–2024: Zedník, StavbyPraha – hrubé stavby\n2017–2019: Pomocný dělník, XY firma'} rows={4} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition resize-none" />

            {/* Step 7 */}
            <label className="text-gray-300 text-sm font-medium block">7. Vzdělání</label>
            <textarea value={formData.education || ''} onChange={(e) => handleChange('education', e.target.value)} placeholder={'2014–2017: SOU stavební, Praha – výuční list'} rows={2} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition resize-none" />

            {/* Step 8 */}
            <label className="text-gray-300 text-sm font-medium block">8. Jazyky</label>
            <div className="grid grid-cols-2 gap-3">
              <select value={formData.german || ''} onChange={(e) => handleChange('german', e.target.value)} className="bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:border-gray-600 focus:outline-none transition appearance-none">
                <option value="">Úroveň němčiny *</option>
                {FIELD_OPTIONS.german.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <input type="text" value={formData.other_languages || ''} onChange={(e) => handleChange('other_languages', e.target.value)} placeholder="Další jazyky" className="bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
            </div>

            {/* Step 9 */}
            <label className="text-gray-300 text-sm font-medium block">9. Dovednosti</label>
            <textarea value={formData.skills || ''} onChange={(e) => handleChange('skills', e.target.value)} placeholder="svařování, jeřáb, práce ve výškách... (AI doplní)" rows={2} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition resize-none" />

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
