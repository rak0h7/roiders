---
name: zustand-cloud-store
description: Create or extend a Zustand store with persist and createCloudPersistStorage for cloud sync. Use when adding module state that syncs to user_modules, or when the user runs /zustand-cloud-store.
---

# Zustand Cloud Store

Pattern: `src/store/cycleStore.ts`, `gymStore.ts`, `nutritionStore.ts`.

## Cloud module contract

`CloudModule` in `src/lib/cloudSync.ts`:

`labs` | `cycle` | `gym` | `nutrition` | `settings`

DB `user_modules.module` CHECK must match. **Do not add new module names without supabase-migration.**

## Storage keys (immutable)

```ts
// src/lib/cloudSync.ts — LOCAL_STORAGE_KEYS
labs:       "roiders-club-labs-v1"
cycle:      "cycle-planner-store-v2"
gym:        "roiders-club-gym-store-v1"
nutrition:  "roiders-club-nutrition-store-v1"
settings:   "roiders-club-settings-v2"
```

**Never rename existing keys** — breaks user data. New module = new key string + migration to add module to DB enum (rare; ask owner).

## New store template

```ts
"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createCloudPersistStorage } from "@/lib/persistStorage";

interface MyState {
  // fields + actions
}

export const useMyStore = create<MyState>()(
  persist(
    (set, get) => ({
      // initial state + setters
    }),
    {
      name: "unique-store-name-v1",  // zustand persist name
      storage: createJSONStorage(() => createCloudPersistStorage("cycle")), // pick correct CloudModule
      partialize: (state) => ({
        // only persist data fields — exclude UI ephemera (modals, search strings)
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<MyState>),
        // normalize arrays/ids like ensureCompoundIds if needed
      }),
    }
  )
);
```

## What to partialize

**Persist:** user data (compounds, workouts, foods, preferences).

**Exclude:** `modalOpen`, `search`, `selectedTab` unless explicitly needed across sessions — see `cycleStore` excluding `compoundModalOpen` from partialize... actually cycleStore partialize includes dashboardTab but excludes view/modals. Follow nearest store.

## Labs exception

Labs state lives in `AppContext` + `src/lib/storage.ts`, not Zustand. Do not migrate to Zustand without explicit user request.

## Sync hooks

- `createCloudPersistStorage` calls `touchLocalModule()` on write → timestamps for conflict resolution.
- Rehydration after sync: `src/lib/storeRehydrate.ts`, `CLOUD_SYNC_EVENT` in `AppContext`.
- Premium gating: `src/lib/cloudSyncAccess.ts`, `src/lib/userCloudSync.ts`.

## Checklist

1. Correct `CloudModule` in `createCloudPersistStorage`.
2. `partialize` excludes transient UI state.
3. `merge` handles undefined persisted state safely.
4. Export typed selectors/actions; `"use client"` at top.
5. Add `src/store/myStore.test.ts` for pure helpers (optional).
6. `npm run typecheck`.

## Extending existing store

- Add fields to interface + partialize + merge normalization.
- Avoid breaking persisted shape — use defaults in `merge` for new fields.
- Bump storage key version only as last resort (migration story required).