-- Smart Apply: zvolený motivační dopis (PDF) pro odesílané přihlášky.
-- NULL = použije se AI text e-mailu jako jednoduché PDF.
-- Spustit v Supabase SQL editoru.

ALTER TABLE member_agent_config ADD COLUMN IF NOT EXISTS letter_pdf_path text;
