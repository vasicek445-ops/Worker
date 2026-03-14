'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSubscription } from '../../../hooks/useSubscription'
import PaywallOverlay from '../../components/PaywallOverlay'
import { supabase } from '../../supabase'
import Link from 'next/link'

type Match = {
  agency_id: number
  company: string
  city: string
  canton: string
  email: string
  website: string | null
  telephone: string | null
  match_score: number
  reasoning: string
}

export default function SmartMatching() {
  const { isActive, loading: subLoading } = useSubscription()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [matching, setMatching] = useState(false)
  const [applying, setApplying] = useState<number | null>(null)
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [cached, setCached] = useState(false)
  const [matchInfo, setMatchInfo] = useState<{ excluded: number; pool: number } | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000) }

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)

      // Load already applied agencies
      const { data: apps } = await supabase
        .from('applications')
        .select('agency_id')
        .eq('user_id', user.id)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (apps) setAppliedIds(new Set(apps.map((a: any) => a.agency_id)))
      setLoading(false)
    }
    load()
  }, [])

  const runMatching = async (forceRefresh = false) => {
    setMatching(true)
    setError(null)
    setMatches([])
    setCached(false)
    setMatchInfo(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const res = await fetch('/api/matching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ forceRefresh }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Matching failed')

      setMatches(data.matches || [])
      setCached(data.cached || false)
      if (data.excluded || data.pool) setMatchInfo({ excluded: data.excluded || 0, pool: data.pool || 0 })
      if (data.matches?.length === 0) setError('Nenašli jsme žádné agentury pro tvůj profil.')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Něco se pokazilo')
    } finally {
      setMatching(false)
    }
  }

  const applyToAgency = async (match: Match) => {
    if (appliedIds.has(match.agency_id)) return
    setApplying(match.agency_id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          agency: {
            id: match.agency_id,
            company: match.company,
            email: match.email,
          },
          matchScore: match.match_score,
          matchReasoning: match.reasoning,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Application failed')

      setAppliedIds(prev => new Set([...prev, match.agency_id]))
      showToast(`Přihláška odeslána do ${match.company}!`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(err.message || 'Chyba při odesílání')
    } finally {
      setApplying(null)
    }
  }

  if (loading || subLoading) {
    return (
      <main className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/30">
          <span className="w-5 h-5 border-2 border-white/10 border-t-[#39ff6e]/50 rounded-full animate-spin" />
          Načítání...
        </div>
      </main>
    )
  }

  const profileComplete = profile?.profile_complete

  return (
    <PaywallOverlay isLocked={!isActive}>
    <main className="min-h-screen bg-[#0a0a12] px-4 py-6 pb-24 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      {/* Ambient effects */}
      <div className="fixed w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none z-0 opacity-10 -top-[200px] right-[10%]" style={{ background: "radial-gradient(circle, rgba(57,255,110,0.25), transparent 70%)" }} />
      <div className="fixed w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none z-0 opacity-8 bottom-[100px] -left-[200px]" style={{ background: "radial-gradient(circle, rgba(100,60,255,0.2), transparent 70%)" }} />

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#111120]/95 backdrop-blur-md border border-[#39ff6e]/20 text-[#39ff6e] px-6 py-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-sm font-medium max-w-sm text-center">
          {toast}
        </div>
      )}

      <div className="max-w-2xl mx-auto relative z-10">
        <Link href="/pruvodce" className="text-white/30 hover:text-white text-sm mb-6 inline-block no-underline transition">← Zpět</Link>

        {/* Hero header */}
        <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #111128 0%, #0d1a2e 40%, #0a1a14 100%)" }}>
          <Image src="/images/3d/target.png" alt="" width={120} height={120} className="absolute -right-4 -bottom-4 opacity-[0.08]" />
          <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(57,255,110,0.15), transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(100,60,255,0.1), transparent 60%)" }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <pattern id="matchGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="white"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#matchGrid)"/>
          </svg>
          <div className="relative flex items-center gap-4">
            <Image src="/images/3d/target.png" alt="" width={56} height={56} className="drop-shadow-[0_4px_20px_rgba(57,255,110,0.3)]" />
            <div>
              <h1 className="text-white text-2xl font-extrabold m-0 tracking-tight">Smart Matching</h1>
              <p className="text-white/35 text-sm m-0 mt-1">AI najde nejlepší agentury z 1000+ kontaktů pro tvůj profil</p>
            </div>
          </div>
        </div>

        {/* Profile Summary */}
        {profileComplete ? (
          <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Image src="/images/3d/key.png" alt="" width={18} height={18} />
              <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Tvůj profil</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Obor', value: profile.obor, img: '/images/3d/briefcase.png' },
                { label: 'Pozice', value: profile.pozice, img: '/images/3d/rocket.png' },
                { label: 'Kanton', value: profile.preferovany_kanton, img: '/images/3d/house.png' },
                { label: 'Němčina', value: profile.nemcina_uroven, img: '/images/3d/speech.png' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <Image src={item.img} alt="" width={24} height={24} className="opacity-60 flex-shrink-0" />
                  <div>
                    <span className="text-white/25 text-[10px] font-medium block">{item.label}</span>
                    <span className="text-white text-sm font-semibold">{item.value || '—'}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3">
              <Link href="/profil" className="text-[#39ff6e]/60 hover:text-[#39ff6e] text-xs no-underline transition">Upravit profil →</Link>
              {profile.saved_cv_html ? (
                <span className="text-[#39ff6e]/60 text-xs flex items-center gap-1.5">
                  <Image src="/images/3d/document.png" alt="" width={14} height={14} />
                  CV uloženo
                </span>
              ) : (
                <Link href="/pruvodce/sablony/cv" className="text-amber-400/60 hover:text-amber-400 text-xs no-underline transition flex items-center gap-1.5">
                  <Image src="/images/3d/document.png" alt="" width={14} height={14} className="opacity-50" />
                  Vytvořit CV →
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-amber-500/15 p-6 mb-5 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(245,158,11,0.2), transparent 70%)" }} />
            <div className="relative">
              <Image src="/images/3d/key.png" alt="" width={48} height={48} className="mx-auto mb-3 drop-shadow-lg" />
              <h3 className="text-white font-bold text-lg mb-2 m-0">Nejdřív vyplň pracovní profil</h3>
              <p className="text-white/40 text-sm mb-4 m-0">Pro Smart Matching potřebujeme znát tvůj obor, pozici, zkušenosti a preferovaný kanton.</p>
              <Link href="/profil" className="inline-block bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] px-6 py-3 rounded-xl font-extrabold text-sm no-underline hover:shadow-[0_4px_20px_rgba(57,255,110,0.3)] transition">
                Vyplnit profil →
              </Link>
            </div>
          </div>
        )}

        {/* Match Button */}
        {profileComplete && matches.length === 0 && (
          <button
            onClick={() => runMatching()}
            disabled={matching}
            className="w-full relative overflow-hidden bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] font-extrabold py-4 px-6 rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_4px_30px_rgba(57,255,110,0.35)] hover:scale-[1.02] active:scale-[0.98] text-base mb-6"
          >
            {matching ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-[#0a0a12]/30 border-t-[#0a0a12] rounded-full animate-spin" />
                AI hledá nejlepší agentury...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2.5">
                <Image src="/images/3d/target.png" alt="" width={22} height={22} />
                Najít nejlepší agentury pro mě
              </span>
            )}
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/[0.06] border border-red-500/20 rounded-2xl p-4 mb-6 text-center">
            <p className="text-red-400 text-sm m-0">{error}</p>
            <button onClick={() => runMatching()} className="text-red-400/60 text-xs mt-2 hover:text-red-400 transition underline">Zkusit znovu</button>
          </div>
        )}

        {/* Results */}
        {matches.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg m-0 flex items-center gap-2">
                <Image src="/images/3d/star.png" alt="" width={22} height={22} className="drop-shadow-lg" />
                Nalezeno {matches.length} agentur
              </h2>
              <button onClick={() => runMatching(true)} disabled={matching} className="text-[#39ff6e]/60 text-xs font-medium hover:text-[#39ff6e] transition">
                {matching ? 'Hledám...' : 'Nové hledání'}
              </button>
            </div>

            <div className="space-y-3">
              {matches.map((match) => {
                const isApplied = appliedIds.has(match.agency_id)
                const isApplying = applying === match.agency_id

                return (
                  <div key={match.agency_id} className={`bg-[#111120]/80 backdrop-blur-sm border rounded-2xl p-5 transition-all hover:bg-[#111120] ${isApplied ? 'border-[#39ff6e]/20' : 'border-white/[0.06]'}`}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 mr-3">
                        <h4 className="text-white font-bold text-base leading-tight mb-1 m-0">{match.company}</h4>
                        <p className="text-white/30 text-sm m-0">{match.city} · {match.canton}</p>
                      </div>
                      <div className={`rounded-2xl w-14 h-14 flex flex-col items-center justify-center flex-shrink-0 relative overflow-hidden ${
                        match.match_score >= 85 ? 'bg-[#39ff6e]/15 border border-[#39ff6e]/30' :
                        match.match_score >= 75 ? 'bg-blue-500/15 border border-blue-500/30' : 'bg-amber-500/15 border border-amber-500/30'
                      }`}>
                        <span className={`text-sm font-black leading-none ${
                          match.match_score >= 85 ? 'text-[#39ff6e]' :
                          match.match_score >= 75 ? 'text-blue-400' : 'text-amber-400'
                        }`}>{match.match_score}%</span>
                        <span className={`text-[8px] leading-none mt-0.5 ${
                          match.match_score >= 85 ? 'text-[#39ff6e]/60' :
                          match.match_score >= 75 ? 'text-blue-400/60' : 'text-amber-400/60'
                        }`}>match</span>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <p className="text-white/40 text-xs mb-4 leading-relaxed m-0">{match.reasoning}</p>

                    {/* Contact info */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {match.telephone && (
                        <a href={`tel:${match.telephone}`} className="bg-white/[0.03] border border-white/[0.08] text-white/40 rounded-xl px-3 py-1.5 text-xs no-underline hover:border-white/[0.15] hover:text-white/60 transition flex items-center gap-1.5">
                          <Image src="/images/3d/speech.png" alt="" width={12} height={12} className="opacity-60" />
                          {match.telephone}
                        </a>
                      )}
                      {match.website && (
                        <a href={match.website} target="_blank" rel="noopener noreferrer" className="bg-white/[0.03] border border-white/[0.08] text-white/40 rounded-xl px-3 py-1.5 text-xs no-underline hover:border-white/[0.15] hover:text-white/60 transition flex items-center gap-1.5">
                          <Image src="/images/3d/star.png" alt="" width={12} height={12} className="opacity-60" />
                          Web
                        </a>
                      )}
                    </div>

                    {/* Apply button */}
                    {isApplied ? (
                      <div className="flex items-center justify-center gap-2 bg-[#39ff6e]/[0.06] border border-[#39ff6e]/20 text-[#39ff6e] py-3 rounded-xl text-sm font-bold">
                        <Image src="/images/3d/handshake.png" alt="" width={18} height={18} />
                        Přihláška odeslána
                      </div>
                    ) : (
                      <button
                        onClick={() => applyToAgency(match)}
                        disabled={isApplying}
                        className="w-full bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] py-3 rounded-xl text-sm font-extrabold hover:shadow-[0_4px_20px_rgba(57,255,110,0.25)] transition-all disabled:opacity-30 hover:scale-[1.01] active:scale-[0.99]"
                      >
                        {isApplying ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-[#0a0a12]/30 border-t-[#0a0a12] rounded-full animate-spin" />
                            Generuji dopis a odesílám...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Image src="/images/3d/envelope.png" alt="" width={16} height={16} />
                            Přihlásit se jedním klikem
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="bg-[#111120]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5 mt-5 text-center">
              {cached && (
                <p className="text-white/20 text-xs m-0 mb-2">
                  Výsledky z cache · <button onClick={() => runMatching(true)} className="text-[#39ff6e]/50 hover:text-[#39ff6e] underline transition">Hledat znovu</button>
                </p>
              )}
              <p className="text-white/40 text-sm m-0">
                Odesláno: <span className="text-[#39ff6e] font-bold">{appliedIds.size}</span> přihlášek
                {matchInfo && <span className="text-white/20 ml-2">· Prohledáno {matchInfo.pool} agentur{matchInfo.excluded > 0 && ` · ${matchInfo.excluded} vyloučeno`}</span>}
              </p>
              <Link href="/prihlasky" className="text-[#39ff6e]/60 hover:text-[#39ff6e] text-xs mt-2 inline-block no-underline transition">
                Zobrazit všechny přihlášky →
              </Link>
            </div>
          </div>
        )}

        {/* How it works */}
        {matches.length === 0 && !matching && profileComplete && (
          <div className="bg-[#111120]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/images/3d/rocket.png" alt="" width={18} height={18} />
              <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Jak to funguje</span>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { step: '1', text: 'AI analyzuje tvůj profil a vybere top agentury z 1000+ kontaktů', img: '/images/3d/target.png' },
                { step: '2', text: 'Uvidíš ranking s match score a zdůvodněním', img: '/images/3d/star.png' },
                { step: '3', text: 'Klikneš "Přihlásit se" → AI vygeneruje motivační dopis v němčině a odešle email', img: '/images/3d/envelope.png' },
                { step: '4', text: 'Agentura ti odpoví přímo na tvůj email', img: '/images/3d/handshake.png' },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition">
                  <div className="w-8 h-8 rounded-xl bg-[#39ff6e]/[0.08] border border-[#39ff6e]/20 flex items-center justify-center flex-shrink-0">
                    <Image src={item.img} alt="" width={16} height={16} />
                  </div>
                  <div className="flex-1">
                    <span className="text-[#39ff6e]/50 text-[10px] font-bold">Krok {item.step}</span>
                    <p className="text-white/50 text-sm m-0">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
    </PaywallOverlay>
  )
}
