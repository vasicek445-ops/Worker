-- Strukturovany seznam dalsich jazyku (mimo nemciny — ta ma vlastni nemcina_uroven).
-- Format: [{language, level}]. Legacy text sloupec dalsi_jazyky zustava pro fallback.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS dalsi_jazyky_struct JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN profiles.dalsi_jazyky_struct IS
  'Array of language proficiencies (mimo nemciny). Format: [{language, level}]. Levels: A1-C2, "Materský". CV editor preferuje strukturu pred legacy textem dalsi_jazyky.';
