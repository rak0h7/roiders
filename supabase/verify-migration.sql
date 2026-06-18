-- Run in Supabase SQL Editor AFTER migrate-pending.sql.
-- All three values must be true. If not, you are on the wrong project or migration failed.

select
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'username'
  ) as has_username,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'is_admin'
  ) as has_is_admin,
  exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'site_settings'
  ) as has_site_settings;