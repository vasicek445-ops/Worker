-- M1C — replace numerical match_score with structured analysis
-- (verdict bucket + strengths/gaps lists + recommendation)

alter table public.daily_matches
  add column if not exists verdict        text check (verdict in ('good','partial','poor')),
  add column if not exists strengths      jsonb,
  add column if not exists gaps           jsonb,
  add column if not exists recommendation text;

-- match_score column kept nullable for back-compat but no longer used by the app
