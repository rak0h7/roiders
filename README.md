# Roiders Club

Labs, protocol, and training — one health command center.

## Authentication (access key)

Roiders Club uses **private access keys** — no email, no verification links.

1. **Create account** → generates a key like `roiders_k7xm_9p2q_rn4w_h8tj`
2. **Save it immediately** — shown once; admins can retrieve escrowed keys if you lose yours
3. **Sign in** → paste your key

## Local development

```bash
cp .env.example .env.local   # fill in Supabase + DB credentials
npm install
npm run dev                  # http://localhost:1337
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Copy keys from **Project Settings → API** into `.env.local`
3. Apply schema migrations:

```bash
npm run db:migrate           # requires DATABASE_URL or SUPABASE_DB_PASSWORD
npm run db:bootstrap         # promotes admin + verifies schema
npm run create-admin         # if no service role key (uses Postgres fallback)
```

**Greenfield manual fallback:** paste `supabase/schema.sql` then `supabase/migrate-pending.sql` in the [SQL Editor](https://supabase.com/dashboard).

Numbered files (`002_admin.sql` … `005_comprehensive_settings.sql`) are historical — `migrate-pending.sql` is the canonical incremental migration.

## Deploy (Vercel)

Production: https://roiders.club

```bash
npm run deploy
```

### Required environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server auth + admin API (optional if `DATABASE_URL` set) |
| `DATABASE_URL` or `SUPABASE_DB_PASSWORD` | Postgres for login fallback + migrations |
| `ADMIN_FINGERPRINT` | Fingerprint of sole admin access key |
| `ACCESS_KEY_VAULT_SECRET` | 32+ char secret for encrypting escrowed access keys |

### Optional

- `SUPABASE_ACCESS_TOKEN` — Management API for `db:migrate` without direct Postgres
- `POSTGRES_URL` / `POSTGRES_URL_NON_POOLING` — Vercel-injected pooler URLs
- `NEXT_PUBLIC_ADMIN_FINGERPRINT` — client-side admin detection

## Cloud sync (premium)

- Requires sign-in and **premium sync enabled** on your account (admin toggle)
- Site-wide `cloud_sync_enabled` must also be on
- Free tier is local-only (browser storage)
- Modules synced: labs, cycle, gym, settings (legacy `nutrition` rows ignored)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Unit tests (vitest) |
| `npm run build` | Production build |
| `npm run db:migrate` | Apply `migrate-pending.sql` |
| `npm run db:bootstrap` | Post-migration admin promotion |
| `npm run create-admin` | Create sole admin account |