'use client'

import { useProfileShell } from '../_components/ProfileShell'

const FIELDS = [
  'Gastronomie',
  'Stavebnictví',
  'Logistika a sklad',
  'Úklid',
  'Zdravotnictví a péče',
  'Výroba a montáž',
  'Řidič',
  'Zemědělství',
  'Hotelnictví',
  'Jiné',
]

const NEMCINA_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const inputClass =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fb923c]/40'
const labelClass = 'block text-white/60 text-xs font-medium mb-1.5'
const hintClass = 'text-white/30 text-xs mt-1'

export default function KarieraPage() {
  const { profile, loading, update, saving, savedAt } = useProfileShell()

  const saveStatus = saving ? 'Ukládám…' : savedAt ? 'Uloženo' : ''

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
            <h1 className="text-2xl font-extrabold text-white m-0">Kariéra</h1>
            <p className="text-white/40 text-sm mt-1">Co umíš a kde jsi pracoval. AI to rozšíří do CV — piš stručně, body stačí.</p>
          </div>
          {saveStatus && (
            <span className="text-[11px] text-white/40 mt-1 whitespace-nowrap">{saveStatus}</span>
          )}
        </header>

        <div className="bg-[#111120] rounded-2xl border border-white/[0.06] p-5 space-y-4">
          <div>
            <label className={labelClass}>Obor</label>
            <select
              value={profile?.obor || ''}
              onChange={(e) => update({ obor: e.target.value })}
              className={inputClass + ' appearance-none cursor-pointer'}
            >
              <option value="" disabled className="bg-[#111120]">Vyber obor</option>
              {FIELDS.map((f) => (
                <option key={f} value={f} className="bg-[#111120]">{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Pozice</label>
            <input
              type="text"
              value={profile?.pozice || ''}
              onChange={(e) => update({ pozice: e.target.value })}
              className={inputClass}
              placeholder="Kuchař, zedník, řidič C+E…"
            />
            <p className={hintClass}>Konkrétní pozice, kterou hledáš.</p>
          </div>

          <div>
            <label className={labelClass}>Úroveň němčiny</label>
            <select
              value={profile?.nemcina_uroven || ''}
              onChange={(e) => update({ nemcina_uroven: e.target.value })}
              className={inputClass + ' appearance-none cursor-pointer'}
            >
              <option value="" disabled className="bg-[#111120]">Vyber úroveň</option>
              {NEMCINA_LEVELS.map((l) => (
                <option key={l} value={l} className="bg-[#111120]">{l}</option>
              ))}
            </select>
            <p className={hintClass}>A1 = začátečník, C2 = rodilý mluvčí.</p>
          </div>

          <div>
            <label className={labelClass}>Další jazyky</label>
            <input
              type="text"
              value={profile?.dalsi_jazyky || ''}
              onChange={(e) => update({ dalsi_jazyky: e.target.value })}
              className={inputClass}
              placeholder="Angličtina B2, italština A2…"
            />
          </div>

          <div>
            <label className={labelClass}>Zkušenosti</label>
            <textarea
              rows={6}
              value={profile?.zkusenosti || ''}
              onChange={(e) => update({ zkusenosti: e.target.value })}
              className={inputClass + ' resize-y'}
              placeholder={'2020-2024 — Kuchař v restauraci Slunce (Praha)\n2018-2020 — Pomocník v kuchyni, Hotel Lev'}
            />
            <p className={hintClass}>Roky — pozice — firma. Body postačí, AI to rozšíří.</p>
          </div>

          <div>
            <label className={labelClass}>Vzdělání</label>
            <textarea
              rows={3}
              value={profile?.vzdelani || ''}
              onChange={(e) => update({ vzdelani: e.target.value })}
              className={inputClass + ' resize-y'}
              placeholder="SOU gastronomické, Praha 2014-2017"
            />
          </div>

          <div>
            <label className={labelClass}>Dovednosti</label>
            <textarea
              rows={3}
              value={profile?.dovednosti || ''}
              onChange={(e) => update({ dovednosti: e.target.value })}
              className={inputClass + ' resize-y'}
              placeholder="Řízení kuchyně, HACCP, práce pod tlakem, vlastní receptury…"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
