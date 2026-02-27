'use client'

import { useState } from 'react'
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

export default function BydleniPage() {
  const { isActive, loading } = useSubscription()
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [result, setResult] = useState<HousingData | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCz, setShowCz] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

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
    } catch (err: any) { setError(err.message || 'Něco se pokazilo') }
    finally { setGenerating(false) }
  }

  const handleCopy = async (text: string, id: string) => {
    try { await navigator.clipboard.writeText(text) } catch { /* fallback */ }
    setCopied(id); setTimeout(() => setCopied(null), 2000)
  }

  // ─── RESULTS ───
  if (result) {
    return (
      <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/pruvodce/sablony" className="text-gray-500 hover:text-white text-sm">← Zpět</Link>
            <button onClick={() => setResult(null)} className="text-gray-400 hover:text-white text-xs px-3 py-1.5 border border-gray-700 rounded-lg transition">🏠 Nový dossier</button>
          </div>

          {/* Header */}
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-5 mb-5">
            <h1 className="text-white text-lg font-bold mb-1">🏠 Bewerbungsdossier pro bydlení</h1>
            <p className="text-gray-400 text-sm">Kompletní žádost o byt v němčině — připraveno ke kopírování</p>
            {result.region_tips && <p className="text-green-300 text-xs mt-2 leading-relaxed">📍 {result.region_tips}</p>}
          </div>

          {/* Bewerbungsschreiben */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold text-sm flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center text-xs">✉️</span>
                Motivační dopis pro pronajímatele
              </h2>
              <div className="flex gap-2">
                <button onClick={() => setShowCz(!showCz)} className={`text-[10px] px-2 py-1 rounded-full border transition ${showCz ? 'border-blue-500/40 text-blue-400' : 'border-gray-700 text-gray-500'}`}>
                  {showCz ? '🇨🇿 CZ' : '🇩🇪 DE'}
                </button>
                <button onClick={() => handleCopy(result.bewerbungsschreiben, 'letter')} className="text-[10px] px-2 py-1 rounded-full border border-gray-700 text-gray-400 hover:text-white transition">
                  {copied === 'letter' ? '✅' : '📋 Kopírovat'}
                </button>
              </div>
            </div>
            <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4">
              <pre className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {showCz ? result.bewerbungsschreiben_cz : result.bewerbungsschreiben}
              </pre>
            </div>
          </div>

          {/* Personal profile */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold text-sm flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center text-xs">👤</span>
                Osobní profil
              </h2>
              <button onClick={() => handleCopy(result.personal_profile_de, 'profile')} className="text-[10px] px-2 py-1 rounded-full border border-gray-700 text-gray-400 hover:text-white transition">
                {copied === 'profile' ? '✅' : '📋 Kopírovat'}
              </button>
            </div>
            <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4">
              <pre className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">{result.personal_profile_de}</pre>
              <div className="border-t border-gray-800 mt-3 pt-3">
                <pre className="text-gray-500 text-xs leading-relaxed whitespace-pre-wrap font-sans">{result.personal_profile_cz}</pre>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="mb-5">
            <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-yellow-500/20 rounded-lg flex items-center justify-center text-xs">📋</span>
              Dokumenty k přiložení
            </h2>
            <div className="space-y-2">
              {result.checklist.map((c, i) => (
                <div key={i} className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 flex items-start gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${c.priority === 'essential' ? 'bg-red-500/10 text-red-400' : c.priority === 'recommended' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-gray-500/10 text-gray-400'}`}>
                    {c.priority === 'essential' ? 'Povinné' : c.priority === 'recommended' ? 'Doporučené' : 'Volitelné'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{c.document}</p>
                    <p className="text-gray-600 text-xs italic">{c.document_de}</p>
                    <p className="text-gray-400 text-xs mt-1">{c.description}</p>
                    <p className="text-blue-400 text-xs mt-1">→ {c.how_to_get}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="mb-5">
            <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center text-xs">💰</span>
              S čím počítat (náklady)
            </h2>
            <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl divide-y divide-gray-800">
              {Object.entries(result.cost_breakdown).map(([key, value]) => {
                const labels: Record<string, string> = { deposit: 'Kauce (Mietkaution)', first_month: 'První měsíc', insurance: 'Pojištění', other: 'Další náklady' }
                const icons: Record<string, string> = { deposit: '🏦', first_month: '📅', insurance: '🛡️', other: '📦' }
                return (
                  <div key={key} className="p-3 flex items-start gap-3">
                    <span className="text-sm">{icons[key]}</span>
                    <div>
                      <span className="text-gray-400 text-xs font-medium block">{labels[key]}</span>
                      <span className="text-gray-300 text-xs">{value}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Portals */}
          <div className="mb-5">
            <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-cyan-500/20 rounded-lg flex items-center justify-center text-xs">🌐</span>
              Kde hledat byt
            </h2>
            <div className="space-y-2">
              {result.portals.map((p, i) => (
                <div key={i} className={`bg-[#1A1A1A] border rounded-xl p-3 ${p.warning ? 'border-orange-500/30' : 'border-gray-800'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-semibold">{p.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.cost === 'Zdarma' || p.cost.toLowerCase().includes('zdarma') ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{p.cost}</span>
                  </div>
                  <p className="text-gray-400 text-xs">{p.description}</p>
                  {p.warning && <p className="text-orange-400 text-xs mt-1">⚠️ {p.warning}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Scam warnings */}
          {result.scam_warnings.length > 0 && (
            <div className="mb-5">
              <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-red-500/20 rounded-lg flex items-center justify-center text-xs">🚨</span>
                Pozor na podvody!
              </h2>
              <div className="space-y-2">
                {result.scam_warnings.map((s, i) => (
                  <div key={i} className="bg-red-500/5 border border-red-500/15 rounded-xl p-3">
                    <h3 className="text-red-400 text-sm font-bold mb-1">{s.scam}</h3>
                    <p className="text-gray-400 text-xs mb-1">{s.how_to_spot}</p>
                    <p className="text-gray-600 text-xs italic">Příklad: {s.example}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {result.tips.length > 0 && (
            <div className="mb-5">
              <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-yellow-500/20 rounded-lg flex items-center justify-center text-xs">💡</span>
                Tipy pro hledání
              </h2>
              <div className="space-y-2">
                {result.tips.map((t, i) => (
                  <div key={i} className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 flex items-start gap-2.5">
                    <span className="text-yellow-400 text-xs mt-0.5">{i + 1}.</span>
                    <p className="text-gray-300 text-sm">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => { setResult(null); setFormData({}) }} className="w-full text-gray-400 hover:text-white text-sm py-3 mt-3 transition">
            🔄 Vytvořit nový dossier
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
          <span className="text-3xl">🏠</span>
          <div>
            <h1 className="text-white text-xl font-bold">AI hledání bydlení</h1>
            <p className="text-gray-400 text-xs">Bewerbungsdossier + portály + náklady + varování před podvody</p>
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 mb-6">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="text-blue-400">✉️</span> Dopis</span>
            <span className="flex items-center gap-1"><span className="text-purple-400">👤</span> Profil</span>
            <span className="flex items-center gap-1"><span className="text-yellow-400">📋</span> Dokumenty</span>
            <span className="flex items-center gap-1"><span className="text-red-400">🚨</span> Podvody</span>
            <span className="flex items-center gap-1"><span className="text-green-400">💰</span> Náklady</span>
          </div>
        </div>

        <PaywallOverlay isLocked={!isActive && !loading} title="AI bydlení je součástí Premium" description="Bewerbungsdossier, portály, varování před podvody">
          <div className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Celé jméno *</label>
                <input type="text" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} placeholder="Jan Novák" className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              </div>
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Věk</label>
                <input type="text" value={formData.age || ''} onChange={(e) => handleChange('age', e.target.value)} placeholder="30" className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Zaměstnavatel</label>
                <input type="text" value={formData.employer || ''} onChange={(e) => handleChange('employer', e.target.value)} placeholder="Firma / agentura" className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              </div>
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Pozice</label>
                <input type="text" value={formData.position || ''} onChange={(e) => handleChange('position', e.target.value)} placeholder="Monteur, Koch..." className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Hrubý měsíční příjem</label>
                <input type="text" value={formData.income || ''} onChange={(e) => handleChange('income', e.target.value)} placeholder="CHF 5 000" className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              </div>
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Region *</label>
                <select value={formData.region || ''} onChange={(e) => handleChange('region', e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-gray-600 focus:outline-none transition appearance-none">
                  <option value="">Vyber kanton / region</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Typ bytu</label>
                <select value={formData.apartmentType || ''} onChange={(e) => handleChange('apartmentType', e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-gray-600 focus:outline-none transition appearance-none">
                  <option value="">Vyber typ</option>
                  {APT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Max. nájem (CHF)</label>
                <input type="text" value={formData.maxRent || ''} onChange={(e) => handleChange('maxRent', e.target.value)} placeholder="1 500" className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Stěhování od</label>
                <input type="text" value={formData.moveDate || ''} onChange={(e) => handleChange('moveDate', e.target.value)} placeholder="1.4.2026" className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              </div>
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">Kuřák / zvířata</label>
                <input type="text" value={formData.pets || ''} onChange={(e) => handleChange('pets', e.target.value)} placeholder="Nekuřák, bez zvířat" className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
              </div>
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">Něco navíc? (volitelné)</label>
              <textarea value={formData.extra || ''} onChange={(e) => handleChange('extra', e.target.value)} placeholder="např. mám rodinu, potřebuji blízko školy, preferuji klidnou lokalitu..." rows={2} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition resize-none" />
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"><p className="text-red-400 text-sm">⚠️ {error}</p></div>}

            <button onClick={handleSubmit} disabled={generating || !formData.name?.trim() || !formData.region} className="w-full bg-[#E8302A] text-white font-bold py-3.5 px-6 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI připravuje Bewerbungsdossier...
                </span>
              ) : '🏠 Vytvořit Bewerbungsdossier'}
            </button>
            <p className="text-gray-600 text-xs text-center">AI vytvoří motivační dopis v němčině, checklist dokumentů, náklady a varování</p>
          </div>
        </PaywallOverlay>
      </div>
    </main>
  )
}
