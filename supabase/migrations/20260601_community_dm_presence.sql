-- Komunita retention vrstva: soukromé zprávy (DM), presence (online členové),
-- a notifikační preference pro e-maily.

-- 1) Soukromé zprávy 1:1 (Discord-style DM). Konverzace se odvozují z dvojice
--    (sender_id, recipient_id) — bez samostatné tabulky konverzací.
create table if not exists dm_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null,
  recipient_id uuid not null,
  content text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz default null
);
create index if not exists dm_messages_pair_idx
  on dm_messages (sender_id, recipient_id, created_at desc);
create index if not exists dm_messages_recipient_unread_idx
  on dm_messages (recipient_id, read_at);

-- 2) Presence + notifikační preference na profilu.
alter table profiles
  add column if not exists last_seen_at    timestamptz default null,
  add column if not exists notify_mentions boolean default true,
  add column if not exists notify_dms      boolean default true,
  add column if not exists notify_weekly   boolean default true;

comment on column profiles.last_seen_at    is 'Poslední heartbeat z komunity — online = za posledních ~3 min.';
comment on column profiles.notify_mentions is 'E-mail když mě někdo @zmíní v komunitě.';
comment on column profiles.notify_dms      is 'E-mail když mi přijde soukromá zpráva a jsem offline.';
comment on column profiles.notify_weekly   is 'Týdenní souhrn aktivity komunity.';
