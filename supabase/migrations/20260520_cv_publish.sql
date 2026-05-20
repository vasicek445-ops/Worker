-- Web resume URL — publish CV jako veřejnou stránku.
-- Spustit v Supabase SQL editoru.

ALTER TABLE saved_documents
  ADD COLUMN IF NOT EXISTS published_slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

CREATE INDEX IF NOT EXISTS saved_documents_published_slug_idx
  ON saved_documents(published_slug)
  WHERE published_slug IS NOT NULL;

-- Public read policy — kdokoliv může číst řádek, pokud má vyplněný published_slug.
-- Anon klient i tak používá pouze service-role v server komponentě (app/cv/[slug]/page.tsx),
-- ale policy přidáváme jako defense-in-depth.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'saved_documents'
      AND policyname = 'Public can read published documents'
  ) THEN
    CREATE POLICY "Public can read published documents"
      ON saved_documents
      FOR SELECT
      USING (published_slug IS NOT NULL);
  END IF;
END $$;
