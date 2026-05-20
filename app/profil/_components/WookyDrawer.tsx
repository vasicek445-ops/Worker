'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../supabase'
import { useProfileShell } from './ProfileShell'
import { WOOKY_FIELDS_BY_SECTION, wookyField } from '../../../lib/wooky/fields'
import type { WookyFieldMeta, LanguageEntry } from '../../../lib/wooky/types'
import { parseLanguages, stringifyLanguages } from '../../../lib/wooky/types'

void wookyField // re-exported helper, keep import

interface WookyDrawerProps {
  open: boolean
  onClose: () => void
}

type Step = 'picker' | 'editing' | 'preview' | 'saved'

const SECTION_LABELS: Record<WookyFieldMeta['section'], string> = {
  'osobni-udaje': 'Osobní údaje',
  'kariera': 'Kariéra',
  'cil': 'Cíl',
}

export default function WookyDrawer({ open, onClose }: WookyDrawerProps) {
  const { profile, update } = useProfileShell()
  const [step, setStep] = useState<Step>('picker')
  const [activeField, setActiveField] = useState<WookyFieldMeta | null>(null)
  const [draft, setDraft] = useState('')
  const [expanded, setExpanded] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  // Reset state pri zavreni
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep('picker')
        setActiveField(null)
        setDraft('')
        setExpanded('')
        setError(null)
        setLoading(false)
      }, 300)
      return () => clearTimeout(t)
    }
  }, [open])

  // Autofocus inputu pri editing/preview
  useEffect(() => {
    if (step === 'editing' || step === 'preview') {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [step])

  // Esc zavre
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  function openField(field: WookyFieldMeta) {
    setActiveField(field)
    const current = profile?.[field.key]
    setDraft(typeof current === 'string' || typeof current === 'number' ? String(current) : '')
    setExpanded('')
    setError(null)
    setStep('editing')
  }

  function backToPicker() {
    setStep('picker')
    setActiveField(null)
    setDraft('')
    setExpanded('')
    setError(null)
  }

  async function handleExpand() {
    if (!activeField || activeField.kind !== 'expand') return
    if (!draft.trim()) {
      setError('Napiš mi alespoň pár slov.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Musíš být přihlášený.')
        return
      }
      const res = await fetch('/api/wooky/expand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ field: activeField.key, raw: draft }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      const body = await res.json() as { expanded: string }
      setExpanded(body.expanded)
      setStep('preview')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Něco se pokazilo')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(value: string) {
    if (!activeField) return
    const cleaned = value.trim()
    if (!cleaned) {
      setError('Hodnota nemůže být prázdná.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      // ProfileRow keys jsou union of string/number/bool, ale Wooky pole jsou vsechny string
      // krome income_expected (number). Konvertujeme podle potreby.
      const numericKeys: Array<typeof activeField.key> = ['income_expected']
      const patchValue: string | number = numericKeys.includes(activeField.key)
        ? Number(cleaned) || 0
        : cleaned
      await update({ [activeField.key]: patchValue })
      setStep('saved')
      // Po 1.5s zpet na picker
      setTimeout(() => backToPicker(), 1500)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Uložení selhalo')
    } finally {
      setLoading(false)
    }
  }

  if (!open && step === 'picker') {
    // Skipni render kdyz uplne zavreny + ve startovni state
    // (drobna optimalizace, ale primarne aby HMR neresoval scroll lock)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Wooky AI asistent"
        aria-modal="true"
        className={`fixed z-[100] flex flex-col transition-transform duration-300 ease-out
          right-0 top-0 bottom-0 w-full sm:max-w-[440px]
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
        style={{
          background: 'linear-gradient(180deg, #0d0d1a 0%, #0a0a12 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 h-14 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)' }}
            >
              ✨
            </span>
            <span className="text-white font-bold text-base">Wooky</span>
            {step !== 'picker' && (
              <button
                onClick={backToPicker}
                className="ml-2 text-xs text-white/40 hover:text-white transition"
              >
                ← zpět
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Zavřít"
            className="text-white/40 hover:text-white text-xl leading-none p-1"
          >
            ✕
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {step === 'picker' && (
            <PickerView profile={profile} onPick={openField} />
          )}
          {step === 'editing' && activeField && activeField.kind === 'choice' && (
            <ChoiceView
              field={activeField}
              currentValue={profile?.[activeField.key]}
              loading={loading}
              error={error}
              onSave={(val) => handleSave(val)}
            />
          )}
          {step === 'editing' && activeField && activeField.kind === 'languages' && (
            <LanguagesView
              field={activeField}
              currentValue={profile?.[activeField.key]}
              loading={loading}
              error={error}
              onSave={(val) => handleSave(val)}
            />
          )}
          {step === 'editing' && activeField && (activeField.kind === 'simple' || activeField.kind === 'expand') && (
            <EditingView
              field={activeField}
              draft={draft}
              setDraft={setDraft}
              currentValue={profile?.[activeField.key]}
              loading={loading}
              error={error}
              onExpand={handleExpand}
              onSaveDirect={() => handleSave(draft)}
              inputRef={inputRef}
            />
          )}
          {step === 'preview' && activeField && (
            <PreviewView
              field={activeField}
              expanded={expanded}
              setExpanded={setExpanded}
              loading={loading}
              error={error}
              onSave={() => handleSave(expanded)}
              onRetry={handleExpand}
              inputRef={inputRef}
            />
          )}
          {step === 'saved' && activeField && (
            <SavedView field={activeField} />
          )}
        </div>
      </aside>
    </>
  )
}

// ===== Sub-views =====

function PickerView({
  profile,
  onPick,
}: {
  profile: ReturnType<typeof useProfileShell>['profile']
  onPick: (f: WookyFieldMeta) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-white text-base leading-relaxed">
          Ahoj{profile?.full_name ? ` ${profile.full_name.split(' ')[0]}` : ''}! 👋
        </p>
        <p className="text-white/70 text-sm mt-2 leading-relaxed">
          Pomůžu ti změnit nebo doplnit cokoliv v profilu. Vyplníš to jednou tady — pak to automaticky doplním do CV, motivačních dopisů, e-mailů i žádostí o bydlení.
        </p>
        <p className="text-white/70 text-sm mt-2 leading-relaxed">
          Co chceš pozměnit?
        </p>
      </div>

      {(Object.entries(WOOKY_FIELDS_BY_SECTION) as Array<
        [WookyFieldMeta['section'], WookyFieldMeta[]]
      >).map(([sectionId, fields]) => (
        <div key={sectionId}>
          <div
            className="text-[10px] font-semibold uppercase mb-2"
            style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}
          >
            {SECTION_LABELS[sectionId]}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {fields.map((f) => {
              const v = profile?.[f.key]
              const filled = typeof v === 'string' ? v.trim().length > 0 : v != null && v !== false && v !== 0
              return (
                <button
                  key={f.key}
                  onClick={() => onPick(f)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm transition-colors"
                  style={{
                    background: '#111120',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#e5e5ea',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1a1a26'
                    e.currentTarget.style.borderColor = 'rgba(251,146,60,0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#111120'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  }}
                >
                  <span className="text-base shrink-0">{f.icon}</span>
                  <span className="flex-1 truncate">{f.label}</span>
                  {filled && (
                    <span className="text-[10px]" style={{ color: '#22c55e' }} aria-label="vyplněno">
                      ✓
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function EditingView({
  field,
  draft,
  setDraft,
  currentValue,
  loading,
  error,
  onExpand,
  onSaveDirect,
  inputRef,
}: {
  field: WookyFieldMeta
  draft: string
  setDraft: (v: string) => void
  currentValue: unknown
  loading: boolean
  error: string | null
  onExpand: () => void
  onSaveDirect: () => void
  inputRef: React.RefObject<HTMLTextAreaElement | null>
}) {
  const currentDisplay =
    typeof currentValue === 'string' || typeof currentValue === 'number'
      ? String(currentValue)
      : ''
  const isExpand = field.kind === 'expand'

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{field.icon}</span>
          <h2 className="text-white text-lg font-semibold">{field.label}</h2>
        </div>
        <p className="text-white/60 text-sm leading-relaxed">{field.prompt}</p>
      </div>

      {/* Current value (pokud existuje) */}
      {currentDisplay && (
        <div>
          <div className="text-[10px] uppercase font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>
            Co teď máš
          </div>
          <div
            className="rounded-xl px-3 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            {currentDisplay}
          </div>
        </div>
      )}

      {/* Input */}
      <div>
        <div className="text-[10px] uppercase font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>
          {isExpand ? 'Napiš mi to vlastními slovy' : 'Nová hodnota'}
        </div>
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={field.example}
          rows={isExpand ? 4 : 2}
          className="w-full rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none resize-none"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(251,146,60,0.4)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
        />
      </div>

      {/* Value pitch */}
      <div
        className="rounded-xl p-3 text-xs leading-relaxed"
        style={{
          background: 'rgba(251,146,60,0.06)',
          border: '1px solid rgba(251,146,60,0.15)',
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        💡 <span className="text-white/80 font-medium">{field.valuePitch}</span>
      </div>

      {error && (
        <div className="text-sm" style={{ color: '#ef4444' }}>
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {isExpand ? (
          <>
            <button
              onClick={onExpand}
              disabled={loading || !draft.trim()}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #fb923c, #f97316)',
                color: 'white',
              }}
            >
              {loading ? 'Rozšiřuji…' : '✨ Pomoz mi to rozšířit'}
            </button>
            <button
              onClick={onSaveDirect}
              disabled={loading || !draft.trim()}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              Uložit jak je (bez AI)
            </button>
          </>
        ) : (
          <button
            onClick={onSaveDirect}
            disabled={loading || !draft.trim()}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #fb923c, #f97316)',
              color: 'white',
            }}
          >
            {loading ? 'Ukládám…' : 'Uložit do profilu'}
          </button>
        )}
      </div>
    </div>
  )
}

function PreviewView({
  field,
  expanded,
  setExpanded,
  loading,
  error,
  onSave,
  onRetry,
  inputRef,
}: {
  field: WookyFieldMeta
  expanded: string
  setExpanded: (v: string) => void
  loading: boolean
  error: string | null
  onSave: () => void
  onRetry: () => void
  inputRef: React.RefObject<HTMLTextAreaElement | null>
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{field.icon}</span>
          <h2 className="text-white text-lg font-semibold">Takhle by to vypadalo</h2>
        </div>
        <p className="text-white/60 text-sm leading-relaxed">
          Můžeš upravit text — pak ulož. Použije se ve všech tvých budoucích dokumentech.
        </p>
      </div>

      <div>
        <textarea
          ref={inputRef}
          value={expanded}
          onChange={(e) => setExpanded(e.target.value)}
          rows={8}
          className="w-full rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none resize-none leading-relaxed"
          style={{
            background: 'rgba(251,146,60,0.04)',
            border: '1px solid rgba(251,146,60,0.2)',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(251,146,60,0.5)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(251,146,60,0.2)')}
        />
      </div>

      {error && (
        <div className="text-sm" style={{ color: '#ef4444' }}>
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          onClick={onSave}
          disabled={loading || !expanded.trim()}
          className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)', color: 'white' }}
        >
          {loading ? 'Ukládám…' : 'Uložit do profilu'}
        </button>
        <button
          onClick={onRetry}
          disabled={loading}
          className="w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          ↺ Zkusit znovu jinak
        </button>
      </div>
    </div>
  )
}

// ===== ChoiceView: chips s pevnymi moznostmi (single nebo multi) =====
function ChoiceView({
  field,
  currentValue,
  loading,
  error,
  onSave,
}: {
  field: WookyFieldMeta
  currentValue: unknown
  loading: boolean
  error: string | null
  onSave: (value: string) => void
}) {
  const isMulti = !!field.multi
  const customAllowed = !!field.customAllowed
  const currentStr =
    typeof currentValue === 'string' || typeof currentValue === 'number'
      ? String(currentValue)
      : ''

  // pro multi rozsekej "A, B, C" -> Set<string>
  const initialSelected = new Set<string>(
    isMulti
      ? currentStr.split(',').map((s) => s.trim()).filter(Boolean)
      : currentStr ? [currentStr] : [],
  )
  const [selected, setSelected] = useState<Set<string>>(initialSelected)
  const [custom, setCustom] = useState<string>(() => {
    if (!customAllowed) return ''
    // detect ze current je custom (neni mezi options)
    const opts = field.options || []
    if (!isMulti && currentStr && !opts.some((o) => o.value === currentStr)) {
      return currentStr
    }
    return ''
  })

  function toggle(value: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (isMulti) {
        next.has(value) ? next.delete(value) : next.add(value)
      } else {
        next.clear()
        next.add(value)
        // single-select clear custom
        setCustom('')
      }
      return next
    })
  }

  function handleSubmit() {
    if (isMulti) {
      const arr = Array.from(selected)
      if (arr.length === 0 && !custom.trim()) return
      const value = customAllowed && custom.trim()
        ? [...arr, custom.trim()].join(', ')
        : arr.join(', ')
      onSave(value)
    } else {
      const picked = Array.from(selected)[0] || ''
      const value = picked || custom.trim()
      if (!value) return
      onSave(value)
    }
  }

  const canSubmit = isMulti
    ? selected.size > 0 || custom.trim().length > 0
    : selected.size > 0 || custom.trim().length > 0

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{field.icon}</span>
          <h2 className="text-white text-lg font-semibold">{field.label}</h2>
        </div>
        <p className="text-white/60 text-sm leading-relaxed">{field.prompt}</p>
        {isMulti && (
          <p className="text-white/40 text-xs mt-1">Můžeš vybrat víc.</p>
        )}
      </div>

      {/* Chips grid */}
      <div className="flex flex-wrap gap-2">
        {(field.options || []).map((opt) => {
          const active = selected.has(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className="px-3 py-2 rounded-xl text-sm transition-all"
              style={{
                background: active ? 'rgba(251,146,60,0.15)' : 'rgba(255,255,255,0.04)',
                border: active ? '1px solid rgba(251,146,60,0.5)' : '1px solid rgba(255,255,255,0.08)',
                color: active ? '#fb923c' : '#e5e5ea',
                fontWeight: active ? 600 : 500,
              }}
            >
              {opt.label}
              {opt.hint && (
                <span className="ml-1.5 text-[10px] opacity-60">{opt.hint}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Custom input */}
      {customAllowed && (
        <div>
          <div className="text-[10px] uppercase font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>
            Nebo zadej vlastní
          </div>
          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Vlastní hodnota…"
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(251,146,60,0.4)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
          />
        </div>
      )}

      {/* Value pitch */}
      <div
        className="rounded-xl p-3 text-xs leading-relaxed"
        style={{
          background: 'rgba(251,146,60,0.06)',
          border: '1px solid rgba(251,146,60,0.15)',
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        💡 <span className="text-white/80 font-medium">{field.valuePitch}</span>
      </div>

      {error && (
        <div className="text-sm" style={{ color: '#ef4444' }}>
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !canSubmit}
        className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)', color: 'white' }}
      >
        {loading ? 'Ukládám…' : 'Uložit do profilu'}
      </button>
    </div>
  )
}

// ===== LanguagesView: list radek (jazyk + uroven), Add button =====
function LanguagesView({
  field,
  currentValue,
  loading,
  error,
  onSave,
}: {
  field: WookyFieldMeta
  currentValue: unknown
  loading: boolean
  error: string | null
  onSave: (value: string) => void
}) {
  const currentStr = typeof currentValue === 'string' ? currentValue : ''
  const [entries, setEntries] = useState<LanguageEntry[]>(() => {
    const parsed = parseLanguages(currentStr)
    return parsed.length > 0 ? parsed : [{ lang: '', level: '' }]
  })

  function updateRow(idx: number, patch: Partial<LanguageEntry>) {
    setEntries((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }

  function addRow() {
    setEntries((rows) => [...rows, { lang: '', level: '' }])
  }

  function removeRow(idx: number) {
    setEntries((rows) => rows.filter((_, i) => i !== idx))
  }

  function handleSubmit() {
    const cleaned = entries.filter((e) => e.lang.trim().length > 0)
    onSave(stringifyLanguages(cleaned))
  }

  const canSubmit = entries.some((e) => e.lang.trim().length > 0)
  const usedLangs = new Set(entries.map((e) => e.lang))

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{field.icon}</span>
          <h2 className="text-white text-lg font-semibold">{field.label}</h2>
        </div>
        <p className="text-white/60 text-sm leading-relaxed">{field.prompt}</p>
      </div>

      <div className="space-y-2.5">
        {entries.map((row, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <select
              value={row.lang}
              onChange={(e) => updateRow(idx, { lang: e.target.value })}
              className="flex-1 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none appearance-none cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <option value="" disabled className="bg-[#111120]">— vyber jazyk —</option>
              {(field.languageOptions || []).map((l) => {
                const disabled = usedLangs.has(l) && l !== row.lang
                return (
                  <option key={l} value={l} disabled={disabled} className="bg-[#111120]">
                    {l}{disabled ? ' (už máš)' : ''}
                  </option>
                )
              })}
            </select>
            <select
              value={row.level}
              onChange={(e) => updateRow(idx, { level: e.target.value })}
              className="w-28 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none appearance-none cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <option value="" className="bg-[#111120]">úroveň</option>
              {(field.levelOptions || []).map((lv) => (
                <option key={lv.value} value={lv.value} className="bg-[#111120]">
                  {lv.label}
                </option>
              ))}
            </select>
            {entries.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(idx)}
                aria-label="Odstranit jazyk"
                className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-red-400 transition"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addRow}
          className="w-full py-2 rounded-xl text-sm font-medium transition-colors"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.6)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(251,146,60,0.05)'
            e.currentTarget.style.borderColor = 'rgba(251,146,60,0.3)'
            e.currentTarget.style.color = '#fb923c'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
          }}
        >
          + Přidat další jazyk
        </button>
      </div>

      <div
        className="rounded-xl p-3 text-xs leading-relaxed"
        style={{
          background: 'rgba(251,146,60,0.06)',
          border: '1px solid rgba(251,146,60,0.15)',
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        💡 <span className="text-white/80 font-medium">{field.valuePitch}</span>
      </div>

      {error && (
        <div className="text-sm" style={{ color: '#ef4444' }}>
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !canSubmit}
        className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)', color: 'white' }}
      >
        {loading ? 'Ukládám…' : 'Uložit do profilu'}
      </button>
    </div>
  )
}

function SavedView({ field }: { field: WookyFieldMeta }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 space-y-3">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
        style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
      >
        ✓
      </div>
      <h2 className="text-white text-lg font-semibold">Uloženo</h2>
      <p className="text-white/60 text-sm max-w-xs">
        Pole „{field.label}&quot; je teď v tvém profilu. Použiju ho automaticky ve všech budoucích dokumentech.
      </p>
    </div>
  )
}
