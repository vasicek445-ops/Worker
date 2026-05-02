-- M1E — Smart Apply company database (sourced from local.ch + future sources)
-- Goal: 5000-50000 swiss SME employers with verified emails for direct outreach.

create table if not exists public.companies (
  id            uuid primary key default gen_random_uuid(),
  source        text not null,                          -- 'localch' | 'agencies' | 'manual' | 'zefix'
  external_id   text,                                   -- source-specific id when known
  name          text not null,
  email         text,
  phone         text,
  website       text,
  street        text,
  zip           text,
  city          text,
  canton        text,                                   -- 2-letter ZH/BE/etc
  region        text,                                   -- 'german' | 'french' | 'italian'
  branche       text,                                   -- e.g. 'Restaurant', 'Spedition', 'Reinigung'
  noga_code     text,                                   -- if known
  positions     text[],                                 -- inferred typical roles ('koch','kellner')
  scraped_at    timestamptz not null default now(),
  refreshed_at  timestamptz,
  email_verified_at timestamptz,
  unique (source, email)
);

create index if not exists idx_companies_branche on public.companies (branche);
create index if not exists idx_companies_canton on public.companies (canton);
create index if not exists idx_companies_region on public.companies (region);
create index if not exists idx_companies_email_present on public.companies (email) where email is not null;

-- Scraping run log so we know what was crawled when
create table if not exists public.scrape_runs (
  id            uuid primary key default gen_random_uuid(),
  source        text not null,
  query         text,                                   -- e.g. 'restaurant zürich'
  rows_found    integer not null default 0,
  rows_new      integer not null default 0,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  error         text
);
