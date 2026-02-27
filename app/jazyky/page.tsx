"use client"

import { useState } from 'react'
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

const TIPS = [
  { icon: "💡", title: "Schweizerdeutsch vs Hochdeutsch", desc: "Ve Švýcarsku mluví dialektem (Schwyzerdütsch), ale v práci a písemně se používá spisovná němčina (Hochdeutsch). Neboj se, na cizince mluví Hochdeutsch." },
  { icon: "🎯", title: "Jazyková úroveň B1 stačí na start", desc: "Pro většinu manuálních pozic stačí A2-B1. Pro kancelářské a IT pozice potřebuješ B2+. Zdravotnictví vyžaduje často B2-C1." },
  { icon: "📱", title: "Nejlepší appky na učení", desc: "Duolingo (zdarma, denně 15 min), Babbel (placený, lepší pro dospělé), Anki (kartičky na slovíčka). Kombinuj s YouTube kanálem 'Easy German'." },
]

const PROFESSIONS = [
  "Stavba / Montáž", "Gastronomie / Kuchař", "Hotel / Recepce", "Zdravotnictví / Pečovatel",
  "Sklad / Logistika", "Řidič / Doprava", "Elektrikář", "Instalatér",
  "Zahradník / Krajinář", "Malíř / Natěrač", "Tesař / Truhlář", "Svářeč",
  "Čištění / Úklid", "Výroba / Operátor", "IT / Kancelář", "Obchod / Prodej",
]

const LEVELS = [
  { value: "beginner", label: "🟢 Začátečník (A1-A2)", desc: "Umím základy" },
  { value: "intermediate", label: "🟡 Mírně pokročilý (B1)", desc: "Domluvím se" },
  { value: "advanced", label: "🔴 Pokročilý (B2+)", desc: "Chci profesionální fráze" },
]

interface AIPhrase {
  de: string
  cs: string
  context: string
  pronunciation?: string | null
}

interface AICategory {
  title: string
  phrases: AIPhrase[]
}

interface AIResult {
  categories: AICategory[]
  tip: string
}

export default function Jazyky() {
  const { isActive, loading: subLoading } = useSubscription()
  const [profession, setProfession] = useState("")
  const [customProfession, setCustomProfession] = useState("")
  const [level, setLevel] = useState("beginner")
  const [aiResult, setAiResult] = useState<AIResult | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")

  const handleGenerate = async () => {
    const prof = profession === "custom" ? customProfession : profession
    if (!prof) { setError("Vyber nebo napiš svůj obor"); return }
    setGenerating(true)
    setError("")
    setAiResult(null)
    try {
      const res = await fetch("/api/generate-phrases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profession: prof, level }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setAiResult(data)
    } catch (err: any) {
      setError("Chyba při generování")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a12] px-4 py-6 pb-24" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <div className="max-w-2xl mx-auto">
        <Link href="/pruvodce" className="text-white/30 hover:text-white mb-6 inline-block text-sm">← Zpět</Link>

        <h1 className="text-white text-2xl font-extrabold mb-1">🇩🇪 Němčina pro práci</h1>
        <p className="text-white/40 text-sm mb-6">Nejdůležitější fráze a slovíčka pro práci ve Švýcarsku</p>

        {/* Tips */}
        <div className="space-y-2.5 mb-8">
          {TIPS.map((tip) => (
            <div key={tip.title} className="bg-[#111120] border border-white/[0.06] rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">{tip.icon}</span>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">{tip.title}</h3>
                  <p className="text-white/35 text-xs leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Free phrases */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-white text-lg font-bold">Základní fráze</h2>
            <span className="bg-[#39ff6e]/10 text-[#39ff6e] text-[10px] font-bold px-2 py-0.5 rounded-full">Zdarma</span>
          </div>
          <div className="space-y-2.5">
            {FREE_PHRASES.map((phrase) => (
              <div key={phrase.de} className="bg-[#111120] border border-white/[0.06] rounded-xl p-4">
                <span className="text-[10px] bg-red-500/10 text-red-400 font-medium px-2 py-0.5 rounded-full">{phrase.context}</span>
                <p className="text-white font-bold text-sm mt-2 mb-1">🇩🇪 {phrase.de}</p>
                <p className="text-white/40 text-sm">🇨🇿 {phrase.cs}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-white text-lg font-bold">🤖 AI fráze pro tvůj obor</h2>
            <span className="text-[10px] bg-blue-500/15 text-blue-400 font-bold px-2 py-0.5 rounded">AI</span>
            {!isActive && <span className="text-[10px] bg-yellow-500/10 text-yellow-400 font-bold px-2 py-0.5 rounded">Premium</span>}
          </div>

          <PaywallOverlay isLocked={!isActive && !subLoading} title="AI fráze pro tvůj obor" description="Personalizované fráze pro tvou profesi v němčině">

            <div className="bg-[#111120] border border-white/[0.06] rounded-2xl p-5 mb-4">
              {/* Profession */}
              <label className="text-white/25 text-[10px] font-bold uppercase tracking-wider block mb-2">Tvůj obor</label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {PROFESSIONS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setProfession(p)}
                    className={`text-left px-3 py-2 rounded-lg text-xs transition ${
                      profession === p
                        ? "bg-blue-500/15 border border-blue-500/30 text-blue-400 font-medium"
                        : "bg-white/[0.03] border border-white/[0.06] text-white/50 hover:border-white/[0.12]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setProfession("custom")}
                  className={`text-left px-3 py-2 rounded-lg text-xs transition ${
                    profession === "custom"
                      ? "bg-blue-500/15 border border-blue-500/30 text-blue-400 font-medium"
                      : "bg-white/[0.03] border border-white/[0.06] text-white/50 hover:border-white/[0.12]"
                  }`}
                >
                  ✏️ Jiný obor...
                </button>
              </div>

              {profession === "custom" && (
                <input
                  type="text"
                  value={customProfession}
                  onChange={(e) => setCustomProfession(e.target.value)}
                  placeholder="Napiš svůj obor..."
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm mb-3 focus:outline-none focus:border-blue-500/30"
                />
              )}

              {/* Level */}
              <label className="text-white/25 text-[10px] font-bold uppercase tracking-wider block mb-2 mt-4">Tvá úroveň němčiny</label>
              <div className="flex gap-2 mb-4">
                {LEVELS.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setLevel(l.value)}
                    className={`flex-1 px-3 py-2.5 rounded-lg text-xs transition text-center ${
                      level === l.value
                        ? "bg-blue-500/15 border border-blue-500/30 text-blue-400 font-medium"
                        : "bg-white/[0.03] border border-white/[0.06] text-white/50 hover:border-white/[0.12]"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-3">{error}</div>
              )}

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition disabled:opacity-50 text-sm"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⚙️</span> Generuji fráze pro tvůj obor...
                  </span>
                ) : "🤖 Vygenerovat fráze pro můj obor"}
              </button>
            </div>

            {/* AI Results */}
            {aiResult && (
              <div className="space-y-6">
                {aiResult.tip && (
                  <div className="bg-[#39ff6e]/[0.06] border border-[#39ff6e]/[0.12] rounded-2xl p-4">
                    <p className="text-[#39ff6e] text-sm font-medium">💡 {aiResult.tip}</p>
                  </div>
                )}

                {aiResult.categories.map((cat, ci) => (
                  <div key={ci}>
                    <h3 className="text-white font-bold text-base mb-2.5">{cat.title}</h3>
                    <div className="space-y-2.5">
                      {cat.phrases.map((phrase, pi) => (
                        <div key={pi} className="bg-[#111120] border border-white/[0.06] rounded-xl p-4">
                          <span className="text-[10px] bg-blue-500/10 text-blue-400 font-medium px-2 py-0.5 rounded-full">{phrase.context}</span>
                          <p className="text-white font-bold text-sm mt-2 mb-1">🇩🇪 {phrase.de}</p>
                          <p className="text-white/40 text-sm">🇨🇿 {phrase.cs}</p>
                          {phrase.pronunciation && (
                            <p className="text-white/20 text-xs mt-1 italic">🔊 {phrase.pronunciation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </PaywallOverlay>
        </div>
      </div>
    </main>
  )
}
