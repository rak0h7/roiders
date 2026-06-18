-- Comprehensive site settings — run in Supabase SQL Editor after 004_site_settings.sql

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