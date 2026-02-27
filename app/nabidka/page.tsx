"use client"
import Link from 'next/link'

export default function Nabidka() {
  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-gray-500 hover:text-white text-sm mb-6 inline-block">← Zpět</Link>

        <h1 className="text-white text-2xl font-black mb-2">💼 Pracovní pozice</h1>
        <p className="text-gray-500 text-sm mb-8">Nabídky práce ve Švýcarsku pro české pracovníky</p>

        {/* Coming soon */}
        <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-8 text-center mb-6">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-white font-bold text-lg mb-2">Připravujeme pro tebe</h2>
          <p className="text-gray-400 text-sm mb-6">
            Pracujeme na napojení reálných pracovních nabídek přímo od švýcarských zaměstnavatelů. 
            Brzy tu najdeš aktuální pozice od švýcarských temporárních agentur i přímých zaměstnavatelů — vše na jednom místě.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/kontakty" className="block w-full bg-[#E8302A] text-white font-bold py-3 rounded-xl text-center hover:opacity-90 transition">
              📇 Prohlédni 1000+ kontaktů na temporární agentury
            </Link>
            <Link href="/pruvodce/sablony" className="block w-full bg-[#1A1A1A] border border-gray-700 text-white font-bold py-3 rounded-xl text-center hover:border-gray-500 transition">
              📝 Připrav si CV a motivační dopis s AI
            </Link>
          </div>
        </div>

        {/* What's coming */}
        <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-bold text-sm mb-3">Co chystáme:</h3>
          <div className="flex flex-col gap-3">
            {[
              { icon: "🔍", text: "AI matching — pozice podle tvého profilu" },
              { icon: "📧", text: "Přímý kontakt na zaměstnavatele" },
              { icon: "🔔", text: "Notifikace na nové pozice v tvém oboru" },
              { icon: "📊", text: "Porovnání platů podle kantonu a oboru" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-gray-400 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
