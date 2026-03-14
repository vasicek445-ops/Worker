'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSubscription } from '../../../hooks/useSubscription'
import PaywallOverlay from '../../components/PaywallOverlay'
import AIWorkflow, { StepPanel, ResultActions, StreamingIndicator } from '../../components/AIWorkflow'
import Link from 'next/link'
import { supabase } from '../../supabase'

// ─── Template definitions ────────────────────────────────

type TemplateType = 'motivacni-dopis' | 'email' | 'cv'

interface FieldDef {
  name: string
  label: string
  placeholder: string
  type?: 'text' | 'textarea' | 'select'
  options?: string[]
  required?: boolean
}

interface Template {
  id: TemplateType
  icon: string
  title: string
  description: string
  tag: string
  tagColor: string
  time: string
  fields: FieldDef[]
  subtitle: string
}

const FIELD_OPTIONS = [
  'Stavebnictví',
  'Gastronomie / Hotelnictví',
  'Logistika / Sklad',
  'Zdravotnictví',
  'Úklid / Údržba',
  'Strojírenství / Technik',
  'IT / Software',
  'Elektro / Instalatér',
  'Řidič / Doprava',
  'Jiný obor',
]

const GERMAN_LEVELS = [
  'Žádná – teprve se učím',
  'Základy – pár frází (A1)',
  'Základní komunikace (A2)',
  'Dorozumím se (B1)',
  'Dobrá úroveň (B2)',
  'Plynulá (C1/C2)',
]

const TEMPLATES: Template[] = [
  {
    id: 'motivacni-dopis',
    icon: '✉️',
    title: 'Motivační dopis v němčině',
    description: 'AI vytvoří profesionální Bewerbungsschreiben přizpůsobený švýcarskému trhu.',
    tag: '🔥 Nejoblíbenější',
    tagColor: 'bg-orange-500/10 text-orange-400',
    time: '~30 sekund',
    subtitle: 'Vyplň údaje česky – AI vytvoří dopis v němčině + český překlad',
    fields: [
      { name: 'name', label: 'Tvoje celé jméno', placeholder: 'Jan Novák' },
      { name: 'position', label: 'Na jakou pozici se hlásíš?', placeholder: 'např. Monteur, Küchenhilfe, Lagerist...' },
      { name: 'company', label: 'Název firmy nebo agentury', placeholder: 'např. Adecco, Randstad...', required: false },
      { name: 'field', label: 'Obor', placeholder: 'Vyber obor', type: 'select', options: FIELD_OPTIONS },
      { name: 'experience', label: 'Kolik let praxe máš v oboru?', placeholder: 'např. 5 let' },
      { name: 'skills', label: 'Hlavní dovednosti a zkušenosti', placeholder: 'např. svařování, obsluha CNC, řidičák C...', type: 'textarea' },
      { name: 'german', label: 'Úroveň němčiny', placeholder: 'Vyber úroveň', type: 'select', options: GERMAN_LEVELS },
      { name: 'motivation', label: 'Proč chceš pracovat ve Švýcarsku?', placeholder: 'např. lepší podmínky, zkušenosti...', required: false },
      { name: 'extra', label: 'Něco navíc? (volitelné)', placeholder: 'např. mám rodinu ve Švýcarsku...', required: false },
    ],
  },
  {
    id: 'email',
    icon: '📧',
    title: 'Email pro oslovení firmy / agentury',
    description: 'Krátký, profesionální email v němčině pro HR oddělení.',
    tag: 'Rychlý výsledek',
    tagColor: 'bg-blue-500/10 text-blue-400',
    time: '~20 sekund',
    subtitle: 'AI vytvoří email v němčině + český překlad',
    fields: [
      { name: 'name', label: 'Tvoje celé jméno', placeholder: 'Jan Novák' },
      { name: 'position', label: 'Na jakou pozici se hlásíš?', placeholder: 'např. Monteur, Küchenhilfe...' },
      { name: 'company', label: 'Název firmy nebo agentury', placeholder: 'např. Adecco, Randstad...', required: false },
      { name: 'field', label: 'Obor', placeholder: 'Vyber obor', type: 'select', options: FIELD_OPTIONS },
      { name: 'experience', label: 'Kolik let praxe?', placeholder: 'např. 5 let' },
      { name: 'german', label: 'Úroveň němčiny', placeholder: 'Vyber úroveň', type: 'select', options: GERMAN_LEVELS },
      { name: 'extra', label: 'Něco navíc? (volitelné)', placeholder: 'např. okamžitý nástup...', required: false },
    ],
  },
  {
    id: 'cv',
    icon: '📄',
    title: 'Životopis (Lebenslauf)',
    description: 'CV ve formátu, který švýcarské firmy očekávají.',
    tag: 'Kompletní CV',
    tagColor: 'bg-green-500/10 text-green-400',
    time: '~45 sekund',
    subtitle: 'Vyplň údaje česky – AI vytvoří CV ve švýcarském formátu',
    fields: [
      { name: 'name', label: 'Celé jméno', placeholder: 'Jan Novák' },
      { name: 'birthdate', label: 'Datum narození', placeholder: '15.03.1990' },
      { name: 'phone', label: 'Telefon', placeholder: '+420 xxx xxx xxx' },
      { name: 'email', label: 'Email', placeholder: 'jan@email.cz' },
      { name: 'position', label: 'Cílová pozice', placeholder: 'např. Monteur, Elektriker...' },
      { name: 'field', label: 'Obor', placeholder: 'Vyber obor', type: 'select', options: FIELD_OPTIONS },
      { name: 'experience_detail', label: 'Pracovní zkušenosti', placeholder: '2019–2024: Montér, Firma XY\n2016–2019: Pomocný dělník, Firma AB', type: 'textarea' },
      { name: 'education', label: 'Vzdělání', placeholder: '2012–2016: SOU strojírenské, obor zámečník', type: 'textarea' },
      { name: 'german', label: 'Úroveň němčiny', placeholder: 'Vyber úroveň', type: 'select', options: GERMAN_LEVELS },
      { name: 'skills', label: 'Dovednosti', placeholder: 'svařování, CNC, řidičák B+C...', type: 'textarea' },
      { name: 'extra', label: 'Další info (volitelné)', placeholder: 'certifikáty, kurzy...', required: false },
    ],
  },
]

// ─── Other templates (link to sub-pages) ─────────────────

const OTHER_TEMPLATES = [
  {
    icon: '🎤',
    title: 'AI příprava na pohovor',
    href: '/pruvodce/sablony/pohovor',
    tag: '🆕 Nové',
    tagColor: 'bg-purple-500/10 text-purple-400',
  },
  {
    icon: '📋',
    title: 'AI analýza inzerátu',
    href: '/pruvodce/sablony/analyza',
    tag: '🆕 Nové',
    tagColor: 'bg-blue-500/10 text-blue-400',
  },
  {
    icon: '📑',
    title: 'AI analýza pracovní smlouvy',
    href: '/pruvodce/sablony/smlouva',
    tag: '🆕 Nové',
    tagColor: 'bg-green-500/10 text-green-400',
  },
  {
    icon: '🏠',
    title: 'AI hledání bydlení',
    href: '/pruvodce/sablony/bydleni',
    tag: '🆕 Nové',
    tagColor: 'bg-green-500/10 text-green-400',
  },
]

// ─── Workflow Steps ──────────────────────────────────────

const WORKFLOW_STEPS = [
  { label: 'Šablona', icon: '📝' },
  { label: 'Generování', icon: '⚡' },
  { label: 'Výsledek', icon: '✅' },
]

// ─── Component ───────────────────────────────────────────

export default function Sablony() {
  const { isActive, loading: subLoading } = useSubscription()
  const [step, setStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [result, setResult] = useState('')
  const [streamingText, setStreamingText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false) // eslint-disable-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to result when it appears
  useEffect(() => {
    if (step === 3 && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [step])

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setFormData({})
    setResult('')
    setError(null)
    // Stay on step 1 — form is shown below template selection
  }

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenerate = useCallback(async () => {
    if (!selectedTemplate) return

    // Validate required fields
    const missing = selectedTemplate.fields
      .filter((f) => f.required !== false && !formData[f.name]?.trim())
      .map((f) => f.label)

    if (missing.length > 0) {
      setError(`Vyplň prosím: ${missing.join(', ')}`)
      return
    }

    setError(null)
    setStep(2)
    setIsGenerating(true)
    setStreamingText('')
    setResult('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError('Musíš být přihlášen')
        setStep(1)
        setIsGenerating(false)
        return
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: selectedTemplate.id,
          formData,
          stream: true,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Generování selhalo' }))
        throw new Error(errData.error || 'Generování selhalo')
      }

      const contentType = res.headers.get('content-type') || ''

      if (contentType.includes('text/event-stream')) {
        const reader = res.body?.getReader()
        if (!reader) throw new Error('No body')

        const decoder = new TextDecoder()
        let fullText = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue
              try {
                const parsed = JSON.parse(data)
                if (parsed.text) {
                  fullText += parsed.text
                  setStreamingText(fullText)
                }
              } catch { /* skip */ }
            }
          }
        }

        setResult(fullText)
      } else {
        // JSON fallback
        const data = await res.json()
        setResult(data.document || '')
      }

      setStep(3)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Něco se pokazilo')
      setStep(1)
    } finally {
      setIsGenerating(false)
      setStreamingText('')
    }
  }, [selectedTemplate, formData])

  const handleReset = () => {
    setStep(1)
    setSelectedTemplate(null)
    setFormData({})
    setResult('')
    setError(null)
  }

  const handleEditForm = () => {
    setStep(1)
    setResult('')
  }

  const filenameMap: Record<TemplateType, string> = {
    'motivacni-dopis': 'motivacni-dopis.txt',
    'email': 'email-svycarsko.txt',
    'cv': 'lebenslauf.txt',
  }

  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/pruvodce" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
          ← Zpět na průvodce
        </Link>

        <h1 className="text-white text-2xl font-bold mb-2">📝 AI Šablony pro Švýcarsko</h1>
        <p className="text-gray-400 text-sm mb-2">
          Vyplň pár údajů a AI ti vytvoří profesionální dokument v němčině + český překlad
        </p>
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs font-medium">Poháněno umělou inteligencí</span>
        </div>

        <PaywallOverlay
          isLocked={!isActive && !subLoading}
          title="AI šablony jsou součástí Premium"
          description="Nech AI vytvořit profesionální dokumenty v němčině za tebe"
        >
          <AIWorkflow steps={WORKFLOW_STEPS} currentStep={step}>
            {/* ─── Step 1: Select template + fill form ─── */}
            <StepPanel active={step === 1}>
              {/* Template selection */}
              <div className="space-y-3 mb-6">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTemplate(t)}
                    className={`w-full text-left bg-[#1A1A1A] border rounded-2xl p-4 transition-all duration-200 ${
                      selectedTemplate?.id === t.id
                        ? 'border-[#E8302A] ring-1 ring-[#E8302A]/30'
                        : 'border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{t.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{t.title}</h3>
                        <p className="text-gray-500 text-xs mt-0.5">{t.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.tagColor}`}>
                          {t.tag}
                        </span>
                        <span className="text-gray-600 text-[10px]">⏱ {t.time}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Form (shown when template is selected) */}
              {selectedTemplate && (
                <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-5 animate-[fadeSlideIn_0.3s_ease-out]">
                  <div className="mb-5">
                    <h2 className="text-white text-lg font-bold mb-1">
                      {selectedTemplate.icon} {selectedTemplate.title}
                    </h2>
                    <p className="text-gray-400 text-sm">{selectedTemplate.subtitle}</p>
                  </div>

                  <div className="space-y-4">
                    {selectedTemplate.fields.map((field) => (
                      <div key={field.name}>
                        <label className="text-gray-300 text-sm font-medium mb-1.5 block">
                          {field.label}
                          {field.required !== false && <span className="text-[#E8302A] ml-1">*</span>}
                        </label>

                        {field.type === 'textarea' ? (
                          <textarea
                            value={formData[field.name] || ''}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            rows={3}
                            className="w-full bg-[#252525] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-[#E8302A] focus:ring-1 focus:ring-[#E8302A]/30 focus:outline-none transition resize-none"
                          />
                        ) : field.type === 'select' ? (
                          <select
                            value={formData[field.name] || ''}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className="w-full bg-[#252525] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-[#E8302A] focus:ring-1 focus:ring-[#E8302A]/30 focus:outline-none transition appearance-none"
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
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full bg-[#252525] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-[#E8302A] focus:ring-1 focus:ring-[#E8302A]/30 focus:outline-none transition"
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
                      onClick={handleGenerate}
                      className="w-full bg-[#E8302A] text-white font-bold py-3.5 px-6 rounded-xl hover:opacity-90 transition mt-2"
                    >
                      🚀 Vygenerovat {selectedTemplate.title.toLowerCase().includes('email') ? 'email' : 'dokument'}
                    </button>

                    <p className="text-gray-600 text-xs text-center">
                      Všechny údaje vyplňuj česky – AI přeloží do němčiny automaticky
                    </p>
                  </div>
                </div>
              )}
            </StepPanel>

            {/* ─── Step 2: Generating with streaming ─── */}
            <StepPanel active={step === 2}>
              <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">{selectedTemplate?.icon}</div>
                  <h2 className="text-white font-bold text-lg mb-1">
                    Generuji {selectedTemplate?.title.toLowerCase()}...
                  </h2>
                  <p className="text-gray-500 text-sm">AI vytváří dokument na míru</p>
                </div>

                <StreamingIndicator label="AI píše dokument v němčině..." />

                {/* Live preview of streaming text */}
                {streamingText && (
                  <div className="mt-4 bg-[#252525] border border-gray-700 rounded-xl p-4 max-h-64 overflow-y-auto">
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                      {streamingText}
                      <span className="inline-block w-0.5 h-4 bg-[#E8302A] ml-0.5 animate-pulse align-text-bottom" />
                    </pre>
                  </div>
                )}
              </div>
            </StepPanel>

            {/* ─── Step 3: Result ─── */}
            <StepPanel active={step === 3}>
              <div ref={resultRef}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold text-lg">✅ Hotovo!</h2>
                  <button
                    onClick={handleEditForm}
                    className="text-gray-400 hover:text-white text-sm px-3 py-1 border border-gray-700 rounded-lg transition"
                  >
                    ← Upravit údaje
                  </button>
                </div>

                <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-5 mb-4">
                  <pre className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {result}
                  </pre>
                </div>

                <ResultActions
                  text={result}
                  filename={selectedTemplate ? filenameMap[selectedTemplate.id] : 'dokument.txt'}
                />

                <p className="text-gray-500 text-xs text-center mt-4">
                  💡 Tip: Zkopíruj text a vlož do Wordu nebo Google Docs pro finální úpravy
                </p>

                <button
                  onClick={handleReset}
                  className="w-full text-gray-400 hover:text-white text-sm py-3 mt-2 transition"
                >
                  🔄 Vygenerovat nový dokument
                </button>
              </div>
            </StepPanel>
          </AIWorkflow>
        </PaywallOverlay>

        {/* Other templates — link to sub-pages */}
        <div className="mt-8">
          <h3 className="text-gray-400 text-sm font-bold mb-3">Další AI nástroje</h3>
          <div className="space-y-3">
            {OTHER_TEMPLATES.map((t) => (
              <Link key={t.href} href={t.href}>
                <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-colors cursor-pointer flex items-center gap-3 mb-3">
                  <span className="text-2xl">{t.icon}</span>
                  <span className="text-white font-medium flex-1">{t.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.tagColor}`}>
                    {t.tag}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
