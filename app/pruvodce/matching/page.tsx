'use client'

import { useState, useEffect } from 'react'
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
  const [profile, setProfile] = useState<any>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [matching, setMatching] = useState(false)
  const [applying, setApplying] = useState<number | null>(null)
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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

      if (apps) setAppliedIds(new Set(apps.map((a: any) => a.agency_id)))
      setLoading(false)
    }
    load()
  }, [])

  const runMatching = async () => {
    setMatching(true)
    setError(null)
    setMatches([])
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const res = await fetch('/api/matching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Matching failed')

      setMatches(data.matches || [])
      if (data.matches?.length === 0) setError('Nenašli jsme žádné agentury pro tvůj profil.')
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
    } catch (err: any) {
      showToast(err.message || 'Chyba při odesílání')
    } finally {
      setApplying(null)
    }
  }

  if (loading || subLoading) {
    return <main className="min-h-screen bg-[#0E0E0E] flex items-center justify-center"><div className="animate-pulse text-gray-500">Načítání...</div></main>
  }

  const profileComplete = profile?.profile_complete

  return (
    <PaywallOverlay isLocked={!isActive}>
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24 relative">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a2e] border border-green-500/20 text-green-400 px-6 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm text-center">
          {toast}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <Link href="/pruvodce" className="text-gray-500 hover:text-white text-sm mb-4 inline-block">← Zpět</Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xl">🎯</div>
          <div>
            <h1 className="text-white text-2xl font-black m-0">Smart Matching</h1>
            <p className="text-gray-500 text-sm m-0">AI najde nejlepší agentury pro tvůj profil</p>
          </div>
        </div>

        {/* Profile Summary */}
        {profileComplete ? (
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-4 mt-6 mb-6">
            <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-3">Tvůj profil</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-gray-500 text-xs">Obor</span>
                <p className="text-white text-sm font-medium m-0">{profile.obor}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Pozice</span>
                <p className="text-white text-sm font-medium m-0">{profile.pozice}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Kanton</span>
                <p className="text-white text-sm font-medium m-0">{profile.preferovany_kanton}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Němčina</span>
                <p className="text-white text-sm font-medium m-0">{profile.nemcina_uroven}</p>
              </div>
            </div>
            <Link href="/profil" className="text-blue-400 text-xs mt-3 inline-block hover:text-blue-300">Upravit profil →</Link>
          </div>
        ) : (
          <div className="bg-[#1A1A1A] border border-yellow-500/20 rounded-2xl p-6 mt-6 mb-6 text-center">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-white font-bold text-lg mb-2">Nejdřív vyplň pracovní profil</h3>
            <p className="text-gray-400 text-sm mb-4">Pro Smart Matching potřebujeme znát tvůj obor, pozici, zkušenosti a preferovaný kanton.</p>
            <Link href="/profil" className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm">
              Vyplnit profil →
            </Link>
          </div>
        )}

        {/* Match Button */}
        {profileComplete && matches.length === 0 && (
          <button
            onClick={runMatching}
            disabled={matching}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 rounded-2xl hover:opacity-90 transition disabled:opacity-50 text-base mb-6"
          >
            {matching ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                AI hledá nejlepší agentury...
              </span>
            ) : (
              '🎯 Najít nejlepší agentury pro mě'
            )}
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-center">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={runMatching} className="text-red-400 text-xs underline mt-2">Zkusit znovu</button>
          </div>
        )}

        {/* Results */}
        {matches.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Nalezeno {matches.length} agentur</h2>
              <button onClick={runMatching} disabled={matching} className="text-blue-400 text-xs font-medium hover:text-blue-300">
                {matching ? 'Hledám...' : 'Hledat znovu'}
              </button>
            </div>

            <div className="space-y-3">
              {matches.map((match) => {
                const isApplied = appliedIds.has(match.agency_id)
                const isApplying = applying === match.agency_id

                return (
                  <div key={match.agency_id} className={`bg-[#1A1A1A] border rounded-2xl p-4 transition ${isApplied ? 'border-green-500/30' : 'border-gray-800'}`}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 mr-3">
                        <h4 className="text-white font-bold text-base leading-tight mb-0.5">{match.company}</h4>
                        <p className="text-gray-500 text-sm m-0">{match.city} • {match.canton}</p>
                      </div>
                      <div className={`rounded-full w-12 h-12 flex flex-col items-center justify-center flex-shrink-0 ${
                        match.match_score >= 85 ? 'bg-green-500' :
                        match.match_score >= 75 ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}>
                        <span className="text-white text-xs font-black leading-none">{match.match_score}%</span>
                        <span className="text-white/80 text-[8px] leading-none">match</span>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <p className="text-gray-400 text-xs mb-3 leading-relaxed">{match.reasoning}</p>

                    {/* Contact info */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {match.telephone && (
                        <a href={`tel:${match.telephone}`} className="bg-[#111] border border-gray-800 text-gray-400 rounded-full px-3 py-1 text-xs no-underline hover:border-gray-600">
                          📞 {match.telephone}
                        </a>
                      )}
                      {match.website && (
                        <a href={match.website} target="_blank" rel="noopener noreferrer" className="bg-[#111] border border-gray-800 text-gray-400 rounded-full px-3 py-1 text-xs no-underline hover:border-gray-600">
                          🌐 Web
                        </a>
                      )}
                    </div>

                    {/* Apply button */}
                    {isApplied ? (
                      <div className="flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 py-3 rounded-xl text-sm font-bold">
                        ✓ Přihláška odeslána
                      </div>
                    ) : (
                      <button
                        onClick={() => applyToAgency(match)}
                        disabled={isApplying}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:opacity-90 transition disabled:opacity-50"
                      >
                        {isApplying ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Generuji dopis a odesílám...
                          </span>
                        ) : (
                          '📧 Přihlásit se jedním klikem'
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-4 mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Odesláno: <span className="text-green-400 font-bold">{appliedIds.size}</span> přihlášek
              </p>
              <Link href="/prihlasky" className="text-blue-400 text-xs mt-2 inline-block">
                Zobrazit všechny přihlášky →
              </Link>
            </div>
          </div>
        )}

        {/* How it works */}
        {matches.length === 0 && !matching && profileComplete && (
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-5 mt-2">
            <h3 className="text-white font-bold text-sm mb-3">Jak to funguje</h3>
            <div className="flex flex-col gap-3">
              {[
                { step: '1', text: 'AI analyzuje tvůj profil a vybere top agentury z 1000+ kontaktů' },
                { step: '2', text: 'Uvidíš ranking s match score a zdůvodněním' },
                { step: '3', text: 'Klikneš "Přihlásit se" → AI vygeneruje motivační dopis v němčině a odešle email' },
                { step: '4', text: 'Agentura ti odpoví přímo na tvůj email' },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <p className="text-gray-400 text-sm m-0">{item.text}</p>
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
