'use client'

import { useState } from 'react'
import { useSubscription } from '../../../../hooks/useSubscription'
import PaywallOverlay from '../../../components/PaywallOverlay'
import { supabase } from '../../../supabase'
import Link from 'next/link'

const GERMAN = ['Základy (A1)', 'Základní komunikace (A2)', 'Dorozumím se (B1)', 'Dobrá úroveň (B2)', 'Plynulá (C1/C2)']

interface AnalysisData {
  company: string
  position: string
  location: string
  salary: string
  contract_type: string
  summary: string
  requirements: {
    must_have: Array<{ requirement: string; requirement_de: string; difficulty: string }>
    nice_to_have: Array<{ requirement: string; requirement_de: string }>
  }
  languages: Array<{ language: string; level: string; importance: string }>
  skills_needed: string[]
  red_flags: Array<{ flag: string; explanation: string }>
  green_flags: Array<{ flag: string; explanation: string }>
  match_tips: string[]
  cover_letter_keywords: string[]
  interview_topics: string[]
  salary_estimate: string
}

export default function AnalyzaInzeratu() {
  const { isActive, loading } = useSubscription()
  const [jobText, setJobText] = useState('')
  const [showProfile, setShowProfile] = useState(false)
  const [profile, setProfile] = useState<Record<string, string>>({})
  const [result, setResult] = useState<AnalysisData | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (jobText.trim().length < 30) { setError('Vlož celý text inzerátu (min. 30 znaků)'); return }
    setGenerating(true); setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) { setError('Musíš být přihlášen'); setGenerating(false); return }
      const res = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ jobText, userProfile: showProfile ? profile : null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analýza selhala')
      setResult(data.analysisData)
    } catch (err: any) { setError(err.message || 'Něco se pokazilo') }
    finally { setGenerating(false) }
  }

  const diffColor = (d: string) => {
    if (d === 'easy') return { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Snadné' }
    if (d === 'medium') return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Střední' }
    return { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Náročné' }
  }

  // ─── RESULTS ───
  if (result) {
    return (
      <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/pruvodce/sablony" className="text-gray-500 hover:text-white text-sm">← Zpět</Link>
            <button onClick={() => setResult(null)} className="text-gray-400 hover:text-white text-xs px-3 py-1.5 border border-gray-700 rounded-lg transition">📋 Nový inzerát</button>
          </div>

          {/* Header card */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-5 mb-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h1 className="text-white text-lg font-bold">{result.position}</h1>
                {result.company && <p className="text-blue-400 text-sm font-medium">{result.company}</p>}
              </div>
              {result.contract_type && <span className="text-xs bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full">{result.contract_type}</span>}
            </div>
            <div className="flex gap-4 text-xs text-gray-400 mb-3">
              {result.location && <span>📍 {result.location}</span>}
              <span>💰 {result.salary !== 'Neuvedeno' ? result.salary : result.salary_estimate}</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{result.summary}</p>
          </div>

          {/* Must-have requirements */}
          <div className="mb-5">
            <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-red-500/20 rounded-lg flex items-center justify-center text-xs">🎯</span>
              Povinné požadavky
            </h2>
            <div className="space-y-2">
              {result.requirements.must_have.map((r, i) => {
                const dc = diffColor(r.difficulty)
                return (
                  <div key={i} className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 flex items-start gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dc.bg} ${dc.text} flex-shrink-0 mt-0.5`}>{dc.label}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm">{r.requirement}</p>
                      {r.requirement_de && <p className="text-gray-600 text-xs mt-0.5 italic">{r.requirement_de}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Nice-to-have */}
          {result.requirements.nice_to_have.length > 0 && (
            <div className="mb-5">
              <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center text-xs">➕</span>
                Výhody (nice-to-have)
              </h2>
              <div className="space-y-2">
                {result.requirements.nice_to_have.map((r, i) => (
                  <div key={i} className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-3">
                    <p className="text-gray-300 text-sm">{r.requirement}</p>
                    {r.requirement_de && <p className="text-gray-600 text-xs mt-0.5 italic">{r.requirement_de}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {result.languages.length > 0 && (
            <div className="mb-5">
              <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center text-xs">🗣️</span>
                Požadované jazyky
              </h2>
              <div className="flex gap-2 flex-wrap">
                {result.languages.map((l, i) => (
                  <div key={i} className={`px-3 py-2 rounded-xl text-sm ${l.importance === 'Povinné' ? 'bg-purple-500/10 border border-purple-500/20 text-purple-300' : 'bg-[#1A1A1A] border border-gray-800 text-gray-400'}`}>
                    <span className="font-semibold">{l.language}</span> · {l.level}
                    <span className="text-xs ml-1 opacity-60">({l.importance})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Green & Red flags */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <h2 className="text-white font-bold text-sm mb-2 flex items-center gap-1.5">
                <span className="text-green-400">✅</span> Pozitivní
              </h2>
              <div className="space-y-2">
                {result.green_flags.map((f, i) => (
                  <div key={i} className="bg-green-500/5 border border-green-500/10 rounded-xl p-3">
                    <p className="text-green-300 text-xs font-semibold">{f.flag}</p>
                    <p className="text-gray-500 text-[10px] mt-0.5">{f.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-white font-bold text-sm mb-2 flex items-center gap-1.5">
                <span className="text-red-400">⚠️</span> Pozor na
              </h2>
              <div className="space-y-2">
                {result.red_flags.map((f, i) => (
                  <div key={i} className="bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                    <p className="text-red-300 text-xs font-semibold">{f.flag}</p>
                    <p className="text-gray-500 text-[10px] mt-0.5">{f.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Match tips */}
          <div className="mb-5">
            <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-yellow-500/20 rounded-lg flex items-center justify-center text-xs">💡</span>
              Jak se prezentovat
            </h2>
            <div className="space-y-2">
              {result.match_tips.map((t, i) => (
                <div key={i} className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 flex items-start gap-2.5">
                  <span className="text-yellow-400 text-xs mt-0.5">{i + 1}.</span>
                  <p className="text-gray-300 text-sm">{t}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords for cover letter */}
          {result.cover_letter_keywords.length > 0 && (
            <div className="mb-5">
              <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#E8302A]/20 rounded-lg flex items-center justify-center text-xs">🔑</span>
                Klíčová slova pro motivační dopis
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.cover_letter_keywords.map((k, i) => (
                  <span key={i} className="text-xs bg-[#E8302A]/10 text-[#E8302A] px-3 py-1.5 rounded-full font-medium border border-[#E8302A]/20">{k}</span>
                ))}
              </div>
            </div>
          )}

          {/* Interview topics */}
          {result.interview_topics.length > 0 && (
            <div className="mb-5">
              <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center text-xs">🎤</span>
                Na co se budou ptát u pohovoru
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.interview_topics.map((t, i) => (
                  <span key={i} className="text-xs bg-orange-500/10 text-orange-300 px-3 py-1.5 rounded-full border border-orange-500/20">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {result.skills_needed.length > 0 && (
            <div className="mb-5">
              <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-cyan-500/20 rounded-lg flex items-center justify-center text-xs">🛠</span>
                Požadované dovednosti
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.skills_needed.map((s, i) => (
                  <span key={i} className="text-xs bg-[#1A1A1A] text-gray-300 px-3 py-1.5 rounded-full border border-gray-700">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="space-y-2 mt-6">
            <Link href="/pruvodce/sablony/cv" className="block w-full bg-[#E8302A] text-white font-bold py-3 px-6 rounded-xl text-center hover:opacity-90 transition">
              📄 Vytvořit CV na míru pro tento inzerát
            </Link>
            <Link href="/pruvodce/sablony/motivacni-dopis" className="block w-full bg-[#1A1A1A] text-white font-bold py-3 px-6 rounded-xl text-center border border-gray-700 hover:border-gray-500 transition">
              ✉️ Napsat motivační dopis na míru
            </Link>
            <Link href="/pruvodce/sablony/pohovor" className="block w-full bg-[#1A1A1A] text-gray-300 font-bold py-3 px-6 rounded-xl text-center border border-gray-700 hover:border-gray-500 transition">
              🎤 Připravit se na pohovor pro tuto pozici
            </Link>
          </div>

          <button onClick={() => { setResult(null); setJobText('') }} className="w-full text-gray-400 hover:text-white text-sm py-3 mt-3 transition">
            🔄 Analyzovat jiný inzerát
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
          <span className="text-3xl">📋</span>
          <div>
            <h1 className="text-white text-xl font-bold">AI analýza inzerátu</h1>
            <p className="text-gray-400 text-xs">Vlož inzerát → AI vytáhne co firma hledá a jak se prezentovat</p>
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 mb-6">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="text-red-400">🎯</span> Požadavky</span>
            <span className="flex items-center gap-1"><span className="text-green-400">✅</span> Flags</span>
            <span className="flex items-center gap-1"><span className="text-yellow-400">💡</span> Tipy</span>
            <span className="flex items-center gap-1"><span className="text-blue-400">🔑</span> Klíčová slova</span>
            <span className="flex items-center gap-1"><span className="text-orange-400">💰</span> Plat</span>
          </div>
        </div>

        <PaywallOverlay isLocked={!isActive && !loading} title="AI analýza inzerátů je součástí Premium" description="Pochop co firma hledá a jak se prezentovat">
          <div className="space-y-4">

            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">Vlož text pracovního inzerátu *</label>
              <textarea value={jobText} onChange={(e) => setJobText(e.target.value)} placeholder={'Zkopíruj celý text inzerátu z jobs.ch, Indeed, LinkedIn...\n\nNapříklad:\nMonteur (m/w) – Stahlbau\nWir suchen einen erfahrenen Monteur für...'} rows={10} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition resize-none" />
              <p className="text-gray-600 text-xs mt-1">{jobText.length} znaků · {jobText.length < 30 ? 'vlož celý text inzerátu' : '✓ dostatečný text'}</p>
            </div>

            {/* Optional profile */}
            <div>
              <button onClick={() => setShowProfile(!showProfile)} className="text-gray-400 text-sm hover:text-white transition flex items-center gap-2">
                <span className={`transition-transform ${showProfile ? 'rotate-90' : ''}`}>▶</span>
                Volitelné: přidej svůj profil pro personalizovanou analýzu
              </button>
              {showProfile && (
                <div className="mt-3 space-y-3 bg-[#151515] border border-gray-800 rounded-xl p-4">
                  <input type="text" value={profile.position || ''} onChange={(e) => setProfile(p => ({ ...p, position: e.target.value }))} placeholder="Tvá pozice (Monteur, Koch...)" className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
                  <select value={profile.german || ''} onChange={(e) => setProfile(p => ({ ...p, german: e.target.value }))} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-gray-600 focus:outline-none transition appearance-none">
                    <option value="">Úroveň němčiny</option>
                    {GERMAN.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <textarea value={profile.experience || ''} onChange={(e) => setProfile(p => ({ ...p, experience: e.target.value }))} placeholder="Tvé zkušenosti (krátce)" rows={2} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition resize-none" />
                  <input type="text" value={profile.skills || ''} onChange={(e) => setProfile(p => ({ ...p, skills: e.target.value }))} placeholder="Tvé dovednosti" className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" />
                </div>
              )}
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"><p className="text-red-400 text-sm">⚠️ {error}</p></div>}

            <button onClick={handleSubmit} disabled={generating || jobText.trim().length < 30} className="w-full bg-[#E8302A] text-white font-bold py-3.5 px-6 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI analyzuje inzerát...
                </span>
              ) : '📋 Analyzovat inzerát'}
            </button>
            <p className="text-gray-600 text-xs text-center">AI vytáhne požadavky, ohodnotí obtížnost a poradí jak se prezentovat</p>
          </div>
        </PaywallOverlay>
      </div>
    </main>
  )
}
