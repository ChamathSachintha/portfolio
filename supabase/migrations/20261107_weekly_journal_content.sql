
begin;

-- 1. Add a week number to journal entries.
-- Nullable initially to preserve existing records.
alter table public.journal_entries
add column if not exists week_number integer;

-- 2. Add repeatable custom text sections.
alter table public.journal_entries
add column if not exists content_sections jsonb
not null default '[]'::jsonb;

-- 3. Make the exact date optional.
-- The public journal will display week numbers.
alter table public.journal_entries
alter column session_date drop not null;

-- 4. Validate week numbers and content sections.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'journal_entries_week_number_check'
      and conrelid = 'public.journal_entries'::regclass
  ) then
    alter table public.journal_entries
    add constraint journal_entries_week_number_check
    check (week_number between 1 and 52);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'journal_entries_sections_check'
      and conrelid = 'public.journal_entries'::regclass
  ) then
    alter table public.journal_entries
    add constraint journal_entries_sections_check
    check (jsonb_typeof(content_sections) = 'array');
  end if;
end;
$$;

-- 5. Index for ordering published weekly entries.
create index if not exists
journal_entries_public_week_idx
on public.journal_entries
(week_number, created_at)
where status = 'published';

commit;
