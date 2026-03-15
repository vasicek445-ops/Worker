'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSubscription } from '../../../../hooks/useSubscription'
import PaywallOverlay from '../../../components/PaywallOverlay'
import { supabase } from '../../../supabase'
import Link from 'next/link'
import Image from 'next/image'

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
    if (d === 'easy') return { bg: 'bg-[#39ff6e]/10', text: 'text-[#39ff6e]', label: 'Snadné' }
    if (d === 'medium') return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Střední' }
    return { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Náročné' }
  }

  const scoreColor = (score: number) => {
    if (score >= 75) return { stroke: 'stroke-[#39ff6e]', text: 'text-[#39ff6e]', label: 'Výborná shoda', glow: 'shadow-[0_0_30px_rgba(57,255,110,0.2)]' }
    if (score >= 50) return { stroke: 'stroke-yellow-400', text: 'text-yellow-400', label: 'Dobrá shoda', glow: 'shadow-[0_0_30px_rgba(234,179,8,0.2)]' }
    if (score >= 25) return { stroke: 'stroke-orange-400', text: 'text-orange-400', label: 'Částečná shoda', glow: 'shadow-[0_0_30px_rgba(251,146,60,0.2)]' }
    return { stroke: 'stroke-red-400', text: 'text-red-400', label: 'Nízká shoda', glow: 'shadow-[0_0_30px_rgba(248,113,113,0.2)]' }
  }

  // ─── Ambient background ───
  const ambientBg = (
    <>
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[rgba(57,255,110,0.12)] blur-[180px] pointer-events-none z-0" />
      <div className="fixed bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[rgba(100,60,255,0.10)] blur-[160px] pointer-events-none z-0" />
    </>
  )

  // ─── RESULTS ───
  if (result) {
    const sc = result.match_score !== null && result.match_score !== undefined ? scoreColor(result.match_score) : null
    const circumference = 2 * Math.PI * 40

    return (
      <main className="min-h-screen bg-[#0a0a12] px-4 py-6 pb-24 relative overflow-hidden">
        {ambientBg}
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-5">
            <Link href="/pruvodce/sablony" className="text-white/30 hover:text-white text-sm transition">← Zpět</Link>
            <button onClick={() => setResult(null)} className="text-white/40 hover:text-white text-xs px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-xl transition hover:bg-white/[0.08]">Nový inzerát</button>
          </div>

          {/* Header card with match score */}
          <div className={`bg-[#111120]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5 mb-5 ${sc ? sc.glow : ''}`}>
            <div className="flex items-start gap-4">
              {sc && result.match_score !== null && (
                <div className="flex-shrink-0 relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 90 90">
                    <circle cx="45" cy="45" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                    <circle cx="45" cy="45" r="40" fill="none" className={sc.stroke} strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * result.match_score / 100)}
                      style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
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
                    {result.company && <p className="text-[#39ff6e]/70 text-sm font-medium">{result.company}</p>}
                  </div>
                  {result.contract_type && <span className="text-[10px] bg-white/[0.06] text-white/50 px-2.5 py-1 rounded-full flex-shrink-0 border border-white/[0.06]">{result.contract_type}</span>}
                </div>
                <div className="flex gap-4 text-xs text-white/30 mb-2">
                  {result.location && <span>📍 {result.location}</span>}
                  <span>💰 {result.salary !== 'Neuvedeno' ? result.salary : result.salary_estimate}</span>
                </div>
                {sc && <p className={`text-xs font-medium ${sc.text}`}>{sc.label}</p>}
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mt-3">{result.summary}</p>
          </div>

          {/* Must-have requirements */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Image src="/images/3d/target.png" alt="" width={18} height={18} />
              <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Povinné požadavky</span>
            </div>
            <div className="bg-[#111120]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4 space-y-2">
              {result.requirements.must_have.map((r, i) => {
                const dc = diffColor(r.difficulty)
                return (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.02] transition">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dc.bg} ${dc.text} flex-shrink-0 mt-0.5`}>{dc.label}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-sm">{r.requirement}</p>
                      {r.requirement_de && <p className="text-white/20 text-xs mt-0.5 italic">{r.requirement_de}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Nice-to-have */}
          {result.requirements.nice_to_have.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Image src="/images/3d/star.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Výhody (nice-to-have)</span>
              </div>
              <div className="bg-[#111120]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4 space-y-2">
                {result.requirements.nice_to_have.map((r, i) => (
                  <div key={i} className="p-2 rounded-xl hover:bg-white/[0.02] transition">
                    <p className="text-white/60 text-sm">{r.requirement}</p>
                    {r.requirement_de && <p className="text-white/20 text-xs mt-0.5 italic">{r.requirement_de}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {result.languages.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Image src="/images/3d/speech.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Požadované jazyky</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {result.languages.map((l, i) => (
                  <div key={i} className={`px-3 py-2 rounded-xl text-sm backdrop-blur-sm ${l.importance === 'Povinné' ? 'bg-[#39ff6e]/[0.06] border border-[#39ff6e]/20 text-[#39ff6e]/80' : 'bg-[#111120]/80 border border-white/[0.06] text-white/40'}`}>
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
              <div className="flex items-center gap-2 mb-2">
                <Image src="/images/3d/shield.png" alt="" width={16} height={16} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Pozitivní</span>
              </div>
              <div className="space-y-2">
                {result.green_flags.map((f, i) => (
                  <div key={i} className="bg-[#39ff6e]/[0.04] border border-[#39ff6e]/10 rounded-xl p-3 backdrop-blur-sm">
                    <p className="text-[#39ff6e]/80 text-xs font-semibold">{f.flag}</p>
                    <p className="text-white/25 text-[10px] mt-0.5">{f.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-400 text-sm">⚠️</span>
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Pozor na</span>
              </div>
              <div className="space-y-2">
                {result.red_flags.map((f, i) => (
                  <div key={i} className="bg-red-500/[0.04] border border-red-500/10 rounded-xl p-3 backdrop-blur-sm">
                    <p className="text-red-400/80 text-xs font-semibold">{f.flag}</p>
                    <p className="text-white/25 text-[10px] mt-0.5">{f.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Match tips */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Image src="/images/3d/key.png" alt="" width={18} height={18} />
              <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Jak se prezentovat</span>
            </div>
            <div className="bg-[#111120]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4 space-y-2">
              {result.match_tips.map((t, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/[0.02] transition">
                  <span className="text-[#39ff6e]/60 text-xs mt-0.5 font-bold">{i + 1}.</span>
                  <p className="text-white/60 text-sm">{t}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords for cover letter */}
          {result.cover_letter_keywords.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Image src="/images/3d/document.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Klíčová slova pro motivační dopis</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.cover_letter_keywords.map((k, i) => (
                  <span key={i} className="text-xs bg-[#39ff6e]/[0.06] text-[#39ff6e]/70 px-3 py-1.5 rounded-full font-medium border border-[#39ff6e]/15">{k}</span>
                ))}
              </div>
            </div>
          )}

          {/* Interview topics */}
          {result.interview_topics.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Image src="/images/3d/briefcase.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Na co se budou ptát u pohovoru</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.interview_topics.map((t, i) => (
                  <span key={i} className="text-xs bg-white/[0.04] text-white/50 px-3 py-1.5 rounded-full border border-white/[0.06]">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {result.skills_needed.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Image src="/images/3d/gem.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Požadované dovednosti</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.skills_needed.map((s, i) => (
                  <span key={i} className="text-xs bg-[#111120]/80 text-white/50 px-3 py-1.5 rounded-full border border-white/[0.06]">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="space-y-2.5 mt-8">
            <p className="text-white/20 text-xs text-center mb-2">Data z analýzy se automaticky předvyplní</p>
            <Link href={`/pruvodce/sablony/cv?prefill=${encodeURIComponent(JSON.stringify({ position: result.position?.split('(')[0]?.split('/')[0]?.trim() || '', company: result.company, skills: result.skills_needed?.join(', ') || '', keywords: result.cover_letter_keywords?.join(', ') || '', location: result.location || '' }))}`}
              className="block w-full bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] font-extrabold py-4 px-6 rounded-2xl text-center hover:shadow-[0_4px_30px_rgba(57,255,110,0.35)] hover:scale-[1.02] transition-all">
              📄 Vytvořit CV na míru
            </Link>
            <Link href={`/pruvodce/sablony/motivacni-dopis?prefill=${encodeURIComponent(JSON.stringify({ position: result.position?.split('(')[0]?.split('/')[0]?.trim() || '', company: result.company, keywords: result.cover_letter_keywords || [], tips: result.match_tips || [], location: result.location || '' }))}`}
              className="block w-full bg-white/[0.04] text-white font-bold py-3.5 px-6 rounded-2xl text-center border border-white/[0.08] hover:bg-white/[0.08] transition-all">
              ✉️ Napsat motivační dopis
            </Link>
            <Link href={`/pruvodce/sablony/pohovor?prefill=${encodeURIComponent(JSON.stringify({ position: result.position?.split('(')[0]?.split('/')[0]?.trim() || '', company: result.company, topics: result.interview_topics || [] }))}`}
              className="block w-full bg-white/[0.04] text-white/60 font-bold py-3.5 px-6 rounded-2xl text-center border border-white/[0.08] hover:bg-white/[0.08] transition-all">
              🎤 Připravit se na pohovor
            </Link>
            <Link href="/pruvodce/matching"
              className="block w-full bg-gradient-to-r from-[#643cff]/30 to-[#39ff6e]/20 text-white font-bold py-3.5 px-6 rounded-2xl text-center border border-white/[0.08] hover:border-[#39ff6e]/30 transition-all">
              🚀 Přihlásit se přes Smart Matching
            </Link>
          </div>

          <button onClick={() => { setResult(null); setJobText('') }} className="w-full text-white/30 hover:text-white text-sm py-3 mt-3 transition">
            Analyzovat jiný inzerát
          </button>
        </div>
      </main>
    )
  }

  // ─── LOADING STATE ───
  if (generating) {
    return (
      <main className="min-h-screen bg-[#0a0a12] px-4 py-6 pb-24 relative overflow-hidden">
        {ambientBg}
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-sm">
              <div className="mb-8 text-center">
                <div className="w-16 h-16 border-4 border-[#39ff6e]/20 border-t-[#39ff6e] rounded-full animate-spin mx-auto mb-4" />
                <h2 className="text-white text-lg font-bold">Analyzuji inzerát</h2>
                <p className="text-white/30 text-sm mt-1">Tohle trvá 10-15 sekund</p>
              </div>
              <div className="space-y-3">
                {PROGRESS_STEPS.map((step, i) => (
                  <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-500 ${
                    i < progressStep ? 'bg-[#39ff6e]/[0.06] border border-[#39ff6e]/20' :
                    i === progressStep ? 'bg-white/[0.04] border border-white/[0.08]' :
                    'bg-white/[0.02] border border-white/[0.04] opacity-40'
                  }`}>
                    <span className="text-lg">{i < progressStep ? '✅' : step.icon}</span>
                    <span className={`text-sm font-medium ${
                      i < progressStep ? 'text-[#39ff6e]/80' :
                      i === progressStep ? 'text-white' : 'text-white/30'
                    }`}>{step.label}</span>
                    {i === progressStep && <span className="ml-auto w-4 h-4 border-2 border-white/20 border-t-[#39ff6e] rounded-full animate-spin" />}
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
    <main className="min-h-screen bg-[#0a0a12] px-4 py-6 pb-24 relative overflow-hidden">
      {ambientBg}
      <div className="max-w-2xl mx-auto relative z-10">
        <Link href="/pruvodce/sablony" className="text-white/30 hover:text-white mb-6 inline-block text-sm transition">← Zpět na šablony</Link>

        {/* Hero header */}
        <div className="relative rounded-2xl p-5 mb-6 overflow-hidden" style={{ background: 'linear-gradient(135deg, #111128 0%, #0d1a2e 40%, #0a1a14 100%)' }}>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="relative flex items-center gap-3">
            <Image src="/images/3d/target.png" alt="" width={36} height={36} />
            <div>
              <h1 className="text-white text-xl font-bold">AI analýza inzerátu</h1>
              <p className="text-white/30 text-xs">Vlož inzerát → AI vytáhne co firma hledá a jak se prezentovat</p>
            </div>
          </div>
        </div>

        {/* Feature badges */}
        <div className="bg-[#111120]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-3 mb-5">
          <div className="flex items-center gap-3 text-xs text-white/40 flex-wrap">
            <span className="flex items-center gap-1">🎯 Požadavky</span>
            <span className="flex items-center gap-1">✅ Flags</span>
            <span className="flex items-center gap-1">💡 Tipy</span>
            <span className="flex items-center gap-1">🔑 Klíčová slova</span>
            <span className="flex items-center gap-1">💰 Plat</span>
            <span className="flex items-center gap-1 text-[#39ff6e]/60">📊 Match skóre</span>
          </div>
        </div>

        {/* Profile auto-loaded banner */}
        {profile && (profile.pozice || profile.dovednosti) && (
          <div className="bg-[#39ff6e]/[0.04] border border-[#39ff6e]/15 rounded-xl p-3 mb-5 flex items-center gap-3">
            <Image src="/images/3d/key.png" alt="" width={18} height={18} />
            <div className="flex-1 min-w-0">
              <p className="text-[#39ff6e]/70 text-sm font-medium">Profil načten automaticky</p>
              <p className="text-white/30 text-xs truncate">
                {[profile.pozice, profile.obor, profile.nemcina_uroven].filter(Boolean).join(' · ')}
              </p>
            </div>
            <span className="text-[#39ff6e]/60 text-[10px] bg-[#39ff6e]/[0.06] px-2 py-1 rounded-full border border-[#39ff6e]/15">Match aktivní</span>
          </div>
        )}

        <PaywallOverlay isLocked={!isActive && !loading} title="AI analýza inzerátů je součástí Premium" description="Pochop co firma hledá a jak se prezentovat">
          <div className="space-y-4">

            {/* Input mode toggle */}
            <div className="flex gap-2">
              <button onClick={() => setInputMode('text')} className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition ${inputMode === 'text' ? 'bg-[#39ff6e]/15 text-[#39ff6e] border border-[#39ff6e]/30' : 'bg-white/[0.04] text-white/40 border border-white/[0.08] hover:bg-white/[0.08]'}`}>
                📝 Vložit text
              </button>
              <button onClick={() => setInputMode('url')} className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition ${inputMode === 'url' ? 'bg-[#39ff6e]/15 text-[#39ff6e] border border-[#39ff6e]/30' : 'bg-white/[0.04] text-white/40 border border-white/[0.08] hover:bg-white/[0.08]'}`}>
                🔗 Vložit URL
              </button>
            </div>

            {/* URL input */}
            {inputMode === 'url' && (
              <div className="bg-[#111120]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Image src="/images/3d/rocket.png" alt="" width={16} height={16} />
                  <span className="text-white/50 text-xs font-bold uppercase tracking-wider">URL inzerátu</span>
                </div>
                <div className="flex gap-2">
                  <input type="url" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="https://www.jobs.ch/en/vacancies/detail/..."
                    className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:border-[#39ff6e]/40 focus:outline-none focus:shadow-[0_0_20px_rgba(57,255,110,0.05)] transition"
                    onKeyDown={(e) => e.key === 'Enter' && handleExtractUrl()} />
                  <button onClick={handleExtractUrl} disabled={extractingUrl || !jobUrl.trim()}
                    className="bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] px-5 py-3 rounded-xl text-sm font-bold hover:shadow-[0_4px_20px_rgba(57,255,110,0.3)] transition disabled:opacity-50 flex items-center gap-2 flex-shrink-0">
                    {extractingUrl ? <span className="w-4 h-4 border-2 border-[#0a0a12]/30 border-t-[#0a0a12] rounded-full animate-spin" /> : '📥'}
                    {extractingUrl ? 'Načítám' : 'Načíst'}
                  </button>
                </div>
                <p className="text-white/20 text-xs mt-2">Podporuje jobs.ch, Indeed, LinkedIn, Michael Page a další</p>
              </div>
            )}

            {/* Text input */}
            {inputMode === 'text' && (
              <div className="bg-[#111120]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Image src="/images/3d/document.png" alt="" width={16} height={16} />
                  <span className="text-white/50 text-xs font-bold uppercase tracking-wider">
                    {urlSource ? `Text z ${urlSource}` : 'Text inzerátu'}
                  </span>
                </div>
                <textarea value={jobText} onChange={(e) => setJobText(e.target.value)} placeholder={'Zkopíruj celý text inzerátu z jobs.ch, Indeed, LinkedIn...\n\nNapříklad:\nMonteur (m/w) – Stahlbau\nWir suchen einen erfahrenen Monteur für...'} rows={10}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:border-[#39ff6e]/40 focus:outline-none focus:shadow-[0_0_20px_rgba(57,255,110,0.05)] transition resize-none" />
                <p className="text-white/20 text-xs mt-1.5">{jobText.length} znaků · {jobText.length < 30 ? 'vlož celý text inzerátu' : <span className="text-[#39ff6e]/60">✓ dostatečný text</span>}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/[0.06] border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-sm">⚠️ {error}</p>
              </div>
            )}

            <button onClick={handleSubmit} disabled={generating || jobText.trim().length < 30}
              className="w-full bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] font-extrabold py-4 px-6 rounded-2xl hover:shadow-[0_4px_30px_rgba(57,255,110,0.35)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none">
              Analyzovat inzerát{profile?.pozice ? ' + porovnat s profilem' : ''}
            </button>
            <p className="text-white/20 text-xs text-center">
              {profile?.pozice
                ? 'AI vytáhne požadavky, vypočítá match skóre a poradí jak se prezentovat'
                : 'AI vytáhne požadavky, ohodnotí obtížnost a poradí jak se prezentovat'}
            </p>
          </div>
        </PaywallOverlay>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6">
            <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 text-white/30 hover:text-white text-sm transition w-full">
              <span className={`transition-transform ${showHistory ? 'rotate-90' : ''}`}>▶</span>
              <span className="font-medium">Historie analýz</span>
              <span className="text-[10px] bg-white/[0.06] px-2 py-0.5 rounded-full text-white/30 ml-1">{history.length}</span>
            </button>
            {showHistory && (
              <div className="mt-3 space-y-2">
                {history.map(item => (
                  <button key={item.id} onClick={() => loadFromHistory(item)} className="w-full bg-[#111120]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-3 text-left hover:border-white/[0.12] transition group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-white/80 text-sm font-medium truncate">{item.position || 'Neznámá pozice'}</p>
                        <p className="text-white/25 text-xs truncate">
                          {[item.company, item.location].filter(Boolean).join(' · ')}
                          {' · '}
                          {new Date(item.created_at).toLocaleDateString('cs')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.match_score !== null && (
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            item.match_score >= 75 ? 'bg-[#39ff6e]/10 text-[#39ff6e]' :
                            item.match_score >= 50 ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>{item.match_score}%</span>
                        )}
                        <button onClick={(e) => deleteFromHistory(item.id, e)} className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition p-1" title="Smazat">✕</button>
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
