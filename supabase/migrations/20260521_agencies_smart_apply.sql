-- Agency-first Smart Apply (Faze A): pridava metadata do agencies pro hiring
-- detection a industry tagging. Existujici data (1007 agentur, 946 s emaily)
-- zustavaji jak jsou — nove sloupce defaultne NULL.
--
-- Run v Supabase SQL Editor po deploy.

-- ============================================================================
-- 1. Pridani novych sloupcu
-- ============================================================================

ALTER TABLE agencies
  ADD COLUMN IF NOT EXISTS has_open_positions BOOLEAN DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS last_hiring_check_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS current_positions TEXT[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS industry TEXT[] DEFAULT NULL;

COMMENT ON COLUMN agencies.has_open_positions IS
  'Smart Apply hiring detector: aktualne nabizi agentura otevrene pozice? NULL = unchecked yet.';
COMMENT ON COLUMN agencies.last_hiring_check_at IS
  'Cas posledniho hiring check (vlastni scraper / Apify). NULL = nikdy.';
COMMENT ON COLUMN agencies.current_positions IS
  'Aktualne otevrene pozice (z agency career page). Empty array = check ran ale nic nenaslo.';
COMMENT ON COLUMN agencies.industry IS
  'Obory ktere agentura pokryva (Logistika, Gastronomie, Stavba, Pece, ...). Bud rucni tagging nebo AI extraction z webu.';

-- ============================================================================
-- 2. Indexy pro Smart Apply browse queries
-- ============================================================================

-- Partial index: rychly filter "jen aktualne hire-aci"
CREATE INDEX IF NOT EXISTS idx_agencies_hiring
  ON agencies (last_hiring_check_at DESC NULLS LAST)
  WHERE has_open_positions = TRUE;

-- GIN index pro array kontrolu (industry @> '{Logistika}')
CREATE INDEX IF NOT EXISTS idx_agencies_industry_gin
  ON agencies USING gin(industry);

-- Compound index pro hlavni listing query (s_email + region/canton filter)
CREATE INDEX IF NOT EXISTS idx_agencies_email_region
  ON agencies (region, canton, company)
  WHERE email IS NOT NULL AND email != '';

-- ============================================================================
-- 3. Stats po migraci
-- ============================================================================
-- SELECT
--   COUNT(*) total,
--   COUNT(*) FILTER (WHERE email IS NOT NULL AND email != '') with_email,
--   COUNT(*) FILTER (WHERE has_open_positions = TRUE) currently_hiring,
--   COUNT(*) FILTER (WHERE industry IS NOT NULL AND array_length(industry, 1) > 0) with_industry
-- FROM agencies;
