# Roiders.Club

AAS cycle tracker, compound library, bloodwork logger, and pharmacokinetic visualiser.

**Stack:** React (Vite) · Tailwind CSS · Supabase · Recharts · TanStack Query

## Quick start (local)

```bash
npm install
cp .env.example .env.local   # add Supabase credentials
npm run dev
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and anon key from **Settings → API**
4. Add to `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
5. Seed compounds (needs service role key in `.env`):
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   npm run seed
   ```

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy — Vite builds automatically

## Project structure

```
compounds/          Compound .md files (source of truth)
scripts/            Seed script for compounds
src/
  components/       UI, charts, layout
  contexts/         Auth
  lib/              Supabase client, PK engine, utils
  pages/            Route pages
supabase/
  migrations/       SQL schema + RLS
```

## Features

- **Cycle builder & tracker** — compounds, doses, Gantt timeline, dose logging
- **PK engine** — half-life decay curves (HalfLife Kinetics–style)
- **Bloodwork** — panels, marker flagging, trend charts
- **Compound library** — A–Z index from seeded markdown data
- **Calculators** — half-life, ester weight, weekly dose, reference ranges