---
name: add-app-route
description: Add a new AppRoute, URL path, nav item, AppShell view branch, and site_settings module gate. Use when adding a new authenticated app section or navigation entry, or when the user runs /add-app-route.
---

# Add App Route

Authenticated routes use a catch-all: `src/app/[...section]/page.tsx` → `AppShell`. URLs are logical routes, not per-folder `page.tsx` files.

## Files to touch (in order)

1. `src/context/NavigationContext.tsx` — `AppRoute` union + `NAV_ITEMS` entry
2. `src/lib/appRoutes.ts` — `ROUTE_TO_PATH` / `PATH_TO_ROUTE`
3. `src/lib/siteSettings.ts` — `isRouteEnabled()` if module-gated (most routes are)
4. `src/components/shell/AppShell.tsx` — `renderContent()` switch + optional `useEffect` store view sync
5. `src/components/shell/Sidebar.tsx` / `MobileNav.tsx` / `CommandPalette.tsx` — only if custom nav logic needed (usually automatic via `NAV_ITEMS`)
6. Submodule view component (e.g. new `*View.tsx`)

## Step 1: `AppRoute` + nav item

```ts
// NavigationContext.tsx
export type AppRoute = ... | "my-new-route";

export const NAV_ITEMS: NavItem[] = [
  // ...
  {
    id: "my-new-route",
    label: "Label",
    group: "labs" | "protocol" | "training" | "nutrition" | "misc" | "overview",
    icon: "flask",  // string key — see AppIcon mapping
    description: "Short description",
    accent: "labs" | "protocol" | "intel" | "neutral",
  },
];
```

## Step 2: URL path

```ts
// appRoutes.ts
export const ROUTE_TO_PATH: Record<AppRoute, string> = {
  // ...
  "my-new-route": "/module/subpath",
};
```

Path must be unique. `AppSectionGate` calls `notFound()` for unknown paths.

## Step 3: Module gating

`isRouteEnabled()` in `siteSettings.ts` maps route prefixes to `module_*_enabled` flags via `routeModule()`. New routes under existing prefixes inherit gating automatically.

**New top-level module** requires:
- `SiteModule` type + `site_settings` column (supabase-migration)
- `routeModule()` mapping
- `DEFAULT_SITE_SETTINGS` + admin panel toggle

## Step 4: AppShell

```tsx
// renderContent() switch
case "my-new-route":
  return <MyNewView />;

// Optional: sync submodule store view on route change (see existing useEffect)
```

## Step 5: Store view sync (if nested tabs)

Pattern in `AppShell` `useEffect`: when route changes, call `setGymView`, `setNutritionView`, `setView`, or `setMainTab` on the relevant store/context.

## Public vs authenticated

- Authenticated app sections: **no new** `app/` folder needed — catch-all handles it.
- Marketing/legal pages: separate `src/app/my-page/page.tsx` (not this skill).

## Checklist

1. `routeFromPathname("/your/path")` returns new route — add test in `src/lib/appRoutes.test.ts`.
2. Sidebar + mobile nav show item when module enabled.
3. Disabled module redirects via `firstEnabledRoute()` in `AppShell`.
4. `npm run typecheck` && `npm run test`.

## Do not

- Add `page.tsx` under `src/app/labs/...` for authenticated views (breaks single-shell pattern).
- Forget `AuthGuard` is already on `[...section]` — new routes inherit it.