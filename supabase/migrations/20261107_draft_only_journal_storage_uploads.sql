begin;

-- Replace the existing journal upload policy so Storage independently
-- enforces the CMS draft-only upload workflow.
drop policy if exists "Journal admin upload assets"
on storage.objects;

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
      and e.status = 'draft'
  )
);

commit;
