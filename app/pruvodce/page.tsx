"use client"
import Link from 'next/link'
import BottomNav from '../components/BottomNav'
import { useSubscription } from '../../hooks/useSubscription'

export default function Pruvodce() {
  const { isActive } = useSubscription()

  const sections = [
    {
      title: "📚 Před odjezdem",
      desc: "Základní informace než odjedeš do Švýcarska",
      items: [
        { icon: "📋", title: "Pracovní povolení", desc: "L, B, C, G — typy a jak získat", href: "/pruvodce/povoleni", ai: false },
        { icon: "🏥", title: "Zdravotní pojištění", desc: "Grundversicherung, jak ušetřit", href: "/pruvodce/pojisteni", ai: false },
        { icon: "💰", title: "Daně a pojištění", desc: "Quellensteuer, povinné odvody", href: "/pruvodce/dane", ai: false },
        { icon: "🗣️", title: "Němčina pro práci", desc: "Fráze, slovíčka, kurzy", href: "/jazyky", ai: false },
      ]
    },
    {
      title: "🔍 Hledám práci",
      desc: "AI nástroje pro přípravu na zaměstnání",
      items: [
        { icon: "📊", title: "AI analýza inzerátu", desc: "Pochop co firma hledá", href: "/pruvodce/sablony/analyza", ai: true },
        { icon: "📝", title: "AI životopis", desc: "5 profesionálních šablon", href: "/pruvodce/sablony/cv", ai: true },
        { icon: "✉️", title: "AI motivační dopis", desc: "Personalizovaný Bewerbungsschreiben", href: "/pruvodce/sablony/motivacni-dopis", ai: true },
        { icon: "📧", title: "AI email pro HR", desc: "Profesionální oslovení v němčině", href: "/pruvodce/sablony/email", ai: true },
        { icon: "🎤", title: "AI příprava na pohovor", desc: "Otázky a odpovědi pro tvůj obor", href: "/pruvodce/sablony/pohovor", ai: true },
      ]
    },
    {
      title: "✅ Už pracuju",
      desc: "Nástroje pro ty co už jsou ve Švýcarsku",
      items: [
        { icon: "📑", title: "AI analýza smlouvy", desc: "Přelož, vysvětli, odhal problémy", href: "/pruvodce/sablony/smlouva", ai: true },
        { icon: "🏠", title: "AI hledání bydlení", desc: "Bewerbungsdossier, portály, kauce", href: "/pruvodce/sablony/bydleni", ai: true },
      ]
    },
  ]

  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-gray-500 hover:text-white text-sm mb-4 inline-block">← Zpět</Link>

        <h1 className="text-white text-2xl font-black mb-1">🛠️ Nástroje & Průvodce</h1>
        <p className="text-gray-500 text-sm mb-6">Vše co potřebuješ pro práci a život ve Švýcarsku</p>

        <div className="space-y-8">
          {sections.map((section, si) => (
            <div key={si}>
              <h2 className="text-white font-bold text-lg mb-1">{section.title}</h2>
              <p className="text-gray-600 text-xs mb-3">{section.desc}</p>
              <div className="space-y-2">
                {section.items.map((item, ii) => (
                  <Link key={ii} href={item.href} className="flex items-center gap-3.5 bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition no-underline">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold text-sm m-0">{item.title}</p>
                        {item.ai && <span className="text-[10px] bg-blue-500/10 text-blue-400 font-bold px-1.5 py-0.5 rounded">🤖 AI</span>}
                        {item.ai && !isActive && <span className="text-[10px] bg-yellow-500/10 text-yellow-400 font-bold px-1.5 py-0.5 rounded">Premium</span>}
                      </div>
                      <p className="text-gray-500 text-xs m-0 mt-0.5">{item.desc}</p>
                    </div>
                    <span className="text-gray-600 text-sm">→</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active="tools" />
    </main>
  )
}
