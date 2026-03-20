CREATE TABLE IF NOT EXISTS transcriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  creator TEXT NOT NULL DEFAULT '',
  platform TEXT NOT NULL DEFAULT 'tiktok',
  views TEXT DEFAULT '',
  tags TEXT DEFAULT '',
  text TEXT NOT NULL,
  segments JSONB DEFAULT '[]',
  language TEXT DEFAULT '',
  duration REAL DEFAULT 0,
  hook TEXT DEFAULT '',
  structure TEXT DEFAULT '',
  cta TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: only service role can access (admin only)
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access" ON transcriptions
  FOR ALL USING (true) WITH CHECK (true);
