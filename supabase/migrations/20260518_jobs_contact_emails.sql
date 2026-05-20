-- Smart Apply: kontaktní e-maily zaměstnavatele u pracovních nabídek.
-- Vrstva 1 (scrape-indeed) plní e-maily, které actor vytáhl přímo z inzerátu.
-- NULL = inzerát e-mail neměl → dohledá Vrstva 2 (web firmy / Impressum / Temporärbüro).
-- Spustit v Supabase SQL editoru.

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS contact_emails text[];

-- Index pro Vrstvu 2 — rychlé vyhledání nabídek bez e-mailu.
CREATE INDEX IF NOT EXISTS idx_jobs_no_email
  ON jobs (source)
  WHERE contact_emails IS NULL;
