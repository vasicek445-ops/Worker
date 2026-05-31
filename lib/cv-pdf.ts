import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Cesta k CV PDF pro Smart Apply: zvolené CV z member_agent_config,
 * jinak poslední uložené CV uživatele. null = žádné CV PDF k dispozici.
 */
export async function resolveCvPdfPath(
  admin: SupabaseClient,
  userId: string,
): Promise<string | null> {
  // 1) Explicitne nakonfigurovany CV path
  const { data: cfg } = await admin
    .from('member_agent_config')
    .select('cv_pdf_path')
    .eq('member_id', userId)
    .maybeSingle()
  if (cfg?.cv_pdf_path) {
    // Over ze soubor opravdu existuje v Storage
    const cleanPath = (cfg.cv_pdf_path as string).replace(/^[^/]+\//, '')
    const { data: head } = await admin.storage.from('cv-pdfs').list(userId, {
      search: cleanPath.split('/').pop() || '',
      limit: 1,
    })
    if (head && head.length > 0) return cfg.cv_pdf_path as string
  }

  // 2) Vyber nejnovejsi saved_document a over ze PDF existuje v Storage
  const { data: docs } = await admin
    .from('saved_documents')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'cv')
    .order('updated_at', { ascending: false })
    .limit(10)
  if (!docs || docs.length === 0) return null

  // List vsech PDF v Storage pro daneho usera (jednou request)
  const { data: files } = await admin.storage.from('cv-pdfs').list(userId, { limit: 100 })
  const presentFilenames = new Set((files || []).map(f => f.name))

  // Najdi nejnovejsi doc jehoz PDF je v Storage
  for (const doc of docs) {
    if (presentFilenames.has(`${doc.id}.pdf`)) {
      return `${userId}/${doc.id}.pdf`
    }
  }
  return null
}

/**
 * Cesta k PDF motivačního dopisu: zvolené z member_agent_config,
 * jinak poslední uložený letter dokument uživatele. null = nic není k dispozici.
 */
export async function resolveLetterPdfPath(
  admin: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data: cfg } = await admin
    .from('member_agent_config')
    .select('letter_pdf_path')
    .eq('member_id', userId)
    .maybeSingle()
  if (cfg?.letter_pdf_path) {
    // Over existence v Storage (cv-pdfs bucket — letters tam taky leží)
    const filename = (cfg.letter_pdf_path as string).split('/').pop() || ''
    const { data: head } = await admin.storage.from('cv-pdfs').list(userId, { search: filename, limit: 1 })
    if (head && head.length > 0) return cfg.letter_pdf_path as string
  }

  const { data: docs } = await admin
    .from('saved_documents')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'letter')
    .order('updated_at', { ascending: false })
    .limit(10)
  if (!docs || docs.length === 0) return null

  const { data: files } = await admin.storage.from('cv-pdfs').list(userId, { limit: 100 })
  const presentFilenames = new Set((files || []).map(f => f.name))

  for (const doc of docs) {
    if (presentFilenames.has(`${doc.id}.pdf`)) {
      return `${userId}/${doc.id}.pdf`
    }
  }
  return null
}
