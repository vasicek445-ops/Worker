import Link from "next/link";

export default function Jazyky() {
  return (
    <main className="min-h-screen bg-[#0E0E0E] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-[#E8302A] font-black text-xl">⚙ Woker</div>
          <div className="text-gray-600 text-sm">Krok 2 ze 3</div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          <div className="h-1 flex-1 bg-[#E8302A] rounded-full"></div>
          <div className="h-1 flex-1 bg-[#E8302A] rounded-full"></div>
          <div className="h-1 flex-1 bg-gray-800 rounded-full"></div>
        </div>

        {/* Title */}
        <h1 className="text-white text-3xl font-black mb-2">Jazykové znalosti</h1>
        <p className="text-gray-500 mb-8">Jazyk je hlavní filtr pro AI matching.</p>

        {/* Language cards */}
        <div className="flex flex-col gap-4">
          {[
            { flag: "🇬🇧", name: "Angličtina" },
            { flag: "🇩🇪", name: "Němčina" },
            { flag: "🇳🇴", name: "Norština" },
            { flag: "🇨🇭", name: "Francouzština" },
          ].map((lang) => (
            <div key={lang.name} className="bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-bold">{lang.flag} {lang.name}</span>
              </div>
              <select className="w-full bg-[#111] border border-gray-700 text-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E8302A]">
                <option value="">Žádná znalost</option>
                <option>A1 – Začátečník</option>
                <option>A2 – Základní</option>
                <option>B1 – Mírně pokročilý</option>
                <option>B2 – Pokročilý</option>
                <option>C1 – Velmi pokročilý</option>
                <option>C2 – Rodilý mluvčí</option>
              </select>
            </div>
          ))}
        </div>

        {/* Tlačítko Dále */}
        <Link
          href="/kriteria"
          className="block w-full bg-[#E8302A] text-white font-bold py-4 rounded-xl text-lg mt-8 text-center"
        >
          Dále →
        </Link>

      </div>
    </main>
  );
}