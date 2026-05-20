// Minimální OpenAI wrapper. Drží to jednoduchý — fetch, žádný SDK.
// Pokud OPENAI_API_KEY chybí, callOpenAI hodí chybu (handluje route).

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

export interface OpenAIOptions {
  model?: string
  maxTokens?: number
  temperature?: number
  timeoutMs?: number
  system?: string
}

export async function callOpenAI(prompt: string, opts: OpenAIOptions = {}): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 30_000)

  const messages: Array<{ role: 'system' | 'user'; content: string }> = []
  if (opts.system) messages.push({ role: 'system', content: opts.system })
  messages.push({ role: 'user', content: prompt })

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: opts.model || 'gpt-4o-mini',
        messages,
        max_tokens: opts.maxTokens ?? 800,
        temperature: opts.temperature ?? 0.3,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw new Error(`OpenAI API error (${res.status}): ${errText.slice(0, 300)}`)
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    return data.choices?.[0]?.message?.content?.trim() || ''
  } finally {
    clearTimeout(timeout)
  }
}
