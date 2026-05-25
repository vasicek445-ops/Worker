-- Reply classification overrides — user može přepsat AI klasifikaci.
-- Také rozlišíme AI vs user source a low-confidence flag.

-- ============================================================================
-- 1. Nové sloupce v application_replies
-- ============================================================================

ALTER TABLE application_replies
  ADD COLUMN IF NOT EXISTS ai_classification TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS user_classification TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS classification_source TEXT DEFAULT 'ai',
  ADD COLUMN IF NOT EXISTS low_confidence BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN application_replies.ai_classification IS
  'Puvodni AI guess (gpt-4o-mini). Pro audit + future fine-tuning.';
COMMENT ON COLUMN application_replies.user_classification IS
  'Manualni override od usera (klik v /prihlasky UI). NULL = nepřepsano.';
COMMENT ON COLUMN application_replies.classification_source IS
  '''ai'' | ''user'' — kdo nastavil finalni classification sloupec.';
COMMENT ON COLUMN application_replies.low_confidence IS
  'AI confidence < 0.6 → potreba potvrzeni od usera.';

-- ============================================================================
-- 2. Backfill: existujici radky maji ai_classification = classification
-- ============================================================================

UPDATE application_replies
SET ai_classification = classification
WHERE ai_classification IS NULL;

-- ============================================================================
-- 3. RLS — user muze UPDATE pouze sve replies (pro classify endpoint)
-- ============================================================================

DROP POLICY IF EXISTS "Users can update classification on own replies" ON application_replies;
CREATE POLICY "Users can update classification on own replies"
  ON application_replies FOR UPDATE
  USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);
