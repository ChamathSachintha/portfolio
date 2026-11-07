
begin;

-- Public access only to images actually associated
-- with a published journal session.
create policy "Journal public published assets"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'journal-assets'
  and (storage.foldername(name))[1] = 'entries'
  and exists (
    select 1
    from public.journal_entries e
    where e.id::text = (storage.foldername(name))[2]
      and e.status = 'published'
      and (
        e.cover_image_path = name
        or e.facilitator_photo_path = name
        or exists (
          select 1
          from public.journal_media m
          where m.entry_id = e.id
            and m.storage_path = name
        )
      )
  )
);

-- Authorized admins can read all journal assets,
-- including images from draft sessions.
create policy "Journal admin read assets"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'journal-assets'
  and (select private.is_journal_admin())
);

-- Only authorized admins can upload images
-- into folders belonging to existing sessions.
create policy "Journal admin upload assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'journal-assets'
  and (select private.is_journal_admin())
  and (storage.foldername(name))[1] = 'entries'
  and (storage.foldername(name))[3]
    in ('cover', 'facilitator', 'gallery')
  and exists (
    select 1
    from public.journal_entries e
    where e.id::text = (storage.foldername(name))[2]
  )
);

-- Only authorized admins can delete journal assets.
create policy "Journal admin delete assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'journal-assets'
  and (select private.is_journal_admin())
);

commit;
