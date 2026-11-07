
begin;

-- ======================================
-- 1. SECURE ADMIN CHECK FUNCTION
-- ======================================

-- Keep this helper outside the public API schema.
create schema if not exists private;

revoke all on schema private
from public, anon, authenticated;

grant usage on schema private to authenticated;

create or replace function private.is_journal_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.journal_admins ja
        where ja.user_id = (select auth.uid())
    );
$$;

revoke all on function private.is_journal_admin()
from public, anon, authenticated;

grant execute on function private.is_journal_admin()
to authenticated;


-- ======================================
-- 2. EXPLICIT DATABASE PERMISSIONS
-- ======================================

-- Start with restricted access.
revoke all on table
    public.journal_settings,
    public.journal_entries,
    public.journal_media,
    public.journal_admins
from anon, authenticated;

-- Visitors may only read journal content.
grant select on table
    public.journal_settings,
    public.journal_entries,
    public.journal_media
to anon;

-- Signed-in users can read.
-- RLS will distinguish administrators.
grant select on table
    public.journal_settings,
    public.journal_entries,
    public.journal_media
to authenticated;

-- Journal settings cannot be deleted by the client.
grant insert, update
on public.journal_settings
to authenticated;

-- Content management permissions.
-- Only admins will pass the RLS checks.
grant insert, update, delete on table
    public.journal_entries,
    public.journal_media
to authenticated;


-- ======================================
-- 3. JOURNAL SETTINGS POLICIES
-- ======================================

create policy "Public can read journal settings"
on public.journal_settings
for select
to anon, authenticated
using (true);

create policy "Admins can insert journal settings"
on public.journal_settings
for insert
to authenticated
with check (
    (select private.is_journal_admin())
);

create policy "Admins can update journal settings"
on public.journal_settings
for update
to authenticated
using (
    (select private.is_journal_admin())
)
with check (
    (select private.is_journal_admin())
);


-- ======================================
-- 4. JOURNAL ENTRY POLICIES
-- ======================================

-- Visitors can only view published entries.
create policy "Public can read published entries"
on public.journal_entries
for select
to anon, authenticated
using (
    status = 'published'
);

-- Admins can manage both drafts and published entries.
create policy "Admins can manage journal entries"
on public.journal_entries
for all
to authenticated
using (
    (select private.is_journal_admin())
)
with check (
    (select private.is_journal_admin())
);


-- ======================================
-- 5. SESSION GALLERY POLICIES
-- ======================================

-- Only gallery records belonging to
-- published sessions are publicly readable.
create policy "Public can read published session media"
on public.journal_media
for select
to anon, authenticated
using (
    exists (
        select 1
        from public.journal_entries e
        where e.id = journal_media.entry_id
          and e.status = 'published'
    )
);

-- Only administrators manage gallery records.
create policy "Admins can manage journal media"
on public.journal_media
for all
to authenticated
using (
    (select private.is_journal_admin())
)
with check (
    (select private.is_journal_admin())
);

-- The journal_admins table remains inaccessible
-- directly to browser roles.

commit;
