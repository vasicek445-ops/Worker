-- Create agencies table
CREATE TABLE IF NOT EXISTS agencies (
  id SERIAL PRIMARY KEY,
  swissstaffing_id TEXT UNIQUE,
  company TEXT NOT NULL,
  street TEXT,
  zip TEXT,
  city TEXT,
  canton TEXT,
  region TEXT, -- german, french, italian
  telephone TEXT,
  email TEXT,
  website TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  source TEXT DEFAULT 'swissstaffing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast search
CREATE INDEX IF NOT EXISTS idx_agencies_city ON agencies(city);
CREATE INDEX IF NOT EXISTS idx_agencies_canton ON agencies(canton);
CREATE INDEX IF NOT EXISTS idx_agencies_region ON agencies(region);
CREATE INDEX IF NOT EXISTS idx_agencies_company ON agencies(company);
CREATE INDEX IF NOT EXISTS idx_agencies_zip ON agencies(zip);

-- Enable full text search
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS fts tsvector 
  GENERATED ALWAYS AS (to_tsvector('simple', coalesce(company, '') || ' ' || coalesce(city, '') || ' ' || coalesce(canton, ''))) STORED;
CREATE INDEX IF NOT EXISTS idx_agencies_fts ON agencies USING gin(fts);

-- Enable RLS
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read agencies
CREATE POLICY "Authenticated users can read agencies" ON agencies
  FOR SELECT TO authenticated USING (true);

-- Allow anon to read (for public listing if needed)  
CREATE POLICY "Public can read agencies" ON agencies
  FOR SELECT TO anon USING (true);
