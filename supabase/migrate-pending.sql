-- Run this ONCE in Supabase SQL Editor if login gets stuck on /welcome
-- https://supabase.com/dashboard/project/uhssspbmgsijvygrxvaw/sql/new

-- 1) Admin role
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- 2) Usernames
alter table public.profiles add column if not exists username text;

create unique index if not exists profiles_username_idx
  on public.profiles (username)
  where username is not null;

-- 3) Site settings
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default 'Roiders Club',
  site_tagline text not null default 'Private performance tracking',
  maintenance_mode boolean not null default false,
  maintenance_message text not null default 'Roiders Club is undergoing maintenance. Please check back soon.',
  allow_public_signup boolean not null default false,
  announcement_enabled boolean not null default false,
  announcement_message text not null default '',
  announcement_level text not null default 'info' check (announcement_level in ('info', 'warning', 'danger')),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

alter table public.site_settings enable row level security;

-- 4) Comprehensive settings (005)
alter table public.site_settings add column if not exists welcome_message text not null default '';
alter table public.site_settings add column if not exists login_message text not null default '';
alter table public.site_settings add column if not exists signup_message text not null default '';
alter table public.site_settings add column if not exists support_url text not null default '';
alter table public.site_settings add column if not exists max_accounts int not null default 50;
alter table public.site_settings add column if not exists cloud_sync_enabled boolean not null default true;
alter table public.site_settings add column if not exists debug_panel_enabled boolean not null default false;
alter table public.site_settings add column if not exists module_labs_enabled boolean not null default true;
alter table public.site_settings add column if not exists module_cycle_enabled boolean not null default true;
alter table public.site_settings add column if not exists module_gym_enabled boolean not null default true;
alter table public.site_settings add column if not exists module_nutrition_enabled boolean not null default true;
alter table public.site_settings add column if not exists announcement_link text not null default '';

-- Sell-access defaults for existing installs still on open signup + unlimited accounts
update public.site_settings
set allow_public_signup = false, max_accounts = 50
where id = 1 and allow_public_signup = true and max_accounts = 0;

-- 5) Vendors (approved resellers)
alter table public.profiles add column if not exists is_vendor boolean not null default false;
alter table public.profiles add column if not exists issued_by_vendor_id uuid;

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references auth.users (id) on delete cascade,
  name text not null,
  contact_url text not null default '',
  key_quota int not null default 0,
  keys_issued int not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vendors_profile_id_idx on public.vendors (profile_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_issued_by_vendor_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_issued_by_vendor_id_fkey
      foreign key (issued_by_vendor_id) references public.vendors (id) on delete set null;
  end if;
end $$;

create index if not exists profiles_issued_by_vendor_id_idx on public.profiles (issued_by_vendor_id)
  where issued_by_vendor_id is not null;

alter table public.vendors enable row level security;

-- Free product defaults for new installs
update public.site_settings
set allow_public_signup = true
where id = 1 and allow_public_signup = false and max_accounts = 50;

-- 6) Per-user premium cloud sync (off by default for new accounts)
alter table public.profiles add column if not exists premium_sync_enabled boolean not null default false;

-- Existing site admins keep sync; everyone else starts local-only until upgraded
update public.profiles
set premium_sync_enabled = true
where is_admin = true;

-- 7) Extended site settings (admin panel)
alter table public.site_settings add column if not exists public_landing_enabled boolean not null default true;
alter table public.site_settings add column if not exists premium_sources_enabled boolean not null default true;
alter table public.site_settings add column if not exists vendor_portal_enabled boolean not null default true;
alter table public.site_settings add column if not exists default_labs_range_mode text not null default 'optimized';
alter table public.site_settings add column if not exists legal_contact_email text not null default '';
alter table public.site_settings add column if not exists signup_closed_message text not null default '';
alter table public.site_settings add column if not exists site_description text not null default '';
alter table public.site_settings add column if not exists announcement_guest_visible boolean not null default false;

-- 8) Admin key escrow (encrypted recovery for all accounts)
create table if not exists public.access_key_vault (
  user_id uuid primary key references auth.users (id) on delete cascade,
  encrypted_key text not null,
  issued_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.access_key_vault enable row level security;

-- 9) Articles module toggle
alter table public.site_settings add column if not exists module_articles_enabled boolean not null default true;

-- 10) Published articles (admin-managed; server-only RLS)
create table if not exists public.articles (
  id text primary key,
  title text not null,
  tagline text,
  category text not null check (category in ('gear', 'training', 'diet', 'health', 'general')),
  sections jsonb not null default '[]'::jsonb,
  cover_image text,
  cover_image_alt text,
  series_order int,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_category_idx on public.articles (category);
create index if not exists articles_published_at_idx on public.articles (published_at desc nulls last);

alter table public.articles enable row level security;

-- Refresh PostgREST schema cache (safe to run; no-op if already current)
notify pgrst, 'reload schema';