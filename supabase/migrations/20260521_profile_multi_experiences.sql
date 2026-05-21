-- Profile: multi-row experiences + educations (Faze C)
-- User pridava vice firem/skol do profilu, pak CV builder prefill bere
-- strukturovana data. Staré text columns (zkusenosti, vzdelani) zustavaji
-- pro backward compat — pokud experiences[] je prazdne, prefill spadne na text.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS experiences JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS educations JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN profiles.experiences IS
  'Array of work experiences. Format: [{period, title, company, location, description}]. Pouziva v CV builderu jako prefill — kdyz prazdne, fallback na text sloupec zkusenosti.';
COMMENT ON COLUMN profiles.educations IS
  'Array of education entries. Format: [{period, school, degree, location}]. Pouziva v CV builderu jako prefill — kdyz prazdne, fallback na text sloupec vzdelani.';
