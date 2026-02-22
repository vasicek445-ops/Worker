import Link from "next/link";

export default function Nabidka() {
  return (
    <main className="min-h-screen bg-[#0E0E0E] px-6 py-8">
      <div className="max-w-2xl mx-auto">

        {/* Zpět */}
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6">
          ← Zpět na nabídky
        </Link>

        {/* Header karty */}
        <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-white text-2xl font-black mb-1">Software Engineer</h1>
              <p className="text-gray-500">Tech Zürich AG • Zürich 🇨🇭</p>
            </div>
            <div className="bg-[#E8302A] text-white rounded-full w-14 h-14 flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-sm font-black leading-none">97%</span>
              <span className="text-[9px] leading-none opacity-80">match</span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <span className="bg-[#111] border border-gray-800 text-gray-400 rounded-full px-3 py-1 text-xs">Full-time</span>
            <span className="bg-[#111] border border-gray-800 text-gray-400 rounded-full px-3 py-1 text-xs">💰 4 500 CHF/měs</span>
            <span className="bg-[rgba(232,48,42,0.1)] border border-[rgba(232,48,42,0.3)] text-[#E8302A] rounded-full px-3 py-1 text-xs">🇬🇧 B1+</span>
            <span className="bg-[#111] border border-gray-800 text-gray-400 rounded-full px-3 py-1 text-xs">🏠 Ubytování included</span>
          </div>
        </div>

        {/* Kontakt — klíčová funkce */}
        <div className="bg-gradient-to-r from-[rgba(232,48,42,0.15)] to-[rgba(232,48,42,0.05)] border border-[rgba(232,48,42,0.3)] rounded-2xl p-6 mb-4">
          <div className="text-gray-500 text-xs uppercase tracking-wider mb-3">📧 Kontakt zaměstnavatele</div>
          <div className="text-[#E8302A] font-black text-lg mb-1">jobs@techzurich.ch</div>
          <div className="text-gray-500 text-sm mb-4">Kontaktní osoba: Jan Müller, HR Manager</div>
          <a href="mailto:jobs@techzurich.ch" className="block w-full bg-[#E8302A] text-white font-bold py-3 rounded-xl text-center hover:bg-[#FF4D47] transition-colors">
            Napsat email →
          </a>
        </div>

        {/* Popis pozice */}
        <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-6 mb-4">
          <h2 className="text-white font-black mb-3">O pozici</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Hledáme zkušeného softwarového inženýra pro náš tým v Zürichu. 
            Budete pracovat na moderních webových aplikacích v mezinárodním prostředí. 
            Nabízíme kompetitivní plat, relocation package a možnost hybridní práce.
          </p>
        </div>

        {/* Průvodce tlačítko */}
        <Link href="/pruvodce" className="block w-full bg-[#1A1A1A] border border-gray-800 text-white font-bold py-4 rounded-xl text-center hover:border-[#E8302A] transition-colors">
          📋 Použít průvodce přihláškou →
        </Link>

      </div>
    </main>
  );
}