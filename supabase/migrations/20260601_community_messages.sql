-- Community chat: real-time-style message stream (Discord layout).
-- Channels are topics: general, spolubydleni, napady, dotazy, tipy.
-- AI replies (is_ai = true) are inserted server-side only when a user
-- opts in via an @AI / /ai prefix.

create table if not exists community_messages (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  user_id uuid not null,
  user_name text not null,
  content text not null,
  is_ai boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists community_messages_channel_created_idx
  on community_messages (channel, created_at desc);
