'use client'

import { useState, useEffect, useRef } from 'react'
import { useSubscription } from '../../../../hooks/useSubscription'
import PaywallOverlay from '../../../components/PaywallOverlay'
import { supabase } from '../../../supabase'
import Link from 'next/link'
import Image from 'next/image'

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
  good: { emoji: '✅', label: 'Dobrá smlouva', color: 'text-[#39ff6e]', bg: 'bg-[#39ff6e]/[0.06] border-[#39ff6e]/20', glow: 'shadow-[0_0_30px_rgba(57,255,110,0.15)]' },
  acceptable: { emoji: '👍', label: 'Přijatelná', color: 'text-blue-400', bg: 'bg-blue-500/[0.06] border-blue-500/20', glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]' },
  caution: { emoji: '⚠️', label: 'Pozor – jsou problémy', color: 'text-yellow-400', bg: 'bg-yellow-500/[0.06] border-yellow-500/20', glow: 'shadow-[0_0_30px_rgba(234,179,8,0.15)]' },
  bad: { emoji: '🚫', label: 'Nevýhodná smlouva', color: 'text-red-400', bg: 'bg-red-500/[0.06] border-red-500/20', glow: 'shadow-[0_0_30px_rgba(248,113,113,0.15)]' },
}

const STATUS_STYLE = {
  ok: { icon: '✅', border: 'border-l-[#39ff6e]/40' },
  warning: { icon: '⚠️', border: 'border-l-yellow-400/40' },
  danger: { icon: '🚫', border: 'border-l-red-400/40' },
}

const PROGRESS_STEPS = [
  { label: 'Čtu smlouvu', icon: '📖' },
  { label: 'Překládám klauzule', icon: '🔄' },
  { label: 'Hledám problémy', icon: '🚩' },
  { label: 'Porovnávám se standardem', icon: '🇨🇭' },
  { label: 'Generuji doporučení', icon: '💡' },
]

type ResultTab = 'overview' | 'clauses' | 'problems' | 'positive' | 'standard' | 'negotiate'

export default function SmlouvaPage() {
  const { isActive, loading } = useSubscription()
  const [contractText, setContractText] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [result, setResult] = useState<ContractData | null>(null)
  const [generating, setGenerating] = useState(false)
  const [progressStep, setProgressStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ResultTab>('overview')
  const [dragOver, setDragOver] = useState(false)
  const dropRef = useRef<HTMLLabelElement>(null)

  // Restore from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('woker-last-contract')
      if (saved) {
        const { result: savedResult, contractText: savedText } = JSON.parse(saved)
        if (savedResult) { setResult(savedResult); setContractText(savedText || '') }
      }
    } catch { /* ignore */ }
  }, [])

  // Save to sessionStorage
  useEffect(() => {
    if (result) {
      sessionStorage.setItem('woker-last-contract', JSON.stringify({ result, contractText }))
    }
  }, [result, contractText])

  // Progress animation
  useEffect(() => {
    if (!generating) { setProgressStep(0); return }
    const interval = setInterval(() => {
      setProgressStep(prev => prev < PROGRESS_STEPS.length - 1 ? prev + 1 : prev)
    }, 3000)
    return () => clearInterval(interval)
  }, [generating])

  // Speech synthesis for German clauses
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'de-DE'
    utterance.rate = 0.85
    const voices = window.speechSynthesis.getVoices()
    const deVoice = voices.find(v => v.lang.startsWith('de'))
    if (deVoice) utterance.voice = deVoice
    window.speechSynthesis.speak(utterance)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    processFiles(Array.from(files))
    e.target.value = ''
  }

  const processFiles = (files: File[]) => {
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) { setError('Max. velikost obrázku je 10 MB'); return }
      if (!file.type.startsWith('image/')) { setError('Nahrávej pouze obrázky (JPG, PNG)'); return }
      const reader = new FileReader()
      reader.onloadend = () => setImages(prev => [...prev, reader.result as string])
      reader.readAsDataURL(file)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length > 0) processFiles(files)
  }

  const removeImage = (idx: number) => setImages(prev => prev.filter((_, i) => i !== idx))

  const handleSubmit = async () => {
    if (contractText.trim().length < 50 && images.length === 0) { setError('Vlož text smlouvy nebo nahraj fotku'); return }
    setGenerating(true); setError(null); setProgressStep(0)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) { setError('Musíš být přihlášen'); setGenerating(false); return }
      const res = await fetch('/api/analyze-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ contractText: contractText || undefined, contractImage: images.length > 0 ? images : undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analýza selhala')
      setResult(data.contractData)
      setActiveTab('overview')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Něco se pokazilo')
    } finally { setGenerating(false) }
  }

  const handleDownloadPdf = () => {
    if (!result) return
    const rating = RATING[result.overall_rating as keyof typeof RATING] || RATING.acceptable

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Analýza smlouvy – ${result.overview.position}</title>
<style>body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;color:#222;line-height:1.5}
h1{color:#0a6e2a;font-size:22px;border-bottom:2px solid #39ff6e;padding-bottom:8px}
h2{color:#333;font-size:16px;margin-top:24px;border-bottom:1px solid #ddd;padding-bottom:4px}
.rating{padding:12px 16px;border-radius:8px;margin:16px 0;font-weight:bold;font-size:15px}
.good{background:#e8f5e9;color:#2e7d32}.acceptable{background:#e3f2fd;color:#1565c0}
.caution{background:#fff3e0;color:#e65100}.bad{background:#ffebee;color:#c62828}
.overview{display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#f8f9fa;padding:12px;border-radius:8px;margin:12px 0}
.overview span{font-size:11px;color:#888}.overview p{margin:0;font-size:13px}
.term{border-left:3px solid #39ff6e;padding:8px 12px;margin:8px 0;background:#f8f9fa;border-radius:0 6px 6px 0}
.term.warning{border-left-color:#ffc107}.term.danger{border-left-color:#f44336}
.flag{padding:8px 12px;margin:6px 0;border-radius:6px;font-size:13px}
.red{background:#fff5f5;border:1px solid #fee}.green{background:#f0fff0;border:1px solid #e0ffe0}
.tip{padding:6px 12px;margin:4px 0;background:#fffde7;border-radius:6px;font-size:13px}
table{width:100%;border-collapse:collapse;margin:12px 0}td{padding:8px;border-bottom:1px solid #eee;font-size:13px}
td:first-child{font-weight:bold;width:140px;color:#666}
.footer{text-align:center;margin-top:30px;color:#aaa;font-size:11px}
</style></head><body>
<h1>Analýza pracovní smlouvy</h1>
<div class="rating ${result.overall_rating}">${rating.emoji} ${rating.label}</div>
<p>${result.overall_summary}</p>
<h2>Přehled smlouvy</h2>
<div class="overview">
<div><span>Zaměstnavatel</span><p>${result.overview.employer}</p></div>
<div><span>Pozice</span><p>${result.overview.position}</p></div>
<div><span>Místo</span><p>${result.overview.location}</p></div>
<div><span>Nástup</span><p>${result.overview.start_date}</p></div>
<div><span>Typ</span><p>${result.overview.contract_type}</p></div>
<div><span>Úvazek</span><p>${result.overview.workload}</p></div>
<div style="grid-column:span 2"><span>Hrubá mzda</span><p style="font-size:16px;font-weight:bold">${result.overview.salary_gross}</p></div>
${result.overview.salary_info ? `<div style="grid-column:span 2"><span>Mzdové info</span><p>${result.overview.salary_info}</p></div>` : ''}
</div>
<h2>Klíčové klauzule</h2>
${result.key_terms.map(t => `<div class="term ${t.status}"><strong>${t.term_name}</strong>${t.term_de ? ` <em style="color:#888;font-size:12px">„${t.term_de}"</em>` : ''}<br><span style="font-size:13px">${t.translation}</span><br><span style="font-size:12px;color:#666">${t.explanation}</span><br><span style="font-size:11px;color:${t.status === 'ok' ? '#2e7d32' : t.status === 'warning' ? '#e65100' : '#c62828'}">${t.status_reason}</span></div>`).join('')}
${result.red_flags.length > 0 ? `<h2>Red flags</h2>${result.red_flags.map(f => `<div class="flag red"><strong>${f.issue}</strong><br>${f.detail}<br><em style="font-size:12px">Doporučení: ${f.recommendation}</em></div>`).join('')}` : ''}
${result.green_flags.length > 0 ? `<h2>Pozitivní body</h2>${result.green_flags.map(f => `<div class="flag green"><strong>${f.positive}</strong><br>${f.detail}</div>`).join('')}` : ''}
${result.missing_items.length > 0 ? `<h2>Co ve smlouvě chybí</h2>${result.missing_items.map(m => `<div class="flag red"><strong>${m.item}</strong> (${m.importance === 'high' ? 'Důležité' : m.importance === 'medium' ? 'Střední' : 'Nízké'})<br>${m.recommendation}</div>`).join('')}` : ''}
<h2>Porovnání se švýcarským standardem</h2>
<table>
<tr><td>Zkušební doba</td><td>${result.swiss_comparison.probation}</td></tr>
<tr><td>Výpovědní lhůta</td><td>${result.swiss_comparison.notice_period}</td></tr>
<tr><td>Dovolená</td><td>${result.swiss_comparison.vacation}</td></tr>
<tr><td>Přesčasy</td><td>${result.swiss_comparison.overtime}</td></tr>
<tr><td>13. plat</td><td>${result.swiss_comparison.thirteenth_salary}</td></tr>
</table>
${result.negotiate_tips.length > 0 ? `<h2>Co si vyjednat</h2>${result.negotiate_tips.map((t, i) => `<div class="tip">${i + 1}. ${t}</div>`).join('')}` : ''}
<div class="footer">Vygenerováno pomocí Woker AI · gowoker.com</div>
</body></html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `smlouva-analyza-${result.overview.position?.replace(/\s+/g, '-').toLowerCase() || 'export'}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Ambient background ───
  const ambientBg = (
    <>
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[rgba(57,255,110,0.10)] blur-[180px] pointer-events-none z-0" />
      <div className="fixed bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[rgba(100,60,255,0.08)] blur-[160px] pointer-events-none z-0" />
    </>
  )

  // Tab config
  const tabs: { key: ResultTab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Přehled', icon: '📋' },
    { key: 'clauses', label: 'Klauzule', icon: '📖' },
    { key: 'problems', label: 'Problémy', icon: '🚩' },
    { key: 'positive', label: 'Pozitivní', icon: '✅' },
    { key: 'standard', label: 'Standard', icon: '🇨🇭' },
    { key: 'negotiate', label: 'Vyjednání', icon: '🤝' },
  ]

  // ─── RESULTS ───
  if (result) {
    const rating = RATING[result.overall_rating as keyof typeof RATING] || RATING.acceptable
    const problemCount = result.red_flags.length + result.missing_items.length

    return (
      <main className="min-h-screen bg-[#0a0a12] px-4 py-6 pb-24 relative overflow-hidden">
        {ambientBg}
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-5">
            <Link href="/pruvodce/sablony" className="text-white/30 hover:text-white text-sm transition">← Zpět</Link>
            <div className="flex gap-2">
              <button onClick={handleDownloadPdf} className="text-white/40 hover:text-white text-xs px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-xl transition hover:bg-white/[0.08]">📥 PDF</button>
              <button onClick={() => { setResult(null); sessionStorage.removeItem('woker-last-contract') }} className="text-white/40 hover:text-white text-xs px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-xl transition hover:bg-white/[0.08]">Nová smlouva</button>
            </div>
          </div>

          {/* Overall rating card */}
          <div className={`bg-[#111120]/80 backdrop-blur-sm border rounded-2xl p-5 mb-5 ${rating.bg} ${rating.glow}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{rating.emoji}</span>
              <div>
                <h1 className={`text-lg font-bold ${rating.color}`}>{rating.label}</h1>
                <p className="text-white/30 text-xs">{result.overview.employer} · {result.overview.position}</p>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mt-2">{result.overall_summary}</p>
          </div>

          {/* Tab navigation */}
          <div className="bg-[#111120]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-2 mb-5 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'bg-[#39ff6e]/15 text-[#39ff6e] border border-[#39ff6e]/30'
                      : 'text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
                  }`}>
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.key === 'problems' && problemCount > 0 && (
                    <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{problemCount}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* TAB: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="bg-[#111120]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Image src="/images/3d/briefcase.png" alt="" width={18} height={18} />
                  <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Přehled smlouvy</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-white/25 text-xs block">Zaměstnavatel</span><span className="text-white/80">{result.overview.employer}</span></div>
                  <div><span className="text-white/25 text-xs block">Pozice</span><span className="text-white/80">{result.overview.position}</span></div>
                  <div><span className="text-white/25 text-xs block">Místo</span><span className="text-white/80">{result.overview.location}</span></div>
                  <div><span className="text-white/25 text-xs block">Nástup</span><span className="text-white/80">{result.overview.start_date}</span></div>
                  <div><span className="text-white/25 text-xs block">Typ smlouvy</span><span className="text-white/80">{result.overview.contract_type}</span></div>
                  <div><span className="text-white/25 text-xs block">Úvazek</span><span className="text-white/80">{result.overview.workload}</span></div>
                  <div className="col-span-2">
                    <span className="text-white/25 text-xs block">Hrubá mzda</span>
                    <span className="text-[#39ff6e] text-lg font-bold">{result.overview.salary_gross}</span>
                  </div>
                  {result.overview.salary_info && (
                    <div className="col-span-2"><span className="text-white/25 text-xs block">Mzdové info</span><span className="text-white/50 text-sm">{result.overview.salary_info}</span></div>
                  )}
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#39ff6e]/[0.04] border border-[#39ff6e]/15 rounded-xl p-3 text-center">
                  <span className="text-[#39ff6e] text-xl font-bold block">{result.green_flags.length}</span>
                  <span className="text-white/30 text-[10px] uppercase tracking-wider">Pozitivní</span>
                </div>
                <div className="bg-red-500/[0.04] border border-red-500/15 rounded-xl p-3 text-center">
                  <span className="text-red-400 text-xl font-bold block">{result.red_flags.length}</span>
                  <span className="text-white/30 text-[10px] uppercase tracking-wider">Problémy</span>
                </div>
                <div className="bg-yellow-500/[0.04] border border-yellow-500/15 rounded-xl p-3 text-center">
                  <span className="text-yellow-400 text-xl font-bold block">{result.missing_items.length}</span>
                  <span className="text-white/30 text-[10px] uppercase tracking-wider">Chybí</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Clauses */}
          {activeTab === 'clauses' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Image src="/images/3d/document.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Klíčové klauzule ({result.key_terms.length})</span>
              </div>
              {result.key_terms.map((t, i) => {
                const st = STATUS_STYLE[t.status as keyof typeof STATUS_STYLE] || STATUS_STYLE.ok
                return (
                  <div key={i} className={`bg-[#111120]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-3 border-l-4 ${st.border}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs">{st.icon}</span>
                      <span className="text-white/90 text-sm font-semibold flex-1">{t.term_name}</span>
                    </div>
                    {t.term_de && (
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white/20 text-xs italic flex-1">&bdquo;{t.term_de}&ldquo;</p>
                        <button onClick={() => speakText(t.term_de)} className="text-white/20 hover:text-[#39ff6e] transition p-1 flex-shrink-0" title="Poslechnout výslovnost">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" /></svg>
                        </button>
                      </div>
                    )}
                    <p className="text-white/60 text-sm mb-1">{t.translation}</p>
                    <p className="text-white/30 text-xs leading-relaxed">{t.explanation}</p>
                    <p className={`text-xs mt-1.5 ${t.status === 'ok' ? 'text-[#39ff6e]/60' : t.status === 'warning' ? 'text-yellow-400/60' : 'text-red-400/60'}`}>{t.status_reason}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* TAB: Problems */}
          {activeTab === 'problems' && (
            <div className="space-y-5">
              {result.red_flags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Image src="/images/3d/target.png" alt="" width={18} height={18} />
                    <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Red flags ({result.red_flags.length})</span>
                  </div>
                  <div className="space-y-2">
                    {result.red_flags.map((f, i) => (
                      <div key={i} className="bg-red-500/[0.04] border border-red-500/10 rounded-xl p-4 backdrop-blur-sm">
                        <h3 className="text-red-400 text-sm font-bold mb-1">{f.issue}</h3>
                        <p className="text-white/30 text-xs leading-relaxed mb-2">{f.detail}</p>
                        <div className="flex items-start gap-2 bg-red-500/[0.06] rounded-lg p-2.5">
                          <span className="text-xs mt-0.5">💡</span>
                          <p className="text-red-300/70 text-xs">{f.recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.missing_items.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Image src="/images/3d/key.png" alt="" width={18} height={18} />
                    <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Co ve smlouvě chybí ({result.missing_items.length})</span>
                  </div>
                  <div className="space-y-2">
                    {result.missing_items.map((m, i) => (
                      <div key={i} className="bg-[#111120]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-3 flex items-start gap-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                          m.importance === 'high' ? 'bg-red-500/10 text-red-400' :
                          m.importance === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-white/[0.06] text-white/40'
                        }`}>
                          {m.importance === 'high' ? 'Důležité' : m.importance === 'medium' ? 'Střední' : 'Nízké'}
                        </span>
                        <div>
                          <p className="text-white/80 text-sm">{m.item}</p>
                          <p className="text-white/25 text-xs mt-0.5">{m.recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.red_flags.length === 0 && result.missing_items.length === 0 && (
                <div className="bg-[#39ff6e]/[0.04] border border-[#39ff6e]/15 rounded-2xl p-8 text-center">
                  <span className="text-4xl block mb-3">🎉</span>
                  <p className="text-[#39ff6e]/70 font-bold">Žádné problémy nenalezeny</p>
                  <p className="text-white/25 text-sm mt-1">Smlouva vypadá v pořádku</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: Positive */}
          {activeTab === 'positive' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Image src="/images/3d/shield.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Pozitivní body ({result.green_flags.length})</span>
              </div>
              {result.green_flags.length > 0 ? (
                <div className="space-y-2">
                  {result.green_flags.map((f, i) => (
                    <div key={i} className="bg-[#39ff6e]/[0.04] border border-[#39ff6e]/10 rounded-xl p-3 backdrop-blur-sm">
                      <h3 className="text-[#39ff6e]/80 text-sm font-semibold">{f.positive}</h3>
                      <p className="text-white/25 text-xs mt-0.5">{f.detail}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#111120]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 text-center">
                  <p className="text-white/30 text-sm">Žádné výrazné pozitivní body nebyly identifikovány</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: Swiss Standard */}
          {activeTab === 'standard' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Image src="/images/3d/crown.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Porovnání se švýcarským standardem</span>
              </div>
              <div className="bg-[#111120]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl divide-y divide-white/[0.04]">
                {Object.entries(result.swiss_comparison).map(([key, value]) => {
                  const labels: Record<string, string> = { probation: 'Zkušební doba', notice_period: 'Výpovědní lhůta', vacation: 'Dovolená', overtime: 'Přesčasy', thirteenth_salary: '13. plat' }
                  const icons: Record<string, string> = { probation: '⏱️', notice_period: '📅', vacation: '🏖️', overtime: '⏰', thirteenth_salary: '💰' }
                  return (
                    <div key={key} className="p-3.5 flex items-start gap-3">
                      <span className="text-sm flex-shrink-0 mt-0.5">{icons[key] || '📌'}</span>
                      <div className="flex-1">
                        <span className="text-white/40 text-xs font-medium block mb-0.5">{labels[key] || key}</span>
                        <span className="text-white/70 text-sm">{value}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB: Negotiate */}
          {activeTab === 'negotiate' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Image src="/images/3d/handshake.png" alt="" width={18} height={18} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Co si vyjednat ({result.negotiate_tips.length})</span>
              </div>
              {result.negotiate_tips.length > 0 ? (
                <div className="bg-[#111120]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4 space-y-2">
                  {result.negotiate_tips.map((t, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/[0.02] transition">
                      <span className="text-yellow-400/60 text-xs mt-0.5 font-bold">{i + 1}.</span>
                      <p className="text-white/60 text-sm">{t}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#111120]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 text-center">
                  <p className="text-white/30 text-sm">Žádné specifické vyjednávací tipy</p>
                </div>
              )}
            </div>
          )}

          {/* CTA buttons */}
          <div className="space-y-2.5 mt-8">
            <p className="text-white/20 text-xs text-center mb-2">Pokračuj s daty ze smlouvy</p>
            <Link href={`/pruvodce/sablony/email?prefill=${encodeURIComponent(JSON.stringify({ position: result.overview.position || '', company: result.overview.employer || '' }))}`}
              className="block w-full bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] font-extrabold py-4 px-6 rounded-2xl text-center hover:shadow-[0_4px_30px_rgba(57,255,110,0.35)] hover:scale-[1.02] transition-all">
              📧 Napsat email zaměstnavateli
            </Link>
            <Link href={`/pruvodce/sablony/pohovor?prefill=${encodeURIComponent(JSON.stringify({ position: result.overview.position || '', company: result.overview.employer || '' }))}`}
              className="block w-full bg-white/[0.04] text-white font-bold py-3.5 px-6 rounded-2xl text-center border border-white/[0.08] hover:bg-white/[0.08] transition-all">
              🎤 Připravit se na pohovor
            </Link>
          </div>

          <button onClick={() => { setResult(null); setContractText(''); setImages([]); sessionStorage.removeItem('woker-last-contract') }}
            className="w-full text-white/30 hover:text-white text-sm py-3 mt-3 transition">
            Analyzovat jinou smlouvu
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
                <h2 className="text-white text-lg font-bold">Analyzuji smlouvu</h2>
                <p className="text-white/30 text-sm mt-1">Tohle trvá 15-20 sekund</p>
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
            <Image src="/images/3d/shield.png" alt="" width={36} height={36} />
            <div>
              <h1 className="text-white text-xl font-bold">AI analýza pracovní smlouvy</h1>
              <p className="text-white/30 text-xs">Vlož text nebo fotku smlouvy → AI přeloží, vysvětlí a upozorní na problémy</p>
            </div>
          </div>
        </div>

        {/* Feature badges */}
        <div className="bg-[#111120]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-3 mb-5">
          <div className="flex items-center gap-3 text-xs text-white/40 flex-wrap">
            <span className="flex items-center gap-1">📖 Překlad</span>
            <span className="flex items-center gap-1">🚩 Red flags</span>
            <span className="flex items-center gap-1">🇨🇭 Standard</span>
            <span className="flex items-center gap-1">🤝 Vyjednání</span>
            <span className="flex items-center gap-1">✅ Hodnocení</span>
            <span className="flex items-center gap-1 text-[#39ff6e]/60">🔊 Výslovnost</span>
          </div>
        </div>

        <PaywallOverlay isLocked={!isActive && !loading} title="AI analýza smluv je součástí Premium" description="Porozuměj své pracovní smlouvě v němčině">
          <div className="space-y-4">

            {/* Image upload with drag & drop */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Image src="/images/3d/rocket.png" alt="" width={16} height={16} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Nahraj fotku smlouvy (volitelné)</span>
              </div>
              <label ref={dropRef}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`w-full flex flex-col items-center justify-center py-6 rounded-2xl cursor-pointer transition-all ${
                  dragOver
                    ? 'bg-[#39ff6e]/[0.08] border-2 border-dashed border-[#39ff6e]/40 shadow-[0_0_30px_rgba(57,255,110,0.1)]'
                    : 'bg-[#111120]/80 backdrop-blur-sm border-2 border-dashed border-white/[0.08] hover:border-white/[0.15]'
                }`}>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                <span className="text-2xl mb-1">{dragOver ? '📥' : '📷'}</span>
                <span className="text-white/40 text-sm">{dragOver ? 'Pusť pro nahrání' : 'Klikni nebo přetáhni fotky'}</span>
                <p className="text-white/20 text-xs mt-1">JPG, PNG · max. 10 MB · více stránek</p>
              </label>
              {images.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Strana ${i + 1}`} className="w-20 h-28 object-cover rounded-xl border border-white/[0.08]" />
                      <button onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">×</button>
                      <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-black/70 text-white px-1 rounded">{i + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {images.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-white/20 text-xs">nebo vlož text</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
            )}

            {/* Text input */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Image src="/images/3d/document.png" alt="" width={16} height={16} />
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Text smlouvy {images.length === 0 ? '*' : '(volitelné)'}</span>
              </div>
              <textarea value={contractText} onChange={(e) => setContractText(e.target.value)}
                placeholder={'Zkopíruj text smlouvy v němčině...\n\nArbeitsvertrag\nzwischen [Firma] als Arbeitgeber\nund [Jméno] als Arbeitnehmer\n\n1. Beginn und Dauer\nDas Arbeitsverhältnis beginnt am...'}
                rows={10}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:border-[#39ff6e]/40 focus:outline-none focus:shadow-[0_0_20px_rgba(57,255,110,0.05)] transition resize-none" />
              <p className="text-white/20 text-xs mt-1.5">
                {contractText.length} znaků
                {images.length > 0 ? ` · ${images.length} fotk${images.length === 1 ? 'a' : images.length < 5 ? 'y' : 'ek'}` : ''}
                {contractText.length < 50 && images.length === 0 ? ' · vlož text nebo nahraj fotku' : ''}
                {(contractText.length >= 50 || images.length > 0) && <span className="text-[#39ff6e]/60"> · ✓ připraveno k analýze</span>}
              </p>
            </div>

            <div className="bg-[#39ff6e]/[0.04] border border-[#39ff6e]/15 rounded-xl p-3">
              <p className="text-[#39ff6e]/60 text-xs">💡 Tip: Smlouvu můžeš vyfotit telefonem, udělat screenshot nebo zkopírovat text z PDF/emailu. Při fotce nahraj všechny stránky.</p>
            </div>

            {error && (
              <div className="bg-red-500/[0.06] border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-sm">⚠️ {error}</p>
              </div>
            )}

            <button onClick={handleSubmit} disabled={generating || (contractText.trim().length < 50 && images.length === 0)}
              className="w-full bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] font-extrabold py-4 px-6 rounded-2xl hover:shadow-[0_4px_30px_rgba(57,255,110,0.35)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none">
              Analyzovat smlouvu
            </button>
            <p className="text-white/20 text-xs text-center">AI přečte text z fotky nebo vloženého textu, přeloží a porovná se švýcarským standardem</p>
          </div>
        </PaywallOverlay>
      </div>
    </main>
  )
}
