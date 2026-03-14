'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useSubscription } from '../../../../hooks/useSubscription'
import PaywallOverlay from '../../../components/PaywallOverlay'
import { supabase } from '../../../supabase'
import Link from 'next/link'

const REGIONS = ['Zürich', 'Bern', 'Basel', 'Luzern', 'St. Gallen', 'Aargau', 'Solothurn', 'Thurgau', 'Zug', 'Schaffhausen', 'Graubünden', 'Wallis / Valais', 'Waadt / Vaud', 'Genf / Genève', 'Ticino', 'Jiný']
const APT_TYPES = ['Studio / 1 pokoj', '1.5 - 2 pokoje', '2.5 - 3 pokoje', '3.5 - 4 pokoje', '4.5+ pokojů', 'WG (spolubydlení)']

interface HousingData {
  bewerbungsschreiben: string
  bewerbungsschreiben_cz: string
  personal_profile_de: string
  personal_profile_cz: string
  checklist: Array<{ document: string; document_de: string; description: string; priority: string; how_to_get: string }>
  portals: Array<{ name: string; url: string; description: string; cost: string; warning: string | null }>
  scam_warnings: Array<{ scam: string; how_to_spot: string; example: string }>
  tips: string[]
  cost_breakdown: { deposit: string; first_month: string; insurance: string; other: string }
  region_tips: string
}

const TABS = [
  { id: 'letter', label: 'Dopis', img: '/images/3d/envelope.png' },
  { id: 'profile', label: 'Profil', img: '/images/3d/key.png' },
  { id: 'docs', label: 'Dokumenty', img: '/images/3d/document.png' },
  { id: 'scams', label: 'Podvody', img: '/images/3d/shield.png' },
  { id: 'costs', label: 'Náklady', img: '/images/3d/money.png' },
]

export default function BydleniPage() {
  const { isActive, loading } = useSubscription()
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [result, setResult] = useState<HousingData | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCz, setShowCz] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('letter')

  const handleChange = (name: string, value: string) => setFormData(prev => ({ ...prev, [name]: value }))

  const handleSubmit = async () => {
    if (!formData.name?.trim() || !formData.region) { setError('Vyplň jméno a region'); return }
    setGenerating(true); setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) { setError('Musíš být přihlášen'); setGenerating(false); return }
      const res = await fetch('/api/generate-housing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ formData }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generování selhalo')
      setResult(data.housingData)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { setError(err.message || 'Něco se pokazilo') }
    finally { setGenerating(false) }
  }

  const handleCopy = async (text: string, id: string) => {
    try { await navigator.clipboard.writeText(text) } catch { /* fallback */ }
    setCopied(id); setTimeout(() => setCopied(null), 2000)
  }

  const inputClass = "w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:border-[#39ff6e]/40 focus:outline-none focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(57,255,110,0.05)] transition-all"
  const labelClass = "text-white/60 text-sm font-medium mb-1.5 block"
  const selectClass = "w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:border-[#39ff6e]/40 focus:outline-none transition-all appearance-none"

  // ─── RESULTS ───
  if (result) {
    return (
      <main className="min-h-screen bg-[#0a0a12] px-4 py-6 pb-24 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
        {/* Ambient effects */}
        <div className="fixed w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none z-0 opacity-10 -top-[200px] -right-[100px]" style={{ background: "radial-gradient(circle, rgba(57,255,110,0.25), transparent 70%)" }} />
        <div className="fixed w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none z-0 opacity-10 bottom-[200px] -left-[200px]" style={{ background: "radial-gradient(circle, rgba(100,60,255,0.2), transparent 70%)" }} />

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-5">
            <Link href="/pruvodce/sablony" className="text-white/30 hover:text-white text-sm no-underline transition">← Zpět</Link>
            <button onClick={() => setResult(null)} className="text-white/40 hover:text-white text-xs px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl transition hover:bg-white/[0.08]">Nový dossier</button>
          </div>

          {/* Header */}
          <div className="rounded-2xl p-5 mb-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #111128 0%, #0d1a2e 40%, #0a1a14 100%)" }}>
            <Image src="/images/3d/house.png" alt="" width={100} height={100} className="absolute -right-2 -top-2 opacity-[0.1]" />
            <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(57,255,110,0.15), transparent 60%)" }} />
            <div className="relative flex items-center gap-4">
              <Image src="/images/3d/house.png" alt="" width={48} height={48} className="drop-shadow-lg" />
              <div>
                <h1 className="text-white text-lg font-extrabold m-0">Bewerbungsdossier</h1>
                <p className="text-white/40 text-sm m-0 mt-0.5">Kompletní žádost o byt — připraveno ke kopírování</p>
              </div>
            </div>
            {result.region_tips && <p className="text-[#39ff6e]/70 text-xs mt-3 leading-relaxed relative">📍 {result.region_tips}</p>}
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#39ff6e]/10 border border-[#39ff6e]/30 text-[#39ff6e] shadow-[0_0_15px_rgba(57,255,110,0.1)]'
                    : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.06]'
                }`}>
                <Image src={tab.img} alt="" width={16} height={16} className={activeTab === tab.id ? '' : 'opacity-50 grayscale'} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'letter' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-sm flex items-center gap-2">
                  <Image src="/images/3d/envelope.png" alt="" width={24} height={24} className="drop-shadow-lg" />
                  Motivační dopis pro pronajímatele
                </h2>
                <div className="flex gap-2">
                  <button onClick={() => setShowCz(!showCz)} className={`text-[10px] px-3 py-1.5 rounded-lg border transition ${showCz ? 'border-[#39ff6e]/30 text-[#39ff6e] bg-[#39ff6e]/5' : 'border-white/10 text-white/40 hover:text-white/60'}`}>
                    {showCz ? '🇨🇿 CZ' : '🇩🇪 DE'}
                  </button>
                  <button onClick={() => handleCopy(result.bewerbungsschreiben, 'letter')} className="text-[10px] px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-[#39ff6e]/30 transition">
                    {copied === 'letter' ? '✅ Zkopírováno' : '📋 Kopírovat'}
                  </button>
                </div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-sm">
                <pre className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap font-sans m-0">
                  {showCz ? result.bewerbungsschreiben_cz : result.bewerbungsschreiben}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-sm flex items-center gap-2">
                  <Image src="/images/3d/key.png" alt="" width={24} height={24} className="drop-shadow-lg" />
                  Osobní profil
                </h2>
                <button onClick={() => handleCopy(result.personal_profile_de, 'profile')} className="text-[10px] px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-[#39ff6e]/30 transition">
                  {copied === 'profile' ? '✅ Zkopírováno' : '📋 Kopírovat'}
                </button>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-sm">
                <pre className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap font-sans m-0">{result.personal_profile_de}</pre>
                <div className="border-t border-white/[0.06] mt-4 pt-4">
                  <p className="text-white/20 text-[10px] font-bold uppercase tracking-wider mb-2">Český překlad</p>
                  <pre className="text-white/30 text-xs leading-relaxed whitespace-pre-wrap font-sans m-0">{result.personal_profile_cz}</pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-3">
              <h2 className="text-white font-bold text-sm flex items-center gap-2 mb-1">
                <Image src="/images/3d/document.png" alt="" width={24} height={24} className="drop-shadow-lg" />
                Dokumenty k přiložení
              </h2>
              {result.checklist.map((c, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-start gap-3 hover:bg-white/[0.05] transition">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 mt-0.5 ${c.priority === 'essential' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : c.priority === 'recommended' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/[0.05] text-white/40 border border-white/[0.08]'}`}>
                    {c.priority === 'essential' ? 'Povinné' : c.priority === 'recommended' ? 'Doporučené' : 'Volitelné'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold m-0">{c.document}</p>
                    <p className="text-white/20 text-xs italic m-0 mt-0.5">{c.document_de}</p>
                    <p className="text-white/40 text-xs m-0 mt-1.5">{c.description}</p>
                    <p className="text-[#39ff6e]/60 text-xs m-0 mt-1.5">→ {c.how_to_get}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'scams' && (
            <div className="space-y-3">
              <h2 className="text-white font-bold text-sm flex items-center gap-2 mb-1">
                <Image src="/images/3d/shield.png" alt="" width={24} height={24} className="drop-shadow-lg" />
                Pozor na podvody!
              </h2>
              {result.scam_warnings.length > 0 ? result.scam_warnings.map((s, i) => (
                <div key={i} className="bg-red-500/[0.04] border border-red-500/15 rounded-2xl p-4 hover:bg-red-500/[0.07] transition">
                  <h3 className="text-red-400 text-sm font-bold mb-1.5 m-0">{s.scam}</h3>
                  <p className="text-white/40 text-xs m-0 mb-1.5">{s.how_to_spot}</p>
                  <p className="text-white/20 text-xs italic m-0">Příklad: {s.example}</p>
                </div>
              )) : <p className="text-white/30 text-sm">Žádná specifická varování pro tento region.</p>}

              {/* Portals */}
              <h2 className="text-white font-bold text-sm flex items-center gap-2 mt-5 mb-1">
                <Image src="/images/3d/star.png" alt="" width={24} height={24} className="drop-shadow-lg" />
                Kde hledat byt
              </h2>
              {result.portals.map((p, i) => (
                <div key={i} className={`bg-white/[0.03] border rounded-2xl p-4 hover:bg-white/[0.05] transition ${p.warning ? 'border-amber-500/20' : 'border-white/[0.06]'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white text-sm font-semibold">{p.name}</span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold ${p.cost === 'Zdarma' || p.cost.toLowerCase().includes('zdarma') ? 'bg-[#39ff6e]/10 text-[#39ff6e] border border-[#39ff6e]/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>{p.cost}</span>
                  </div>
                  <p className="text-white/40 text-xs m-0">{p.description}</p>
                  {p.warning && <p className="text-amber-400 text-xs m-0 mt-1.5">⚠️ {p.warning}</p>}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'costs' && (
            <div className="space-y-3">
              <h2 className="text-white font-bold text-sm flex items-center gap-2 mb-1">
                <Image src="/images/3d/money.png" alt="" width={24} height={24} className="drop-shadow-lg" />
                S čím počítat (náklady)
              </h2>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                {Object.entries(result.cost_breakdown).map(([key, value], i) => {
                  const labels: Record<string, string> = { deposit: 'Kauce (Mietkaution)', first_month: 'První měsíc', insurance: 'Pojištění', other: 'Další náklady' }
                  const imgs: Record<string, string> = { deposit: '/images/3d/money.png', first_month: '/images/3d/document.png', insurance: '/images/3d/shield.png', other: '/images/3d/briefcase.png' }
                  return (
                    <div key={key} className={`p-4 flex items-center gap-3 ${i > 0 ? 'border-t border-white/[0.06]' : ''}`}>
                      <Image src={imgs[key]} alt="" width={28} height={28} className="drop-shadow-lg flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-white/40 text-xs font-medium block">{labels[key]}</span>
                        <span className="text-white/80 text-sm">{value}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Tips */}
              {result.tips.length > 0 && (
                <>
                  <h2 className="text-white font-bold text-sm flex items-center gap-2 mt-5 mb-1">
                    <Image src="/images/3d/star.png" alt="" width={24} height={24} className="drop-shadow-lg" />
                    Tipy pro hledání
                  </h2>
                  {result.tips.map((tip, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex items-start gap-3">
                      <span className="text-[#39ff6e] text-xs font-bold mt-0.5 flex-shrink-0 w-5 h-5 rounded-lg bg-[#39ff6e]/10 flex items-center justify-center">{i + 1}</span>
                      <p className="text-white/60 text-sm m-0">{tip}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          <button onClick={() => { setResult(null); setFormData({}) }} className="w-full text-white/30 hover:text-white text-sm py-4 mt-5 transition bg-white/[0.02] hover:bg-white/[0.05] rounded-xl border border-white/[0.06]">
            Vytvořit nový dossier
          </button>
        </div>
      </main>
    )
  }

  // ─── FORM ───
  return (
    <main className="min-h-screen bg-[#0a0a12] px-4 py-6 pb-24 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      {/* Ambient effects */}
      <div className="fixed w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none z-0 opacity-10 -top-[200px] right-[10%]" style={{ background: "radial-gradient(circle, rgba(57,255,110,0.25), transparent 70%)" }} />
      <div className="fixed w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none z-0 opacity-8 bottom-[100px] -left-[200px]" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.2), transparent 70%)" }} />

      <div className="max-w-2xl mx-auto relative z-10">
        <Link href="/pruvodce/sablony" className="text-white/30 hover:text-white mb-6 inline-block text-sm no-underline transition">← Zpět na šablony</Link>

        {/* Hero header */}
        <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #111128 0%, #0d1a2e 40%, #0a1a14 100%)" }}>
          <Image src="/images/3d/house.png" alt="" width={120} height={120} className="absolute -right-4 -bottom-4 opacity-[0.08]" />
          <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.15), transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(57,255,110,0.1), transparent 60%)" }} />
          {/* Dot pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <pattern id="formGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="white"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#formGrid)"/>
          </svg>
          <div className="relative flex items-center gap-4">
            <Image src="/images/3d/house.png" alt="" width={56} height={56} className="drop-shadow-[0_4px_20px_rgba(6,182,212,0.3)]" />
            <div>
              <h1 className="text-white text-2xl font-extrabold m-0 tracking-tight">AI hledání bydlení</h1>
              <p className="text-white/35 text-sm m-0 mt-1">Bewerbungsdossier + portály + náklady + varování před podvody</p>
            </div>
          </div>
        </div>

        {/* What you'll get */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map(tab => (
            <div key={tab.id} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] flex-shrink-0">
              <Image src={tab.img} alt="" width={16} height={16} className="opacity-60" />
              <span className="text-white/40 text-xs font-medium">{tab.label}</span>
            </div>
          ))}
        </div>

        <PaywallOverlay isLocked={!isActive && !loading} title="AI bydlení je součástí Premium" description="Bewerbungsdossier, portály, varování před podvody">
          <div className="space-y-5">

            {/* Form card */}
            <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Image src="/images/3d/key.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Osobní údaje</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Celé jméno *</label>
                  <input type="text" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} placeholder="Jan Novák" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Věk</label>
                  <input type="text" value={formData.age || ''} onChange={(e) => handleChange('age', e.target.value)} placeholder="30" className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Zaměstnavatel</label>
                  <input type="text" value={formData.employer || ''} onChange={(e) => handleChange('employer', e.target.value)} placeholder="Firma / agentura" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Pozice</label>
                  <input type="text" value={formData.position || ''} onChange={(e) => handleChange('position', e.target.value)} placeholder="Monteur, Koch..." className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Hrubý měsíční příjem</label>
                  <input type="text" value={formData.income || ''} onChange={(e) => handleChange('income', e.target.value)} placeholder="CHF 5 000" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Region *</label>
                  <select value={formData.region || ''} onChange={(e) => handleChange('region', e.target.value)} className={selectClass}>
                    <option value="">Vyber kanton / region</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Housing preferences card */}
            <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Image src="/images/3d/house.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Požadavky na bydlení</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Typ bytu</label>
                  <select value={formData.apartmentType || ''} onChange={(e) => handleChange('apartmentType', e.target.value)} className={selectClass}>
                    <option value="">Vyber typ</option>
                    {APT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Max. nájem (CHF)</label>
                  <input type="text" value={formData.maxRent || ''} onChange={(e) => handleChange('maxRent', e.target.value)} placeholder="1 500" className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Stěhování od</label>
                  <input type="text" value={formData.moveDate || ''} onChange={(e) => handleChange('moveDate', e.target.value)} placeholder="1.4.2026" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Kuřák / zvířata</label>
                  <input type="text" value={formData.pets || ''} onChange={(e) => handleChange('pets', e.target.value)} placeholder="Nekuřák, bez zvířat" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Něco navíc? (volitelné)</label>
                <textarea value={formData.extra || ''} onChange={(e) => handleChange('extra', e.target.value)} placeholder="např. mám rodinu, potřebuji blízko školy, preferuji klidnou lokalitu..." rows={2} className={`${inputClass} resize-none`} />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/[0.06] border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm m-0">⚠️ {error}</p>
              </div>
            )}

            {/* Submit button */}
            <button onClick={handleSubmit} disabled={generating || !formData.name?.trim() || !formData.region}
              className="w-full relative overflow-hidden bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] font-extrabold py-4 px-6 rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_4px_30px_rgba(57,255,110,0.35)] hover:scale-[1.02] active:scale-[0.98]">
              {generating ? (
                <span className="flex items-center justify-center gap-2.5">
                  <span className="w-5 h-5 border-2 border-[#0a0a12]/30 border-t-[#0a0a12] rounded-full animate-spin" />
                  AI připravuje Bewerbungsdossier...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2.5">
                  <Image src="/images/3d/house.png" alt="" width={22} height={22} />
                  Vytvořit Bewerbungsdossier
                </span>
              )}
            </button>
            <p className="text-white/20 text-xs text-center">AI vytvoří motivační dopis v němčině, checklist dokumentů, náklady a varování</p>
          </div>
        </PaywallOverlay>
      </div>
    </main>
  )
}
