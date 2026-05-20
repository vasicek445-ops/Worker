-- Smart Apply: zvolené CV PDF pro odesílané přihlášky.
-- NULL = použije se poslední uložené CV uživatele.
-- Spustit v Supabase SQL editoru.

ALTER TABLE member_agent_config ADD COLUMN IF NOT EXISTS cv_pdf_path text;
