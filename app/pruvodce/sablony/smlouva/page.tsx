'use client'

import { useState } from 'react'
import { useSubscription } from '../../../../hooks/useSubscription'
import PaywallOverlay from '../../../components/PaywallOverlay'
import { supabase } from '../../../supabase'
import Link from 'next/link'

interface ContractData {
  overview: { employer: string; position: string; location: string; start_date: string; contract_type: string; workload: string; salary_gross: string; salary_info: string }
  key_terms: Array<{ term_de: string; term_name: string; translation: string; explanation: string; status: string; status_reason: string }>
  red_flags: Array<{ issue: string; detail: string; recommendation: string }>
  green_flags: Array<{ positive: string; detail: string }>
  missing_items: Array<{ item: string; importance: string; recommendation: string }>
  swiss_comparison: { probation: string; notice_period: string; vacation: string; overtime: string; thirteenth_salary: string }
  negotiate_tips: string[]
  overall_rating: string
  overall_summary: string
}

const RATING = {
  good: { emoji: '✅', label: 'Dobrá smlouva', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  acceptable: { emoji: '👍', label: 'Přijatelná', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  caution: { emoji: '⚠️', label: 'Pozor – jsou problémy', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  bad: { emoji: '🚫', label: 'Nevýhodná smlouva', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
}

const STATUS_STYLE = {
  ok: { icon: '✅', bg: 'border-l-green-500' },
  warning: { icon: '⚠️', bg: 'border-l-yellow-500' },
  danger: { icon: '🚫', bg: 'border-l-red-500' },
}

export default function SmlouvaPage() {
  const { isActive, loading } = useSubscription()
  const [contractText, setContractText] = useState('')
  const [result, setResult] = useState<ContractData | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (contractText.trim().length < 50) { setError('Vlož celý text smlouvy (min. 50 znaků)'); return }
    setGenerating(true); setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) { setError('Musíš být přihlášen'); setGenerating(false); return }
      const res = await fetch('/api/analyze-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ contractText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analýza selhala')
      setResult(data.contractData)
    } catch (err: any) { setError(err.message || 'Něco se pokazilo') }
    finally { setGenerating(false) }
  }

  // ─── RESULTS ───
  if (result) {
    const rating = RATING[result.overall_rating as keyof typeof RATING] || RATING.acceptable
    return (
      <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/pruvodce/sablony" className="text-gray-500 hover:text-white text-sm">← Zpět</Link>
            <button onClick={() => setResult(null)} className="text-gray-400 hover:text-white text-xs px-3 py-1.5 border border-gray-700 rounded-lg transition">📄 Nová smlouva</button>
          </div>

          {/* Overall rating */}
          <div className={`rounded-2xl p-5 mb-5 border ${rating.bg}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{rating.emoji}</span>
              <div>
                <h1 className={`text-lg font-bold ${rating.color}`}>{rating.label}</h1>
                <p className="text-gray-400 text-xs">{result.overview.employer} · {result.overview.position}</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mt-2">{result.overall_summary}</p>
          </div>

          {/* Overview */}
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 mb-5">
            <h2 className="text-white font-bold text-sm mb-3">📋 Přehled smlouvy</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500 text-xs block">Zaměstnavatel</span><span className="text-white">{result.overview.employer}</span></div>
              <div><span className="text-gray-500 text-xs block">Pozice</span><span className="text-white">{result.overview.position}</span></div>
              <div><span className="text-gray-500 text-xs block">Místo</span><span className="text-white">{result.overview.location}</span></div>
              <div><span className="text-gray-500 text-xs block">Nástup</span><span className="text-white">{result.overview.start_date}</span></div>
              <div><span className="text-gray-500 text-xs block">Typ smlouvy</span><span className="text-white">{result.overview.contract_type}</span></div>
              <div><span className="text-gray-500 text-xs block">Úvazek</span><span className="text-white">{result.overview.workload}</span></div>
              <div className="col-span-2"><span className="text-gray-500 text-xs block">Hrubá mzda</span><span className="text-white text-lg font-bold">{result.overview.salary_gross}</span></div>
              {result.overview.salary_info && <div className="col-span-2"><span className="text-gray-500 text-xs block">Mzdové info</span><span className="text-gray-300">{result.overview.salary_info}</span></div>}
            </div>
          </div>

          {/* Key terms */}
          <div className="mb-5">
            <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center text-xs">📖</span>
              Klíčové klauzule
            </h2>
            <div className="space-y-2">
              {result.key_terms.map((t, i) => {
                const st = STATUS_STYLE[t.status as keyof typeof STATUS_STYLE] || STATUS_STYLE.ok
                return (
                  <div key={i} className={`bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 border-l-4 ${st.bg}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs">{st.icon}</span>
                      <span className="text-white text-sm font-semibold">{t.term_name}</span>
                    </div>
                    {t.term_de && <p className="text-gray-600 text-xs italic mb-1">„{t.term_de}"</p>}
                    <p className="text-gray-300 text-sm mb-1">{t.translation}</p>
                    <p className="text-gray-400 text-xs leading-relaxed">{t.explanation}</p>
                    <p className={`text-xs mt-1 ${t.status === 'ok' ? 'text-green-400/70' : t.status === 'warning' ? 'text-yellow-400/70' : 'text-red-400/70'}`}>{t.status_reason}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Red flags */}
          {result.red_flags.length > 0 && (
            <div className="mb-5">
              <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-red-500/20 rounded-lg flex items-center justify-center text-xs">🚩</span>
                Red flags – problémy
              </h2>
              <div className="space-y-2">
                {result.red_flags.map((f, i) => (
                  <div key={i} className="bg-red-500/5 border border-red-500/15 rounded-xl p-4">
                    <h3 className="text-red-400 text-sm font-bold mb-1">{f.issue}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed mb-2">{f.detail}</p>
                    <div className="flex items-start gap-2 bg-red-500/10 rounded-lg p-2">
                      <span className="text-xs">💡</span>
                      <p className="text-red-300 text-xs">{f.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Green flags */}
          {result.green_flags.length > 0 && (
            <div className="mb-5">
              <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center text-xs">✅</span>
                Pozitivní body
              </h2>
              <div className="space-y-2">
                {result.green_flags.map((f, i) => (
                  <div key={i} className="bg-green-500/5 border border-green-500/15 rounded-xl p-3">
                    <h3 className="text-green-300 text-xs font-bold">{f.positive}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">{f.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing items */}
          {result.missing_items.length > 0 && (
            <div className="mb-5">
              <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center text-xs">❓</span>
                Co ve smlouvě chybí
              </h2>
              <div className="space-y-2">
                {result.missing_items.map((m, i) => (
                  <div key={i} className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 flex items-start gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${m.importance === 'high' ? 'bg-red-500/10 text-red-400' : m.importance === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-gray-500/10 text-gray-400'}`}>
                      {m.importance === 'high' ? 'Důležité' : m.importance === 'medium' ? 'Střední' : 'Nízké'}
                    </span>
                    <div>
                      <p className="text-white text-sm">{m.item}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{m.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Swiss comparison */}
          <div className="mb-5">
            <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center text-xs">🇨🇭</span>
              Porovnání se švýcarským standardem
            </h2>
            <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl divide-y divide-gray-800">
              {Object.entries(result.swiss_comparison).map(([key, value]) => {
                const labels: Record<string, string> = { probation: 'Zkušební doba', notice_period: 'Výpovědní lhůta', vacation: 'Dovolená', overtime: 'Přesčasy', thirteenth_salary: '13. plat' }
                return (
                  <div key={key} className="p-3 flex items-start gap-3">
                    <span className="text-gray-500 text-xs font-medium w-28 flex-shrink-0">{labels[key] || key}</span>
                    <span className="text-gray-300 text-xs">{value}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Negotiate tips */}
          {result.negotiate_tips.length > 0 && (
            <div className="mb-5">
              <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-yellow-500/20 rounded-lg flex items-center justify-center text-xs">🤝</span>
                Co si vyjednat
              </h2>
              <div className="space-y-2">
                {result.negotiate_tips.map((t, i) => (
                  <div key={i} className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 flex items-start gap-2.5">
                    <span className="text-yellow-400 text-xs mt-0.5">{i + 1}.</span>
                    <p className="text-gray-300 text-sm">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => { setResult(null); setContractText('') }} className="w-full text-gray-400 hover:text-white text-sm py-3 mt-3 transition">
            🔄 Analyzovat jinou smlouvu
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
          <span className="text-3xl">📑</span>
          <div>
            <h1 className="text-white text-xl font-bold">AI analýza pracovní smlouvy</h1>
            <p className="text-gray-400 text-xs">Vlož smlouvu v němčině → AI přeloží, vysvětlí a upozorní na problémy</p>
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 mb-6">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="text-purple-400">📖</span> Překlad</span>
            <span className="flex items-center gap-1"><span className="text-red-400">🚩</span> Red flags</span>
            <span className="flex items-center gap-1"><span className="text-blue-400">🇨🇭</span> Standard</span>
            <span className="flex items-center gap-1"><span className="text-yellow-400">🤝</span> Vyjednání</span>
            <span className="flex items-center gap-1"><span className="text-green-400">✅</span> Hodnocení</span>
          </div>
        </div>

        <PaywallOverlay isLocked={!isActive && !loading} title="AI analýza smluv je součástí Premium" description="Porozuměj své pracovní smlouvě v němčině">
          <div className="space-y-4">

            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">Vlož text pracovní smlouvy *</label>
              <textarea value={contractText} onChange={(e) => setContractText(e.target.value)} placeholder={'Zkopíruj text smlouvy v němčině...\n\nArbeitsvertrag\nzwischen [Firma] als Arbeitgeber\nund [Jméno] als Arbeitnehmer\n\n1. Beginn und Dauer\nDas Arbeitsverhältnis beginnt am...'} rows={12} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition resize-none" />
              <p className="text-gray-600 text-xs mt-1">{contractText.length} znaků · {contractText.length < 50 ? 'vlož celý text smlouvy' : '✓ dostatečný text'}</p>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3">
              <p className="text-blue-300 text-xs">💡 Tip: Smlouvu můžeš zkopírovat z PDF nebo emailu. Čím víc textu vložíš, tím přesnější analýza.</p>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"><p className="text-red-400 text-sm">⚠️ {error}</p></div>}

            <button onClick={handleSubmit} disabled={generating || contractText.trim().length < 50} className="w-full bg-[#E8302A] text-white font-bold py-3.5 px-6 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI analyzuje smlouvu...
                </span>
              ) : '📑 Analyzovat smlouvu'}
            </button>
            <p className="text-gray-600 text-xs text-center">AI přeloží, vysvětlí klauzule a porovná se švýcarským standardem</p>
          </div>
        </PaywallOverlay>
      </div>
    </main>
  )
}
