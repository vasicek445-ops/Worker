'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [result, setResult] = useState<InterviewData | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedQ, setExpandedQ] = useState<number | null>(0)
  const [showCz, setShowCz] = useState(true)
  const resultRef = useRef<HTMLDivElement>(null)
  const [prefilled, setPrefilled] = useState(false)

  useEffect(() => {
    const p = searchParams.get('prefill')
    if (p && !prefilled) {
      try {
        const data = JSON.parse(decodeURIComponent(p))
        setFormData(prev => ({
          ...prev,
          ...(data.position && { position: data.position }),
          ...(data.company && { company: data.company }),
        }))
        setPrefilled(true)
      } catch {}
    }
  }, [searchParams, prefilled])

  const handleChange = (name: string, value: string) => setFormData((prev) => ({ ...prev, [name]: value }))

  const handleSubmit = async () => {
    if (!formData.position?.trim() || !formData.field || !formData.german) {
      setError('Vyplň pozici, obor a úroveň němčiny')
      return
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
    } catch (err: any) { setError(err.message || 'Něco se pokazilo') }
    finally { setGenerating(false) }
  }

  const handleDownloadPDF = async () => {
    if (!resultRef.current) return
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const element = resultRef.current
      await html2pdf().set({
        margin: [8, 8, 8, 8],
        filename: `Pohovor_${formData.position?.replace(/\s+/g, '_') || 'priprava'}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 1.5, useCORS: true, logging: false, backgroundColor: '#0E0E0E' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      } as any).from(element).save()
    } catch (err) {
      console.error('PDF error:', err)
      // Fallback: print
      window.print()
    }
  }

  // ─── RESULTS ───
  if (result) {
    return (
      <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/pruvodce/sablony" className="text-gray-500 hover:text-white text-sm">← Zpět na šablony</Link>
            <div className="flex gap-2">
              <button onClick={() => setShowCz(!showCz)} className={`text-xs px-3 py-1.5 rounded-lg border transition ${showCz ? 'border-[#E8302A] text-[#E8302A]' : 'border-gray-700 text-gray-400'}`}>
                {showCz ? '🇨🇿 CZ zapnuto' : '🇨🇿 CZ vypnuto'}
              </button>
              <button onClick={() => setResult(null)} className="text-gray-400 hover:text-white text-xs px-3 py-1.5 border border-gray-700 rounded-lg transition">✏️ Nový</button>
            </div>
          </div>

          {/* Header */}
          <div className="bg-gradient-to-r from-[#E8302A]/20 to-transparent border border-[#E8302A]/20 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🎤</span>
              <div>
                <h1 className="text-white text-lg font-bold">Příprava na pohovor: {formData.position}</h1>
                <p className="text-gray-400 text-xs">{formData.field} · {formData.company || 'obecný pohovor'}</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mt-2">{result.position_summary}</p>
          </div>

          <div ref={resultRef}>
            {/* Questions */}
            <div className="mb-6">
              <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#E8302A] rounded-lg flex items-center justify-center text-xs">❓</span>
                10 otázek na pohovoru
              </h2>
              <div className="space-y-2">
                {result.questions.map((q, i) => (
                  <div key={i} className="bg-[#1A1A1A] border border-gray-800 rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedQ(expandedQ === i ? null : i)} className="w-full px-4 py-3 flex items-start gap-3 text-left">
                      <span className="w-6 h-6 bg-[#252525] rounded-lg flex items-center justify-center text-xs text-gray-400 flex-shrink-0 mt-0.5">{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{q.question_de}</p>
                        {showCz && <p className="text-gray-500 text-xs mt-0.5">{q.question_cz}</p>}
                      </div>
                      <span className={`text-gray-600 text-xs transition-transform ${expandedQ === i ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {expandedQ === i && (
                      <div className="px-4 pb-4 border-t border-gray-800">
                        <div className="mt-3 bg-[#0E0E0E] rounded-lg p-3">
                          <p className="text-xs text-[#E8302A] font-medium mb-1">✅ Vzorová odpověď:</p>
                          <p className="text-gray-200 text-sm leading-relaxed">{q.answer_de}</p>
                          {showCz && <p className="text-gray-500 text-xs mt-2 italic">{q.answer_cz}</p>}
                        </div>
                        {q.tip && (
                          <div className="mt-2 flex items-start gap-2">
                            <span className="text-yellow-500 text-xs mt-0.5">💡</span>
                            <p className="text-yellow-500/80 text-xs">{q.tip}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            <div className="mb-6">
              <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center text-xs">⚠️</span>
                Na co si dát pozor
              </h2>
              <div className="space-y-2">
                {result.warnings.map((w, i) => (
                  <div key={i} className="bg-[#1A1A1A] border border-orange-500/20 rounded-xl p-4">
                    <h3 className="text-orange-400 text-sm font-semibold mb-1">{w.title}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">{w.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Salary tip */}
            {result.salary_tip && (
              <div className="mb-6 bg-[#1A1A1A] border border-green-500/20 rounded-xl p-4">
                <h2 className="text-green-400 font-bold text-sm mb-2 flex items-center gap-2">
                  <span>💰</span> Platové očekávání (Lohnvorstellung)
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed">{result.salary_tip}</p>
              </div>
            )}

            {/* Phrases */}
            <div className="mb-6">
              <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center text-xs">💬</span>
                Klíčové fráze na pohovor
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {result.phrases.map((p, i) => (
                  <div key={i} className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 flex items-start gap-3">
                    <span className="w-5 h-5 bg-blue-500/20 rounded flex items-center justify-center text-[10px] text-blue-400 flex-shrink-0 mt-0.5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{p.de}</p>
                      {showCz && <p className="text-gray-500 text-xs">{p.cz}</p>}
                      <p className="text-gray-600 text-[10px] mt-0.5 italic">{p.context}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <button onClick={handleDownloadPDF} className="w-full bg-[#E8302A] text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition mb-3">
            📥 Stáhnout přípravu jako PDF
          </button>
          <button onClick={() => { setResult(null); setFormData({}) }} className="w-full text-gray-400 hover:text-white text-sm py-3 transition">
            🔄 Vygenerovat pro jinou pozici
          </button>
        </div>
      </main>
    )
  }

  // ─── FORM ───
  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/pruvodce/sablony" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">← Zpět na šablony</Link>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🎤</span>
          <div>
            <h1 className="text-white text-xl font-bold">AI příprava na pohovor</h1>
            <p className="text-gray-400 text-xs">Otázky, odpovědi a fráze v němčině pro tvou pozici</p>
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 mb-6">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="text-[#E8302A]">❓</span> 10 otázek</span>
            <span className="flex items-center gap-1"><span className="text-green-400">✅</span> Vzorové odpovědi</span>
            <span className="flex items-center gap-1"><span className="text-orange-400">⚠️</span> Tipy</span>
            <span className="flex items-center gap-1"><span className="text-blue-400">💬</span> Fráze</span>
            <span className="flex items-center gap-1"><span className="text-yellow-400">💰</span> Plat</span>
          </div>
        </div>

        <PaywallOverlay isLocked={!isActive && !loading} title="AI příprava na pohovor je součástí Premium" description="Připrav se na pohovor ve Švýcarsku s AI">
          <div className="space-y-4">

            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">Cílová pozice *</label>
              <input type="text" value={formData.position || ''} onChange={(e) => handleChange('position', e.target.value)} placeholder="Např. Monteur, Koch, Lagerist, Fahrer..." className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Obor *</label>
                <select value={formData.field || ''} onChange={(e) => handleChange('field', e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:border-gray-600 focus:outline-none transition appearance-none">
                  <option value="">Vyber obor</option>
                  {FIELDS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Úroveň němčiny *</label>
                <select value={formData.german || ''} onChange={(e) => handleChange('german', e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:border-gray-600 focus:outline-none transition appearance-none">
                  <option value="">Vyber úroveň</option>
                  {GERMAN.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">Firma (volitelné)</label>
              <input type="text" value={formData.company || ''} onChange={(e) => handleChange('company', e.target.value)} placeholder="Např. Adecco, Manpower, konkrétní firma..." className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              <p className="text-gray-600 text-xs mt-1">Pokud víš firmu, AI přizpůsobí otázky</p>
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">Tvé zkušenosti (volitelné)</label>
              <textarea value={formData.experience || ''} onChange={(e) => handleChange('experience', e.target.value)} placeholder="Krátce popiš co umíš – AI přizpůsobí odpovědi tvému profilu" rows={3} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition resize-none" />
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"><p className="text-red-400 text-sm">⚠️ {error}</p></div>}

            <button onClick={handleSubmit} disabled={generating} className="w-full bg-[#E8302A] text-white font-bold py-3.5 px-6 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI připravuje tvůj pohovor...
                </span>
              ) : '🎤 Připravit se na pohovor'}
            </button>
            <p className="text-gray-600 text-xs text-center">AI vygeneruje otázky, odpovědi a fráze specifické pro tvou pozici</p>
          </div>
        </PaywallOverlay>
      </div>
    </main>
  )
}
