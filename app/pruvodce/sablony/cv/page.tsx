'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useSubscription } from '../../../../hooks/useSubscription'
import PaywallOverlay from '../../../components/PaywallOverlay'
import CVPreview from '../../../components/CVPreview'
import { supabase } from '../../../supabase'
import Link from 'next/link'

const FIELD_OPTIONS = {
  fields: ['Stavebnictví', 'Gastronomie / Hotelnictví', 'Logistika / Sklad', 'Zdravotnictví', 'Úklid / Údržba', 'Strojírenství / Technik', 'IT / Software', 'Elektro / Instalatér', 'Řidič / Doprava', 'Jiný obor'],
  german: ['Žádná – teprve se učím', 'Základy (A1)', 'Základní komunikace (A2)', 'Dorozumím se (B1)', 'Dobrá úroveň (B2)', 'Plynulá (C1/C2)'],
}

const TEMPLATES: Array<{ id: string; name: string; desc: string; icon: string; category?: string }> = [
  // Handcrafted
  { id: 'klassisch', name: 'Klassisch', desc: 'Tmavý sidebar', icon: '🏢', category: 'Populární' },
  { id: 'modern', name: 'Modern', desc: 'Čistý, elegantní', icon: '✨', category: 'Populární' },
  { id: 'kreativ', name: 'Kreativ', desc: 'Výrazný banner', icon: '🎨', category: 'Populární' },
  { id: 'elegant', name: 'Elegant', desc: 'Jemný, sofistikovaný', icon: '💎', category: 'Populární' },
  { id: 'minimal', name: 'Minimal', desc: 'Čistá typografie', icon: '📐', category: 'Populární' },
  { id: 'executive', name: 'Executive', desc: 'Tmavá hlavička', icon: '👔', category: 'Populární' },
  { id: 'swiss', name: 'Swiss', desc: 'Formální, tabulkový', icon: '🇨🇭', category: 'Populární' },
  { id: 'timeline', name: 'Timeline', desc: 'Vizuální časová osa', icon: '📊', category: 'Populární' },
  { id: 'corporate', name: 'Corporate', desc: 'Pravý sidebar', icon: '🏛️', category: 'Populární' },
  { id: 'bold', name: 'Bold', desc: 'Výrazný, gradient', icon: '🔥', category: 'Populární' },
  { id: 'compact', name: 'Compact', desc: 'Hustý, víc obsahu', icon: '📋', category: 'Populární' },
  { id: 'dark', name: 'Dark', desc: 'Tmavý motiv', icon: '🌙', category: 'Populární' },
  { id: 'infographic', name: 'Infographic', desc: 'Grafické prvky', icon: '📈', category: 'Populární' },
  { id: 'zweispaltig', name: 'Zwei-Spalten', desc: 'Dva rovné sloupce', icon: '📰', category: 'Populární' },
  { id: 'nordic', name: 'Nordic', desc: 'Skandinávský styl', icon: '❄️', category: 'Populární' },
  // Professional series
  { id: 'pro-classic', name: 'Pro Classic', desc: 'Profesionální sidebar', icon: '💼', category: 'Profesionální' },
  { id: 'pro-light', name: 'Pro Light', desc: 'Světlý sidebar', icon: '☀️', category: 'Profesionální' },
  { id: 'pro-serif', name: 'Pro Serif', desc: 'Patkové písmo', icon: '📖', category: 'Profesionální' },
  { id: 'pro-square', name: 'Pro Square', desc: 'Čtvercová fotka', icon: '⬛', category: 'Profesionální' },
  { id: 'pro-rounded', name: 'Pro Rounded', desc: 'Zaoblená fotka', icon: '🔲', category: 'Profesionální' },
  { id: 'pro-gradient', name: 'Pro Gradient', desc: 'Gradientový sidebar', icon: '🌈', category: 'Profesionální' },
  { id: 'pro-compact', name: 'Pro Compact', desc: 'Kompaktní sidebar', icon: '📦', category: 'Profesionální' },
  { id: 'pro-cards', name: 'Pro Cards', desc: 'Kartičkové sekce', icon: '🃏', category: 'Profesionální' },
  { id: 'pro-dots', name: 'Pro Dots', desc: 'Tečkové nadpisy', icon: '⚫', category: 'Profesionální' },
  { id: 'pro-slim', name: 'Pro Slim', desc: 'Štíhlá hlavička', icon: '📏', category: 'Profesionální' },
  // Right sidebar series
  { id: 'right-classic', name: 'Right Classic', desc: 'Pravý svetlý', icon: '▶️', category: 'Pravý panel' },
  { id: 'right-dark', name: 'Right Dark', desc: 'Pravý barevný', icon: '◀️', category: 'Pravý panel' },
  { id: 'right-serif', name: 'Right Serif', desc: 'Pravý patkový', icon: '📓', category: 'Pravý panel' },
  { id: 'right-gradient', name: 'Right Gradient', desc: 'Pravý gradient', icon: '🎆', category: 'Pravý panel' },
  { id: 'right-modern', name: 'Right Modern', desc: 'Pravý moderní', icon: '🔷', category: 'Pravý panel' },
  { id: 'right-compact', name: 'Right Compact', desc: 'Pravý kompakt', icon: '📎', category: 'Pravý panel' },
  { id: 'right-cards', name: 'Right Cards', desc: 'Pravý kartičky', icon: '🎴', category: 'Pravý panel' },
  { id: 'right-dots', name: 'Right Dots', desc: 'Pravý tečky', icon: '🔘', category: 'Pravý panel' },
  // Top header series
  { id: 'top-dark', name: 'Top Dark', desc: 'Tmavá hlavička', icon: '⬆️', category: 'Horní hlavička' },
  { id: 'top-gradient', name: 'Top Gradient', desc: 'Gradient hlavička', icon: '🌅', category: 'Horní hlavička' },
  { id: 'top-accent', name: 'Top Accent', desc: 'Barevná hlavička', icon: '🎯', category: 'Horní hlavička' },
  { id: 'top-serif', name: 'Top Serif', desc: 'Patkový horní', icon: '📜', category: 'Horní hlavička' },
  { id: 'top-modern', name: 'Top Modern', desc: 'Moderní horní', icon: '🔺', category: 'Horní hlavička' },
  { id: 'top-compact', name: 'Top Compact', desc: 'Kompaktní horní', icon: '📌', category: 'Horní hlavička' },
  { id: 'top-cards', name: 'Top Cards', desc: 'Kartičky horní', icon: '🎪', category: 'Horní hlavička' },
  { id: 'top-light', name: 'Top Light', desc: 'Světlá hlavička', icon: '💡', category: 'Horní hlavička' },
  { id: 'top-slim', name: 'Top Slim', desc: 'Štíhlá hlavička', icon: '➖', category: 'Horní hlavička' },
  { id: 'top-dots', name: 'Top Dots', desc: 'Tečkový horní', icon: '🔵', category: 'Horní hlavička' },
  // Two column series
  { id: 'twin-classic', name: 'Twin Classic', desc: 'Dva sloupce', icon: '📑', category: 'Dva sloupce' },
  { id: 'twin-dark', name: 'Twin Dark', desc: 'Tmavé dva sloupce', icon: '📋', category: 'Dva sloupce' },
  { id: 'twin-serif', name: 'Twin Serif', desc: 'Patkové dva sl.', icon: '📘', category: 'Dva sloupce' },
  { id: 'twin-modern', name: 'Twin Modern', desc: 'Moderní dva sl.', icon: '📊', category: 'Dva sloupce' },
  { id: 'twin-compact', name: 'Twin Compact', desc: 'Kompaktní dva sl.', icon: '🗂️', category: 'Dva sloupce' },
  { id: 'twin-cards', name: 'Twin Cards', desc: 'Kartičky dva sl.', icon: '🗃️', category: 'Dva sloupce' },
  { id: 'twin-accent', name: 'Twin Accent', desc: 'Barevné dva sl.', icon: '🎨', category: 'Dva sloupce' },
  { id: 'twin-dots', name: 'Twin Dots', desc: 'Tečkové dva sl.', icon: '⚪', category: 'Dva sloupce' },
  // Single column series
  { id: 'single-classic', name: 'Single Classic', desc: 'Jednosloupec', icon: '📄', category: 'Jednosloupec' },
  { id: 'single-dark', name: 'Single Dark', desc: 'Tmavý jednosloupec', icon: '🖤', category: 'Jednosloupec' },
  { id: 'single-serif', name: 'Single Serif', desc: 'Patkový jednosloupec', icon: '📕', category: 'Jednosloupec' },
  { id: 'single-modern', name: 'Single Modern', desc: 'Moderní jednosloupec', icon: '🔹', category: 'Jednosloupec' },
  { id: 'single-compact', name: 'Single Compact', desc: 'Kompaktní jednosloupec', icon: '📍', category: 'Jednosloupec' },
  { id: 'single-cards', name: 'Single Cards', desc: 'Kartičky jednosloupec', icon: '🎫', category: 'Jednosloupec' },
  { id: 'single-gradient', name: 'Single Gradient', desc: 'Gradient jednosloupec', icon: '🌊', category: 'Jednosloupec' },
  { id: 'single-accent', name: 'Single Accent', desc: 'Barevný jednosloupec', icon: '🔶', category: 'Jednosloupec' },
  // Dark mode series
  { id: 'dark-sidebar', name: 'Dark Sidebar', desc: 'Tmavý + sidebar', icon: '🌑', category: 'Tmavý motiv' },
  { id: 'dark-right', name: 'Dark Right', desc: 'Tmavý + pravý', icon: '🌒', category: 'Tmavý motiv' },
  { id: 'dark-top', name: 'Dark Top', desc: 'Tmavý + horní', icon: '🌓', category: 'Tmavý motiv' },
  { id: 'dark-twin', name: 'Dark Twin', desc: 'Tmavý + dva sl.', icon: '🌔', category: 'Tmavý motiv' },
  { id: 'dark-single', name: 'Dark Single', desc: 'Tmavý + jeden sl.', icon: '🌕', category: 'Tmavý motiv' },
  { id: 'dark-serif', name: 'Dark Serif', desc: 'Tmavý + patkový', icon: '🌖', category: 'Tmavý motiv' },
  { id: 'dark-modern', name: 'Dark Modern', desc: 'Tmavý + moderní', icon: '🌗', category: 'Tmavý motiv' },
  { id: 'dark-compact', name: 'Dark Compact', desc: 'Tmavý kompaktní', icon: '🌘', category: 'Tmavý motiv' },
  { id: 'dark-cards', name: 'Dark Cards', desc: 'Tmavé kartičky', icon: '🃏', category: 'Tmavý motiv' },
  { id: 'dark-gradient', name: 'Dark Gradient', desc: 'Tmavý gradient', icon: '🎇', category: 'Tmavý motiv' },
  // Serif series
  { id: 'serif-classic', name: 'Serif Classic', desc: 'Patkový klasik', icon: '📚', category: 'Patkové' },
  { id: 'serif-top', name: 'Serif Top', desc: 'Patkový horní', icon: '📖', category: 'Patkové' },
  { id: 'serif-single', name: 'Serif Single', desc: 'Patkový jeden sl.', icon: '📗', category: 'Patkové' },
  { id: 'serif-dark', name: 'Serif Dark', desc: 'Patkový tmavý', icon: '📙', category: 'Patkové' },
  { id: 'serif-twin', name: 'Serif Twin', desc: 'Patkový dva sl.', icon: '📔', category: 'Patkové' },
  // Modern series
  { id: 'modern-square', name: 'Modern Square', desc: 'Čtvercový moderní', icon: '🟦', category: 'Moderní' },
  { id: 'modern-dark', name: 'Modern Dark', desc: 'Tmavý moderní', icon: '🟪', category: 'Moderní' },
  { id: 'modern-sidebar', name: 'Modern Sidebar', desc: 'Moderní sidebar', icon: '🟩', category: 'Moderní' },
  { id: 'modern-twin', name: 'Modern Twin', desc: 'Moderní dva sl.', icon: '🟨', category: 'Moderní' },
  { id: 'modern-single', name: 'Modern Single', desc: 'Moderní jeden sl.', icon: '🟧', category: 'Moderní' },
  // Card series
  { id: 'card-light', name: 'Card Light', desc: 'Světlé karty', icon: '🪧', category: 'Kartičky' },
  { id: 'card-dark', name: 'Card Dark', desc: 'Tmavé karty', icon: '🏷️', category: 'Kartičky' },
  { id: 'card-sidebar', name: 'Card Sidebar', desc: 'Karty + sidebar', icon: '🏷️', category: 'Kartičky' },
  { id: 'card-single', name: 'Card Single', desc: 'Karty jednosloupec', icon: '🏷️', category: 'Kartičky' },
  { id: 'card-serif', name: 'Card Serif', desc: 'Karty patkové', icon: '🏷️', category: 'Kartičky' },
  // Gradient series
  { id: 'grad-sidebar', name: 'Grad Sidebar', desc: 'Gradient sidebar', icon: '🌈', category: 'Gradient' },
  { id: 'grad-top', name: 'Grad Top', desc: 'Gradient horní', icon: '🌅', category: 'Gradient' },
  { id: 'grad-right', name: 'Grad Right', desc: 'Gradient pravý', icon: '🌇', category: 'Gradient' },
  { id: 'grad-twin', name: 'Grad Twin', desc: 'Gradient dva sl.', icon: '🌄', category: 'Gradient' },
  { id: 'grad-serif', name: 'Grad Serif', desc: 'Gradient patkový', icon: '🌆', category: 'Gradient' },
  { id: 'grad-dark', name: 'Grad Dark', desc: 'Gradient tmavý', icon: '🌃', category: 'Gradient' },
  // Compact series
  { id: 'compact-sidebar', name: 'Kompakt Sidebar', desc: 'Kompakt sidebar', icon: '📐', category: 'Kompaktní' },
  { id: 'compact-top', name: 'Kompakt Top', desc: 'Kompakt horní', icon: '📏', category: 'Kompaktní' },
  { id: 'compact-twin', name: 'Kompakt Twin', desc: 'Kompakt dva sl.', icon: '📎', category: 'Kompaktní' },
  { id: 'compact-dark-top', name: 'Kompakt Dark', desc: 'Kompakt tmavý', icon: '📌', category: 'Kompaktní' },
  { id: 'compact-single', name: 'Kompakt Single', desc: 'Kompakt jeden sl.', icon: '📍', category: 'Kompaktní' },
  // Dot/Arrow series
  { id: 'dots-sidebar', name: 'Dots Sidebar', desc: 'Tečky sidebar', icon: '⚫', category: 'Speciální' },
  { id: 'dots-top', name: 'Dots Top', desc: 'Tečky horní', icon: '🔴', category: 'Speciální' },
  { id: 'dots-serif', name: 'Dots Serif', desc: 'Tečky patkový', icon: '🟤', category: 'Speciální' },
  { id: 'dots-dark', name: 'Dots Dark', desc: 'Tečky tmavý', icon: '🟣', category: 'Speciální' },
  { id: 'arrow-top', name: 'Arrow Top', desc: 'Šipky horní', icon: '➡️', category: 'Speciální' },
  { id: 'arrow-sidebar', name: 'Arrow Sidebar', desc: 'Šipky sidebar', icon: '↗️', category: 'Speciální' },
  { id: 'arrow-dark', name: 'Arrow Dark', desc: 'Šipky tmavý', icon: '⬆️', category: 'Speciální' },
]

const QUICK_COLORS = [
  '#1a3a5c', '#2471a3', '#5dade2',
  '#0e4429', '#1e8449', '#2ecc71',
  '#641e16', '#c0392b', '#e74c3c',
  '#4a235a', '#8e44ad', '#c39bd3',
  '#1c1c1c', '#2c3e50', '#b9770e',
]

type TemplateType = string

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
  const [category, setCategory] = useState('Populární')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

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

  const handleSaveCV = async (html: string) => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('profiles').update({ saved_cv_html: html }).eq('id', user.id)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    finally { setSaving(false) }
  }

  const inputClass = "w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:border-[#39ff6e]/40 focus:outline-none focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(57,255,110,0.05)] transition-all"
  const selectClass = "w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:border-[#39ff6e]/40 focus:outline-none transition-all appearance-none"

  // ─── RESULT VIEW ───
  if (cvData) {
    return (
      <main className="min-h-screen bg-[#0a0a12] px-4 py-6 pb-24 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
        {/* Ambient effects */}
        <div className="fixed w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none z-0 opacity-10 -top-[200px] -right-[100px]" style={{ background: "radial-gradient(circle, rgba(57,255,110,0.25), transparent 70%)" }} />
        <div className="fixed w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none z-0 opacity-10 bottom-[200px] -left-[200px]" style={{ background: "radial-gradient(circle, rgba(100,60,255,0.2), transparent 70%)" }} />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-5">
            <Link href="/pruvodce/sablony" className="text-white/30 hover:text-white text-sm no-underline transition">← Zpět</Link>
            <button onClick={() => setCvData(null)} className="text-white/40 hover:text-white text-xs px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl transition hover:bg-white/[0.08]">Upravit údaje</button>
          </div>

          {/* Template + color switcher */}
          <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 mb-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Image src="/images/3d/document.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Styl šablony</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {TEMPLATES.map((t) => (
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

          <CVPreview data={cvData} photo={photo} template={template} accentColor={accentColor} onSave={handleSaveCV} saving={saving} />
          {saved && (
            <div className="bg-[#39ff6e]/[0.06] border border-[#39ff6e]/20 rounded-xl p-3 mt-3 text-center">
              <span className="text-[#39ff6e]/80 text-sm">CV uloženo — bude se automaticky přikládat k přihláškám přes Smart Matching</span>
            </div>
          )}

          <button onClick={() => { setCvData(null); setFormData({}); setPhoto(null) }} className="w-full text-white/30 hover:text-white text-sm py-4 mt-5 transition bg-white/[0.02] hover:bg-white/[0.05] rounded-xl border border-white/[0.06]">
            Vytvořit nový životopis
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
          {/* Dot pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <pattern id="cvGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="white"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#cvGrid)"/>
          </svg>
          <div className="relative flex items-center gap-4">
            <Image src="/images/3d/document.png" alt="" width={56} height={56} className="drop-shadow-[0_4px_20px_rgba(57,255,110,0.3)]" />
            <div>
              <h1 className="text-white text-2xl font-extrabold m-0 tracking-tight">AI Životopis</h1>
              <p className="text-white/35 text-sm m-0 mt-1">{TEMPLATES.length} profesionálních stylů · libovolná barva · fotka · PDF ke stažení</p>
            </div>
          </div>
        </div>

        <PaywallOverlay isLocked={!isActive && !loading} title="AI šablony jsou součástí Premium" description="Získej profesionální CV ve švýcarském formátu">
          <div className="space-y-5">

            {/* Profile prefill banner */}
            {prefilled && Object.keys(formData).length > 2 && (
              <div className="bg-[#39ff6e]/[0.06] border border-[#39ff6e]/20 rounded-xl p-3 flex items-center gap-2">
                <Image src="/images/3d/key.png" alt="" width={18} height={18} />
                <span className="text-[#39ff6e]/80 text-sm">Údaje vyplněny z profilu. Uprav co potřebuješ.</span>
              </div>
            )}

            {/* Step 1: Template */}
            <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Image src="/images/3d/target.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">1. Styl šablony</span>
                <span className="text-white/20 text-xs font-normal ml-1">({TEMPLATES.length} stylů)</span>
              </div>
              {/* Category filter */}
              <div className="flex gap-1.5 mb-3 flex-wrap">
                {Array.from(new Set(TEMPLATES.map(t => t.category || 'Ostatní'))).map((cat) => (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${category === cat ? 'bg-[#39ff6e]/15 text-[#39ff6e] border border-[#39ff6e]/30 shadow-[0_0_10px_rgba(57,255,110,0.1)]' : 'bg-white/[0.03] text-white/30 hover:text-white/50 border border-white/[0.06]'}`}>
                    {cat}
                  </button>
                ))}
              </div>
              {/* Template grid */}
              <div className="grid grid-cols-5 gap-1.5 max-h-[220px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                {TEMPLATES.filter(t => (t.category || 'Ostatní') === category).map((t) => (
                  <button key={t.id} onClick={() => setTemplate(t.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${template === t.id ? 'border-[#39ff6e]/40 bg-[#39ff6e]/[0.08] shadow-[0_0_15px_rgba(57,255,110,0.08)]' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12]'}`}>
                    <span className="text-sm block">{t.icon}</span>
                    <span className="text-white text-[10px] font-semibold block truncate mt-0.5">{t.name}</span>
                    <span className="text-white/25 text-[8px] leading-tight block truncate">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Color picker */}
            <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Image src="/images/3d/gem.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">2. Barva</span>
              </div>
              {/* Quick preset colors */}
              <div className="flex flex-wrap gap-2 mb-4">
                {QUICK_COLORS.map((c) => (
                  <button key={c} onClick={() => setAccentColor(c)}
                    className="w-8 h-8 rounded-full transition-all hover:scale-110 flex-shrink-0"
                    style={{ backgroundColor: c, border: accentColor === c ? '2.5px solid #fff' : '2.5px solid transparent', boxShadow: accentColor === c ? '0 0 0 2px rgba(255,255,255,0.3), 0 0 15px rgba(57,255,110,0.15)' : 'none' }} />
                ))}
              </div>
              {/* Custom color picker */}
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded-full cursor-pointer border-0 p-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-2 [&::-webkit-color-swatch]:border-white/20 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-2 [&::-moz-color-swatch]:border-white/20"
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

            {/* Step 3: Photo */}
            <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Image src="/images/3d/star.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">3. Fotka (volitelné)</span>
              </div>
              <div className="flex items-center gap-4">
                <div onClick={() => fileInputRef.current?.click()} className="w-16 h-16 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center cursor-pointer hover:border-[#39ff6e]/30 transition-all overflow-hidden flex-shrink-0 hover:shadow-[0_0_15px_rgba(57,255,110,0.08)]">
                  {photo ? <img src={photo} alt="Foto" className="w-full h-full object-cover" /> : <span className="text-white/20 text-xl">+</span>}
                </div>
                <div>
                  <button onClick={() => fileInputRef.current?.click()} className="text-[#39ff6e]/80 text-sm font-medium hover:text-[#39ff6e] transition">{photo ? 'Změnit' : 'Nahrát fotku'}</button>
                  {photo && <button onClick={() => setPhoto(null)} className="text-white/30 text-xs ml-3 hover:text-white transition">Odstranit</button>}
                  <p className="text-white/20 text-xs mt-0.5">JPG/PNG, max 5 MB</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} className="hidden" />
              </div>
            </div>

            {/* Step 4: Personal */}
            <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Image src="/images/3d/key.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">4. Osobní údaje</span>
              </div>
              <input type="text" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} placeholder="Celé jméno *" className={inputClass} />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={formData.birthdate || ''} onChange={(e) => handleChange('birthdate', e.target.value)} placeholder="Datum narození *" className={inputClass} />
                <input type="text" value={formData.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} placeholder="Telefon *" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={formData.email || ''} onChange={(e) => handleChange('email', e.target.value)} placeholder="Email *" className={inputClass} />
                <select value={formData.nationality || ''} onChange={(e) => handleChange('nationality', e.target.value)} className={selectClass}>
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
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={formData.address || ''} onChange={(e) => handleChange('address', e.target.value)} placeholder="Adresa" className={inputClass} />
                <input type="text" value={formData.driving || ''} onChange={(e) => handleChange('driving', e.target.value)} placeholder="Řidičský průkaz (B, C...)" className={inputClass} />
              </div>
            </div>

            {/* Step 5: Position */}
            <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Image src="/images/3d/briefcase.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">5. Cílová pozice</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={formData.position || ''} onChange={(e) => handleChange('position', e.target.value)} placeholder="Pozice *" className={inputClass} />
                <select value={formData.field || ''} onChange={(e) => handleChange('field', e.target.value)} className={selectClass}>
                  <option value="">Obor *</option>
                  {FIELD_OPTIONS.fields.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* Step 6: Experience */}
            <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Image src="/images/3d/rocket.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">6. Pracovní zkušenosti</span>
              </div>
              <textarea value={formData.experience_detail || ''} onChange={(e) => handleChange('experience_detail', e.target.value)} placeholder={'Napiš zkušenosti – AI je rozšíří:\n2019–2024: Zedník, StavbyPraha – hrubé stavby\n2017–2019: Pomocný dělník, XY firma'} rows={4} className={`${inputClass} resize-none`} />
            </div>

            {/* Step 7: Education */}
            <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Image src="/images/3d/document.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">7. Vzdělání</span>
              </div>
              <textarea value={formData.education || ''} onChange={(e) => handleChange('education', e.target.value)} placeholder={'2014–2017: SOU stavební, Praha – výuční list'} rows={2} className={`${inputClass} resize-none`} />
            </div>

            {/* Step 8: Languages */}
            <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Image src="/images/3d/speech.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">8. Jazyky</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={formData.german || ''} onChange={(e) => handleChange('german', e.target.value)} className={selectClass}>
                  <option value="">Úroveň němčiny *</option>
                  {FIELD_OPTIONS.german.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <input type="text" value={formData.other_languages || ''} onChange={(e) => handleChange('other_languages', e.target.value)} placeholder="Další jazyky" className={inputClass} />
              </div>
            </div>

            {/* Step 9: Skills */}
            <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Image src="/images/3d/target.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">9. Dovednosti</span>
              </div>
              <textarea value={formData.skills || ''} onChange={(e) => handleChange('skills', e.target.value)} placeholder="svařování, jeřáb, práce ve výškách... (AI doplní)" rows={2} className={`${inputClass} resize-none`} />
            </div>

            {error && (
              <div className="bg-red-500/[0.06] border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm m-0">⚠️ {error}</p>
              </div>
            )}

            {/* Submit button */}
            <button onClick={handleSubmit} disabled={generating}
              className="w-full relative overflow-hidden bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] font-extrabold py-4 px-6 rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_4px_30px_rgba(57,255,110,0.35)] hover:scale-[1.02] active:scale-[0.98]">
              {generating ? (
                <span className="flex items-center justify-center gap-2.5">
                  <span className="w-5 h-5 border-2 border-[#0a0a12]/30 border-t-[#0a0a12] rounded-full animate-spin" />
                  AI generuje profesionální CV...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2.5">
                  <Image src="/images/3d/document.png" alt="" width={22} height={22} />
                  Vygenerovat profesionální CV
                </span>
              )}
            </button>
            <p className="text-white/20 text-xs text-center">AI přeloží do němčiny, rozšíří texty a vytvoří vizuální PDF</p>
          </div>
        </PaywallOverlay>
      </div>
    </main>
  )
}
