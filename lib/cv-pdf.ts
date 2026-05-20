import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Cesta k CV PDF pro Smart Apply: zvolené CV z member_agent_config,
 * jinak poslední uložené CV uživatele. null = žádné CV PDF k dispozici.
 */
export async function resolveCvPdfPath(
  admin: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data: cfg } = await admin
    .from('member_agent_config')
    .select('cv_pdf_path')
    .eq('member_id', userId)
    .maybeSingle()
  if (cfg?.cv_pdf_path) return cfg.cv_pdf_path as string

  const { data: doc } = await admin
    .from('saved_documents')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'cv')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return doc ? `${userId}/${doc.id}.pdf` : null
}

/** Cesta k PDF motivačního dopisu zvoleného pro Smart Apply. null = použít AI dopis. */
export async function resolveLetterPdfPath(
  admin: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data: cfg } = await admin
    .from('member_agent_config')
    .select('letter_pdf_path')
    .eq('member_id', userId)
    .maybeSingle()
  return (cfg?.letter_pdf_path as string) || null
}
