'use client'

import { useProfile } from '../../../lib/profile/hooks'

const KANTONY = [
  'Kdekoliv v CH',
  'Zürich', 'Bern', 'Luzern', 'Uri', 'Schwyz', 'Obwalden', 'Nidwalden',
  'Glarus', 'Zug', 'Fribourg', 'Solothurn', 'Basel-Stadt', 'Basel-Landschaft',
  'Schaffhausen', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden',
  'St. Gallen', 'Graubünden', 'Aargau', 'Thurgau', 'Ticino', 'Vaud',
  'Valais', 'Neuchâtel', 'Genève', 'Jura',
]

const PERMITS = [
  { value: 'B', label: 'B — povolení k pobytu' },
  { value: 'C', label: 'C — trvalý pobyt' },
  { value: 'L', label: 'L — krátkodobý' },
  { value: 'G', label: 'G — přeshraniční' },
  { value: 'pending', label: 'Žádost podaná' },
  { value: 'none', label: 'Žádné — ucházím se nově' },
  { value: 'other', label: 'Jiné' },
]

const inputClass =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fb923c]/40'
const labelClass = 'block text-white/60 text-xs font-medium mb-1.5'
const hintClass = 'text-white/30 text-xs mt-1'

export default function CilPage() {
  const { profile, loading, update, saving, savedAt } = useProfile()

  const saveStatus = saving ? 'Ukládám…' : savedAt ? 'Uloženo' : ''
  const willing = !!profile?.willing_to_relocate

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#fb923c] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <div className="max-w-[640px] mx-auto px-5 py-8">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white m-0">Cíl</h1>
            <p className="text-white/40 text-sm mt-1">Kam míříš ve Švýcarsku a za jakých podmínek. Použijeme to při matchování a v dopise pronajímateli.</p>
          </div>
          {saveStatus && (
            <span className="text-[11px] text-white/40 mt-1 whitespace-nowrap">{saveStatus}</span>
          )}
        </header>

        <div className="bg-[#111120] rounded-2xl border border-white/[0.06] p-5 space-y-4">
          <div>
            <label className={labelClass}>Preferovaný kanton</label>
            <select
              value={profile?.preferovany_kanton || ''}
              onChange={(e) => update({ preferovany_kanton: e.target.value })}
              className={inputClass + ' appearance-none cursor-pointer'}
            >
              <option value="" disabled className="bg-[#111120]">Vyber kanton</option>
              {KANTONY.map((k) => (
                <option key={k} value={k} className="bg-[#111120]">{k}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Očekávaný příjem (CHF/měs)</label>
            <input
              type="number"
              inputMode="numeric"
              value={profile?.income_expected ?? ''}
              onChange={(e) => {
                const v = e.target.value
                update({ income_expected: v === '' ? null : Number(v) })
              }}
              className={inputClass}
              placeholder="napr. 4500"
            />
            <p className={hintClass}>Co bys očekával minimálně? Volitelné.</p>
          </div>

          <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-3">
            <div className="pr-4">
              <p className="text-white text-sm font-medium m-0">Ochotný relokovat za prací</p>
              <p className="text-white/30 text-xs mt-0.5">Přestěhuju se kvůli dobré nabídce.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={willing}
              onClick={() => update({ willing_to_relocate: !willing })}
              className={`relative w-11 h-6 rounded-full transition shrink-0 ${willing ? 'bg-[#fb923c]' : 'bg-white/[0.12]'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${willing ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>

          <div>
            <label className={labelClass}>Aktuální zaměstnavatel</label>
            <input
              type="text"
              value={profile?.employer_current || ''}
              onChange={(e) => update({ employer_current: e.target.value })}
              className={inputClass}
              placeholder="napr. Restaurace Slunce, Praha"
            />
            <p className={hintClass}>Volitelné — pomáhá u dopisu pronajímateli.</p>
          </div>

          <div>
            <label className={labelClass}>Status pracovního povolení (CH)</label>
            <select
              value={profile?.work_permit_status || ''}
              onChange={(e) => update({ work_permit_status: e.target.value })}
              className={inputClass + ' appearance-none cursor-pointer'}
            >
              <option value="" disabled className="bg-[#111120]">Vyber status</option>
              {PERMITS.map((p) => (
                <option key={p.value} value={p.value} className="bg-[#111120]">{p.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
