"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Nabidka() {
  const router = useRouter()
  useEffect(() => { router.replace('/nabidky') }, [router])
  return <main className="min-h-screen bg-[#0E0E0E] flex items-center justify-center"><div className="animate-pulse text-gray-500">Přesměrování...</div></main>
}
