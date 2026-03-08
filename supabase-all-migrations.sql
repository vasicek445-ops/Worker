-- ============================================
-- WOKER: Všechny migrace najednou
-- Spustit v Supabase SQL editoru jedním klikem
-- ============================================

-- 1. SMART MATCHING: Rozšíření profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS obor text,
  ADD COLUMN IF NOT EXISTS pozice text,
  ADD COLUMN IF NOT EXISTS preferovany_kanton text,
  ADD COLUMN IF NOT EXISTS nemcina_uroven text,
  ADD COLUMN IF NOT EXISTS zkusenosti text,
  ADD COLUMN IF NOT EXISTS vzdelani text,
  ADD COLUMN IF NOT EXISTS dovednosti text,
  ADD COLUMN IF NOT EXISTS telefon text,
  ADD COLUMN IF NOT EXISTS adresa text,
  ADD COLUMN IF NOT EXISTS datum_narozeni text,
  ADD COLUMN IF NOT EXISTS ridicky_prukaz text,
  ADD COLUMN IF NOT EXISTS dalsi_jazyky text,
  ADD COLUMN IF NOT EXISTS profile_complete boolean DEFAULT false;

-- 2. SMART MATCHING: Tabulka applications
CREATE TABLE IF NOT EXISTS applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id bigint REFERENCES agencies(id),
  agency_name text NOT NULL,
  agency_email text,
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'replied', 'rejected')),
  match_score integer,
  match_reasoning text,
  cv_html text,
  letter_text text,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_agency_id ON applications(agency_id);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own applications') THEN
    CREATE POLICY "Users can view own applications" ON applications FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own applications') THEN
    CREATE POLICY "Users can insert own applications" ON applications FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own applications') THEN
    CREATE POLICY "Users can update own applications" ON applications FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 3. JOB BOARD: Tabulka jobs
CREATE TABLE IF NOT EXISTS jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id text,
  source text NOT NULL DEFAULT 'arbeitnow',
  title text NOT NULL,
  company text NOT NULL,
  location text,
  canton text,
  description text,
  salary_min integer,
  salary_max integer,
  salary_text text,
  job_type text DEFAULT 'Full-time',
  category text,
  url text,
  tags text[],
  remote boolean DEFAULT false,
  posted_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(source, external_id)
);

CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);
CREATE INDEX IF NOT EXISTS idx_jobs_canton ON jobs(canton);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_title_search ON jobs USING gin(to_tsvector('simple', title));

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view jobs') THEN
    CREATE POLICY "Anyone can view jobs" ON jobs FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can manage jobs') THEN
    CREATE POLICY "Service role can manage jobs" ON jobs FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;
