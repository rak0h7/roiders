-- Admin role — run in Supabase SQL Editor after schema.sql

alter table public.profiles add column if not exists is_admin boolean not null default false;

-- Bootstrap: your owner account (fingerprint of roiders_9k34_5tkc_vu3v_rw6n)
update public.profiles
set is_admin = true, updated_at = now()
where key_fingerprint = 'd6b10edd75eaef1d'
   or id = '2cc12262-1800-4573-9d2f-8e2b06d9e650';