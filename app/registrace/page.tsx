import Link from "next/link";

export default function Registrace() {
  return (
    <main className="min-h-screen bg-[#0E0E0E] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">

        <div className="flex items-center justify-between mb-8">
          <div className="text-[#E8302A] font-black text-xl">⚙ Woker</div>
          <div className="text-gray-600 text-sm">Krok 1 ze 3</div>
        </div>

        <div className="flex gap-2 mb-8">
          <div className="h-1 flex-1 bg-[#E8302A] rounded-full"></div>
          <div className="h-1 flex-1 bg-gray-800 rounded-full"></div>
          <div className="h-1 flex-1 bg-gray-800 rounded-full"></div>
        </div>

        <h1 className="text-white text-3xl font-black mb-2">Základní info</h1>
        <p className="text-gray-500 mb-8">Řekni nám o sobě ať AI může matchovat správně.</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-gray-500 text-xs uppercase tracking-wider mb-2 block">Jméno a příjmení</label>
            <input type="text" placeholder="Václav Novák"
              className="w-full bg-[#1A1A1A] border border-gray-800 text-white rounded-xl px-4 py-4 focus:outline-none focus:border-[#E8302A] transition-colors" />
          </div>
          <div>
            <label className="text-gray-500 text-xs uppercase tracking-wider mb-2 block">Email</label>
            <input type="email" placeholder="vas@email.cz"
              className="w-full bg-[#1A1A1A] border border-gray-800 text-white rounded-xl px-4 py-4 focus:outline-none focus:border-[#E8302A] transition-colors" />
          </div>
          <div>
            <label className="text-gray-500 text-xs uppercase tracking-wider mb-2 block">Pracovní pozice</label>
            <input type="text" placeholder="Elektrikář, IT Technik, Kuchař..."
              className="w-full bg-[#1A1A1A] border border-gray-800 text-white rounded-xl px-4 py-4 focus:outline-none focus:border-[#E8302A] transition-colors" />
          </div>
          <div>
            <label className="text-gray-500 text-xs uppercase tracking-wider mb-2 block">Roky zkušeností</label>
            <select className="w-full bg-[#1A1A1A] border border-gray-800 text-white rounded-xl px-4 py-4 focus:outline-none focus:border-[#E8302A] transition-colors">
              <option value="">Vyber...</option>
              <option>Méně než 1 rok</option>
              <option>1 - 3 roky</option>
              <option>3 - 5 let</option>
              <option>5+ let</option>
            </select>
          </div>
        </div>

        <Link href="/jazyky" className="block w-full bg-[#E8302A] text-white font-bold py-4 rounded-xl text-lg mt-8 hover:bg-[#FF4D47] transition-colors text-center">
          Dále →
        </Link>

      </div>
    </main>
  );
}