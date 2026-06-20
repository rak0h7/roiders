# Roiders Club — Agent Instructions

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

Private performance health tracker: labs (bloodwork OCR/analysis), protocol/cycle planning, and gym training — unified in one authenticated SPA shell.

Production: https://roiders.club · Local dev: `http://localhost:1337` (`npm run dev` uses port **1337**).

---

## Tech stack (verified from `package.json`)

| Layer | Package | Version |
|-------|---------|---------|
| Framework | `next` | 16.2.9 |
| UI | `react`, `react-dom` | 19.2.4 |
| Styling | `tailwindcss`, `@tailwindcss/postcss` | ^4 |
| Auth / DB | `@supabase/ssr`, `@supabase/supabase-js` | ^0.12.0 / ^2.108.2 |
| State | `zustand` | ^5.0.14 |
| Charts | `recharts` | ^3.8.1 |
| Motion | `framer-motion` | ^12.40.0 |
| Icons | `lucide-react` | ^1.20.0 |
| Dates | `date-fns` | ^4.4.0 |
| Command palette | `cmdk` | ^1.1.1 |
| OCR / PDF | `tesseract.js`, `pdfjs-dist` | ^6.0.1 / ^6.0.227 |
| Class merge | `clsx`, `tailwind-merge` | via `cn()` in `src/lib/utils.ts` |
| Tests | `vitest` | ^4.1.9 |
| Lint | `eslint`, `eslint-config-next` | ^9 / 16.2.9 |
| Deploy | `vercel` CLI | ^54.14.1 |

**Not in main app:** no shadcn/ui, no React Query, no separate `tailwind.config.*` (Tailwind v4 CSS-first). No `src/hooks/` directory — logic lives in contexts, colocated hooks (e.g. `useLabFilePicker.ts`), or stores.

**Sibling project:** `PS/` — Vite + React content-maker (`ps-content-maker`). Excluded from root `tsconfig.json`. Shares `src/app/globals.css` and some `src/components/` paths. Built via `npm run build:ps`.

---

## Project structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Server: public landing OR authenticated entry
│   ├── [...section]/       # Catch-all authenticated app routes (/labs/log, etc.)
│   ├── auth/               # Login / signup
│   ├── admin/              # Admin + vendor panel
│   ├── welcome/            # Username onboarding
│   ├── features/           # Marketing feature pages
│   ├── about|privacy|terms # Static legal/marketing
│   ├── maintenance/        # Maintenance gate page
│   └── api/                # Route handlers (auth, admin, vendor, profile, site)
├── components/             # Feature-organized UI (no atomic design hierarchy)
│   ├── shell/              # AppShell, Sidebar, TopBar, MobileNav, CommandPalette
│   ├── labs/               # Lab upload, trends, category breakdown
│   ├── planner/            # Cycle builder UI
│   ├── dashboard/          # Simulation charts (saturation, risk, etc.)
│   ├── gym/                # Workout logging
│   ├── settings/           # Appearance, account, export
│   ├── admin/              # Site settings, accounts, vendors
│   ├── auth/               # AuthGuard, forms
│   ├── marketing/          # Public pages
│   └── ui/                 # Shared primitives: Panel, TabNav, EmptyState, etc.
├── context/                # React context providers (see Provider tree below)
├── store/                  # Zustand stores: cycleStore, gymStore
├── data/                   # Static catalogs (compounds, markers, exercises, guides)
├── lib/                    # Business logic, parsers, scoring, auth, Supabase clients
│   ├── supabase/           # client, server, admin, middleware helpers
│   ├── auth/               # Login session helpers
│   └── db/                 # Direct Postgres (migrations fallback)
└── app/globals.css         # Design tokens + Tailwind @theme

supabase/
├── schema.sql              # Greenfield base schema (safe to re-run)
├── migrate-pending.sql     # Canonical incremental migration (npm run db:migrate)
└── archive/                # Historical 002–005 SQL — do NOT run on new installs

scripts/                    # Migrations, admin seeding, social asset generators
PS/                         # Vite content-maker (separate package.json)
```

### Provider tree (`src/app/layout.tsx`)

`SiteConfigProvider` → `AuthProvider` → `SettingsProvider` → `ToastProvider` → `NavigationProvider` → `AppProvider`

Authenticated app sections additionally wrap: `AuthGuard` → `AppSectionGate` → `HomeScreenPromptProvider` → `AppShell`.

### Routing model

- **Marketing / legal:** dedicated `app/*/page.tsx` routes.
- **Authenticated modules:** single catch-all `app/[...section]/page.tsx` renders `AppShell`; URL → logical route via `src/lib/appRoutes.ts` + `src/context/NavigationContext.tsx`.
- **Invalid paths** under catch-all: `AppSectionGate` calls `notFound()`.
- **Legacy alias:** `/labs/archive` → `bloodwork-insights`.

Key route map (`ROUTE_TO_PATH` in `src/lib/appRoutes.ts`):

| Module | Paths |
|--------|-------|
| Labs | `/labs/log`, `/labs/analysis` |
| Protocol | `/cycle/builder`, `/cycle/guides`, `/cycle/simulation`, `/cycle/sources` |
| Gym | `/gym/workout`, `/gym/programs`, `/gym/history`, `/gym/stats`, `/gym/exercises` |
| Settings | `/settings` |
| Articles (public) | `/articles`, `/articles/[slug]` — sidebar href, not AppShell catch-all |

### State & persistence

| Concern | Location | Storage |
|---------|----------|---------|
| Labs UI + reports | `AppContext` | `localStorage` key `roiders-club-labs-v1` via `src/lib/storage.ts` |
| Cycle planner | `cycleStore` (Zustand + persist) | `cycle-planner-store-v2` |
| Gym | `gymStore` | `roiders-club-gym-store-v1` |
| Theme / prefs | `SettingsContext` | `roiders-club-settings-v2` |
| Cloud sync | `src/lib/cloudSync.ts` | Supabase `user_modules` JSONB per module |

Cloud modules (must match DB check constraint): `labs` | `cycle` | `gym` | `nutrition` | `settings`.

Zustand stores use `createCloudPersistStorage()` from `src/lib/persistStorage.ts` to timestamp writes for sync conflict resolution.

### Auth model (access key only)

- Users sign up with a generated key (`roiders_…` format); **shown once, not recoverable** (per README).
- Supabase `auth.users` rows use synthetic email `{userId}@users.roidersclub.internal` (`src/lib/accessKey.shared.ts`).
- `profiles` stores `key_fingerprint`, `access_key_hash` (server-side); **no email column** (schema explicitly drops it).
- Admin detection: `ADMIN_FINGERPRINT` / `NEXT_PUBLIC_ADMIN_FINGERPRINT` env vars (`src/lib/adminFingerprint.ts`).
- Middleware (`src/middleware.ts` → `src/lib/supabase/middleware.ts`) enforces: maintenance mode, auth redirects, username onboarding (`/welcome`), admin/vendor gates.

**Gap:** Premium sync gating logic exists (`premium_sync_enabled` on profiles, `cloud_sync_enabled` on site_settings) but full product rules for who gets premium are not documented in code comments — verify in `src/lib/cloudSyncAccess.ts` / `src/lib/userCloudSync.ts` before changing behavior.

---

## Supabase schema (from `schema.sql` + `migrate-pending.sql`)

### Tables

**`profiles`** (1:1 with `auth.users`)
- PK `id` → `auth.users(id)` ON DELETE CASCADE
- `key_fingerprint` (unique partial index), `access_key_hash`, `display_name`
- `username` (unique partial index, nullable)
- `is_admin`, `is_vendor`, `premium_sync_enabled` (all boolean, default false)
- `issued_by_vendor_id` → `vendors(id)` ON DELETE SET NULL
- `created_at`, `updated_at`
- RLS: users SELECT/INSERT/UPDATE own row only

**`auth_secrets`** — server-only session secrets
- PK `user_id` → `auth.users`, `session_secret`
- RLS enabled, **no client policies** (server-only)

**`user_modules`** — per-user JSONB app state
- PK (`user_id`, `module`) where `module IN ('labs','cycle','gym','nutrition','settings')`
- `data jsonb`, `updated_at`
- RLS: own rows only (SELECT/INSERT/UPDATE/DELETE)

**`vendors`** — approved resellers
- `profile_id` (unique) → `auth.users`
- `name`, `contact_url`, `key_quota`, `keys_issued`, `enabled`, timestamps
- RLS enabled (admin-managed via service role)

**`site_settings`** — singleton (`id = 1` CHECK)
- Site branding, maintenance, announcements, module toggles, signup limits, legal fields
- `allow_public_signup`, `max_accounts`, `cloud_sync_enabled`, `vendor_portal_enabled`, etc.
- RLS enabled (read via admin client / public API subset)

### Triggers

`on_auth_user_created` → `handle_new_user()` inserts default `profiles` row.

### Migration workflow

1. **Greenfield:** paste `supabase/schema.sql`, then `npm run db:migrate`
2. **Existing:** `npm run db:migrate` only (applies `migrate-pending.sql`)
3. **Never** run `supabase/archive/*.sql` on fresh installs (see `supabase/archive/README.md`)
4. Post-migrate: `npm run db:bootstrap`, `npm run create-admin`

Edit incremental changes in `migrate-pending.sql` using idempotent `IF NOT EXISTS` / `add column if not exists` patterns already present.

**Gap:** No generated TypeScript DB types (e.g. `database.types.ts`) — types are hand-written in `src/lib/siteSettings.ts`, `src/lib/profile.ts`, etc.

---

## Design system (as implemented)

### Token architecture

CSS custom properties in `src/app/globals.css` (`:root` defaults). Runtime overrides via `applyThemeToDocument()` / `applyThemeToElement()` in `src/lib/themes.ts` driven by `SettingsContext`.

### Colour domains

Three semantic accents map to product areas:

| Token | Default | Used for |
|-------|---------|----------|
| `--labs` / `--labs-dim` / `--labs-glow` | `#ff2e4a` family | Bloodwork module |
| `--protocol` / `--protocol-dim` / `--protocol-glow` | `#ff6b8a` family | Cycle / gym actions |
| `--intel` / `--intel-dim` / `--intel-glow` | `#c084fc` family | Insights, nutrition, dashboard |

Shared surfaces: `--bg-base`, `--bg-elevated`, `--bg-surface`, `--bg-hover`, `--foreground`, `--muted`, `--muted-2`, `--border`, `--border-strong`.

Status: `--danger`, `--warning`, `--success`.

Text-on-accent: `--text-on-labs`, `--text-on-protocol`, `--text-on-intel`, `--text-on-warning`, `--text-on-success` (contrast-resolved in `src/lib/themeContrast.ts`).

### Typography

- **Body:** DM Sans (`--font-dm-sans`), loaded in `layout.tsx`
- **Display:** Syne (`--font-syne`) — `.font-display`, page titles
- **Mono:** Geist Mono (`--font-geist-mono`)
- Also loaded: Inter, Orbitron (selectable in theme settings)
- Scale: `--font-scale` (default 1; theme range 85–115%)

### Spacing & sizing

- `--space-unit` (1 comfortable / 0.85 compact) scales padding via `calc(… * var(--space-unit))`
- Control heights: `--control-height` (2.5rem), `-sm`, `-xs`, `-icon`, `-micro`
- Radii: `--radius-sm` (10px), `-md` (14px), `-lg` (20px), `-xl` (28px) — scaled by `radiusScale` in theme
- Icons: `--icon-size` (20px default), `.app-icon` / `.app-icon--sm`
- Mobile nav: `--mobile-nav-inner: 4.25rem`; dock must stay **fully solid** (see `.mobile-nav-dock` comment in globals.css)

### UI composition patterns

- **Class bundles:** `src/lib/ui.ts` exports `ui.card`, `ui.btnPrimary`, `ui.input`, etc. — prefer these over ad-hoc Tailwind for controls.
- **Panels:** `src/components/ui/Panel.tsx` with variants `default|glass|labs|protocol|intel`; uses `cn()` + `framer-motion`.
- **Glass:** `.glass-panel`, `.glass` utility classes in globals.css.
- **Charts:** `getChartTheme()` / `getChartColors()` in `src/lib/charts.ts` read live CSS variables; wrap in `Panel`, use `ui.sectionTitle` / `ui.sectionSub`.
- **Content width:** `CONTENT_WIDTH_CLASS` in `themes.ts` (`max-w-4xl` … `max-w-none`).

### Tailwind v4

Configured via `@import "tailwindcss"` + `@theme inline` in `globals.css`. PostCSS plugin in `postcss.config.mjs`. No `tailwind.config.js`.

---

## Conventions & architecture

### Naming

- **Files:** PascalCase components (`AppShell.tsx`), camelCase lib (`cloudSync.ts`), kebab-ish route folders (`[...section]`).
- **Tests:** colocated `*.test.ts` beside source (`src/lib/parser.test.ts`). 38 tests in `src/`, 5 in `PS/src/`.
- **Imports:** `@/` alias → `src/` (`tsconfig.json` paths).
- **Client components:** `"use client"` at top; most app UI is client-rendered. Server components used for metadata, site settings fetch, home page auth branch.

### Data catalogs (`src/data/`)

Static TypeScript arrays — not fetched from DB:

| File | Purpose |
|------|---------|
| `compounds.ts` | Core compound library + `CYCLE_TEMPLATES`; spreads `OMA_COMPOUNDS` at end |
| `omaCompounds.ts` | Additional compounds (peptides, GLP-1, etc.) |
| `compoundProfiles.ts` | Guide content; spreads `OMA_COMPOUND_PROFILES` |
| `omaCompoundProfiles.ts` | OMA-specific guide profiles |
| `frequencies.ts` | Dosing frequency defaults |
| `exercises.ts`, `routineTemplates.ts` | Gym catalogs |
| `cycleSources.ts` | Verified vendor source listings |

Adding a compound: entry in `compounds.ts` (or `omaCompounds.ts`), optional profile in `compoundProfiles.ts`, link via `compoundIds` in profiles.

### API routes (`src/app/api/`)

| Prefix | Purpose |
|--------|---------|
| `/api/auth/login`, `/api/auth/register` | Access key auth |
| `/api/admin/*` | Users, vendors, settings, stats (service role) |
| `/api/vendor/*` | Vendor key generation |
| `/api/profile/*` | Username |
| `/api/admin/users/[id]/key` | Admin key reveal (escrow vault) |
| `/api/site/settings` | Public site config subset |

Admin/vendor routes gated in middleware; handlers use `createAdminClient()`.

### Site config gating

`SiteConfigContext` + `src/lib/navVisibility.ts` hide modules/routes when `site_settings.module_*_enabled` is false. `AppShell` redirects to `firstEnabledRoute()` if current route disabled.

### Environment

Copy `.env.example` → `.env.local`. Never commit `.env*`, `.access-key`. Required for full functionality: Supabase URL/keys, `DATABASE_URL` or `SUPABASE_DB_PASSWORD`, `ADMIN_FINGERPRINT`, `ACCESS_KEY_VAULT_SECRET`.

---

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server :1337 |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest (node env) |
| `npm run db:migrate` | Apply `migrate-pending.sql` |
| `npm run db:bootstrap` | Post-migrate admin promotion |
| `npm run create-admin` | Seed sole admin account |
| `npm run deploy` | Vercel production |

---

## Hard constraints

### Evidenced in code (do not change without explicit confirmation)

1. **Access-key auth only** — no email signup/recovery; `profiles.email` column is dropped in schema.
2. **Canonical migration path** — incremental changes go in `migrate-pending.sql`; archive SQL is historical only.
3. **`user_modules.module` enum** — must remain `labs|cycle|gym|nutrition|settings` (DB CHECK + `CloudModule` type).
4. **Local storage key names** — changing `LOCAL_STORAGE_KEYS` in `cloudSync.ts` breaks existing user data.
5. **Mobile bottom nav** — `.mobile-nav-dock` must stay opaque/solid (explicit CSS comment).
6. **Next.js 16** — consult `node_modules/next/dist/docs/` before using APIs from training data.
7. **`tsconfig` excludes** — `PS` and `Clone2` are excluded; don't import PS into main app bundle without intent.
8. **Synthetic auth emails** — `{uuid}@users.roidersclub.internal` format is assumed by account creation.
9. **`site_settings` singleton** — `id = 1` constraint; code assumes single row.
10. **`auth_secrets`** — no client RLS policies; server-only by design.

### Product-level rules (owner-locked — do not override)

- **Medical / liability:** All lab flags, scores, simulations, and compound guides are informational only — not medical advice. Use `MedicalDisclaimer` in labs UI and cycle guides. Owner accepts product risk; legal copy lives in `/terms` and `/privacy`.
- **Lab ranges:** Optimal targets only (`src/lib/ranges.ts`). No lab-reference mode. Optimal = health on a very minimal cycle; caution/strict bands flag deviations to monitor — not diagnoses.
- **Cloud sync:** Premium only (`canUserCloudSync` in `src/lib/cloudSyncAccess.ts`). Free tier is local-only. Admin enables `premium_sync_enabled` per account; site flag `cloud_sync_enabled` must also be on.
- **Access keys:** Shown once at creation. Escrowed in `access_key_vault` (AES-256-GCM via `ACCESS_KEY_VAULT_SECRET`). Admins reveal via `/api/admin/users/[id]/key` — no self-service recovery.
- **Nutrition:** Removed from app UI/routes. `nutrition` remains in `CloudModule` / DB enum for legacy sync rows only.
- **Content maintenance:** Compound library, guides, articles (`src/data/articles.ts`), markers, and marketing copy are edited via Grok Build CLI only — do not invent clinical policy in data files.
- **Articles:** Public SEO pages at `/articles/[slug]`; gated by `module_articles_enabled`. Diet articles are educational reference only (no food logging).
- **Admin auth:** Env fingerprint (`ADMIN_FINGERPRINT`) — unchanged.
- **Vendor keys:** Issued through approved vendor portal; keys are escrowed like all other accounts.

---

## Known gaps (not assumed)

- No auto-generated Supabase TypeScript types.
- Compound dosing ranges in `src/data/` are reference content, not validated clinical policy.
- `site_settings.default_labs_range_mode` column may exist in DB but is unused — app uses optimal ranges only.
- `Clone2/`, `Clone3/` exist in `.gitignore` but purpose undocumented in repo.