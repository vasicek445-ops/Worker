-- Job Board: tabulka pro pracovní nabídky z externích zdrojů
-- Spustit v Supabase SQL editoru

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

-- Indexy pro rychlé vyhledávání
CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);
CREATE INDEX IF NOT EXISTS idx_jobs_canton ON jobs(canton);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_title_search ON jobs USING gin(to_tsvector('simple', title));

-- RLS - nabídky jsou veřejné pro čtení
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view jobs"
  ON jobs FOR SELECT
  USING (true);

-- Jen service role může zapisovat (scraper)
CREATE POLICY "Service role can manage jobs"
  ON jobs FOR ALL
  USING (auth.role() = 'service_role');
