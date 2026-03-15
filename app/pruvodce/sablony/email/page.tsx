'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSubscription } from '../../../../hooks/useSubscription'
import PaywallOverlay from '../../../components/PaywallOverlay'
import { supabase } from '../../../supabase'
import Link from 'next/link'

const FIELD_OPTIONS = [
  'Stavebnictví', 'Gastronomie / Hotelnictví', 'Logistika / Sklad', 'Zdravotnictví',
  'Úklid / Údržba', 'Strojírenství / Technik', 'IT / Software', 'Elektro / Instalatér',
  'Řidič / Doprava', 'Jiný obor',
]
const GERMAN_OPTIONS = [
  'Žádná – teprve se učím', 'Základy (A1)', 'Základní komunikace (A2)',
  'Dorozumím se (B1)', 'Dobrá úroveň (B2)', 'Plynulá (C1/C2)',
]

function parseEmailResult(text: string) {
  const separator = text.indexOf('───')
  if (separator === -1) return { german: text.trim(), czech: '', subject: '' }

  const germanPart = text.substring(0, separator).trim()
  const czechPart = text.substring(separator + 3).replace(/^\s*ČESKÝ PŘEKLAD:\s*/i, '').trim()

  // Extract subject from Betreff: line
  const subjectMatch = germanPart.match(/^Betreff:\s*(.+)/m)
  const subject = subjectMatch ? subjectMatch[1].trim() : ''

  // Get body without Betreff line
  const body = germanPart.replace(/^Betreff:\s*.+\n*/m, '').trim()

  return { german: germanPart, czech: czechPart, subject, body }
}

export default function EmailSablona() {
  const { isActive, loading } = useSubscription()
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [result, setResult] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [prefilled, setPrefilled] = useState(false)
  const [savingDoc, setSavingDoc] = useState(false)
  const [savedDoc, setSavedDoc] = useState(false)

  // Restore from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('woker-last-email')
      if (saved) {
        const { result: savedResult, formData: savedForm } = JSON.parse(saved)
        if (savedResult) setResult(savedResult)
        if (savedForm) setFormData(savedForm)
      }
    } catch {}
  }, [])

  // Save to sessionStorage
  useEffect(() => {
    if (result) {
      sessionStorage.setItem('woker-last-email', JSON.stringify({ result, formData }))
    }
  }, [result, formData])

  // Auto-prefill from profile + analysis
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
          if (profile.pozice) prefillData.position = profile.pozice
          if (profile.obor) prefillData.field = profile.obor
          if (profile.nemcina_uroven) prefillData.german = profile.nemcina_uroven
          if (profile.zkusenosti) prefillData.experience = profile.zkusenosti
          if (profile.dovednosti) prefillData.skills = profile.dovednosti
          if (user.email) prefillData.userEmail = user.email
          setFormData(prev => ({ ...prev, ...prefillData }))
        }

        // Analysis prefill
        const params = new URLSearchParams(window.location.search)
        const p = params.get('prefill')
        if (p) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let analysisData: any = null
          try { analysisData = JSON.parse(decodeURIComponent(p)) } catch {}
          if (!analysisData) {
            try {
              const saved = sessionStorage.getItem('woker-last-analysis')
              if (saved) {
                const { result: r } = JSON.parse(saved)
                if (r) analysisData = {
                  position: r.position?.split('(')[0]?.split('/')[0]?.trim() || '',
                  company: r.company || '',
                  skills: r.skills_needed?.join(', ') || '',
                }
              }
            } catch {}
          }
          if (analysisData) {
            setFormData(prev => ({
              ...prev,
              ...(analysisData.position && { position: analysisData.position }),
              ...(analysisData.company && { company: analysisData.company }),
              ...(analysisData.skills && { extra: prev.extra ? `${prev.extra}, ${analysisData.skills}` : analysisData.skills }),
            }))
          }
        }
      } catch {}
      setPrefilled(true)
    }
    loadProfile()
  }, [prefilled])

  const handleChange = (name: string, value: string) => setFormData(prev => ({ ...prev, [name]: value }))

  const handleSubmit = async () => {
    const required = ['name', 'position', 'field', 'experience', 'german']
    if (required.some(f => !formData[f]?.trim())) { setError('Vyplň prosím všechna povinná pole'); return }
    setGenerating(true); setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) { setError('Musíš být přihlášen'); setGenerating(false); return }
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ type: 'email', formData }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generování selhalo')
      setResult(data.document)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { setError(err.message || 'Něco se pokazilo') }
    finally { setGenerating(false) }
  }

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const saveDocument = async () => {
    if (!result) return
    setSavingDoc(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return
      const title = formData.company
        ? `Email — ${formData.position} @ ${formData.company}`
        : `Email — ${formData.position || 'HR'}`
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          type: 'letter',
          title,
          document_data: { emailText: result, formData },
          template: 'email',
        }),
      })
      setSavedDoc(true)
      setTimeout(() => setSavedDoc(false), 3000)
    } catch {}
    finally { setSavingDoc(false) }
  }

  const inputClass = "w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:border-[#39ff6e]/40 focus:outline-none focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(57,255,110,0.05)] transition-all"
  const selectClass = "w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:border-[#39ff6e]/40 focus:outline-none transition-all appearance-none"

  // ─── RESULT VIEW ───
  if (result) {
    const { german, czech, subject, body } = parseEmailResult(result)
    const mailtoBody = body || german
    const mailtoHref = `mailto:${formData.recipientEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailtoBody)}`

    return (
      <main className="min-h-screen bg-[#0a0a12] px-4 py-6 pb-24 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
        <div className="fixed w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none z-0 opacity-10 -top-[200px] -right-[100px]" style={{ background: "radial-gradient(circle, rgba(57,255,110,0.25), transparent 70%)" }} />
        <div className="fixed w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none z-0 opacity-10 bottom-[200px] -left-[200px]" style={{ background: "radial-gradient(circle, rgba(100,60,255,0.2), transparent 70%)" }} />

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-5">
            <Link href="/pruvodce/sablony" className="text-white/30 hover:text-white text-sm no-underline transition">← Zpět</Link>
            <div className="flex items-center gap-2">
              <button onClick={saveDocument} disabled={savingDoc}
                className={`text-xs px-4 py-2 rounded-xl transition border ${savedDoc ? 'bg-[#39ff6e]/10 border-[#39ff6e]/30 text-[#39ff6e]' : 'bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.08]'}`}>
                {savingDoc ? '...' : savedDoc ? '✓ Uloženo' : '💾 Uložit'}
              </button>
              <button onClick={() => setResult(null)} className="text-white/40 hover:text-white text-xs px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl transition hover:bg-white/[0.08]">Upravit údaje</button>
            </div>
          </div>

          {/* German email */}
          <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Image src="/images/3d/rocket.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Email v němčině</span>
              </div>
              <button onClick={() => handleCopy(german, 'de')}
                className={`text-xs px-3 py-1.5 rounded-lg transition border ${copied === 'de' ? 'bg-[#39ff6e]/10 border-[#39ff6e]/30 text-[#39ff6e]' : 'bg-white/[0.04] border-white/[0.06] text-white/40 hover:text-white'}`}>
                {copied === 'de' ? '✓ Zkopírováno' : '📋 Kopírovat'}
              </button>
            </div>
            {subject && (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 mb-3">
                <span className="text-white/30 text-[10px] uppercase tracking-wider">Betreff</span>
                <p className="text-white text-sm font-medium m-0">{subject}</p>
              </div>
            )}
            <pre className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap font-sans m-0">{body || german}</pre>
          </div>

          {/* Recipient email input */}
          <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-white/30 text-xs flex-shrink-0">Komu:</span>
              <input
                type="email"
                value={formData.recipientEmail || ''}
                onChange={(e) => handleChange('recipientEmail', e.target.value)}
                placeholder="email@firma.ch — vyplň pro přímé odeslání"
                className="flex-1 bg-transparent border-none text-white text-sm placeholder-white/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Email client buttons */}
          <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Image src="/images/3d/rocket.png" alt="" width={18} height={18} />
              <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Odeslat přes</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <a href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(formData.recipientEmail || '')}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailtoBody)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white/[0.04] border border-white/[0.06] text-white font-semibold py-3 rounded-xl no-underline transition hover:bg-white/[0.08] hover:border-white/[0.12] text-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" fill="#EA4335"/></svg>
                Gmail
              </a>
              <a href={`https://email.seznam.cz/newMessageScreen?to=${encodeURIComponent(formData.recipientEmail || '')}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailtoBody)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white/[0.04] border border-white/[0.06] text-white font-semibold py-3 rounded-xl no-underline transition hover:bg-white/[0.08] hover:border-white/[0.12] text-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#CC0000"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">S</text></svg>
                Seznam
              </a>
              <a href={`https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(formData.recipientEmail || '')}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailtoBody)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white/[0.04] border border-white/[0.06] text-white font-semibold py-3 rounded-xl no-underline transition hover:bg-white/[0.08] hover:border-white/[0.12] text-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" fill="#0078D4"/></svg>
                Outlook
              </a>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a href={mailtoHref}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] font-bold py-3 rounded-xl no-underline transition hover:shadow-[0_4px_30px_rgba(57,255,110,0.35)] hover:scale-[1.02] active:scale-[0.98] text-sm">
                📧 Výchozí email
              </a>
              <button onClick={() => handleCopy(german, 'full')}
                className={`flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition text-sm border ${copied === 'full' ? 'bg-[#39ff6e]/10 border-[#39ff6e]/30 text-[#39ff6e]' : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08]'}`}>
                {copied === 'full' ? '✓ Zkopírováno' : '📋 Kopírovat email'}
              </button>
            </div>
          </div>

          {/* Czech translation */}
          {czech && (
            <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-white/50 text-xs font-bold uppercase tracking-wider">🇨🇿 Český překlad</span>
                </div>
                <button onClick={() => handleCopy(czech, 'cs')}
                  className={`text-xs px-3 py-1.5 rounded-lg transition border ${copied === 'cs' ? 'bg-[#39ff6e]/10 border-[#39ff6e]/30 text-[#39ff6e]' : 'bg-white/[0.04] border-white/[0.06] text-white/40 hover:text-white'}`}>
                  {copied === 'cs' ? '✓ Zkopírováno' : '📋 Kopírovat'}
                </button>
              </div>
              <pre className="text-white/50 text-sm leading-relaxed whitespace-pre-wrap font-sans m-0">{czech}</pre>
            </div>
          )}

          <p className="text-white/20 text-xs text-center mb-4">Zkopíruj německý text nebo klikni &quot;Otevřít v emailu&quot; pro předvyplnění</p>

          <button onClick={() => { setResult(null); setFormData({}); sessionStorage.removeItem('woker-last-email') }}
            className="w-full text-white/30 hover:text-white text-sm py-4 transition bg-white/[0.02] hover:bg-white/[0.05] rounded-xl border border-white/[0.06]">
            Vytvořit nový email
          </button>
        </div>
      </main>
    )
  }

  // ─── FORM VIEW ───
  return (
    <main className="min-h-screen bg-[#0a0a12] px-4 py-6 pb-24 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <div className="fixed w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none z-0 opacity-10 -top-[200px] right-[10%]" style={{ background: "radial-gradient(circle, rgba(57,255,110,0.25), transparent 70%)" }} />
      <div className="fixed w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none z-0 opacity-8 bottom-[100px] -left-[200px]" style={{ background: "radial-gradient(circle, rgba(100,60,255,0.2), transparent 70%)" }} />

      <div className="max-w-2xl mx-auto relative z-10">
        <Link href="/pruvodce/sablony" className="text-white/30 hover:text-white mb-6 inline-block text-sm no-underline transition">← Zpět na šablony</Link>

        {/* Hero header */}
        <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #111128 0%, #0d1a2e 40%, #0a1a14 100%)" }}>
          <Image src="/images/3d/rocket.png" alt="" width={120} height={120} className="absolute -right-4 -bottom-4 opacity-[0.08]" />
          <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(57,255,110,0.15), transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(100,60,255,0.1), transparent 60%)" }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <pattern id="emailGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="white"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#emailGrid)"/>
          </svg>
          <div className="relative flex items-center gap-4">
            <Image src="/images/3d/rocket.png" alt="" width={56} height={56} className="drop-shadow-[0_4px_20px_rgba(57,255,110,0.3)]" />
            <div>
              <h1 className="text-white text-2xl font-extrabold m-0 tracking-tight">AI Email pro HR</h1>
              <p className="text-white/35 text-sm m-0 mt-1">Profesionální email v němčině · kopíruj a pošli · 20 sekund</p>
            </div>
          </div>
        </div>

        <PaywallOverlay isLocked={!isActive && !loading} title="AI šablony jsou součástí Premium" description="Získej profesionální email v němčině za 20 sekund">
          <div className="space-y-5">

            {/* Profile prefill banner */}
            {prefilled && Object.keys(formData).length > 2 && (
              <div className="bg-[#39ff6e]/[0.06] border border-[#39ff6e]/20 rounded-xl p-3 flex items-center gap-2">
                <Image src="/images/3d/key.png" alt="" width={18} height={18} />
                <span className="text-[#39ff6e]/80 text-sm">Údaje vyplněny z profilu. Uprav co potřebuješ.</span>
              </div>
            )}

            {/* Personal info */}
            <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Image src="/images/3d/key.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Odesílatel</span>
              </div>
              <input type="text" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} placeholder="Tvoje celé jméno *" className={inputClass} />
            </div>

            {/* Target */}
            <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Image src="/images/3d/target.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Komu a na jakou pozici</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={formData.position || ''} onChange={(e) => handleChange('position', e.target.value)} placeholder="Cílová pozice *" className={inputClass} />
                <input type="text" value={formData.company || ''} onChange={(e) => handleChange('company', e.target.value)} placeholder="Firma / agentura" className={inputClass} />
              </div>
              <input type="email" value={formData.recipientEmail || ''} onChange={(e) => handleChange('recipientEmail', e.target.value)} placeholder="Email příjemce (volitelné — pro tlačítko 'Otevřít v emailu')" className={inputClass} />
            </div>

            {/* Experience */}
            <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Image src="/images/3d/briefcase.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Tvoje zkušenosti</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={formData.field || ''} onChange={(e) => handleChange('field', e.target.value)} className={selectClass}>
                  <option value="">Obor *</option>
                  {FIELD_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <input type="text" value={formData.experience || ''} onChange={(e) => handleChange('experience', e.target.value)} placeholder="Roky praxe *" className={inputClass} />
              </div>
              <select value={formData.german || ''} onChange={(e) => handleChange('german', e.target.value)} className={selectClass}>
                <option value="">Úroveň němčiny *</option>
                {GERMAN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <textarea value={formData.extra || ''} onChange={(e) => handleChange('extra', e.target.value)} placeholder="Něco navíc? (volitelné)&#10;např. mohu nastoupit ihned, mám EU občanství, certifikáty..." rows={2} className={`${inputClass} resize-none`} />
            </div>

            {error && (
              <div className="bg-red-500/[0.06] border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm m-0">⚠️ {error}</p>
              </div>
            )}

            <button onClick={handleSubmit} disabled={generating}
              className="w-full relative overflow-hidden bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] font-extrabold py-4 px-6 rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_4px_30px_rgba(57,255,110,0.35)] hover:scale-[1.02] active:scale-[0.98]">
              {generating ? (
                <span className="flex items-center justify-center gap-2.5">
                  <span className="w-5 h-5 border-2 border-[#0a0a12]/30 border-t-[#0a0a12] rounded-full animate-spin" />
                  AI generuje email...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2.5">
                  <Image src="/images/3d/rocket.png" alt="" width={22} height={22} />
                  Vygenerovat email pro HR
                </span>
              )}
            </button>
            <p className="text-white/20 text-xs text-center">AI vytvoří krátký profesionální email v němčině + český překlad</p>
          </div>
        </PaywallOverlay>
      </div>
    </main>
  )
}
