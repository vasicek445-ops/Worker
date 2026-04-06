-- Enable Row Level Security on profiles and subscriptions tables
-- CRITICAL: These tables were missing RLS, allowing any authenticated user
-- to read/modify any other user's data via the Supabase client.

-- ============================================================
-- PROFILES TABLE
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read only their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile (for onboarding)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete only their own profile
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- ============================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read only their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Note: INSERT/UPDATE/DELETE on subscriptions should only happen
-- via the Stripe webhook using the service_role key (which bypasses RLS).
-- No user-facing write policies needed.
