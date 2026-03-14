-- Add saved_cv_html column to profiles table
-- Stores the rendered CV HTML from the CV generator for use in Smart Matching applications
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS saved_cv_html text;
