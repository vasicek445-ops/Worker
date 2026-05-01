-- Phase 2 M1B — extend daily_matches with discovery metadata

alter table public.daily_matches
  add column if not exists job_source       text,
  add column if not exists job_source_id    text,
  add column if not exists salary_text      text,
  add column if not exists description      text,
  add column if not exists language         text,
  add column if not exists match_date       date not null default current_date;

-- Allow null company (some Adzuna feeds don't include it)
alter table public.daily_matches alter column company drop not null;

-- Dedupe per member: (member_id, job_url) must be unique.
-- Note: ON CONFLICT in Supabase upsert does NOT work with partial indexes
-- (WHERE clause), so we use a full unique constraint instead.
do $$ begin
  alter table public.daily_matches
    add constraint daily_matches_member_url_unique unique (member_id, job_url);
exception when duplicate_object then null;
end $$;

create index if not exists idx_daily_matches_match_date
  on public.daily_matches (member_id, match_date desc);
