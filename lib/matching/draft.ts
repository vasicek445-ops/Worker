import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export type CVData = {
  profil?: string
  personalData: {
    name: string
    birthdate?: string
    nationality?: string
    address?: string
    phone?: string
    email?: string
    drivingLicense?: string
  }
  experience?: Array<{ period: string; title: string; company: string; location?: string; tasks: string[] }>
  education?: Array<{ period: string; school: string; degree: string; location?: string }>
  languages?: Array<{ language: string; level: string }>
  skills?: { technical?: string[]; soft?: string[] }
  certifications?: string[]
}

export type JobInput = {
  position: string
  company: string | null
  location: string | null
  description: string
  language?: string | null
}

export type DraftResult = {
  match_score: number // 0-100
  match_reasoning: string // 1-2 věty proč/proč ne
  draft_subject: string
  draft_body: string // plain text, language matches job
  language: string // detected/used language for the email
}

const SYSTEM_PROMPT = `Jsi expert na švýcarský pracovní trh a píšeš stručné, přesvědčivé pracovní přihlášky.

Tvým úkolem je analyzovat shodu mezi uchazečovým CV a konkrétní pracovní nabídkou, a vygenerovat draft emailu, který uchazeč pošle ze svého Gmailu na firmu.

PRAVIDLA:
1. Vrať JEN validní JSON, žádný markdown, žádné code-fence bloky.
2. JSON struktura:
   {
     "match_score": <0-100>,
     "match_reasoning": "<1-2 věty česky proč shoda funguje nebo nefunguje>",
     "draft_subject": "<předmět emailu v JAZYCE POZICE>",
     "draft_body": "<tělo emailu v JAZYCE POZICE, plain text, 80-150 slov>",
     "language": "<de|en|fr|it — jazyk emailu>"
   }
3. Email PIŠ V JAZYCE INZERÁTU (typicky DE pro CH-Deutsch). Pokud inzerát anglicky, piš anglicky.
4. Email má být osobní — odkaž na 1-2 konkrétní body z CV které sedí na pozici.
5. NEPIŠ jako AI/bot. Žádné "Sehr geehrte Damen und Herren, ich bewerbe mich hiermit..." — buď přirozený, lehce neformální, ale profesionální.
6. NEPŘIDÁVEJ podpis (uchazečovo jméno, telefon) — Gmail to dodá automaticky.
7. NEPŘIDÁVEJ "P.S." nebo emoji.
8. Match score:
   - 80-100: silná shoda (zkušenosti + jazyk + lokalita sedí)
   - 50-79: částečná shoda (chybí 1-2 klíčové věci, ale stojí to za pokus)
   - 0-49: slabá shoda (poslat by byl plonk)`

/**
 * Generate match score + email draft for a job, given the candidate's CV.
 * Uses prompt caching on the CV (system block) — saves ~90% on input tokens
 * when processing multiple matches for same user in same session.
 */
export async function generateDraft(params: {
  cv: CVData
  job: JobInput
  preferredLanguages?: string[]
}): Promise<DraftResult> {
  const { cv, job, preferredLanguages = ['de'] } = params

  const cvText = formatCV(cv)

  const userPrompt = `## Nabídka práce

**Pozice:** ${job.position}
**Firma:** ${job.company ?? 'neuvedena'}
**Lokace:** ${job.location ?? 'CH'}
**Jazykové preference uchazeče:** ${preferredLanguages.join(', ')}

**Popis:**
${job.description.slice(0, 3500)}

---

Vygeneruj match analýzu a draft emailu podle pravidel ze system promptu. Vrať JEN JSON.`

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    system: [
      { type: 'text', text: SYSTEM_PROMPT },
      {
        type: 'text',
        text: `## CV uchazeče\n\n${cvText}`,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userPrompt }],
  })

  const block = response.content.find((b) => b.type === 'text')
  if (!block || block.type !== 'text') {
    throw new Error('No text block in Claude response')
  }
  const text = block.text.trim()

  // Strip code fences if Claude ignored instructions
  const stripped = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```\s*$/, '').trim()
  const parsed = JSON.parse(stripped) as DraftResult

  // Validation
  if (typeof parsed.match_score !== 'number' || parsed.match_score < 0 || parsed.match_score > 100) {
    throw new Error('Invalid match_score in response')
  }
  if (!parsed.draft_subject || !parsed.draft_body) {
    throw new Error('Missing draft_subject or draft_body')
  }

  return {
    match_score: Math.round(parsed.match_score),
    match_reasoning: parsed.match_reasoning ?? '',
    draft_subject: parsed.draft_subject.slice(0, 200),
    draft_body: parsed.draft_body,
    language: parsed.language || job.language || 'de',
  }
}

function formatCV(cv: CVData): string {
  const lines: string[] = []
  if (cv.personalData?.name) lines.push(`**Jméno:** ${cv.personalData.name}`)
  if (cv.personalData?.address) lines.push(`**Lokalita:** ${cv.personalData.address}`)
  if (cv.personalData?.nationality) lines.push(`**Národnost:** ${cv.personalData.nationality}`)
  if (cv.personalData?.drivingLicense) lines.push(`**Řidičák:** ${cv.personalData.drivingLicense}`)
  if (cv.profil) lines.push(`\n**Profil:**\n${cv.profil}`)

  if (cv.experience?.length) {
    lines.push('\n**Zkušenosti:**')
    for (const e of cv.experience.slice(0, 8)) {
      lines.push(`- ${e.period} — ${e.title} @ ${e.company}${e.location ? ` (${e.location})` : ''}`)
      if (e.tasks?.length) {
        for (const t of e.tasks.slice(0, 4)) lines.push(`  • ${t}`)
      }
    }
  }
  if (cv.education?.length) {
    lines.push('\n**Vzdělání:**')
    for (const ed of cv.education.slice(0, 5)) {
      lines.push(`- ${ed.period} — ${ed.degree} @ ${ed.school}`)
    }
  }
  if (cv.languages?.length) {
    lines.push('\n**Jazyky:** ' + cv.languages.map((l) => `${l.language} (${l.level})`).join(', '))
  }
  if (cv.skills?.technical?.length) {
    lines.push('\n**Tech skills:** ' + cv.skills.technical.join(', '))
  }
  if (cv.skills?.soft?.length) {
    lines.push('**Soft skills:** ' + cv.skills.soft.join(', '))
  }
  if (cv.certifications?.length) {
    lines.push('\n**Certifikace:** ' + cv.certifications.join(', '))
  }
  return lines.join('\n')
}
