
begin;

create or replace function public.is_current_journal_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_journal_admin();
$$;

-- Restrict who can execute this function.
revoke all on function public.is_current_journal_admin()
from public, anon, authenticated;

grant execute on function public.is_current_journal_admin()
to authenticated;

commit;
