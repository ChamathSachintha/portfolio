begin;

create table public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  short_description text not null default '',
  overview text,
  category text,
  project_type text not null default 'individual' check (project_type in ('individual', 'team')),
  role text,
  contribution text,
  challenges text,
  lessons_learned text,
  github_url text,
  live_url text,
  figma_url text,
  other_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  display_order integer not null default 0 check (display_order >= 0),
  thumbnail_path text,
  hero_image_path text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolio_project_technologies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.portfolio_projects(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0 check (sort_order >= 0)
);

create table public.portfolio_project_features (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.portfolio_projects(id) on delete cascade,
  title text not null,
  description text not null default '',
  sort_order integer not null default 0 check (sort_order >= 0)
);

create table public.portfolio_project_sections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.portfolio_projects(id) on delete cascade,
  title text not null,
  body text not null default '',
  sort_order integer not null default 0 check (sort_order >= 0)
);

create table public.portfolio_project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.portfolio_projects(id) on delete cascade,
  storage_path text not null unique,
  caption text,
  alt_text text,
  sort_order integer not null default 0 check (sort_order >= 0),
  media_type text not null default 'screenshot' check (media_type in ('screenshot', 'hero')),
  created_at timestamptz not null default now()
);

create table public.portfolio_featured_projects (
  position smallint primary key check (position between 1 and 3),
  project_id uuid not null unique references public.portfolio_projects(id) on delete cascade
);

create table public.portfolio_settings (
  id smallint primary key default 1 check (id = 1),
  use_cms_featured_projects boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.portfolio_settings (id) values (1) on conflict (id) do nothing;

create index portfolio_projects_status_order_idx on public.portfolio_projects(status, display_order, created_at);
create index portfolio_project_media_project_order_idx on public.portfolio_project_media(project_id, sort_order);

alter table public.portfolio_projects enable row level security;
alter table public.portfolio_project_technologies enable row level security;
alter table public.portfolio_project_features enable row level security;
alter table public.portfolio_project_sections enable row level security;
alter table public.portfolio_project_media enable row level security;
alter table public.portfolio_featured_projects enable row level security;
alter table public.portfolio_settings enable row level security;

grant select on public.portfolio_projects, public.portfolio_project_technologies,
  public.portfolio_project_features, public.portfolio_project_sections,
  public.portfolio_project_media, public.portfolio_featured_projects,
  public.portfolio_settings to anon, authenticated;
grant insert, update, delete on public.portfolio_projects,
  public.portfolio_project_technologies, public.portfolio_project_features,
  public.portfolio_project_sections, public.portfolio_project_media,
  public.portfolio_featured_projects, public.portfolio_settings to authenticated;

create policy "Public can read published portfolio projects"
on public.portfolio_projects for select to anon, authenticated using (status = 'published');
create policy "Admins can manage portfolio projects"
on public.portfolio_projects for all to authenticated
using ((select private.is_journal_admin())) with check ((select private.is_journal_admin()));

create policy "Public can read published project technologies"
on public.portfolio_project_technologies for select to anon, authenticated
using (exists (select 1 from public.portfolio_projects p where p.id = project_id and p.status = 'published'));
create policy "Admins can manage project technologies"
on public.portfolio_project_technologies for all to authenticated
using ((select private.is_journal_admin())) with check ((select private.is_journal_admin()));

create policy "Public can read published project features"
on public.portfolio_project_features for select to anon, authenticated
using (exists (select 1 from public.portfolio_projects p where p.id = project_id and p.status = 'published'));
create policy "Admins can manage project features"
on public.portfolio_project_features for all to authenticated
using ((select private.is_journal_admin())) with check ((select private.is_journal_admin()));

create policy "Public can read published project sections"
on public.portfolio_project_sections for select to anon, authenticated
using (exists (select 1 from public.portfolio_projects p where p.id = project_id and p.status = 'published'));
create policy "Admins can manage project sections"
on public.portfolio_project_sections for all to authenticated
using ((select private.is_journal_admin())) with check ((select private.is_journal_admin()));

create policy "Public can read published project media"
on public.portfolio_project_media for select to anon, authenticated
using (exists (select 1 from public.portfolio_projects p where p.id = project_id and p.status = 'published'));
create policy "Admins can manage project media"
on public.portfolio_project_media for all to authenticated
using ((select private.is_journal_admin())) with check ((select private.is_journal_admin()));

create policy "Public can read published featured projects"
on public.portfolio_featured_projects for select to anon, authenticated
using (exists (select 1 from public.portfolio_projects p where p.id = project_id and p.status = 'published'));
create policy "Admins can manage featured projects"
on public.portfolio_featured_projects for all to authenticated
using ((select private.is_journal_admin())) with check ((select private.is_journal_admin()));

create policy "Public can read portfolio settings"
on public.portfolio_settings for select to anon, authenticated using (true);
create policy "Admins can manage portfolio settings"
on public.portfolio_settings for all to authenticated
using ((select private.is_journal_admin())) with check ((select private.is_journal_admin()));

create or replace function public.save_portfolio_featured_projects(selected_project_ids uuid[])
returns void language plpgsql security invoker set search_path = public
as $$
begin
  if coalesce(array_length(selected_project_ids, 1), 0) <> 3 then
    raise exception 'Provide three featured slot values; use null for empty slots';
  end if;
  if (select count(*) from unnest(selected_project_ids) as selected(id) where selected.id is not null) <>
     (select count(distinct selected.id) from unnest(selected_project_ids) as selected(id) where selected.id is not null) then
    raise exception 'Featured projects must be unique';
  end if;
  if exists (select 1 from public.portfolio_projects where id = any(selected_project_ids) and status <> 'published') then
    raise exception 'Only published projects can be featured';
  end if;
  delete from public.portfolio_featured_projects
  where position in (1, 2, 3);
  insert into public.portfolio_featured_projects(position, project_id)
  select row_number() over (), id from unnest(selected_project_ids) as selected(id) where id is not null;
end;
$$;
grant execute on function public.save_portfolio_featured_projects(uuid[]) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-project-assets', 'portfolio-project-assets', false, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = 8388608,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can read published project assets"
on storage.objects for select to anon, authenticated using (
  bucket_id = 'portfolio-project-assets'
  and exists (
    select 1 from public.portfolio_project_media m
    join public.portfolio_projects p on p.id = m.project_id
    where p.status = 'published' and m.storage_path = name
  )
);
create policy "Admins can read project assets"
on storage.objects for select to authenticated using (
  bucket_id = 'portfolio-project-assets' and (select private.is_journal_admin())
);
create policy "Admins can upload project assets"
on storage.objects for insert to authenticated with check (
  bucket_id = 'portfolio-project-assets'
  and (select private.is_journal_admin())
  and (storage.foldername(name))[1] = 'projects'
  and exists (select 1 from public.portfolio_projects p where p.id::text = (storage.foldername(name))[2])
);
create policy "Admins can delete project assets"
on storage.objects for delete to authenticated using (
  bucket_id = 'portfolio-project-assets' and (select private.is_journal_admin())
);

commit;
