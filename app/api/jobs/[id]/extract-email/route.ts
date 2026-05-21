import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { callOpenAI } from '@/lib/openai'
import { extractEmails, preferredEmail } from '@/lib/jobs/extract-email'

// POST /api/jobs/{id}/extract-email
// On-demand only — triggered by user click or Wooky AI flow.
// NO cron job should call this automatically (cost discipline).
//
// Returns: { email: string | null, source: 'regex' | 'ai' | 'none' | 'cached', cached: boolean }

const EMAIL_VALIDATE_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

interface ExtractEmailResponse {
  email: string | null
  source: 'regex' | 'ai' | 'none' | 'cached'
  cached: boolean
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.replace(/^Bearer\s+/i, '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: jobId } = await params

    // Load job
    const { data: job, error: jobErr } = await supabaseAdmin
      .from('jobs')
      .select('id, url, contact_emails, description, title, company')
      .eq('id', jobId)
      .maybeSingle()

    if (jobErr) {
      return NextResponse.json({ error: jobErr.message }, { status: 500 })
    }
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Cache hit — return immediately, no fetch, no AI
    const cachedEmails = job.contact_emails as string[] | null
    if (cachedEmails && cachedEmails.length > 0) {
      const email = preferredEmail(cachedEmails)
      return NextResponse.json<ExtractEmailResponse>({
        email,
        source: 'cached',
        cached: true,
      })
    }

    // No URL — nothing to fetch
    if (!job.url) {
      return NextResponse.json<ExtractEmailResponse>({
        email: null,
        source: 'none',
        cached: false,
      })
    }

    // Fetch apply page HTML
    let html = ''
    try {
      const res = await fetch(job.url as string, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WokerBot/1.0)' },
        signal: AbortSignal.timeout(10_000),
      })
      html = await res.text()
    } catch {
      // Network failure — fall through to AI with description only
      html = ''
    }

    // Strip HTML tags
    const strippedHtml = html ? stripHtml(html) : ''

    // Also try description field (already stripped in DB usually)
    const descriptionText = typeof job.description === 'string' ? job.description : ''

    // Combined text for regex search
    const combinedText = [strippedHtml, descriptionText].filter(Boolean).join(' ')

    // Step 1: Regex extraction
    if (combinedText) {
      const regexEmails = extractEmails(combinedText)
      const best = preferredEmail(regexEmails)
      if (best) {
        await updateContactEmail(jobId, best)
        return NextResponse.json<ExtractEmailResponse>({
          email: best,
          source: 'regex',
          cached: false,
        })
      }
    }

    // Step 2: AI fallback — gpt-4o-mini
    // COST: ~$0.0001 per AI fallback call. Use sparingly.
    const htmlForAI = strippedHtml.slice(0, 8000) || descriptionText.slice(0, 8000)
    if (!htmlForAI) {
      return NextResponse.json<ExtractEmailResponse>({
        email: null,
        source: 'none',
        cached: false,
      })
    }

    const prompt = `Z následujícího HTML stripnutého obsahu pracovního inzerátu najdi VÝHRADNĚ kontaktní e-mail zaměstnavatele/HR. NIKDY si nevymýšlej. Pokud žádný email nevidíš nebo si nejsi jistý/á, vrať null.

Vrať POUZE JSON bez code fences: {"email": "..."} nebo {"email": null}

Pozice: ${job.title ?? ''}
Firma: ${job.company ?? ''}
URL: ${job.url}

HTML obsah:
${htmlForAI}`

    let aiText = ''
    try {
      aiText = await callOpenAI(prompt, {
        model: 'gpt-4o-mini',
        maxTokens: 100,
        temperature: 0.1,
        timeoutMs: 20_000,
      })
    } catch {
      return NextResponse.json<ExtractEmailResponse>({
        email: null,
        source: 'none',
        cached: false,
      })
    }

    // Parse AI JSON response
    aiText = aiText.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()

    let aiEmail: string | null = null
    try {
      const parsed = JSON.parse(aiText) as { email?: string | null }
      const candidate = parsed.email ?? null
      // Validate format — reject hallucinations
      if (candidate && EMAIL_VALIDATE_REGEX.test(candidate)) {
        aiEmail = candidate.toLowerCase()
      }
    } catch {
      // Unparseable — treat as no result
    }

    if (aiEmail) {
      await updateContactEmail(jobId, aiEmail)
      return NextResponse.json<ExtractEmailResponse>({
        email: aiEmail,
        source: 'ai',
        cached: false,
      })
    }

    return NextResponse.json<ExtractEmailResponse>({
      email: null,
      source: 'none',
      cached: false,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal error'
    console.error('extract-email error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

async function updateContactEmail(jobId: string, email: string): Promise<void> {
  await supabaseAdmin
    .from('jobs')
    .update({ contact_emails: [email] })
    .eq('id', jobId)
}
