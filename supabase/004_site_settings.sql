-- Site settings + owner display name — run in Supabase SQL Editor

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

-- Owner account: username @admin, display name Admin
update public.profiles
set username = 'admin', display_name = 'Admin', updated_at = now()
where key_fingerprint = 'd6b10edd75eaef1d'
   or id = '2cc12262-1800-4573-9d2f-8e2b06d9e650';