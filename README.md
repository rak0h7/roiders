# Roiders Club

Labs, protocol, training, and nutrition — one health command center.

## Authentication (access key)

Roiders Club uses **private access keys** — no email, no verification links.

1. **Create account** → generates a key like `roiders_k7xm_9p2q_rn4w_h8tj`
2. **Save it immediately** — shown once, cannot be recovered
3. **Sign in** → paste your key

## Local development

```bash
cp .env.example .env.local   # add anon + service_role keys
npm install
npm run dev                  # http://localhost:1337
```

## Supabase setup

Project: `https://uhssspbmgsijvygrxvaw.supabase.co`

1. [SQL Editor](https://supabase.com/dashboard/project/uhssspbmgsijvygrxvaw/sql/new) → run `supabase/schema.sql`
2. **Authentication → Providers** → disable email signups (optional; keys are used instead)
3. Copy keys from **Project Settings → API** into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon public)
   - `SUPABASE_SERVICE_ROLE_KEY` (server only)

## Deploy (Vercel)

Production: https://roiders.vercel.app

```bash
npm run deploy
```

Required environment variables on Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required for key auth API routes)

## Cloud sync

- Sign-in required (access key)
- Data syncs automatically while signed in
- Modules: labs, cycle, gym, nutrition, settings