import Link from "next/link";

const kroky = [
  {
    id: 1,
    icon: "📄",
    title: "Připrav CV",
    desc: "CV musí být v němčině nebo angličtině. Max 2 strany. Švýcarští zaměstnavatelé očekávají foto.",
    hotovo: false,
  },
  {
    id: 2,
    icon: "✉️",
    title: "Napiš motivační dopis",
    desc: "Krátký — max 1 strana. Zmiň konkrétně proč chceš do Švýcarska a co přineseš firmě.",
    hotovo: false,
  },
  {
    id: 3,
    icon: "📧",
    title: "Odešli přihlášku",
    desc: "Pošli email přímo na kontakt zaměstnavatele. Předmět: 'Bewerbung als [pozice] – [tvoje jméno]'",
    hotovo: false,
  },
  {
    id: 4,
    icon: "⏳",
    title: "Počkej na odpověď",
    desc: "Švýcarské firmy odpovídají do 2-3 týdnů. Po 2 týdnech můžeš poslat zdvořilý follow-up.",
    hotovo: false,
  },
  {
    id: 5,
    icon: "🎯",
    title: "Připrav se na pohovor",
    desc: "Pohovor bývá online. Připrav si odpovědi na: Proč Švýcarsko? Kde vidíš sebe za 5 let? Jaké máš zkušenosti?",
    hotovo: false,
  },
  {
    id: 6,
    icon: "🏠",
    title: "Vyřiď ubytování",
    desc: "Hledej na homegate.ch nebo tutti.ch. Průměrný nájem v Zürichu: 1500-2000 CHF/měs za pokoj.",
    hotovo: false,
  },
  {
    id: 7,
    icon: "📋",
    title: "Vyřiď pracovní povolení",
    desc: "Jako občan EU máš právo pracovat ve Švýcarsku. Přihlas se na místním obecním úřadě do 90 dní.",
    hotovo: false,
  },
];

export default function Pruvodce() {
  return (
    <main className="min-h-screen bg-[#0E0E0E] px-6 py-8 pb-24">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div className="text-[#E8302A] font-black text-xl">⚙ Woker</div>
        </div>

        <div className="mb-6">
          <h1 className="text-white text-2xl font-black mb-1">Průvodce procesem 📋</h1>
          <p className="text-gray-500 text-sm">Krok za krokem jak získat práci ve Švýcarsku</p>
        </div>

        <div className="bg-[rgba(232,48,42,0.1)] border border-[rgba(232,48,42,0.3)] rounded-2xl p-4 mb-6">
          <p className="text-[#E8302A] text-sm font-bold">🎯 Aktuální pozice</p>
          <p className="text-white font-black">Software Engineer @ Tech Zürich AG</p>
          <p className="text-gray-500 text-sm">4 500 CHF/měs • 97% match</p>
        </div>

        <div className="flex flex-col gap-4">
          {kroky.map((krok) => (
            <div key={krok.id} className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#111] rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                  {krok.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-white font-black">{krok.id}. {krok.title}</h2>
                    <div className="w-5 h-5 rounded-full border border-gray-700"></div>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{krok.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link href="/nabidka" className="block w-full bg-[#E8302A] text-white font-bold py-4 rounded-xl text-center mt-6 hover:bg-[#FF4D47] transition-colors">
          Zobrazit kontakt zaměstnavatele →
        </Link>

      </div>
    </main>
  );
}