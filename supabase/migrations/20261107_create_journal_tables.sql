
begin;

-- 1. One university module: journal settings
create table public.journal_settings (
    id smallint primary key default 1 check (id = 1),
    module_title text not null default '',
    heading text not null default 'University Practical Journal',
    subheading text,
    introduction text,
    updated_at timestamptz not null default now()
);

-- 2. Individual practical sessions
create table public.journal_entries (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique
        check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    title text not null,
    subheading text,
    session_date date not null,

    -- Content
    description text not null default '',
    reflection text not null default '',

    -- Optional facilitator information
    facilitator_name text,
    facilitator_title text,
    facilitator_organization text,
    facilitator_bio text,
    facilitator_photo_path text,
    facilitator_link text,

    -- Optional cover
    cover_image_path text,

    -- Publishing
    status text not null default 'draft'
        check (status in ('draft', 'published')),
    published_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 3. Images associated with individual sessions
create table public.journal_media (
    id uuid primary key default gen_random_uuid(),
    entry_id uuid not null
        references public.journal_entries(id)
        on delete cascade,

    storage_path text not null unique,
    caption text,
    alt_text text,
    sort_order integer not null default 0
        check (sort_order >= 0),

    created_at timestamptz not null default now()
);

-- 4. Authorized CMS administrators
create table public.journal_admins (
    user_id uuid primary key
        references auth.users(id)
        on delete cascade,
    created_at timestamptz not null default now()
);

-- Indexes for efficient journal queries
create index journal_entries_status_date_idx
    on public.journal_entries(status, session_date desc);

create index journal_media_entry_order_idx
    on public.journal_media(entry_id, sort_order);

-- Enable security immediately
alter table public.journal_settings enable row level security;
alter table public.journal_entries enable row level security;
alter table public.journal_media enable row level security;
alter table public.journal_admins enable row level security;

-- Deny browser access until explicit policies are created
revoke all on table
    public.journal_settings,
    public.journal_entries,
    public.journal_media,
    public.journal_admins
from anon, authenticated;

commit;
