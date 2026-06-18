-- Usernames — run in Supabase SQL Editor

alter table public.profiles add column if not exists username text;

create unique index if not exists profiles_username_idx
  on public.profiles (username)
  where username is not null;

-- Owner account: username @admin, display name Admin
update public.profiles
set username = 'admin', display_name = 'Admin', updated_at = now()
where key_fingerprint = 'd6b10edd75eaef1d'
   or id = '2cc12262-1800-4573-9d2f-8e2b06d9e650';