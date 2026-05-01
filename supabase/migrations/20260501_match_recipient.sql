-- M1D — recipient email for Gmail send
alter table public.daily_matches
  add column if not exists recipient_email text;
