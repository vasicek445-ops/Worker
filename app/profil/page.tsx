import Link from "next/link";

export default function Profil() {
  return (
    <main className="min-h-screen bg-[#0E0E0E] px-6 py-8 pb-24">
      <div className="max-w-2xl mx-auto">

        <div className="text-[#E8302A] font-black text-xl mb-6">⚙ Woker</div>

        {/* Avatar + jméno */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E8302A] to-orange-400 flex items-center justify-center text-white font-black text-2xl">
            V
          </div>
          <div>
            <h1 className="text-white font-black text-xl">Václav N.</h1>
            <p className="text-gray-500 text-sm">Elektrikář • Česká republika 🇨🇿</p>
          </div>
        </div>

        {/* Statistiky */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-4 text-center">
            <div className="text-[#E8302A] font-black text-2xl">2</div>
            <div className="text-gray-500 text-xs mt-1">Nabídek dnes</div>
          </div>
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-4 text-center">
            <div className="text-[#E8302A] font-black text-2xl">0</div>
            <div className="text-gray-500 text-xs mt-1">Přihlášek</div>
          </div>
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-4 text-center">
            <div className="text-[#E8302A] font-black text-2xl">97%</div>
            <div className="text-gray-500 text-xs mt-1">Top match</div>
          </div>
        </div>

        {/* Premium */}
        <div className="bg-gradient-to-r from-[rgba(232,48,42,0.2)] to-[rgba(232,48,42,0.05)] border border-[rgba(232,48,42,0.4)] rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚡</span>
            <span className="text-[#E8302A] font-black">Woker Premium</span>
          </div>
          <p className="text-gray-400 text-sm mb-4">Neomezené kontakty, prioritní nabídky, AI průvodce pohovorem</p>
          <button className="w-full bg-[#E8302A] text-white font-bold py-3 rounded-xl hover:bg-[#FF4D47] transition-colors">
            Upgradovat — 9€/měs
          </button>
        </div>

        {/* Nastavení */}
        <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-5 mb-4">
          <h2 className="text-white font-black mb-4">Nastavení hledání</h2>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Cílová země</span>
              <span className="text-white text-sm font-bold">🇨🇭 Švýcarsko</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Minimální plat</span>
              <span className="text-white text-sm font-bold">3 500 CHF</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Notifikace</span>
              <span className="text-white text-sm font-bold">⚡ Každou hodinu</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Typ úvazku</span>
              <span className="text-white text-sm font-bold">Full-time</span>
            </div>
          </div>
        </div>

        <Link href="/kriteria" className="block w-full bg-[#1A1A1A] border border-gray-800 text-gray-500 font-bold py-4 rounded-xl text-center hover:border-[#E8302A] hover:text-white transition-colors">
          Upravit kritéria →
        </Link>

      </div>
    </main>
  );
}