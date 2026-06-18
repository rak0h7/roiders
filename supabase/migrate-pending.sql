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
  allow_public_signup boolean not null default true,
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
alter table public.site_settings add column if not exists max_accounts int not null default 0;
alter table public.site_settings add column if not exists cloud_sync_enabled boolean not null default true;
alter table public.site_settings add column if not exists debug_panel_enabled boolean not null default false;
alter table public.site_settings add column if not exists module_labs_enabled boolean not null default true;
alter table public.site_settings add column if not exists module_cycle_enabled boolean not null default true;
alter table public.site_settings add column if not exists module_gym_enabled boolean not null default true;
alter table public.site_settings add column if not exists module_nutrition_enabled boolean not null default true;
alter table public.site_settings add column if not exists announcement_link text not null default '';

-- Refresh PostgREST schema cache (safe to run; no-op if already current)
notify pgrst, 'reload schema';