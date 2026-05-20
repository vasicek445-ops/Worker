-- Feedback z dotazníku při rušení předplatného.
-- Spustit v Supabase SQL editoru.

CREATE TABLE IF NOT EXISTS cancellation_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  comment text,
  stripe_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cancellation_feedback_user_id_idx
  ON cancellation_feedback(user_id);

CREATE INDEX IF NOT EXISTS cancellation_feedback_created_at_idx
  ON cancellation_feedback(created_at DESC);

ALTER TABLE cancellation_feedback ENABLE ROW LEVEL SECURITY;

-- Pouze service-role zápis/čtení (přes API endpoint).
-- Žádná public RLS policy → klient nečte ani nezapisuje přímo.
