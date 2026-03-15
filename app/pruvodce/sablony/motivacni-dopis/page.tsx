'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSubscription } from '../../../../hooks/useSubscription'
import PaywallOverlay from '../../../components/PaywallOverlay'
import LetterPreview, { LETTER_TEMPLATES } from '../../../components/LetterPreview'
import { supabase } from '../../../supabase'
import Link from 'next/link'

const FIELD_OPTIONS = [
  'Stavebnictví',
  'Gastronomie / Hotelnictví',
  'Logistika / Sklad',
  'Zdravotnictví',
  'Úklid / Údržba',
  'Strojírenství / Technik',
  'IT / Software',
  'Elektro / Instalatér',
  'Řidič / Doprava',
  'Jiný obor',
]

const GERMAN_OPTIONS = [
  'Žádná – teprve se učím',
  'Základy (A1)',
  'Základní komunikace (A2)',
  'Dorozumím se (B1)',
  'Dobrá úroveň (B2)',
  'Plynulá (C1/C2)',
]

const QUICK_COLORS = [
  '#1a3a5c', '#2471a3', '#5dade2',
  '#0e4429', '#1e8449', '#2ecc71',
  '#641e16', '#c0392b', '#e74c3c',
  '#4a235a', '#8e44ad', '#c39bd3',
  '#1c1c1c', '#2c3e50', '#b9770e',
]

export default function MotivacniDopis() {
  const { isActive, loading } = useSubscription()
  const [step, setStep] = useState(1)
  const [template, setTemplate] = useState(LETTER_TEMPLATES[0]?.id || 'formal')
  const [accentColor, setAccentColor] = useState('#2c3e50')
  const [category, setCategory] = useState(LETTER_TEMPLATES[0]?.category || 'Formální')
  const [formData, setFormData] = useState<Record<string, string>>({})
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [letterData, setLetterData] = useState<any | null>(null)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prefilled, setPrefilled] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)

  // Restore last letter from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('woker-last-letter')
      if (saved) {
        const { letterData: savedLetter, template: savedTemplate, accentColor: savedColor, photo: savedPhoto } = JSON.parse(saved)
        if (savedLetter) { setLetterData(savedLetter); if (savedTemplate) setTemplate(savedTemplate); if (savedColor) setAccentColor(savedColor); if (savedPhoto) setPhoto(savedPhoto) }
      }
    } catch {}
  }, [])

  // Save letter to sessionStorage when generated
  useEffect(() => {
    if (letterData) {
      sessionStorage.setItem('woker-last-letter', JSON.stringify({ letterData, template, accentColor, photo }))
    }
  }, [letterData, template, accentColor, photo])

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
          if (profile.adresa) prefillData.address = profile.adresa
          if (profile.telefon) prefillData.phone = profile.telefon
          if (user.email) prefillData.email = user.email
          if (profile.pozice) prefillData.position = profile.pozice
          if (profile.obor) prefillData.field = profile.obor
          if (profile.zkusenosti) prefillData.experience = profile.zkusenosti
          if (profile.nemcina_uroven) prefillData.german = profile.nemcina_uroven
          if (profile.dovednosti) prefillData.skills = profile.dovednosti
          setFormData(prev => ({ ...prev, ...prefillData }))
          if (profile.avatar_url && !photo) setPhoto(profile.avatar_url)
        }
        // Prefill from job analysis (only when coming from analysis via URL param)
        const params = new URLSearchParams(window.location.search)
        const p = params.get('prefill')
        let analysisResult: { position?: string; company?: string; companyAddress?: string; field?: string; keywords?: string[]; tips?: string[]; location?: string; cover_letter_keywords?: string[]; match_tips?: string[]; skills_needed?: string[] } | null = null

        if (p) {
          try { analysisResult = JSON.parse(decodeURIComponent(p)) } catch {}

          // Also try sessionStorage if URL param parse failed
          if (!analysisResult) {
            try {
              const saved = sessionStorage.getItem('woker-last-analysis')
              if (saved) {
                const { result } = JSON.parse(saved)
                if (result) {
                  analysisResult = {
                    position: result.position?.split('(')[0]?.split('/')[0]?.trim() || '',
                    company: result.company || '',
                    keywords: result.cover_letter_keywords || [],
                    tips: result.match_tips || [],
                    location: result.location || '',
                  }
                }
              }
            } catch {}
          }
        }

        if (analysisResult) {
          const keywords = analysisResult.keywords || analysisResult.cover_letter_keywords || []
          const tips = analysisResult.tips || analysisResult.match_tips || []
          setFormData(prev => ({
            ...prev,
            ...(analysisResult!.position && { position: analysisResult!.position }),
            ...(analysisResult!.company && { company: analysisResult!.company }),
            ...(analysisResult!.companyAddress && { companyAddress: analysisResult!.companyAddress }),
            ...(analysisResult!.field && { field: analysisResult!.field }),
            ...(keywords.length && { skills: prev.skills ? `${prev.skills}, ${keywords.join(', ')}` : keywords.join(', ') }),
            ...(tips.length && { motivation: tips.join('. ') }),
            ...(analysisResult!.location && { companyAddress: analysisResult!.location }),
          }))
        }
      } catch {}
      setPrefilled(true)
    }
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilled])

  const handleChange = (name: string, value: string) => setFormData(prev => ({ ...prev, [name]: value }))

  const handleSubmit = async () => {
    const required = ['name', 'email', 'position', 'field', 'skills', 'german']
    if (required.some(f => !formData[f]?.trim())) { setError('Vyplň prosím všechna povinná pole'); return }
    setGenerating(true); setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) { setError('Musíš být přihlášen'); setGenerating(false); return }
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ formData }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generování selhalo')
      setLetterData(data.letterData)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { setError(err.message || 'Něco se pokazilo') }
    finally { setGenerating(false) }
  }

  const handleSaveLetter = async (html: string) => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('profiles').update({ saved_letter_html: html }).eq('id', user.id)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    finally { setSaving(false) }
  }

  const inputClass = "w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:border-[#39ff6e]/40 focus:outline-none focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(57,255,110,0.05)] transition-all"
  const selectClass = "w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:border-[#39ff6e]/40 focus:outline-none transition-all appearance-none"

  const categories = Array.from(new Set(LETTER_TEMPLATES.map(t => t.category || 'Ostatní')))

  // ─── RESULT VIEW ───
  if (letterData) {
    return (
      <main className="min-h-screen bg-[#0a0a12] px-4 py-6 pb-24 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
        {/* Ambient effects */}
        <div className="fixed w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none z-0 opacity-10 -top-[200px] -right-[100px]" style={{ background: "radial-gradient(circle, rgba(57,255,110,0.25), transparent 70%)" }} />
        <div className="fixed w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none z-0 opacity-10 bottom-[200px] -left-[200px]" style={{ background: "radial-gradient(circle, rgba(100,60,255,0.2), transparent 70%)" }} />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-5">
            <Link href="/pruvodce/sablony" className="text-white/30 hover:text-white text-sm no-underline transition">← Zpět</Link>
            <button onClick={() => setLetterData(null)} className="text-white/40 hover:text-white text-xs px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl transition hover:bg-white/[0.08]">Upravit údaje</button>
          </div>

          {/* Template + color switcher */}
          <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 mb-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Image src="/images/3d/document.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Styl šablony</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {LETTER_TEMPLATES.map((t) => (
                  <button key={t.id} onClick={() => setTemplate(t.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${template === t.id ? 'bg-[#39ff6e]/15 text-[#39ff6e] border border-[#39ff6e]/30' : 'bg-white/[0.03] text-white/40 hover:text-white/60 border border-white/[0.06]'}`}>
                    {t.icon} {t.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-white/[0.06] pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Image src="/images/3d/gem.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Barva</span>
              </div>
              <div className="flex items-center gap-3">
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
                  className="w-8 h-8 rounded-full cursor-pointer border-0 p-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-2 [&::-webkit-color-swatch]:border-white/20"
                />
              </div>
            </div>
          </div>

          <LetterPreview data={letterData} photo={photo} template={template} accentColor={accentColor} onSave={handleSaveLetter} saving={saving} saved={saved} />
          {saved && (
            <div className="bg-[#39ff6e]/[0.06] border border-[#39ff6e]/20 rounded-xl p-3 mt-3 text-center">
              <span className="text-[#39ff6e]/80 text-sm">Dopis uložen — bude se automaticky přikládat k přihláškám přes Smart Matching</span>
            </div>
          )}

          <button onClick={() => { setLetterData(null); setFormData({}); setPhoto(null); setStep(1); sessionStorage.removeItem('woker-last-letter') }} className="w-full text-white/30 hover:text-white text-sm py-4 mt-5 transition bg-white/[0.02] hover:bg-white/[0.05] rounded-xl border border-white/[0.06]">
            Vytvořit nový motivační dopis
          </button>
        </div>
      </main>
    )
  }

  // ─── FORM VIEW ───
  return (
    <main className="min-h-screen bg-[#0a0a12] px-4 py-6 pb-24 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      {/* Ambient effects */}
      <div className="fixed w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none z-0 opacity-10 -top-[200px] right-[10%]" style={{ background: "radial-gradient(circle, rgba(57,255,110,0.25), transparent 70%)" }} />
      <div className="fixed w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none z-0 opacity-8 bottom-[100px] -left-[200px]" style={{ background: "radial-gradient(circle, rgba(100,60,255,0.2), transparent 70%)" }} />

      <div className="max-w-2xl mx-auto relative z-10">
        <Link href="/pruvodce/sablony" className="text-white/30 hover:text-white mb-6 inline-block text-sm no-underline transition">← Zpět na šablony</Link>

        {/* Hero header */}
        <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #111128 0%, #0d1a2e 40%, #0a1a14 100%)" }}>
          <Image src="/images/3d/document.png" alt="" width={120} height={120} className="absolute -right-4 -bottom-4 opacity-[0.08]" />
          <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(57,255,110,0.15), transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(100,60,255,0.1), transparent 60%)" }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <pattern id="letterGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="white"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#letterGrid)"/>
          </svg>
          <div className="relative flex items-center gap-4">
            <Image src="/images/3d/document.png" alt="" width={56} height={56} className="drop-shadow-[0_4px_20px_rgba(57,255,110,0.3)]" />
            <div>
              <h1 className="text-white text-2xl font-extrabold m-0 tracking-tight">AI Motivační dopis</h1>
              <p className="text-white/35 text-sm m-0 mt-1">{LETTER_TEMPLATES.length} profesionálních stylů · v němčině · PDF ke stažení</p>
            </div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map(s => (
            <button key={s} onClick={() => setStep(s)}
              className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? 'bg-[#39ff6e]/60' : 'bg-white/[0.06]'}`} />
          ))}
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-white/30 text-xs">Krok {step} / 4</span>
          <span className="text-white/20 text-xs">
            {step === 1 && 'Výběr šablony'}
            {step === 2 && 'Osobní údaje'}
            {step === 3 && 'Pozice'}
            {step === 4 && 'Obsah dopisu'}
          </span>
        </div>

        <PaywallOverlay isLocked={!isActive && !loading} title="AI šablony jsou součástí Premium" description="Získej profesionální motivační dopis v němčině za 30 sekund">
          <div className="space-y-5">

            {/* Profile prefill banner */}
            {prefilled && Object.keys(formData).length > 2 && (
              <div className="bg-[#39ff6e]/[0.06] border border-[#39ff6e]/20 rounded-xl p-3 flex items-center gap-2">
                <Image src="/images/3d/key.png" alt="" width={18} height={18} />
                <span className="text-[#39ff6e]/80 text-sm">Údaje vyplněny z profilu. Uprav co potřebuješ.</span>
              </div>
            )}

            {/* ═══ STEP 1: Template Selection ═══ */}
            {step === 1 && (
              <>
                {/* Template picker */}
                <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Image src="/images/3d/target.png" alt="" width={18} height={18} />
                    <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Styl dopisu</span>
                    <span className="text-white/20 text-xs font-normal ml-1">({LETTER_TEMPLATES.length} stylů)</span>
                  </div>
                  {/* Category filter */}
                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    {categories.map((cat) => (
                      <button key={cat} onClick={() => setCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${category === cat ? 'bg-[#39ff6e]/15 text-[#39ff6e] border border-[#39ff6e]/30 shadow-[0_0_10px_rgba(57,255,110,0.1)]' : 'bg-white/[0.03] text-white/30 hover:text-white/50 border border-white/[0.06]'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                  {/* Template grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-[280px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                    {LETTER_TEMPLATES.filter(t => (t.category || 'Ostatní') === category).map((t) => (
                      <button key={t.id} onClick={() => setTemplate(t.id)}
                        className={`p-3 rounded-xl border text-center transition-all ${template === t.id ? 'border-[#39ff6e]/40 bg-[#39ff6e]/[0.08] shadow-[0_0_15px_rgba(57,255,110,0.08)]' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12]'}`}>
                        <span className="text-lg block">{t.icon}</span>
                        <span className="text-white text-[11px] font-semibold block truncate mt-1">{t.name}</span>
                        <span className="text-white/25 text-[9px] leading-tight block truncate">{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color picker */}
                <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Image src="/images/3d/gem.png" alt="" width={18} height={18} />
                    <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Barva akcentu</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {QUICK_COLORS.map((c) => (
                      <button key={c} onClick={() => setAccentColor(c)}
                        className="w-8 h-8 rounded-full transition-all hover:scale-110 flex-shrink-0"
                        style={{ backgroundColor: c, border: accentColor === c ? '2.5px solid #fff' : '2.5px solid transparent', boxShadow: accentColor === c ? '0 0 0 2px rgba(255,255,255,0.3), 0 0 15px rgba(57,255,110,0.15)' : 'none' }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded-full cursor-pointer border-0 p-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-2 [&::-webkit-color-swatch]:border-white/20"
                    />
                    <div className="flex-1">
                      <p className="text-white/25 text-[10px] mb-1">Vlastní barva</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={accentColor}
                          onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setAccentColor(e.target.value) }}
                          className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-2.5 py-1 text-white text-xs font-mono w-20 focus:border-[#39ff6e]/40 focus:outline-none"
                          maxLength={7}
                        />
                        <div className="h-6 w-16 rounded-lg" style={{ backgroundColor: accentColor }} />
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={() => setStep(2)}
                  className="w-full bg-[#39ff6e]/10 border border-[#39ff6e]/20 text-[#39ff6e] font-bold py-3.5 rounded-2xl transition hover:bg-[#39ff6e]/20 hover:border-[#39ff6e]/30">
                  Pokračovat na osobní údaje →
                </button>
              </>
            )}

            {/* ═══ STEP 2: Personal Data ═══ */}
            {step === 2 && (
              <>
                <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Image src="/images/3d/key.png" alt="" width={18} height={18} />
                    <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Osobní údaje</span>
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <label className="relative cursor-pointer group">
                      <div className={`w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition ${photo ? 'border-[#39ff6e]/40' : 'border-white/15 hover:border-white/30'}`}>
                        {photo ? (
                          <img src={photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white/20 text-xl">+</span>
                        )}
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = (ev) => setPhoto(ev.target?.result as string)
                        reader.readAsDataURL(file)
                      }} />
                      {photo && <button onClick={(e) => { e.preventDefault(); setPhoto(null) }} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600">×</button>}
                    </label>
                    <div className="flex-1 space-y-2">
                      <input type="text" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} placeholder="Celé jméno *" className={inputClass} />
                      <span className="text-white/20 text-[10px]">Fotka je volitelná</span>
                    </div>
                  </div>
                  <input type="text" value={formData.address || ''} onChange={(e) => handleChange('address', e.target.value)} placeholder="Adresa (ulice, město, PSČ)" className={inputClass} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={formData.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} placeholder="Telefon" className={inputClass} />
                    <input type="text" value={formData.email || ''} onChange={(e) => handleChange('email', e.target.value)} placeholder="Email *" className={inputClass} />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] text-white/50 font-medium py-3.5 rounded-2xl transition hover:bg-white/[0.08] hover:text-white">
                    ← Zpět
                  </button>
                  <button onClick={() => setStep(3)}
                    className="flex-[2] bg-[#39ff6e]/10 border border-[#39ff6e]/20 text-[#39ff6e] font-bold py-3.5 rounded-2xl transition hover:bg-[#39ff6e]/20 hover:border-[#39ff6e]/30">
                    Pokračovat →
                  </button>
                </div>
              </>
            )}

            {/* ═══ STEP 3: Position ═══ */}
            {step === 3 && (
              <>
                <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Image src="/images/3d/briefcase.png" alt="" width={18} height={18} />
                    <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Cílová pozice</span>
                  </div>
                  <input type="text" value={formData.position || ''} onChange={(e) => handleChange('position', e.target.value)} placeholder="Pozice, na kterou se hlásíš *" className={inputClass} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={formData.company || ''} onChange={(e) => handleChange('company', e.target.value)} placeholder="Firma / agentura" className={inputClass} />
                    <input type="text" value={formData.companyAddress || ''} onChange={(e) => handleChange('companyAddress', e.target.value)} placeholder="Adresa firmy" className={inputClass} />
                  </div>
                  <select value={formData.field || ''} onChange={(e) => handleChange('field', e.target.value)} className={selectClass}>
                    <option value="">Obor *</option>
                    {FIELD_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] text-white/50 font-medium py-3.5 rounded-2xl transition hover:bg-white/[0.08] hover:text-white">
                    ← Zpět
                  </button>
                  <button onClick={() => setStep(4)}
                    className="flex-[2] bg-[#39ff6e]/10 border border-[#39ff6e]/20 text-[#39ff6e] font-bold py-3.5 rounded-2xl transition hover:bg-[#39ff6e]/20 hover:border-[#39ff6e]/30">
                    Pokračovat →
                  </button>
                </div>
              </>
            )}

            {/* ═══ STEP 4: Content ═══ */}
            {step === 4 && (
              <>
                <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Image src="/images/3d/rocket.png" alt="" width={18} height={18} />
                    <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Obsah dopisu</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={formData.experience || ''} onChange={(e) => handleChange('experience', e.target.value)} placeholder="Let praxe v oboru *" className={inputClass} />
                    <select value={formData.german || ''} onChange={(e) => handleChange('german', e.target.value)} className={selectClass}>
                      <option value="">Úroveň němčiny *</option>
                      {GERMAN_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <textarea value={formData.skills || ''} onChange={(e) => handleChange('skills', e.target.value)} placeholder="Klíčové dovednosti a zkušenosti *&#10;např. svařování, obsluha CNC, práce ve výškách, řidičák C..." rows={3} className={`${inputClass} resize-none`} />
                  <textarea value={formData.motivation || ''} onChange={(e) => handleChange('motivation', e.target.value)} placeholder="Proč chceš pracovat ve Švýcarsku?&#10;např. lepší podmínky, profesní růst, zkušenosti v zahraničí..." rows={3} className={`${inputClass} resize-none`} />
                  <textarea value={formData.extra || ''} onChange={(e) => handleChange('extra', e.target.value)} placeholder="Další informace (volitelné)&#10;např. mám rodinu ve Švýcarsku, nastup ihned, certifikáty..." rows={2} className={`${inputClass} resize-none`} />
                </div>

                {error && (
                  <div className="bg-red-500/[0.06] border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-sm m-0">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(3)}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] text-white/50 font-medium py-3.5 rounded-2xl transition hover:bg-white/[0.08] hover:text-white">
                    ← Zpět
                  </button>
                  <button onClick={handleSubmit} disabled={generating}
                    className="flex-[2] relative overflow-hidden bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] font-extrabold py-3.5 px-6 rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_4px_30px_rgba(57,255,110,0.35)] hover:scale-[1.02] active:scale-[0.98]">
                    {generating ? (
                      <span className="flex items-center justify-center gap-2.5">
                        <span className="w-5 h-5 border-2 border-[#0a0a12]/30 border-t-[#0a0a12] rounded-full animate-spin" />
                        AI generuje dopis...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2.5">
                        <Image src="/images/3d/document.png" alt="" width={22} height={22} />
                        Vygenerovat motivační dopis
                      </span>
                    )}
                  </button>
                </div>
                <p className="text-white/20 text-xs text-center">AI vytvoří profesionální Bewerbungsschreiben v němčině</p>
              </>
            )}

          </div>
        </PaywallOverlay>
      </div>
    </main>
  )
}
