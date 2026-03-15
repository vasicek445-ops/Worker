'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSubscription } from '../../../../hooks/useSubscription'
import PaywallOverlay from '../../../components/PaywallOverlay'
import { supabase } from '../../../supabase'
import Link from 'next/link'

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
  match_score: number | null
}

interface HistoryItem {
  id: string
  position: string | null
  company: string | null
  location: string | null
  match_score: number | null
  job_text: string
  analysis_data: AnalysisData
  created_at: string
}

interface UserProfile {
  pozice: string
  obor: string
  nemcina_uroven: string
  zkusenosti: string
  dovednosti: string
  full_name: string
}

const PROGRESS_STEPS = [
  { label: 'Čtu inzerát', icon: '📖' },
  { label: 'Analyzuji požadavky', icon: '🔍' },
  { label: 'Hledám červené vlajky', icon: '🚩' },
  { label: 'Porovnávám s profilem', icon: '👤' },
  { label: 'Generuji tipy', icon: '💡' },
]

export default function AnalyzaInzeratu() {
  const { isActive, loading } = useSubscription()
  const [jobText, setJobText] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [extractingUrl, setExtractingUrl] = useState(false)
  const [urlSource, setUrlSource] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisData | null>(null)
  const [generating, setGenerating] = useState(false)
  const [progressStep, setProgressStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [inputMode, setInputMode] = useState<'text' | 'url'>('text')

  // Load profile and history
  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const [profileRes, historyRes] = await Promise.all([
        supabase.from('profiles').select('pozice, obor, nemcina_uroven, zkusenosti, dovednosti, full_name').eq('id', session.user.id).single(),
        supabase.from('job_analyses').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(20),
      ])

      if (profileRes.data) setProfile(profileRes.data as UserProfile)
      if (historyRes.data) setHistory(historyRes.data as HistoryItem[])
    }
    loadData()
  }, [])

  // Progress animation during generation
  useEffect(() => {
    if (!generating) { setProgressStep(0); return }
    const interval = setInterval(() => {
      setProgressStep(prev => prev < PROGRESS_STEPS.length - 1 ? prev + 1 : prev)
    }, 2500)
    return () => clearInterval(interval)
  }, [generating])

  const handleExtractUrl = async () => {
    if (!jobUrl.trim()) return
    setExtractingUrl(true); setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) { setError('Musíš být přihlášen'); return }

      const res = await fetch('/api/extract-job-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ url: jobUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Nepodařilo se načíst')
      setJobText(data.text)
      setUrlSource(data.source)
      setInputMode('text')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Něco se pokazilo'
      setError(message)
    } finally { setExtractingUrl(false) }
  }

  const handleSubmit = async () => {
    if (jobText.trim().length < 30) { setError('Vlož celý text inzerátu (min. 30 znaků)'); return }
    setGenerating(true); setError(null); setProgressStep(0)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) { setError('Musíš být přihlášen'); setGenerating(false); return }
      const res = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ jobText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analýza selhala')
      setResult(data.analysisData)
      // Refresh history
      const historyRes = await supabase.from('job_analyses').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(20)
      if (historyRes.data) setHistory(historyRes.data as HistoryItem[])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Něco se pokazilo'
      setError(message)
    } finally { setGenerating(false) }
  }

  const loadFromHistory = useCallback((item: HistoryItem) => {
    setResult(item.analysis_data)
    setJobText(item.job_text)
    setShowHistory(false)
  }, [])

  const deleteFromHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await supabase.from('job_analyses').delete().eq('id', id)
    setHistory(prev => prev.filter(h => h.id !== id))
  }

  const diffColor = (d: string) => {
    if (d === 'easy') return { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Snadné' }
    if (d === 'medium') return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Střední' }
    return { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Náročné' }
  }

  const scoreColor = (score: number) => {
    if (score >= 75) return { stroke: 'stroke-green-500', text: 'text-green-400', label: 'Výborná shoda' }
    if (score >= 50) return { stroke: 'stroke-yellow-500', text: 'text-yellow-400', label: 'Dobrá shoda' }
    if (score >= 25) return { stroke: 'stroke-orange-500', text: 'text-orange-400', label: 'Částečná shoda' }
    return { stroke: 'stroke-red-500', text: 'text-red-400', label: 'Nízká shoda' }
  }

  // ─── RESULTS ───
  if (result) {
    const sc = result.match_score !== null && result.match_score !== undefined ? scoreColor(result.match_score) : null
    const circumference = 2 * Math.PI * 40

    return (
      <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/pruvodce/sablony" className="text-gray-500 hover:text-white text-sm">← Zpět</Link>
            <button onClick={() => setResult(null)} className="text-gray-400 hover:text-white text-xs px-3 py-1.5 border border-gray-700 rounded-lg transition">📋 Nový inzerát</button>
          </div>

          {/* Header card with match score */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-5 mb-5">
            <div className="flex items-start gap-4">
              {/* Match score circle */}
              {sc && result.match_score !== null && (
                <div className="flex-shrink-0 relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 90 90">
                    <circle cx="45" cy="45" r="40" fill="none" stroke="#1A1A1A" strokeWidth="6" />
                    <circle cx="45" cy="45" r="40" fill="none" className={sc.stroke} strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * result.match_score / 100)} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-lg font-bold ${sc.text}`}>{result.match_score}%</span>
                  </div>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h1 className="text-white text-lg font-bold">{result.position}</h1>
                    {result.company && <p className="text-blue-400 text-sm font-medium">{result.company}</p>}
                  </div>
                  {result.contract_type && <span className="text-xs bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full flex-shrink-0">{result.contract_type}</span>}
                </div>
                <div className="flex gap-4 text-xs text-gray-400 mb-2">
                  {result.location && <span>📍 {result.location}</span>}
                  <span>💰 {result.salary !== 'Neuvedeno' ? result.salary : result.salary_estimate}</span>
                </div>
                {sc && <p className={`text-xs font-medium ${sc.text}`}>{sc.label}</p>}
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mt-3">{result.summary}</p>
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
            <p className="text-gray-500 text-xs text-center mb-1">🔗 Data z analýzy se automaticky předvyplní</p>
            <Link href={`/pruvodce/sablony/cv?prefill=${encodeURIComponent(JSON.stringify({ position: result.position?.split('(')[0]?.split('/')[0]?.trim() || '', company: result.company, skills: result.skills_needed?.join(', ') || '', keywords: result.cover_letter_keywords?.join(', ') || '' }))}`} className="block w-full bg-[#E8302A] text-white font-bold py-3 px-6 rounded-xl text-center hover:opacity-90 transition">
              📄 Vytvořit CV na míru
            </Link>
            <Link href={`/pruvodce/sablony/motivacni-dopis?prefill=${encodeURIComponent(JSON.stringify({ position: result.position?.split('(')[0]?.split('/')[0]?.trim() || '', company: result.company, keywords: result.cover_letter_keywords || [], tips: result.match_tips || [] }))}`} className="block w-full bg-[#1A1A1A] text-white font-bold py-3 px-6 rounded-xl text-center border border-gray-700 hover:border-gray-500 transition">
              ✉️ Napsat motivační dopis
            </Link>
            <Link href={`/pruvodce/sablony/pohovor?prefill=${encodeURIComponent(JSON.stringify({ position: result.position?.split('(')[0]?.split('/')[0]?.trim() || '', company: result.company, topics: result.interview_topics || [] }))}`} className="block w-full bg-[#1A1A1A] text-gray-300 font-bold py-3 px-6 rounded-xl text-center border border-gray-700 hover:border-gray-500 transition">
              🎤 Připravit se na pohovor
            </Link>
            <Link href="/pruvodce/matching" className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl text-center hover:opacity-90 transition">
              🚀 Přihlásit se přes Smart Matching
            </Link>
          </div>

          <button onClick={() => { setResult(null); setJobText('') }} className="w-full text-gray-400 hover:text-white text-sm py-3 mt-3 transition">
            🔄 Analyzovat jiný inzerát
          </button>
        </div>
      </main>
    )
  }

  // ─── LOADING STATE ───
  if (generating) {
    return (
      <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-sm">
              <div className="mb-8 text-center">
                <div className="w-16 h-16 border-4 border-[#E8302A]/20 border-t-[#E8302A] rounded-full animate-spin mx-auto mb-4" />
                <h2 className="text-white text-lg font-bold">Analyzuji inzerát</h2>
                <p className="text-gray-500 text-sm mt-1">Tohle trvá 10-15 sekund</p>
              </div>
              <div className="space-y-3">
                {PROGRESS_STEPS.map((step, i) => (
                  <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-500 ${
                    i < progressStep ? 'bg-green-500/10 border border-green-500/20' :
                    i === progressStep ? 'bg-[#E8302A]/10 border border-[#E8302A]/20' :
                    'bg-[#1A1A1A] border border-gray-800 opacity-40'
                  }`}>
                    <span className="text-lg">{i < progressStep ? '✅' : step.icon}</span>
                    <span className={`text-sm font-medium ${
                      i < progressStep ? 'text-green-400' :
                      i === progressStep ? 'text-white' : 'text-gray-600'
                    }`}>{step.label}</span>
                    {i === progressStep && <span className="ml-auto w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
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

        {/* Feature badges */}
        <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1"><span className="text-red-400">🎯</span> Požadavky</span>
            <span className="flex items-center gap-1"><span className="text-green-400">✅</span> Flags</span>
            <span className="flex items-center gap-1"><span className="text-yellow-400">💡</span> Tipy</span>
            <span className="flex items-center gap-1"><span className="text-blue-400">🔑</span> Klíčová slova</span>
            <span className="flex items-center gap-1"><span className="text-orange-400">💰</span> Plat</span>
            <span className="flex items-center gap-1"><span className="text-purple-400">📊</span> Match skóre</span>
          </div>
        </div>

        {/* Profile auto-loaded banner */}
        {profile && (profile.pozice || profile.dovednosti) && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-4 flex items-center gap-3">
            <span className="text-blue-400 text-lg">👤</span>
            <div className="flex-1 min-w-0">
              <p className="text-blue-300 text-sm font-medium">Profil načten automaticky</p>
              <p className="text-gray-400 text-xs truncate">
                {[profile.pozice, profile.obor, profile.nemcina_uroven].filter(Boolean).join(' · ')}
              </p>
            </div>
            <span className="text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded-full">Match skóre aktivní</span>
          </div>
        )}

        <PaywallOverlay isLocked={!isActive && !loading} title="AI analýza inzerátů je součástí Premium" description="Pochop co firma hledá a jak se prezentovat">
          <div className="space-y-4">

            {/* Input mode toggle */}
            <div className="flex gap-2">
              <button onClick={() => setInputMode('text')} className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition ${inputMode === 'text' ? 'bg-[#E8302A] text-white' : 'bg-[#1A1A1A] text-gray-400 border border-gray-800 hover:border-gray-600'}`}>
                📝 Vložit text
              </button>
              <button onClick={() => setInputMode('url')} className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition ${inputMode === 'url' ? 'bg-[#E8302A] text-white' : 'bg-[#1A1A1A] text-gray-400 border border-gray-800 hover:border-gray-600'}`}>
                🔗 Vložit URL
              </button>
            </div>

            {/* URL input */}
            {inputMode === 'url' && (
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">URL pracovního inzerátu</label>
                <div className="flex gap-2">
                  <input type="url" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="https://www.jobs.ch/en/vacancies/detail/..." className="flex-1 bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition" onKeyDown={(e) => e.key === 'Enter' && handleExtractUrl()} />
                  <button onClick={handleExtractUrl} disabled={extractingUrl || !jobUrl.trim()} className="bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2 flex-shrink-0">
                    {extractingUrl ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '📥'}
                    {extractingUrl ? 'Načítám...' : 'Načíst'}
                  </button>
                </div>
                <p className="text-gray-600 text-xs mt-1.5">Podporuje jobs.ch, Indeed, LinkedIn, Michael Page a další</p>
              </div>
            )}

            {/* Text input */}
            {inputMode === 'text' && (
              <div>
                <label className="text-gray-300 text-sm font-medium mb-1.5 block">
                  {urlSource ? `Text načtený z ${urlSource}` : 'Vlož text pracovního inzerátu *'}
                </label>
                <textarea value={jobText} onChange={(e) => setJobText(e.target.value)} placeholder={'Zkopíruj celý text inzerátu z jobs.ch, Indeed, LinkedIn...\n\nNapříklad:\nMonteur (m/w) – Stahlbau\nWir suchen einen erfahrenen Monteur für...'} rows={10} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition resize-none" />
                <p className="text-gray-600 text-xs mt-1">{jobText.length} znaků · {jobText.length < 30 ? 'vlož celý text inzerátu' : '✓ dostatečný text'}</p>
              </div>
            )}

            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"><p className="text-red-400 text-sm">⚠️ {error}</p></div>}

            <button onClick={handleSubmit} disabled={generating || jobText.trim().length < 30} className="w-full bg-[#E8302A] text-white font-bold py-3.5 px-6 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed">
              📋 Analyzovat inzerát{profile?.pozice ? ' + porovnat s profilem' : ''}
            </button>
            <p className="text-gray-600 text-xs text-center">
              {profile?.pozice
                ? 'AI vytáhne požadavky, vypočítá match skóre a poradí jak se prezentovat'
                : 'AI vytáhne požadavky, ohodnotí obtížnost a poradí jak se prezentovat'}
            </p>
          </div>
        </PaywallOverlay>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6">
            <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition w-full">
              <span className={`transition-transform ${showHistory ? 'rotate-90' : ''}`}>▶</span>
              <span className="font-medium">Historie analýz</span>
              <span className="text-xs bg-[#1A1A1A] px-2 py-0.5 rounded-full text-gray-500 ml-1">{history.length}</span>
            </button>
            {showHistory && (
              <div className="mt-3 space-y-2">
                {history.map(item => (
                  <button key={item.id} onClick={() => loadFromHistory(item)} className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 text-left hover:border-gray-600 transition group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.position || 'Neznámá pozice'}</p>
                        <p className="text-gray-500 text-xs truncate">
                          {[item.company, item.location].filter(Boolean).join(' · ')}
                          {' · '}
                          {new Date(item.created_at).toLocaleDateString('cs')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.match_score !== null && (
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            item.match_score >= 75 ? 'bg-green-500/10 text-green-400' :
                            item.match_score >= 50 ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>{item.match_score}%</span>
                        )}
                        <button onClick={(e) => deleteFromHistory(item.id, e)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition p-1" title="Smazat">✕</button>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
