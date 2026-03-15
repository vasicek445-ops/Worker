'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useSubscription } from '../../../../hooks/useSubscription'
import PaywallOverlay from '../../../components/PaywallOverlay'
import { supabase } from '../../../supabase'
import Link from 'next/link'

const FIELDS = ['Stavebnictví', 'Gastronomie / Hotelnictví', 'Logistika / Sklad', 'Zdravotnictví', 'Úklid / Údržba', 'Strojírenství / Technik', 'IT / Software', 'Elektro / Instalatér', 'Řidič / Doprava', 'Jiný obor']
const GERMAN = ['Žádná – teprve se učím', 'Základy (A1)', 'Základní komunikace (A2)', 'Dorozumím se (B1)', 'Dobrá úroveň (B2)', 'Plynulá (C1/C2)']

interface InterviewData {
  position_summary: string
  questions: Array<{
    question_de: string
    question_cz: string
    answer_de: string
    answer_cz: string
    tip: string
  }>
  warnings: Array<{ title: string; description: string }>
  phrases: Array<{ de: string; cz: string; context: string }>
  salary_tip: string
}

export default function PohovorPage() {
  const { isActive, loading } = useSubscription()
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [result, setResult] = useState<InterviewData | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedQ, setExpandedQ] = useState<number | null>(0)
  const [showCz, setShowCz] = useState(true)
  const resultRef = useRef<HTMLDivElement>(null)
  const [prefilled, setPrefilled] = useState(false)
  const [practiceMode, setPracticeMode] = useState(false)
  const [practiceIndex, setPracticeIndex] = useState(0)
  const [practiceRevealed, setPracticeRevealed] = useState(false)
  const [savingDoc, setSavingDoc] = useState(false)
  const [savedDoc, setSavedDoc] = useState(false)
  const [activeTab, setActiveTab] = useState<'questions' | 'warnings' | 'phrases' | 'salary'>('questions')

  // Restore from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('woker-last-interview')
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
      sessionStorage.setItem('woker-last-interview', JSON.stringify({ result, formData }))
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
          const p: Record<string, string> = {}
          if (profile.pozice) p.position = profile.pozice
          if (profile.obor) p.field = profile.obor
          if (profile.nemcina_uroven) p.german = profile.nemcina_uroven
          if (profile.zkusenosti) p.experience = profile.zkusenosti
          if (profile.dovednosti) p.experience = (p.experience || '') + (p.experience ? '\n' : '') + 'Dovednosti: ' + profile.dovednosti
          setFormData(prev => ({ ...prev, ...p }))
        }

        // Analysis prefill
        const params = new URLSearchParams(window.location.search)
        const pr = params.get('prefill')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let analysisData: any = null
        if (pr) {
          try { analysisData = JSON.parse(decodeURIComponent(pr)) } catch {}
          if (!analysisData) {
            try {
              const saved = sessionStorage.getItem('woker-last-analysis')
              if (saved) {
                const { result: r } = JSON.parse(saved)
                if (r) analysisData = {
                  position: r.position?.split('(')[0]?.split('/')[0]?.trim() || '',
                  company: r.company || '',
                  topics: r.interview_topics || [],
                }
              }
            } catch {}
          }
        }
        if (analysisData) {
          setFormData(prev => ({
            ...prev,
            ...(analysisData.position && { position: analysisData.position }),
            ...(analysisData.company && { company: analysisData.company }),
            ...(analysisData.topics?.length && { experience: prev.experience ? `${prev.experience}\nTémata z inzerátu: ${analysisData.topics.join(', ')}` : `Témata z inzerátu: ${analysisData.topics.join(', ')}` }),
          }))
        }
      } catch {}
      setPrefilled(true)
    }
    loadProfile()
  }, [prefilled])

  const handleChange = (name: string, value: string) => setFormData(prev => ({ ...prev, [name]: value }))

  const handleSubmit = async () => {
    if (!formData.position?.trim() || !formData.field || !formData.german) {
      setError('Vyplň pozici, obor a úroveň němčiny'); return
    }
    setGenerating(true); setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) { setError('Musíš být přihlášen'); setGenerating(false); return }
      const res = await fetch('/api/generate-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ formData }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generování selhalo')
      setResult(data.interviewData)
      setExpandedQ(0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { setError(err.message || 'Něco se pokazilo') }
    finally { setGenerating(false) }
  }

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'de-DE'
    utterance.rate = 0.85
    window.speechSynthesis.speak(utterance)
  }

  const saveDocument = async () => {
    if (!result) return
    setSavingDoc(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return
      const title = `Pohovor — ${formData.position}${formData.company ? ` @ ${formData.company}` : ''}`
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ type: 'letter', title, document_data: { interviewData: result, formData }, template: 'interview' }),
      })
      setSavedDoc(true)
      setTimeout(() => setSavedDoc(false), 3000)
    } catch {}
    finally { setSavingDoc(false) }
  }

  const handleDownloadPDF = async () => {
    if (!resultRef.current) return
    try {
      const html2pdf = (await import('html2pdf.js')).default
      await html2pdf().set({
        margin: [8, 8, 8, 8],
        filename: `Pohovor_${formData.position?.replace(/\s+/g, '_') || 'priprava'}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 1.5, useCORS: true, logging: false, backgroundColor: '#0a0a12' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any).from(resultRef.current).save()
    } catch { window.print() }
  }

  const inputClass = "w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:border-[#39ff6e]/40 focus:outline-none focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(57,255,110,0.05)] transition-all"
  const selectClass = "w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:border-[#39ff6e]/40 focus:outline-none transition-all appearance-none"

  // ─── PRACTICE MODE ───
  if (practiceMode && result) {
    const q = result.questions[practiceIndex]
    return (
      <main className="min-h-screen bg-[#0a0a12] px-4 py-6 pb-24 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
        <div className="fixed w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none z-0 opacity-10 -top-[200px] -right-[100px]" style={{ background: "radial-gradient(circle, rgba(57,255,110,0.25), transparent 70%)" }} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { setPracticeMode(false); setPracticeIndex(0); setPracticeRevealed(false) }} className="text-white/30 hover:text-white text-sm transition">← Zpět na přehled</button>
            <span className="text-white/30 text-xs">{practiceIndex + 1} / {result.questions.length}</span>
          </div>

          {/* Progress bar */}
          <div className="flex gap-1 mb-8">
            {result.questions.map((_, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= practiceIndex ? 'bg-[#39ff6e]/60' : 'bg-white/[0.06]'}`} />
            ))}
          </div>

          {/* Question card */}
          <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 bg-[#39ff6e]/10 rounded-xl flex items-center justify-center text-sm text-[#39ff6e] font-bold">{practiceIndex + 1}</span>
              <span className="text-white/30 text-xs uppercase tracking-wider font-bold">Otázka</span>
              <button onClick={() => speakText(q.question_de)} className="ml-auto text-white/20 hover:text-[#39ff6e] text-xs px-2 py-1 rounded-lg transition hover:bg-white/[0.04]" title="Přečíst německy">
                🔊
              </button>
            </div>
            <p className="text-white text-lg font-semibold leading-relaxed">{q.question_de}</p>
            {showCz && <p className="text-white/30 text-sm mt-2">{q.question_cz}</p>}
          </div>

          {/* Answer area */}
          {!practiceRevealed ? (
            <div className="text-center py-8">
              <p className="text-white/30 text-sm mb-4">Zkus si odpovědět nahlas v němčině, pak odkryj vzorovou odpověď</p>
              <button onClick={() => setPracticeRevealed(true)}
                className="bg-[#39ff6e]/10 border border-[#39ff6e]/20 text-[#39ff6e] font-bold py-3.5 px-8 rounded-2xl transition hover:bg-[#39ff6e]/20 text-sm">
                Odkrýt odpověď
              </button>
            </div>
          ) : (
            <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-[#39ff6e]/10 p-6 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[#39ff6e] text-xs font-bold uppercase tracking-wider">Vzorová odpověď</span>
                <button onClick={() => speakText(q.answer_de)} className="ml-auto text-white/20 hover:text-[#39ff6e] text-xs px-2 py-1 rounded-lg transition hover:bg-white/[0.04]">
                  🔊
                </button>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{q.answer_de}</p>
              {showCz && <p className="text-white/30 text-xs mt-3 italic">{q.answer_cz}</p>}
              {q.tip && (
                <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-start gap-2">
                  <span className="text-yellow-400 text-xs">💡</span>
                  <p className="text-yellow-400/70 text-xs">{q.tip}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            <button onClick={() => { setPracticeIndex(Math.max(0, practiceIndex - 1)); setPracticeRevealed(false) }} disabled={practiceIndex === 0}
              className="flex-1 bg-white/[0.04] border border-white/[0.08] text-white/40 font-medium py-3.5 rounded-2xl transition hover:bg-white/[0.08] disabled:opacity-20 text-sm">
              ← Předchozí
            </button>
            {practiceIndex < result.questions.length - 1 ? (
              <button onClick={() => { setPracticeIndex(practiceIndex + 1); setPracticeRevealed(false) }}
                className="flex-[2] bg-[#39ff6e]/10 border border-[#39ff6e]/20 text-[#39ff6e] font-bold py-3.5 rounded-2xl transition hover:bg-[#39ff6e]/20 text-sm">
                Další otázka →
              </button>
            ) : (
              <button onClick={() => { setPracticeMode(false); setPracticeIndex(0); setPracticeRevealed(false) }}
                className="flex-[2] bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] font-bold py-3.5 rounded-2xl transition text-sm">
                ✓ Hotovo!
              </button>
            )}
          </div>
        </div>
      </main>
    )
  }

  // ─── RESULT VIEW ───
  if (result) {
    return (
      <main className="min-h-screen bg-[#0a0a12] px-4 py-6 pb-24 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
        <div className="fixed w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none z-0 opacity-10 -top-[200px] -right-[100px]" style={{ background: "radial-gradient(circle, rgba(57,255,110,0.25), transparent 70%)" }} />
        <div className="fixed w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none z-0 opacity-10 bottom-[200px] -left-[200px]" style={{ background: "radial-gradient(circle, rgba(100,60,255,0.2), transparent 70%)" }} />

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-5">
            <Link href="/pruvodce/sablony" className="text-white/30 hover:text-white text-sm no-underline transition">← Zpět</Link>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowCz(!showCz)}
                className={`text-xs px-3 py-2 rounded-xl transition border ${showCz ? 'border-[#39ff6e]/30 text-[#39ff6e] bg-[#39ff6e]/[0.06]' : 'border-white/[0.08] text-white/30 bg-white/[0.04]'}`}>
                🇨🇿 {showCz ? 'CZ' : 'CZ'}
              </button>
              <button onClick={saveDocument} disabled={savingDoc}
                className={`text-xs px-3 py-2 rounded-xl transition border ${savedDoc ? 'bg-[#39ff6e]/10 border-[#39ff6e]/30 text-[#39ff6e]' : 'bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white'}`}>
                {savingDoc ? '...' : savedDoc ? '✓ Uloženo' : '💾 Uložit'}
              </button>
              <button onClick={() => setResult(null)} className="text-white/40 hover:text-white text-xs px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl transition hover:bg-white/[0.08]">Nový</button>
            </div>
          </div>

          {/* Header */}
          <div className="rounded-2xl p-5 mb-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #111128 0%, #0d1a2e 40%, #0a1a14 100%)" }}>
            <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(57,255,110,0.15), transparent 60%)" }} />
            <div className="relative flex items-center gap-4">
              <Image src="/images/3d/speech.png" alt="" width={48} height={48} className="drop-shadow-[0_4px_20px_rgba(57,255,110,0.3)]" />
              <div>
                <h1 className="text-white text-lg font-extrabold m-0">Pohovor: {formData.position}</h1>
                <p className="text-white/30 text-xs m-0 mt-0.5">{formData.field} · {formData.company || 'obecný pohovor'}</p>
              </div>
            </div>
            <p className="text-white/50 text-sm mt-3 relative">{result.position_summary}</p>
          </div>

          {/* Practice mode CTA */}
          <button onClick={() => { setPracticeMode(true); setPracticeIndex(0); setPracticeRevealed(false) }}
            className="w-full bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] font-extrabold py-3.5 rounded-2xl mb-5 transition hover:shadow-[0_4px_30px_rgba(57,255,110,0.35)] hover:scale-[1.02] active:scale-[0.98] text-sm flex items-center justify-center gap-2.5">
            <Image src="/images/3d/speech.png" alt="" width={22} height={22} />
            Procvičit otázky (flashcards)
          </button>

          {/* Tab navigation */}
          <div className="flex gap-1.5 mb-5">
            {([
              { id: 'questions' as const, label: 'Otázky', count: result.questions.length, icon: '❓' },
              { id: 'warnings' as const, label: 'Tipy', count: result.warnings.length, icon: '⚠️' },
              { id: 'phrases' as const, label: 'Fráze', count: result.phrases.length, icon: '💬' },
              { id: 'salary' as const, label: 'Plat', icon: '💰' },
            ]).map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all border ${activeTab === tab.id ? 'bg-[#39ff6e]/[0.08] border-[#39ff6e]/20 text-[#39ff6e]' : 'bg-white/[0.02] border-white/[0.06] text-white/30 hover:text-white/50'}`}>
                {tab.icon} {tab.label} {tab.count ? `(${tab.count})` : ''}
              </button>
            ))}
          </div>

          <div ref={resultRef}>
            {/* Questions tab */}
            {activeTab === 'questions' && (
              <div className="space-y-2 mb-6">
                {result.questions.map((q, i) => (
                  <div key={i} className="bg-[#111120]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden">
                    <button onClick={() => setExpandedQ(expandedQ === i ? null : i)} className="w-full px-4 py-3.5 flex items-start gap-3 text-left">
                      <span className="w-7 h-7 bg-[#39ff6e]/10 rounded-lg flex items-center justify-center text-xs text-[#39ff6e] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{q.question_de}</p>
                        {showCz && <p className="text-white/25 text-xs mt-0.5">{q.question_cz}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); speakText(q.question_de) }} className="text-white/15 hover:text-[#39ff6e] text-xs p-1 rounded transition">🔊</button>
                        <span className={`text-white/20 text-xs transition-transform ${expandedQ === i ? 'rotate-180' : ''}`}>▼</span>
                      </div>
                    </button>
                    {expandedQ === i && (
                      <div className="px-4 pb-4 border-t border-white/[0.06]">
                        <div className="mt-3 bg-[#39ff6e]/[0.03] border border-[#39ff6e]/[0.08] rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-[#39ff6e]/70 font-semibold">Vzorová odpověď</p>
                            <button onClick={() => speakText(q.answer_de)} className="text-white/20 hover:text-[#39ff6e] text-xs p-1 rounded transition">🔊</button>
                          </div>
                          <p className="text-white/80 text-sm leading-relaxed">{q.answer_de}</p>
                          {showCz && <p className="text-white/30 text-xs mt-2 italic">{q.answer_cz}</p>}
                        </div>
                        {q.tip && (
                          <div className="mt-2 flex items-start gap-2">
                            <span className="text-yellow-400 text-xs mt-0.5">💡</span>
                            <p className="text-yellow-400/60 text-xs">{q.tip}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Warnings tab */}
            {activeTab === 'warnings' && (
              <div className="space-y-2 mb-6">
                {result.warnings.map((w, i) => (
                  <div key={i} className="bg-[#111120]/80 backdrop-blur-sm border border-orange-500/10 rounded-2xl p-4">
                    <h3 className="text-orange-400/80 text-sm font-semibold mb-1 flex items-center gap-2">
                      <span className="w-6 h-6 bg-orange-500/10 rounded-lg flex items-center justify-center text-xs">⚠️</span>
                      {w.title}
                    </h3>
                    <p className="text-white/40 text-xs leading-relaxed ml-8">{w.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Phrases tab */}
            {activeTab === 'phrases' && (
              <div className="space-y-2 mb-6">
                {result.phrases.map((p, i) => (
                  <div key={i} className="bg-[#111120]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-3.5 flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-500/10 rounded-lg flex items-center justify-center text-[10px] text-blue-400 font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-medium">{p.de}</p>
                        <button onClick={() => speakText(p.de)} className="text-white/15 hover:text-[#39ff6e] text-xs p-0.5 rounded transition flex-shrink-0">🔊</button>
                      </div>
                      {showCz && <p className="text-white/30 text-xs">{p.cz}</p>}
                      <p className="text-white/15 text-[10px] mt-0.5 italic">{p.context}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Salary tab */}
            {activeTab === 'salary' && result.salary_tip && (
              <div className="bg-[#111120]/80 backdrop-blur-sm border border-[#39ff6e]/10 rounded-2xl p-5 mb-6">
                <h2 className="text-[#39ff6e]/70 font-bold text-sm mb-3 flex items-center gap-2">
                  <Image src="/images/3d/gem.png" alt="" width={18} height={18} />
                  Platové očekávání (Lohnvorstellung)
                </h2>
                <p className="text-white/60 text-sm leading-relaxed">{result.salary_tip}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button onClick={handleDownloadPDF} className="bg-white/[0.04] border border-white/[0.08] text-white/60 font-medium py-3 rounded-xl transition hover:bg-white/[0.08] hover:text-white text-sm">
              📥 Stáhnout PDF
            </button>
            <Link href={`/pruvodce/sablony/cv?prefill=${encodeURIComponent(JSON.stringify({ position: formData.position, company: formData.company }))}`}
              className="bg-white/[0.04] border border-white/[0.08] text-white/60 font-medium py-3 rounded-xl transition hover:bg-white/[0.08] hover:text-white text-sm text-center no-underline flex items-center justify-center">
              📄 Vytvořit CV
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Link href={`/pruvodce/sablony/motivacni-dopis?prefill=${encodeURIComponent(JSON.stringify({ position: formData.position, company: formData.company }))}`}
              className="bg-white/[0.04] border border-white/[0.08] text-white/60 font-medium py-3 rounded-xl transition hover:bg-white/[0.08] hover:text-white text-sm text-center no-underline flex items-center justify-center">
              ✉️ Motivační dopis
            </Link>
            <Link href={`/pruvodce/sablony/email?prefill=${encodeURIComponent(JSON.stringify({ position: formData.position, company: formData.company }))}`}
              className="bg-white/[0.04] border border-white/[0.08] text-white/60 font-medium py-3 rounded-xl transition hover:bg-white/[0.08] hover:text-white text-sm text-center no-underline flex items-center justify-center">
              📧 Email pro HR
            </Link>
          </div>

          <button onClick={() => { setResult(null); setFormData({}); sessionStorage.removeItem('woker-last-interview') }}
            className="w-full text-white/30 hover:text-white text-sm py-4 transition bg-white/[0.02] hover:bg-white/[0.05] rounded-xl border border-white/[0.06]">
            Vygenerovat pro jinou pozici
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
          <Image src="/images/3d/speech.png" alt="" width={120} height={120} className="absolute -right-4 -bottom-4 opacity-[0.08]" />
          <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(57,255,110,0.15), transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(100,60,255,0.1), transparent 60%)" }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <pattern id="interviewGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="white"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#interviewGrid)"/>
          </svg>
          <div className="relative flex items-center gap-4">
            <Image src="/images/3d/speech.png" alt="" width={56} height={56} className="drop-shadow-[0_4px_20px_rgba(57,255,110,0.3)]" />
            <div>
              <h1 className="text-white text-2xl font-extrabold m-0 tracking-tight">AI příprava na pohovor</h1>
              <p className="text-white/35 text-sm m-0 mt-1">10 otázek · odpovědi · fráze · procvičování · výslovnost</p>
            </div>
          </div>
        </div>

        {/* Feature badges */}
        <div className="bg-[#111120]/80 backdrop-blur-sm rounded-xl border border-white/[0.06] p-3 mb-6">
          <div className="flex items-center gap-3 text-xs text-white/30 justify-center flex-wrap">
            <span className="flex items-center gap-1"><span className="text-[#39ff6e]">❓</span> 10 otázek</span>
            <span className="flex items-center gap-1"><span className="text-[#39ff6e]">✅</span> Odpovědi</span>
            <span className="flex items-center gap-1"><span className="text-orange-400">⚠️</span> Tipy</span>
            <span className="flex items-center gap-1"><span className="text-blue-400">💬</span> Fráze</span>
            <span className="flex items-center gap-1"><span className="text-yellow-400">💰</span> Plat</span>
            <span className="flex items-center gap-1"><span className="text-purple-400">🔊</span> Výslovnost</span>
            <span className="flex items-center gap-1"><span className="text-[#39ff6e]">🃏</span> Flashcards</span>
          </div>
        </div>

        <PaywallOverlay isLocked={!isActive && !loading} title="AI příprava na pohovor je součástí Premium" description="Připrav se na pohovor ve Švýcarsku s AI">
          <div className="space-y-5">

            {prefilled && Object.keys(formData).length > 2 && (
              <div className="bg-[#39ff6e]/[0.06] border border-[#39ff6e]/20 rounded-xl p-3 flex items-center gap-2">
                <Image src="/images/3d/key.png" alt="" width={18} height={18} />
                <span className="text-[#39ff6e]/80 text-sm">Údaje vyplněny z profilu. Uprav co potřebuješ.</span>
              </div>
            )}

            {/* Position */}
            <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Image src="/images/3d/target.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Pozice a obor</span>
              </div>
              <input type="text" value={formData.position || ''} onChange={(e) => handleChange('position', e.target.value)} placeholder="Cílová pozice *" className={inputClass} />
              <div className="grid grid-cols-2 gap-3">
                <select value={formData.field || ''} onChange={(e) => handleChange('field', e.target.value)} className={selectClass}>
                  <option value="">Obor *</option>
                  {FIELDS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <select value={formData.german || ''} onChange={(e) => handleChange('german', e.target.value)} className={selectClass}>
                  <option value="">Úroveň němčiny *</option>
                  {GERMAN.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <input type="text" value={formData.company || ''} onChange={(e) => handleChange('company', e.target.value)} placeholder="Firma / agentura (volitelné — AI přizpůsobí otázky)" className={inputClass} />
            </div>

            {/* Experience */}
            <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Image src="/images/3d/briefcase.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Tvé zkušenosti (volitelné)</span>
              </div>
              <textarea value={formData.experience || ''} onChange={(e) => handleChange('experience', e.target.value)} placeholder="Krátce popiš co umíš — AI přizpůsobí odpovědi tvému profilu" rows={3} className={`${inputClass} resize-none`} />
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
                  AI připravuje tvůj pohovor...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2.5">
                  <Image src="/images/3d/speech.png" alt="" width={22} height={22} />
                  Připravit se na pohovor
                </span>
              )}
            </button>
            <p className="text-white/20 text-xs text-center">AI vygeneruje 10 otázek, odpovědi, tipy a fráze specifické pro tvou pozici</p>
          </div>
        </PaywallOverlay>
      </div>
    </main>
  )
}
