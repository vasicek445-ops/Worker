"use client"

import { useSubscription } from '../../hooks/useSubscription'
import PaywallOverlay from '../components/PaywallOverlay'
import Link from 'next/link'

const FREE_PHRASES = [
  { de: "Guten Morgen, ich bin der/die Neue.", cs: "Dobré ráno, jsem tu nový/nová.", context: "První den v práci" },
  { de: "Können Sie mir das bitte zeigen?", cs: "Můžete mi to prosím ukázat?", context: "Když potřebuješ pomoc" },
  { de: "Wo ist die Kantine / Toilette?", cs: "Kde je jídelna / toaleta?", context: "Orientace na pracovišti" },
  { de: "Ich habe eine Frage zu meinem Vertrag.", cs: "Mám otázku ke své smlouvě.", context: "Administrativa" },
  { de: "Wann ist Feierabend?", cs: "Kdy končíme?", context: "Pracovní doba" },
  { de: "Ich bin krank und kann heute nicht kommen.", cs: "Jsem nemocný/á a dnes nemůžu přijít.", context: "Nemocenská" },
]

const PREMIUM_PHRASES = [
  {
    category: "📋 Pracovní pohovor",
    phrases: [
      { de: "Ich habe 5 Jahre Erfahrung als...", cs: "Mám 5 let zkušeností jako...", context: "Představení" },
      { de: "Wann könnte ich anfangen?", cs: "Kdy bych mohl/a začít?", context: "Nástup" },
      { de: "Wie hoch ist das Gehalt?", cs: "Jaký je plat?", context: "Plat" },
      { de: "Gibt es einen Dreizehnten Monatslohn?", cs: "Je tu třináctý plat?", context: "Benefity" },
      { de: "Wie viele Urlaubstage gibt es?", cs: "Kolik je dnů dovolené?", context: "Dovolená" },
      { de: "Ist Homeoffice möglich?", cs: "Je možný home office?", context: "Flexibilita" },
    ]
  },
  {
    category: "🏗️ Na stavbě / ve výrobě",
    phrases: [
      { de: "Wo ist das Werkzeug?", cs: "Kde je nářadí?", context: "Vybavení" },
      { de: "Das Material ist ausgegangen.", cs: "Došel materiál.", context: "Zásobování" },
      { de: "Ich brauche Sicherheitsausrüstung.", cs: "Potřebuji bezpečnostní vybavení.", context: "BOZP" },
      { de: "Achtung, Gefahr!", cs: "Pozor, nebezpečí!", context: "Bezpečnost" },
      { de: "Die Maschine funktioniert nicht.", cs: "Stroj nefunguje.", context: "Poruchy" },
      { de: "Wer ist der Vorarbeiter?", cs: "Kdo je předák/mistr?", context: "Hierarchie" },
    ]
  },
  {
    category: "🍳 V gastronomii / hotelu",
    phrases: [
      { de: "Die Bestellung für Tisch 5.", cs: "Objednávka pro stůl 5.", context: "Obsluha" },
      { de: "Haben Sie eine Reservation?", cs: "Máte rezervaci?", context: "Recepce" },
      { de: "Das Zimmer ist fertig.", cs: "Pokoj je připravený.", context: "Housekeeping" },
      { de: "Ich brauche eine Pause.", cs: "Potřebuji přestávku.", context: "Pracovní právo" },
      { de: "Wann ist meine Schicht?", cs: "Kdy mám směnu?", context: "Rozvrh" },
    ]
  },
  {
    category: "🏥 Ve zdravotnictví",
    phrases: [
      { de: "Der Patient braucht Hilfe.", cs: "Pacient potřebuje pomoc.", context: "Péče" },
      { de: "Ich muss den Arzt informieren.", cs: "Musím informovat lékaře.", context: "Komunikace" },
      { de: "Die Visite ist um 8 Uhr.", cs: "Vizita je v 8 hodin.", context: "Rutina" },
      { de: "Bitte füllen Sie dieses Formular aus.", cs: "Prosím vyplňte tento formulář.", context: "Administrativa" },
    ]
  },
  {
    category: "📞 Telefonování / emaily",
    phrases: [
      { de: "Guten Tag, hier spricht...", cs: "Dobrý den, tady mluví...", context: "Představení" },
      { de: "Können Sie mich bitte verbinden?", cs: "Můžete mě prosím spojit?", context: "Přepojení" },
      { de: "Ich schicke Ihnen eine E-Mail.", cs: "Pošlu vám email.", context: "Korespondence" },
      { de: "Mit freundlichen Grüßen", cs: "S přátelským pozdravem", context: "Závěr emailu" },
    ]
  },
]

const TIPS = [
  { icon: "💡", title: "Schweizerdeutsch vs Hochdeutsch", desc: "Ve Švýcarsku mluví dialektem (Schwyzerdütsch), ale v práci a písemně se používá spisovná němčina (Hochdeutsch). Neboj se, na cizince mluví Hochdeutsch." },
  { icon: "🎯", title: "Jazyková úroveň B1 stačí na start", desc: "Pro většinu manuálních pozic stačí A2-B1. Pro kancelářské a IT pozice potřebuješ B2+. Zdravotnictví vyžaduje často B2-C1." },
  { icon: "📱", title: "Nejlepší appky na učení", desc: "Duolingo (zdarma, denně 15 min), Babbel (placený, lepší pro dospělé), Anki (kartičky na slovíčka). Kombinuj s YouTube kanálem 'Easy German'." },
]

export default function Jazyky() {
  const { isActive, loading } = useSubscription()

  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
          {"<-"} Zpět
        </Link>

        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold mb-2">🇩🇪 Němčina pro práci</h1>
          <p className="text-gray-400 text-sm">
            Nejdůležitější fráze a slovíčka pro práci ve Švýcarsku
          </p>
        </div>

        {/* Tips */}
        <div className="space-y-3 mb-8">
          {TIPS.map((tip) => (
            <div key={tip.title} className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">{tip.icon}</span>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">{tip.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Free phrases */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-white text-lg font-bold">Základní fráze</h2>
            <span className="bg-green-500/10 text-green-400 text-xs font-bold px-2 py-1 rounded-full">
              Zdarma
            </span>
          </div>
          <div className="space-y-3">
            {FREE_PHRASES.map((phrase) => (
              <div key={phrase.de} className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#E8302A]/10 text-[#E8302A] text-xs font-medium px-2 py-0.5 rounded-full">
                    {phrase.context}
                  </span>
                </div>
                <p className="text-white font-bold text-sm mb-1">🇩🇪 {phrase.de}</p>
                <p className="text-gray-400 text-sm">🇨🇿 {phrase.cs}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Premium phrases by category */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-white text-lg font-bold">Fráze podle oboru</h2>
            <span className="bg-[#E8302A]/10 text-[#E8302A] text-xs font-bold px-2 py-1 rounded-full">
              Premium
            </span>
          </div>

          <PaywallOverlay
            isLocked={!isActive && !loading}
            title="Odemkni 50+ frází podle oboru"
            description="Pohovor, stavba, gastronomie, zdravotnictví, kancelář – vše v češtině a němčině"
          >
            <div className="space-y-6">
              {PREMIUM_PHRASES.map((cat) => (
                <div key={cat.category}>
                  <h3 className="text-white font-bold mb-3">{cat.category}</h3>
                  <div className="space-y-3">
                    {cat.phrases.map((phrase) => (
                      <div key={phrase.de} className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-[#E8302A]/10 text-[#E8302A] text-xs font-medium px-2 py-0.5 rounded-full">
                            {phrase.context}
                          </span>
                        </div>
                        <p className="text-white font-bold text-sm mb-1">🇩🇪 {phrase.de}</p>
                        <p className="text-gray-400 text-sm">🇨🇿 {phrase.cs}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </PaywallOverlay>
        </div>
      </div>
    </main>
  )
}
