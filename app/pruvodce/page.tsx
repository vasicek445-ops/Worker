"use client"
import Link from 'next/link'
import { useSubscription } from '../../hooks/useSubscription'
import {
  ClipboardList,
  HeartPulse,
  Wallet,
  Languages,
  Target,
  BarChart3,
  FileText,
  PenLine,
  AtSign,
  Mic,
  FileCheck,
  KeyRound,
  Plane,
  Search,
  BadgeCheck,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'

type Tool = {
  Icon: LucideIcon
  title: string
  desc: string
  href: string
  ai: boolean
}

type Section = {
  Icon: LucideIcon
  title: string
  subtitle: string
  items: Tool[]
}

const ACCENT = '#ff8c2b'

export default function Pruvodce() {
  const { isActive } = useSubscription()

  const sections: Section[] = [
    {
      Icon: Plane,
      title: 'Před odjezdem',
      subtitle: 'Co potřebuješ vyřešit než přijedeš do Švýcarska',
      items: [
        { Icon: ClipboardList, title: 'Pracovní povolení', desc: 'L, B, C, G — typy povolení a jak je získat', href: '/pruvodce/povoleni', ai: false },
        { Icon: HeartPulse, title: 'Zdravotní pojištění', desc: 'Grundversicherung, Krankenkasse a jak ušetřit', href: '/pruvodce/pojisteni', ai: false },
        { Icon: Wallet, title: 'Daně a pojištění', desc: 'Quellensteuer, AHV, povinné odvody', href: '/pruvodce/dane', ai: false },
        { Icon: Languages, title: 'Němčina pro práci', desc: 'Fráze a slovíčka do práce + AI lekce', href: '/jazyky', ai: true },
      ],
    },
    {
      Icon: Search,
      title: 'Hledám práci',
      subtitle: 'AI nástroje pro úspěšné podání přihlášky',
      items: [
        { Icon: Target, title: 'Smart Matching', desc: 'Najdi agentury a přihlas se jedním klikem', href: '/pruvodce/matching', ai: true },
        { Icon: BarChart3, title: 'Analýza inzerátu', desc: 'AI vyhodnotí, jestli pozice sedí na tvůj profil', href: '/pruvodce/sablony/analyza', ai: true },
        { Icon: FileText, title: 'Životopis (CV)', desc: '5 šablon + AI generátor obsahu v němčině', href: '/pruvodce/sablony/cv', ai: true },
        { Icon: PenLine, title: 'Motivační dopis', desc: 'Personalizovaný Bewerbungsschreiben pro každou firmu', href: '/pruvodce/sablony/motivacni-dopis', ai: true },
        { Icon: AtSign, title: 'Email pro HR', desc: 'Profesionální oslovení personalisty v němčině', href: '/pruvodce/sablony/email', ai: true },
        { Icon: Mic, title: 'Příprava na pohovor', desc: 'AI ti vygeneruje otázky pro tvůj obor a kanton', href: '/pruvodce/sablony/pohovor', ai: true },
      ],
    },
    {
      Icon: BadgeCheck,
      title: 'Už pracuju',
      subtitle: 'Pro ty, kdo už ve Švýcarsku zaměstnání mají',
      items: [
        { Icon: FileCheck, title: 'Analýza smlouvy', desc: 'AI ti přeloží Arbeitsvertrag a upozorní na rizika', href: '/pruvodce/sablony/smlouva', ai: true },
        { Icon: KeyRound, title: 'Hledání bydlení', desc: 'Bewerbungsdossier, portály, jak na kauci', href: '/pruvodce/sablony/bydleni', ai: true },
      ],
    },
  ]

  return (
    <main className="min-h-screen bg-[#0a0a12] px-4 sm:px-6 lg:px-10 py-8 pb-24">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3 text-sm">
            <Link href="/dashboard" className="text-white/40 hover:text-white no-underline transition">
              Dashboard
            </Link>
            <ChevronRight size={14} strokeWidth={2} className="text-white/20" />
            <span className="text-white/60">Nástroje</span>
          </div>
          <h1 className="text-white text-3xl sm:text-[2rem] font-bold tracking-tight mb-2">
            Nástroje
          </h1>
          <p className="text-white/40 text-sm max-w-2xl">
            Vyber si, co potřebuješ vyřešit. Vše máš na jednom místě — od povolení po AI-generovaný motivační dopis.
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((section, si) => (
            <section key={si}>
              <div className="flex items-center gap-2.5 mb-4">
                <section.Icon size={18} strokeWidth={1.75} color={ACCENT} />
                <div>
                  <h2 className="text-white font-semibold text-sm tracking-tight m-0">{section.title}</h2>
                </div>
                <span className="text-white/30 text-xs ml-1">— {section.subtitle}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {section.items.map((item, ii) => (
                  <Link
                    key={ii}
                    href={item.href}
                    className="group flex items-center gap-4 bg-[#111120]/50 hover:bg-[#15152a]/70 border border-white/[0.06] hover:border-white/[0.12] rounded-xl px-4 py-3.5 transition-all no-underline"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#ff8c2b]/[0.08] border border-[#ff8c2b]/[0.15] flex items-center justify-center flex-shrink-0 group-hover:bg-[#ff8c2b]/[0.12] transition-colors">
                      <item.Icon size={18} strokeWidth={1.75} color={ACCENT} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-white font-semibold text-[14px] m-0 truncate">{item.title}</h3>
                        {item.ai && (
                          <span className="text-[9px] bg-[#ff8c2b]/15 text-[#ff8c2b] font-bold px-1.5 py-0.5 rounded">AI</span>
                        )}
                        {item.ai && !isActive && (
                          <span className="text-[9px] bg-white/5 text-white/40 font-bold px-1.5 py-0.5 rounded">Premium</span>
                        )}
                      </div>
                      <p className="text-white/40 text-[12.5px] leading-snug m-0 truncate">{item.desc}</p>
                    </div>
                    <ChevronRight size={16} strokeWidth={2} className="text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
