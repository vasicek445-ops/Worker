-- Smart Matching: rozšíření profiles + nová tabulka applications
-- Spustit v Supabase SQL editoru

-- 1. Rozšíření profiles tabulky o pracovní profil
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

-- 2. Tabulka pro sledování přihlášek
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

-- RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON applications FOR UPDATE
  USING (auth.uid() = user_id);
