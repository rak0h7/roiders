# Archived migrations

These numbered SQL files are **historical** and superseded by `supabase/migrate-pending.sql`.

For new environments:

1. Greenfield: run `supabase/schema.sql`, then `npm run db:migrate`
2. Existing project: run `npm run db:migrate` only

Do not run archive files individually unless you know the exact schema state of your database.