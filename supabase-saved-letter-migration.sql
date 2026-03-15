-- Add saved_letter_html column to profiles table
-- This stores the user's professionally designed motivation letter HTML
-- from the letter template generator, similar to saved_cv_html

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS saved_letter_html text;
