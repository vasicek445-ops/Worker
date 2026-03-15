'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AsistentRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard#wooky')
  }, [router])

  return (
    <main className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#39ff6e]/20 border-t-[#39ff6e] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 text-sm">Presmerovavam na Wooky...</p>
      </div>
    </main>
  )
}
