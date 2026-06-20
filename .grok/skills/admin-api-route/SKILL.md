---
name: admin-api-route
description: Scaffold a protected /api/admin/* route handler using requireAdmin and createAdminClient patterns. Use when adding admin or vendor server APIs, or when the user runs /admin-api-route.
---

# Admin API Route

Admin handlers live under `src/app/api/admin/`. Vendor handlers under `src/app/api/vendor/`. Middleware enforces auth before handlers run.

## Reference implementations

- `src/app/api/admin/settings/route.ts` — GET + PATCH with validation
- `src/app/api/admin/users/route.ts` — list/create users
- `src/app/api/admin/stats/route.ts` — read-only aggregate
- `src/app/api/vendor/generate/route.ts` — vendor-scoped (not admin)

## Admin route template

```ts
import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  try {
    // use createAdminClient() from @/lib/supabase/admin for DB
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Request failed" },
      { status: 500 },
    );
  }
}
```

## Auth helpers

| Helper | Location | Use |
|--------|----------|-----|
| `requireAdmin(request)` | `src/lib/admin.ts` | Site admin only |
| `createAdminClient()` | `src/lib/supabase/admin.ts` | Service role Supabase client |
| Middleware | `src/lib/supabase/middleware.ts` | Redirects unauthenticated `/api/admin/*` to login |

Vendor routes: check `src/app/api/vendor/me/route.ts` for vendor profile gate pattern.

## Validation pattern

Follow `admin/settings/route.ts`:

1. Parse `request.json()` into typed patch/body.
2. Run validator (`validateSiteSettingsPatch`, etc.) — return `400` with `{ error }`.
3. Mutate via lib function, not raw SQL in route file when a lib exists.

## Response shape

- Success: `NextResponse.json({ ... })`
- Auth failure: return `error` response from `requireAdmin` directly
- Client errors: `{ error: string }` with 400/404
- Server errors: `{ error: string }` with 500 — no stack traces

## File location

```
src/app/api/admin/<resource>/route.ts
src/app/api/admin/<resource>/[id]/route.ts   # dynamic segments
```

Use Route Handlers only (not server actions) — matches existing codebase.

## RLS note

`createAdminClient()` bypasses RLS. Still validate inputs and scope mutations to intended records. Never expose service role to client.

## Checklist

1. `requireAdmin` (or vendor equivalent) on every method.
2. Input validation before DB writes.
3. Errors return JSON, not thrown uncaught exceptions.
4. If new DB columns: supabase-migration + update lib types.
5. `npm run typecheck`.

## Do not

- Use anon Supabase client for admin mutations.
- Add routes under `/api/admin` without middleware-compatible auth (already covered by `middleware.ts`).
- Return `profiles.access_key_hash` or raw access keys in list endpoints.