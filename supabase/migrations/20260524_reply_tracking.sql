-- Reply tracking — Reply-To inbound parsing via Postmark webhook.
-- Pri odeslani Smart Apply emailu nastavujeme Reply-To: apply+USER+APP@apply.gowoker.com.
-- HR pak posila reply nam (ne user's Gmail), my parsujeme + forwardujeme.

-- ============================================================================
-- 0. Vytvorit sent_applications tabulku pokud neexistuje
--    (smart-apply/send do ni loguje vsechny posldne emaily)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sent_applications (
  id BIGSERIAL PRIMARY KEY,
  member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id BIGINT DEFAULT NULL,
  agency_id BIGINT DEFAULT NULL,
  to_email TEXT NOT NULL,
  subject TEXT,
  body_preview TEXT,
  gmail_message_id TEXT,
  gmail_thread_id TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sent_applications_member_recent
  ON sent_applications (member_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_sent_applications_agency
  ON sent_applications (agency_id) WHERE agency_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sent_applications_job
  ON sent_applications (job_id) WHERE job_id IS NOT NULL;

-- RLS
ALTER TABLE sent_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sent applications" ON sent_applications;
CREATE POLICY "Users can view own sent applications"
  ON sent_applications FOR SELECT
  USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can insert own sent applications" ON sent_applications;
CREATE POLICY "Users can insert own sent applications"
  ON sent_applications FOR INSERT
  WITH CHECK (auth.uid() = member_id);

-- ============================================================================
-- 1. Pridat sloupce pro reply tracking
-- ============================================================================

ALTER TABLE sent_applications
  ADD COLUMN IF NOT EXISTS reply_received_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reply_classification TEXT DEFAULT NULL,
  -- AI klasifikace: 'interview' | 'rejection' | 'question' | 'auto_reply' | 'neutral' | 'positive'
  ADD COLUMN IF NOT EXISTS last_reply_preview TEXT DEFAULT NULL;

COMMENT ON COLUMN sent_applications.reply_received_at IS
  'Cas prvni odpovedi od HR. NULL = zatim zadna odpoved.';
COMMENT ON COLUMN sent_applications.reply_count IS
  'Pocet odpovedi v thread (HR muze odpovedet vicekrat).';
COMMENT ON COLUMN sent_applications.reply_classification IS
  'AI klasifikace prvni odpovedi: interview/rejection/question/auto_reply/neutral/positive';

-- ============================================================================
-- 2. Tabulka replies — full text vsech odpovedi pro audit + forwarding
-- ============================================================================

CREATE TABLE IF NOT EXISTS application_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id BIGINT REFERENCES sent_applications(id) ON DELETE CASCADE,
  member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  from_email TEXT NOT NULL,
  from_name TEXT,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  raw_headers JSONB,
  classification TEXT,
  -- 'interview' | 'rejection' | 'question' | 'auto_reply' | 'neutral' | 'positive'
  classification_confidence REAL,
  -- 0.0 - 1.0 AI confidence score
  forwarded_to_user BOOLEAN DEFAULT FALSE,
  forwarded_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_replies_application
  ON application_replies (application_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_replies_member_recent
  ON application_replies (member_id, received_at DESC);

-- RLS: user vidi jen sve replies
ALTER TABLE application_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own replies" ON application_replies;
CREATE POLICY "Users can view own replies"
  ON application_replies FOR SELECT
  USING (auth.uid() = member_id);

-- Insert pres service role only (webhook /api/inbound-reply)
DROP POLICY IF EXISTS "Service role insert replies" ON application_replies;
CREATE POLICY "Service role insert replies"
  ON application_replies FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE application_replies IS
  'HR odpovedi na Smart Apply prihlasky. Naplnovano /api/inbound-reply webhookem (Postmark inbound).';
