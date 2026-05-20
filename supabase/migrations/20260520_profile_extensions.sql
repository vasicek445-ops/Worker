-- Rozšíření profile schema — doplňková pole identifikovaná v duplikační analýze.
-- Spustit v Supabase SQL Editoru.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS nationality text,           -- chybělo, je v CV BasicsSection
  ADD COLUMN IF NOT EXISTS income_expected int,         -- min. mzda CHF/měs (sloučit s agent.min_salary_chf)
  ADD COLUMN IF NOT EXISTS willing_to_relocate boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS employer_current text,       -- pro bydlení dopis pronajímateli
  ADD COLUMN IF NOT EXISTS work_permit_status text,     -- B, C, L, G, žádost, none — pro CH
  ADD COLUMN IF NOT EXISTS profile_locale text DEFAULT 'cs';  -- preference UI jazyka (oddělit od dat)

CREATE INDEX IF NOT EXISTS profiles_obor_kanton_idx ON profiles(obor, preferovany_kanton);
