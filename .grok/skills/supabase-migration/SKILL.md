---
name: supabase-migration
description: Add idempotent SQL to supabase/migrate-pending.sql and mirror greenfield changes in schema.sql. Use when changing Supabase tables, columns, RLS, or indexes, or when the user runs /supabase-migration.
---

# Supabase Migration

Roiders Club uses hand-written SQL, not Supabase CLI migrations folder.

## Canonical files

| File | Purpose |
|------|---------|
| `supabase/migrate-pending.sql` | **Incremental** — applied by `npm run db:migrate` |
| `supabase/schema.sql` | **Greenfield** — full base schema, safe to re-run |
| `supabase/archive/*.sql` | Historical only — **never** append here |

## Workflow

1. **Read current schema** in `schema.sql` and latest `migrate-pending.sql`.
2. **Append** new changes to `migrate-pending.sql` using idempotent patterns already in file:
   - `create table if not exists`
   - `alter table ... add column if not exists`
   - `create index if not exists`
   - `drop policy if exists` + `create policy`
   - `do $$ ... if not exists (pg_constraint) ... end $$` for FKs
3. **Mirror** the same structural change in `schema.sql` for greenfield installs (so new projects get complete schema in one paste).
4. End `migrate-pending.sql` section with `notify pgrst, 'reload schema';` if not already at file end.
5. Update hand-written TS types if columns are read by app (`src/lib/siteSettings.ts`, `src/lib/profile.ts`, etc.).

## Apply locally

```bash
npm run db:migrate          # needs DATABASE_URL or SUPABASE_DB_PASSWORD
npm run db:migrate:print    # print SQL only
npm run db:bootstrap        # post-migrate admin promotion
```

## RLS conventions

- `profiles`, `user_modules`: users access own rows (`auth.uid() = id` / `user_id`).
- `auth_secrets`: RLS on, **no client policies** — server-only.
- `site_settings`, `vendors`: RLS on; app uses service role / admin client.

## Hard constraints (from AGENTS.md)

- `user_modules.module` CHECK must stay: `'labs','cycle','gym','nutrition','settings'`.
- Do not reintroduce `profiles.email`.
- `site_settings.id` singleton CHECK (`id = 1`).

## Checklist

1. SQL is idempotent (safe to re-run).
2. Both `migrate-pending.sql` and `schema.sql` updated.
3. TypeScript types + any API handlers updated.
4. Document manual fallback in commit message (SQL Editor URL pattern in `scripts/apply-migrations.mjs`).

## Do not

- Run or reference `supabase/archive/` for new work.
- Generate `database.types.ts` unless user explicitly requests Supabase codegen setup.