'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// ─── Types ───────────────────────────────────────────────

export interface WorkflowStep {
  label: string
  icon?: string
}

interface AIWorkflowProps {
  steps: WorkflowStep[]
  currentStep: number
  children: React.ReactNode
}

// ─── Step Indicator ──────────────────────────────────────

function StepIndicator({ steps, currentStep }: { steps: WorkflowStep[]; currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {steps.map((step, i) => {
        const stepNum = i + 1
        const isActive = stepNum === currentStep
        const isDone = stepNum < currentStep

        return (
          <div key={i} className="flex items-center gap-1">
            {/* Step circle */}
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isDone
                    ? 'bg-green-500 text-white'
                    : isActive
                      ? 'bg-[#E8302A] text-white scale-110'
                      : 'bg-[#252525] text-gray-500'
                }`}
              >
                {isDone ? '✓' : step.icon || stepNum}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block transition-colors duration-300 ${
                  isActive ? 'text-white' : isDone ? 'text-green-400' : 'text-gray-600'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-1 transition-colors duration-300 ${
                  isDone ? 'bg-green-500' : 'bg-[#252525]'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Step Panel (animated container) ─────────────────────

export function StepPanel({
  active,
  children,
}: {
  active: boolean
  children: React.ReactNode
}) {
  if (!active) return null

  return (
    <div className="animate-[fadeSlideIn_0.3s_ease-out]">
      {children}
    </div>
  )
}

// ─── Streaming Text Hook ─────────────────────────────────

export function useStreamingFetch() {
  const [streamedText, setStreamedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const startStream = useCallback(async (
    url: string,
    options: RequestInit,
  ): Promise<string> => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStreamedText('')
    setIsStreaming(true)

    let fullText = ''

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Chyba serveru' }))
        throw new Error(errData.error || `HTTP ${res.status}`)
      }

      const contentType = res.headers.get('content-type') || ''

      // Streaming response (text/event-stream or text/plain with stream)
      if (contentType.includes('text/event-stream') || contentType.includes('text/plain')) {
        const reader = res.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          // Handle SSE format: "data: ..." lines
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue
              try {
                const parsed = JSON.parse(data)
                if (parsed.text) {
                  fullText += parsed.text
                  setStreamedText(fullText)
                }
              } catch {
                // Plain text chunk
                fullText += data
                setStreamedText(fullText)
              }
            } else if (line.trim() && !line.startsWith(':')) {
              // Raw text streaming
              fullText += line
              setStreamedText(fullText)
            }
          }
        }
      } else {
        // Non-streaming JSON fallback
        const data = await res.json()
        fullText = data.response || data.document || data.text || JSON.stringify(data)
        setStreamedText(fullText)
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return fullText
      throw err
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }

    return fullText
  }, [])

  const cancelStream = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

  return { streamedText, isStreaming, startStream, cancelStream, setStreamedText }
}

// ─── Result Actions (Copy + Download) ────────────────────

export function ResultActions({
  text,
  filename = 'dokument.txt',
}: {
  text: string
  filename?: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleCopy}
        className="flex-1 bg-[#E8302A] text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition text-center"
      >
        {copied ? '✅ Zkopírováno!' : '📋 Kopírovat'}
      </button>
      <button
        onClick={handleDownload}
        className="bg-[#252525] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#303030] transition border border-gray-700"
      >
        ⬇️ Stáhnout
      </button>
    </div>
  )
}

// ─── Streaming Progress Indicator ────────────────────────

export function StreamingIndicator({ label = 'AI generuje...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="relative w-5 h-5">
        <div className="absolute inset-0 border-2 border-[#E8302A]/30 rounded-full" />
        <div className="absolute inset-0 border-2 border-[#E8302A] border-t-transparent rounded-full animate-spin" />
      </div>
      <span className="text-gray-400 text-sm">{label}</span>
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 bg-[#E8302A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 bg-[#E8302A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 bg-[#E8302A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

// ─── Auto-scroll Hook ────────────────────────────────────

export function useAutoScroll(deps: unknown[]) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return ref
}

// ─── Main AIWorkflow Component ───────────────────────────

export default function AIWorkflow({ steps, currentStep, children }: AIWorkflowProps) {
  return (
    <div>
      <StepIndicator steps={steps} currentStep={currentStep} />
      {children}
    </div>
  )
}
