-- Roiders Club access-key auth — run in Supabase SQL Editor
-- Safe to re-run on an existing database (migrates legacy profiles tables).

create extension if not exists "pgcrypto";

-- Base table (legacy Roiders Club installs may already have profiles with other columns)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade
);

-- Access-key auth columns (added if missing)
alter table public.profiles add column if not exists key_fingerprint text;
alter table public.profiles add column if not exists access_key_hash text;
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles add column if not exists is_vendor boolean not null default false;
alter table public.profiles add column if not exists premium_sync_enabled boolean not null default false;
alter table public.profiles add column if not exists username text;

create unique index if not exists profiles_username_idx
  on public.profiles (username)
  where username is not null;

-- Drop legacy email column if present (access keys only)
alter table public.profiles drop column if exists email;

-- Server-only session secrets (no client policies)
create table if not exists public.auth_secrets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  session_secret text not null
);

-- Admin-recoverable access keys (AES-encrypted; server-only, no client policies)
create table if not exists public.access_key_vault (
  user_id uuid primary key references auth.users (id) on delete cascade,
  encrypted_key text not null,
  issued_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.access_key_vault enable row level security;

create table if not exists public.user_modules (
  user_id uuid not null references auth.users (id) on delete cascade,
  module text not null check (module in ('labs', 'cycle', 'gym', 'nutrition', 'settings')),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, module)
);

create index if not exists user_modules_user_id_idx on public.user_modules (user_id);

-- Approved vendors (resellers who issue customer access keys)
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

alter table public.profiles add column if not exists issued_by_vendor_id uuid references public.vendors (id) on delete set null;
create index if not exists profiles_issued_by_vendor_id_idx on public.profiles (issued_by_vendor_id)
  where issued_by_vendor_id is not null;

alter table public.vendors enable row level security;

-- Unique fingerprint lookup (partial index allows legacy rows without keys)
create unique index if not exists profiles_key_fingerprint_idx
  on public.profiles (key_fingerprint)
  where key_fingerprint is not null;

alter table public.profiles enable row level security;
alter table public.user_modules enable row level security;
alter table public.auth_secrets enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "user_modules_select_own" on public.user_modules;
create policy "user_modules_select_own" on public.user_modules
  for select using (auth.uid() = user_id);

drop policy if exists "user_modules_insert_own" on public.user_modules;
create policy "user_modules_insert_own" on public.user_modules
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_modules_update_own" on public.user_modules;
create policy "user_modules_update_own" on public.user_modules
  for update using (auth.uid() = user_id);

drop policy if exists "user_modules_delete_own" on public.user_modules;
create policy "user_modules_delete_own" on public.user_modules
  for delete using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, 'Account')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Site-wide settings (singleton row, server-managed)
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
  announcement_link text not null default '',
  welcome_message text not null default '',
  login_message text not null default '',
  signup_message text not null default '',
  support_url text not null default '',
  max_accounts int not null default 50,
  cloud_sync_enabled boolean not null default true,
  debug_panel_enabled boolean not null default false,
  module_labs_enabled boolean not null default true,
  module_cycle_enabled boolean not null default true,
  module_gym_enabled boolean not null default true,
  module_articles_enabled boolean not null default true,
  module_nutrition_enabled boolean not null default true,
  public_landing_enabled boolean not null default true,
  premium_sources_enabled boolean not null default true,
  vendor_portal_enabled boolean not null default true,
  default_labs_range_mode text not null default 'optimized' check (default_labs_range_mode in ('lab', 'optimized')),
  legal_contact_email text not null default '',
  signup_closed_message text not null default '',
  site_description text not null default '',
  announcement_guest_visible boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

alter table public.site_settings enable row level security;

-- Published reference articles (admin-managed via service role; no client RLS policies)
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