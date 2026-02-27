'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'

interface Field {
  name: string
  label: string
  placeholder: string
  type?: 'text' | 'textarea' | 'select'
  options?: string[]
  required?: boolean
}

interface GenerateFormProps {
  type: 'motivacni-dopis' | 'email' | 'cv'
  title: string
  subtitle: string
  fields: Field[]
  initialData?: Record<string, string>
}

export default function GenerateForm({ type, title, subtitle, fields, initialData }: GenerateFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({ ...prev, ...initialData }))
    }
  }, [initialData])
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    // Validate required fields
    const missing = fields
      .filter((f) => f.required !== false && !formData[f.name]?.trim())
      .map((f) => f.label)

    if (missing.length > 0) {
      setError(`Vyplň prosím: ${missing.join(', ')}`)
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError('Musíš být přihlášen')
        setLoading(false)
        return
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ type, formData }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Generování selhalo')
      }

      setResult(data.document)
    } catch (err: any) {
      setError(err.message || 'Něco se pokazilo')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = result
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
  }

  // ─── RESULT VIEW ────────────────────────────────────────
  if (result) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">✅ Hotovo!</h2>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="text-gray-400 hover:text-white text-sm px-3 py-1 border border-gray-700 rounded-lg transition"
            >
              ← Upravit údaje
            </button>
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-5">
          <pre className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {result}
          </pre>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 bg-[#E8302A] text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition text-center"
          >
            {copied ? '✅ Zkopírováno!' : '📋 Kopírovat do schránky'}
          </button>
        </div>

        <p className="text-gray-500 text-xs text-center">
          💡 Tip: Zkopíruj text a vlož do Wordu nebo Google Docs pro finální úpravy
        </p>

        {/* Generate another */}
        <button
          onClick={() => {
            setResult(null)
            setFormData({})
          }}
          className="w-full text-gray-400 hover:text-white text-sm py-2 transition"
        >
          🔄 Vygenerovat nový dokument
        </button>
      </div>
    )
  }

  // ─── FORM VIEW ──────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-white text-xl font-bold mb-1">{title}</h2>
        <p className="text-gray-400 text-sm">{subtitle}</p>
      </div>

      {fields.map((field) => (
        <div key={field.name}>
          <label className="text-gray-300 text-sm font-medium mb-1.5 block">
            {field.label}
            {field.required !== false && <span className="text-[#E8302A] ml-1">*</span>}
          </label>

          {field.type === 'textarea' ? (
            <textarea
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
              className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition resize-none"
            />
          ) : field.type === 'select' ? (
            <select
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:border-gray-600 focus:outline-none transition appearance-none"
            >
              <option value="" className="text-gray-600">{field.placeholder}</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-gray-600 focus:outline-none transition"
            />
          )}
        </div>
      ))}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <p className="text-red-400 text-sm">⚠️ {error}</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-[#E8302A] text-white font-bold py-3.5 px-6 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            AI generuje dokument...
          </span>
        ) : (
          '🚀 Vygenerovat'
        )}
      </button>

      <p className="text-gray-600 text-xs text-center">
        Všechny údaje vyplňuj česky – AI přeloží do němčiny automaticky
      </p>
    </div>
  )
}
