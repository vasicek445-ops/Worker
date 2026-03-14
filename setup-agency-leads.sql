-- Agency leads table for B2B chatbot lead capture
CREATE TABLE IF NOT EXISTS agency_leads (
  id SERIAL PRIMARY KEY,
  agency_name TEXT,
  contact_email TEXT NOT NULL,
  canton TEXT,
  specialization TEXT,
  source TEXT DEFAULT 'chatbot',
  notes TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by status and date
CREATE INDEX idx_agency_leads_status ON agency_leads(status);
CREATE INDEX idx_agency_leads_created ON agency_leads(created_at DESC);

-- RLS: only service role can insert/read (no public access)
ALTER TABLE agency_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON agency_leads
  FOR ALL USING (auth.role() = 'service_role');
