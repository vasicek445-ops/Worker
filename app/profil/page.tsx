"use client"

import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useSubscription } from '../../hooks/useSubscription'
import Link from 'next/link'

export default function Profil() {
  const { isActive, plan, loading: subLoading } = useSubscription()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleManageSubscription = async () => {
    if (!user) return
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      alert('Něco se pokazilo')
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0E0E0E] flex items-center justify-center">
        <div className="text-gray-500">Načítání...</div>
      </main>
    )
  }

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Uživatel'
  const userEmail = user?.email || ''
  const userInitial = userName.charAt(0).toUpperCase()
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' }) : ''

  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="text-gray-500 hover:text-white text-sm">
            {"<-"} Zpět
          </Link>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 text-sm font-medium"
          >
            Odhlásit se
          </button>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E8302A] to-orange-400 flex items-center justify-center text-white font-black text-2xl">
            {userInitial}
          </div>
          <div>
            <h1 className="text-white font-black text-xl">{userName}</h1>
            <p className="text-gray-500 text-sm">{userEmail}</p>
            {memberSince && (
              <p className="text-gray-600 text-xs mt-1">Člen od {memberSince}</p>
            )}
          </div>
        </div>

        {/* Subscription status */}
        {isActive ? (
          <div className="bg-gradient-to-r from-[rgba(232,48,42,0.2)] to-[rgba(232,48,42,0.05)] border border-[rgba(232,48,42,0.4)] rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <span className="text-[#E8302A] font-black">Woker Premium</span>
              </div>
              <span className="bg-green-500/10 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                Aktivní
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Máš plný přístup ke kontaktům, průvodci, AI asistentovi a všem funkcím.
            </p>
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="w-full bg-[#1A1A1A] border border-gray-700 text-gray-300 font-medium py-3 rounded-xl hover:border-gray-500 transition text-sm"
            >
              {portalLoading ? 'Načítání...' : 'Spravovat předplatné'}
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-[rgba(232,48,42,0.2)] to-[rgba(232,48,42,0.05)] border border-[rgba(232,48,42,0.4)] rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">⚡</span>
              <span className="text-[#E8302A] font-black">Woker Premium</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              200+ kontaktů, AI asistent 24/7, kompletní průvodce, šablony CV
            </p>
            <Link
              href="/pricing"
              className="block w-full bg-[#E8302A] text-white font-bold py-3 rounded-xl text-center hover:opacity-90 transition"
            >
              Upgradovat za 9,90 EUR/měsíc
            </Link>
          </div>
        )}

        {/* Quick links */}
        <div className="space-y-3 mb-6">
          <h2 className="text-white font-bold text-base mb-3">Rychlé odkazy</h2>
          
          {[
            { icon: "📇", label: "Databáze kontaktů", href: "/kontakty", desc: "200+ přímých kontaktů na firmy" },
            { icon: "🤖", label: "AI Asistent", href: "/asistent", desc: "Pomoc s CV, dopisy, otázky 24/7" },
            { icon: "📚", label: "Průvodce", href: "/pruvodce", desc: "Dokumenty, pojištění, daně" },
            { icon: "🇩🇪", label: "Němčina pro práci", href: "/jazyky", desc: "Fráze a slovíčka podle oboru" },
            { icon: "💰", label: "Předplatné", href: "/pricing", desc: "Plány a ceny" },
          ].map((link) => (
            <Link key={link.href} href={link.href}>
              <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-gray-700 transition">
                <span className="text-xl">{link.icon}</span>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{link.label}</p>
                  <p className="text-gray-500 text-xs">{link.desc}</p>
                </div>
                <span className="text-gray-600 text-sm">{"->"}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Settings */}
        <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-5 mb-6">
          <h2 className="text-white font-bold mb-4">Nastavení hledání</h2>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Cílová země</span>
              <span className="text-white text-sm font-bold">🇨🇭 Švýcarsko</span>
            </div>
            <div className="border-t border-gray-800" />
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Notifikace</span>
              <span className="text-white text-sm font-bold">Zapnuté</span>
            </div>
            <div className="border-t border-gray-800" />
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Typ úvazku</span>
              <span className="text-white text-sm font-bold">Full-time</span>
            </div>
          </div>
        </div>

        {/* Edit criteria */}
        <Link href="/kriteria" className="block w-full bg-[#1A1A1A] border border-gray-800 text-gray-400 font-medium py-4 rounded-xl text-center hover:border-[#E8302A] hover:text-white transition text-sm mb-4">
          Upravit kritéria hledání
        </Link>

        {/* Logout button at bottom */}
        <button
          onClick={handleLogout}
          className="w-full border border-red-500/30 text-red-400 font-medium py-3 rounded-xl hover:bg-red-500/10 transition text-sm"
        >
          Odhlásit se
        </button>

        {/* App version */}
        <p className="text-gray-700 text-xs text-center mt-6">
          Woker v1.0 • Powered by AI
        </p>
      </div>
    </main>
  )
}
