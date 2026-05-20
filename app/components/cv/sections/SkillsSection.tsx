'use client'

import { useState } from 'react'
import type { CVFormData } from '@/lib/cv/types'

interface SkillsSectionProps {
  formData: CVFormData
  onChange: (key: keyof CVFormData, value: CVFormData[keyof CVFormData]) => void
}

const inputClass =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fb923c]/40'

const labelClass = 'block text-xs font-medium text-white/60 mb-1.5'

// Hard-coded typické dovednosti per obor (3-5 skills × CS + DE).
const TYPICAL_SKILLS: Record<string, Array<{ cs: string; de: string }>> = {
  'Stavebnictví': [
    { cs: 'Svařování MIG/MAG', de: 'Schweissen MIG/MAG' },
    { cs: 'Obsluha jeřábu', de: 'Bedienung Turmdrehkran' },
    { cs: 'Práce ve výškách', de: 'Höhenarbeit (SUVA)' },
    { cs: 'Čtení výkresů', de: 'Lesen technischer Pläne' },
    { cs: 'Bednění a betonáž', de: 'Schalungs- und Betonarbeiten' },
  ],
  'Gastronomie / Hotelnictví': [
    { cs: 'HACCP standardy', de: 'HACCP-Hygienevorschriften' },
    { cs: 'Mise en place', de: 'Mise en place' },
    { cs: 'Práce na grillu / sauté', de: 'Arbeit am Grill- und Sauté-Posten' },
    { cs: 'Kasovní systémy', de: 'Kassensysteme (Lightspeed, Gastrofix)' },
    { cs: 'Servis hostů', de: 'Service am Gast' },
  ],
  'Logistika / Sklad': [
    { cs: 'Vysokozdvižný vozík (Stapler)', de: 'Gabelstapler-Fahrausweis' },
    { cs: 'SAP / Navision', de: 'ERP-Systeme SAP / Navision' },
    { cs: 'Pick by Scan', de: 'Kommissionierung mit Handscanner' },
    { cs: 'Retrak', de: 'Schubmaststapler' },
    { cs: 'Skladová evidence', de: 'Lagerbestandsführung' },
  ],
  'Zdravotnictví': [
    { cs: 'Pflegehelfer SRK', de: 'Pflegehelfer/in SRK' },
    { cs: 'Měření vitálních funkcí', de: 'Messen von Vitalzeichen' },
    { cs: 'Polohování pacientů', de: 'Lagerung und Mobilisation' },
    { cs: 'Spitex zkušenost', de: 'Spitex-Erfahrung' },
    { cs: 'Pflegedokumentation', de: 'Pflegedokumentation' },
  ],
  'Úklid / Údržba': [
    { cs: 'Strojní čištění podlah', de: 'Maschinelle Bodenreinigung' },
    { cs: 'Mytí oken', de: 'Fenster- und Fassadenreinigung' },
    { cs: 'Bauendreinigung', de: 'Bauendreinigung' },
    { cs: 'Práce s chemií', de: 'Sicherer Umgang mit Reinigungschemikalien' },
    { cs: 'Housekeeping', de: 'Housekeeping' },
  ],
  'Strojírenství / Technik': [
    { cs: 'CNC obsluha', de: 'CNC-Maschinenbedienung' },
    { cs: 'Frézování / soustružení', de: 'Fräsen und Drehen' },
    { cs: 'Čtení výkresů', de: 'Lesen technischer Zeichnungen' },
    { cs: 'Měření a kontrola kvality', de: 'Messen und Qualitätskontrolle' },
  ],
  'IT / Software': [
    { cs: 'Programování', de: 'Programmierung' },
    { cs: 'Databáze SQL', de: 'SQL-Datenbanken' },
    { cs: 'Verzování Git', de: 'Versionskontrolle Git' },
    { cs: 'Cloud (AWS / Azure)', de: 'Cloud-Plattformen (AWS / Azure)' },
  ],
  'Elektro / Instalatér': [
    { cs: 'Elektroinstalace', de: 'Elektroinstallationen' },
    { cs: 'Sanitární instalace', de: 'Sanitärinstallationen' },
    { cs: 'Čtení schémat', de: 'Lesen von Schaltplänen' },
    { cs: 'Měření a revize', de: 'Messen und Prüfen' },
  ],
  'Řidič / Doprava': [
    { cs: 'Řidičský průkaz C / CE', de: 'Führerschein C / CE' },
    { cs: 'Digitální tachograf', de: 'Digitaler Tachograph' },
    { cs: 'ADR (nebezpečné zboží)', de: 'ADR-Schein (Gefahrgut)' },
    { cs: 'Mezinárodní doprava', de: 'Internationale Transporte' },
  ],
}

export default function SkillsSection({ formData, onChange }: SkillsSectionProps) {
  const [showPanel, setShowPanel] = useState(false)
  const field = formData.field
  const typical = field ? TYPICAL_SKILLS[field] : undefined

  const insertSkill = (de: string) => {
    const existing = formData.skills || ''
    const parts = existing.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.includes(de)) return
    parts.push(de)
    onChange('skills', parts.join(', '))
  }

  const insertAll = () => {
    if (!typical) return
    const existing = formData.skills || ''
    const parts = existing.split(',').map((s) => s.trim()).filter(Boolean)
    for (const s of typical) {
      if (!parts.includes(s.de)) parts.push(s.de)
    }
    onChange('skills', parts.join(', '))
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className={labelClass + ' !mb-0'}>Dovednosti a certifikáty</label>
          {typical && typical.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPanel((v) => !v)}
              className="rounded-lg bg-[#fb923c]/15 px-2.5 py-1 text-xs font-medium text-[#fb923c] transition hover:bg-[#fb923c]/25"
            >
              💡 Vlož typické dovednosti pro {field}
            </button>
          )}
        </div>
        <textarea
          value={formData.skills || ''}
          onChange={(e) => onChange('skills', e.target.value)}
          placeholder="svařování, jeřáb, práce ve výškách... AI doplní"
          rows={4}
          className={inputClass + ' resize-y'}
        />
        <p className="mt-1.5 text-[11px] text-white/40">
          Odděl dovednosti čárkou. AI z nich udělá strukturovaný seznam v CV.
        </p>
      </div>

      {showPanel && typical && (
        <div className="rounded-xl border border-white/[0.08] bg-[#0f0f1c] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-semibold text-white/80">
              Typické dovednosti pro: <span className="text-[#fb923c]">{field}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={insertAll}
                className="rounded-lg bg-[#fb923c]/15 px-2.5 py-1 text-xs font-medium text-[#fb923c] hover:bg-[#fb923c]/25"
              >
                Vložit vše
              </button>
              <button
                type="button"
                onClick={() => setShowPanel(false)}
                className="text-xs text-white/40 hover:text-white/80"
              >
                zavřít
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            {typical.map((s) => (
              <button
                key={s.de}
                type="button"
                onClick={() => insertSkill(s.de)}
                className="group grid w-full grid-cols-2 gap-3 rounded-lg border border-transparent bg-white/[0.02] px-3 py-2 text-left transition hover:border-[#fb923c]/30 hover:bg-white/[0.05]"
              >
                <div className="text-xs text-white/50 group-hover:text-white/70">{s.cs}</div>
                <div className="text-xs font-semibold text-white group-hover:text-[#fb923c]">{s.de}</div>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-white/40">Klikni a dovednost se přidá do seznamu.</p>
        </div>
      )}
    </div>
  )
}
