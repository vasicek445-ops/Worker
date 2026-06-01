-- Community chat: file/photo attachments + storage bucket.
-- Users can attach images (fotky bytů, screenshoty) and files (PDF smlouvy)
-- to a chat message via the "+" button in the composer.

alter table community_messages
  add column if not exists attachment_url  text default null,
  add column if not exists attachment_type text default null,  -- MIME, e.g. image/png, application/pdf
  add column if not exists attachment_name text default null;

comment on column community_messages.attachment_url  is 'Public URL přílohy v Storage bucketu "community". NULL = bez přílohy.';
comment on column community_messages.attachment_type is 'MIME typ přílohy — rozhoduje render (image/* = náhled, jinak file chip).';
comment on column community_messages.attachment_name is 'Původní název souboru pro zobrazení a download.';

-- Public bucket for community attachments (stejný princip jako "avatars").
insert into storage.buckets (id, name, public)
values ('community', 'community', true)
on conflict (id) do nothing;

-- Authenticated users mohou nahrávat, kdokoliv může číst (bucket je public).
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'community_attach_insert') then
    create policy "community_attach_insert" on storage.objects
      for insert to authenticated
      with check (bucket_id = 'community');
  end if;
  if not exists (select 1 from pg_policies where policyname = 'community_attach_select') then
    create policy "community_attach_select" on storage.objects
      for select
      using (bucket_id = 'community');
  end if;
end $$;
