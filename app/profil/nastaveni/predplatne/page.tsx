'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'
import { useSubscription } from '../../../../hooks/useSubscription'
import { ArrowLeft, ArrowRight, CreditCard } from 'lucide-react'

export default function PredplatnePage() {
  const router = useRouter()
  const { isActive, plan, loading: subLoading } = useSubscription()
  const [userId, setUserId] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [subDetails, setSubDetails] = useState<any>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (cancelled) return
      if (!data.user) { router.replace('/prihlaseni'); return }
      setUserId(data.user.id)
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status, plan, current_period_end, price_amount, price_currency')
        .eq('user_id', data.user.id)
        .maybeSingle()
      if (!cancelled) {
        setSubDetails(sub)
        setAuthChecked(true)
      }
    })()
    return () => { cancelled = true }
  }, [router])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const handleManageSubscription = async () => {
    if (!userId) return
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else showToast('Něco se pokazilo')
    } catch { showToast('Něco se pokazilo') }
    finally { setPortalLoading(false) }
  }

  if (!authChecked || subLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#fb923c] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const nextPaymentDate = subDetails?.current_period_end
    ? new Date(subDetails.current_period_end).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const priceLabel = subDetails?.price_amount && subDetails?.price_currency
    ? `${(subDetails.price_amount / 100).toFixed(2)} ${subDetails.price_currency.toUpperCase()}`
    : null

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-2xl mx-auto p-6">
        <header className="mb-8">
          <Link href="/profil/nastaveni" className="inline-flex items-center gap-1.5 text-white/40 text-sm hover:text-white/70 transition no-underline">
            <ArrowLeft size={15} strokeWidth={1.75} /> Zpět na nastavení
          </Link>
          <h1 className="text-2xl font-extrabold text-white m-0 mt-3 flex items-center gap-2">
            <CreditCard size={22} strokeWidth={1.75} className="text-[#fb923c]" /> Předplatné
          </h1>
          <p className="text-white/40 text-sm mt-1">Plán, fakturace a správa.</p>
        </header>

        {isActive ? (
          <>
            <div className="bg-gradient-to-br from-[#111120]/90 to-[#0f1a14]/90 backdrop-blur-sm rounded-2xl border border-[#fb923c]/15 p-6 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] bg-[#fb923c]/10 text-[#fb923c] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Aktivní
                </span>
              </div>
              <p className="text-white/40 text-xs uppercase tracking-wider m-0 mb-1">Aktuální plán</p>
              <h2 className="text-white text-2xl font-extrabold m-0 mb-4">
                {plan === 'premium' || !plan ? 'Premium' : plan}
              </h2>

              {nextPaymentDate && (
                <div className="pt-3 border-t border-white/[0.06]">
                  <p className="text-white/40 text-xs m-0">Příští platba</p>
                  <p className="text-white text-sm font-medium m-0 mt-1">
                    {nextPaymentDate}{priceLabel && <span className="text-white/50"> · {priceLabel}</span>}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2 mb-6">
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#fb923c] to-[#f97316] text-[#0a0a12] font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 text-sm"
              >
                {portalLoading ? 'Načítání...' : <>Spravovat fakturaci <ArrowRight size={15} strokeWidth={2} /></>}
              </button>
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white font-medium py-3 rounded-xl hover:bg-white/[0.06] transition disabled:opacity-50 text-sm"
              >
                Stáhnout faktury
              </button>
            </div>

            <div className="border-t border-white/[0.04] pt-6 mt-8 text-center">
              <Link
                href="/profil/nastaveni/predplatne/zrusit"
                className="text-white/20 text-[11px] hover:text-white/50 transition no-underline"
              >
                Zrušit předplatné
              </Link>
            </div>
          </>
        ) : (
          <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6">
            <p className="text-white/60 text-sm m-0 mb-4">Nemáš aktivní předplatné.</p>
            <Link
              href="/pricing"
              className="block w-full bg-gradient-to-r from-[#fb923c] to-[#f97316] text-[#0a0a12] font-bold py-3 rounded-xl hover:opacity-90 transition text-sm text-center no-underline"
            >
              Aktivovat Premium
            </Link>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#111120] border border-[#fb923c]/20 text-[#fb923c] text-sm px-4 py-2.5 rounded-xl shadow-lg z-50">
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}
