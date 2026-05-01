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

-- Dedupe per member: (member_id, job_url) must be unique
create unique index if not exists uniq_daily_matches_member_url
  on public.daily_matches (member_id, job_url)
  where job_url is not null;

create index if not exists idx_daily_matches_match_date
  on public.daily_matches (member_id, match_date desc);
