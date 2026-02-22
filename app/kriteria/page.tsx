import Link from "next/link";

export default function Kriteria() {
  return (
    <main className="min-h-screen bg-[#0E0E0E] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">

        <div className="flex items-center justify-between mb-8">
          <div className="text-[#E8302A] font-black text-xl">⚙ Woker</div>
          <div className="text-gray-600 text-sm">Krok 3 ze 3</div>
        </div>

        <div className="flex gap-2 mb-8">
          <div className="h-1 flex-1 bg-[#E8302A] rounded-full"></div>
          <div className="h-1 flex-1 bg-[#E8302A] rounded-full"></div>
          <div className="h-1 flex-1 bg-[#E8302A] rounded-full"></div>
        </div>

        <h1 className="text-white text-3xl font-black mb-2">Kritéria hledání</h1>
        <p className="text-gray-500 mb-8">AI bude matchovat nabídky přesně podle toho co chceš.</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-gray-500 text-xs uppercase tracking-wider mb-2 block">Cílová země</label>
            <select className="w-full bg-[#1A1A1A] border border-gray-800 text-white rounded-xl px-4 py-4 focus:outline-none focus:border-[#E8302A] transition-colors">
              <option>🇨🇭 Švýcarsko</option>
              <option>🇳🇴 Norsko</option>
              <option>🇸🇪 Švédsko</option>
              <option>🇩🇪 Německo</option>
              <option>🇦🇹 Rakousko</option>
            </select>
          </div>

          <div>
            <label className="text-gray-500 text-xs uppercase tracking-wider mb-2 block">Typ úvazku</label>
            <div className="flex gap-3">
              {["Full-time", "Part-time", "Freelance"].map((type) => (
                <div key={type} className="flex-1 bg-[#1A1A1A] border border-gray-800 text-gray-400 rounded-xl py-3 text-center text-sm cursor-pointer hover:border-[#E8302A] hover:text-white transition-colors">
                  {type}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-500 text-xs uppercase tracking-wider mb-2 block">Minimální plat (měsíčně)</label>
            <input type="number" placeholder="3 500"
              className="w-full bg-[#1A1A1A] border border-gray-800 text-white rounded-xl px-4 py-4 focus:outline-none focus:border-[#E8302A] transition-colors" />
          </div>

          <div>
            <label className="text-gray-500 text-xs uppercase tracking-wider mb-2 block">Frekvence notifikací</label>
            <select className="w-full bg-[#1A1A1A] border border-gray-800 text-white rounded-xl px-4 py-4 focus:outline-none focus:border-[#E8302A] transition-colors">
              <option>⚡ Každou hodinu</option>
              <option>🌅 Každý den ráno</option>
              <option>📅 Každý týden</option>
            </select>
          </div>
        </div>

        <Link href="/dashboard" className="block w-full bg-[#E8302A] text-white font-bold py-4 rounded-xl text-lg mt-8 hover:bg-[#FF4D47] transition-colors text-center">
          Spustit AI matching 🚀
        </Link>

      </div>
    </main>
  );
}