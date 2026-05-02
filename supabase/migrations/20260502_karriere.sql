-- M1F — HR-specific email tagging + active company jobs index

-- Tag the role of each company email so Smart Apply can prefer HR mailboxes
alter table public.companies
  add column if not exists email_role     text check (email_role in ('hr','specific','general','sales','unknown')),
  add column if not exists karriere_url   text,
  add column if not exists karriere_scraped_at timestamptz;

create index if not exists idx_companies_email_role on public.companies (email_role);

-- Backfill existing 394 rows: classify info@/kontakt@ as 'general'
update public.companies set email_role = 'general'
  where email_role is null and email is not null
    and split_part(email, '@', 1) in ('info','kontakt','office','contact','hello','mail','support','admin','reception');

update public.companies set email_role = 'unknown'
  where email_role is null and email is not null;

-- Active job listings scraped from each company's /karriere page
create table if not exists public.company_jobs (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references public.companies(id) on delete cascade,
  title           text not null,
  description     text,
  job_url         text,
  language        text,
  scraped_at      timestamptz not null default now(),
  expires_at      timestamptz not null default now() + interval '21 days',
  unique (company_id, title)
);

create index if not exists idx_company_jobs_company on public.company_jobs (company_id);
create index if not exists idx_company_jobs_active on public.company_jobs (expires_at) where expires_at > now();
