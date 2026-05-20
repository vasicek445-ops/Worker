'use client'

import { useEffect, useRef, useState } from 'react'
import type { CVFormData, SectionId } from '@/lib/cv/types'

export type AIAction =
  | 'expand'
  | 'translate-de'
  | 'professional-tone'
  | 'find-keywords'
  | 'fill-from-profile'
  | 'suggest-skills'

interface AIDropdownProps {
  section: SectionId
  formData: CVFormData
  onUpdate: (key: keyof CVFormData, value: CVFormData[keyof CVFormData]) => void
  userToken: string
}

interface ActionOption {
  id: AIAction
  label: string
  needsJob?: boolean
  serverless?: boolean // nepoužívá API
}

function actionsForSection(section: SectionId): ActionOption[] {
  switch (section) {
    case 'experience':
    case 'education':
      return [
        { id: 'expand', label: 'Rozšířit text' },
        { id: 'translate-de', label: 'Přeložit do DE' },
        { id: 'professional-tone', label: 'Profesionálnější tón' },
        { id: 'find-keywords', label: 'Najít DE keywords pro inzerát', needsJob: true },
      ]
    case 'basics':
      return [{ id: 'fill-from-profile', label: 'Vyplnit z profilu', serverless: true }]
    case 'skills':
      return [
        { id: 'suggest-skills', label: 'Doplnit relevantní dovednosti' },
        { id: 'translate-de', label: 'Přeložit do DE' },
      ]
    default:
      return []
  }
}

export default function AIDropdown({ section, formData, onUpdate, userToken }: AIDropdownProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<AIAction | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [keywordModal, setKeywordModal] = useState<null | { action: AIAction }>(null)
  const [jobDescription, setJobDescription] = useState('')
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const options = actionsForSection(section)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function runAction(action: AIAction, extra: { jobDescription?: string } = {}) {
    setError(null)

    if (action === 'fill-from-profile') {
      // Loaduje z profilu uživatele — žádné AI volání, voláme dedikovaný endpoint
      setLoading(action)
      try {
        const res = await fetch('/api/cv/improve', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ action, section, formData }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Akce selhala')
        applyUpdate(data?.updated)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Neznámá chyba')
      } finally {
        setLoading(null)
        setOpen(false)
      }
      return
    }

    setLoading(action)
    try {
      const res = await fetch('/api/cv/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          action,
          section,
          formData,
          jobDescription: extra.jobDescription,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Akce selhala')
      applyUpdate(data?.updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Neznámá chyba')
    } finally {
      setLoading(null)
      setOpen(false)
      setKeywordModal(null)
      setJobDescription('')
    }
  }

  function applyUpdate(updated: Partial<CVFormData> | undefined) {
    if (!updated || typeof updated !== 'object') return
    for (const k of Object.keys(updated) as Array<keyof CVFormData>) {
      const value = updated[k]
      if (value !== undefined) onUpdate(k, value as CVFormData[keyof CVFormData])
    }
  }

  if (options.length === 0) return null

  return (
    <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={loading !== null}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(251,146,60,0.12)',
          color: '#fb923c',
          border: '1px solid rgba(251,146,60,0.35)',
          padding: '6px 10px',
          borderRadius: 8,
          cursor: loading !== null ? 'wait' : 'pointer',
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        {loading !== null ? 'Vylepšuji…' : '✏️ Vylepšit s AI ▾'}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            minWidth: 240,
            background: '#111120',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                if (opt.needsJob) {
                  setKeywordModal({ action: opt.id })
                  setOpen(false)
                } else {
                  runAction(opt.id)
                }
              }}
              disabled={loading !== null}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: 'transparent',
                color: '#f3f4f6',
                border: 'none',
                padding: '10px 12px',
                cursor: 'pointer',
                fontSize: 13,
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(251,146,60,0.08)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              }}
            >
              {opt.label}
              {loading === opt.id && <span style={{ marginLeft: 8, opacity: 0.7 }}>…</span>}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            minWidth: 240,
            background: '#1c1230',
            color: '#fda4af',
            border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: 8,
            padding: '8px 10px',
            fontSize: 12,
            zIndex: 60,
          }}
        >
          {error}
        </div>
      )}

      {keywordModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => setKeywordModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(560px, 92vw)',
              background: '#111120',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: 18,
              color: '#f3f4f6',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 600 }}>
              Vlož inzerát (job description)
            </h3>
            <p style={{ margin: '0 0 10px 0', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
              AI najde 5-10 DE keywords pro ATS, které by mělo CV obsahovat.
            </p>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
              placeholder="Stellenbeschreibung hier einfügen…"
              style={{
                width: '100%',
                background: '#0a0a12',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#f3f4f6',
                padding: 10,
                fontSize: 13,
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setKeywordModal(null)}
                style={{
                  background: 'transparent',
                  color: '#f3f4f6',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                Zrušit
              </button>
              <button
                type="button"
                disabled={!jobDescription.trim() || loading !== null}
                onClick={() => runAction(keywordModal.action, { jobDescription })}
                style={{
                  background: '#fb923c',
                  color: '#0a0a12',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 14px',
                  cursor:
                    !jobDescription.trim() || loading !== null ? 'not-allowed' : 'pointer',
                  opacity: !jobDescription.trim() || loading !== null ? 0.5 : 1,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {loading !== null ? 'Hledám…' : 'Najít keywords'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
