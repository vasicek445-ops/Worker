-- Job analyses history table
-- Stores past AI analyses so users can review and compare jobs

CREATE TABLE IF NOT EXISTS job_analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_text text NOT NULL,
  position text,
  company text,
  location text,
  match_score integer,
  analysis_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE job_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses" ON job_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON job_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON job_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_job_analyses_user_id ON job_analyses(user_id, created_at DESC);
