---
name: vitest-lib-test
description: Add a colocated Vitest unit test for pure lib functions following src/lib/*.test.ts patterns. Use when testing parsers, scoring, sync, or utility logic, or when the user runs /vitest-lib-test.
---

# Vitest Lib Test

Config: `vitest.config.ts` — **node** environment, `@/` alias → `src/`.

## File placement

Colocate beside source:

```
src/lib/myFeature.ts
src/lib/myFeature.test.ts
```

PS project tests: `PS/src/lib/*.test.ts` (same config, `@ps` alias available).

## Template

```ts
import { describe, expect, it } from "vitest";
import { myFunction } from "./myFeature";

describe("myFunction", () => {
  it("handles the happy path", () => {
    expect(myFunction("input")).toEqual(expected);
  });

  it("handles edge case", () => {
    expect(myFunction("")).toEqual([]);
  });
});
```

## Conventions from this repo

- **Pure functions first** — parsers (`parser.test.ts`), ranges (`ranges.test.ts`), scoring (`scoring.test.ts`), routes (`appRoutes.test.ts`).
- Use **fixture constants** exported from source when available (`SAMPLE_LAB_TEXT`, `DEMO_LAB_TEXT` in `parser.ts`).
- **No DOM** in `src/` tests — node environment. Component tests are rare; prefer testing extracted logic.
- **Deterministic** — no `Date.now()` without mocking; use fixed ISO strings.
- **describe** names match exported function or module name.

## What to test

| Layer | Examples |
|-------|----------|
| Parsers | `parseLabText`, `parseCSV`, `annotateExtractedHistorical` |
| Auth helpers | `normalizeAccessKey`, `credentialErrors` |
| Sync | `cloudSync`, `storeRehydrate`, conflict merge |
| Routes | `routeFromPathname`, `pathFromRoute`, legacy aliases |
| Theme | `normalizeTheme`, `resolveThemeContrast` |

## Running tests

```bash
npm run test                           # all
npm run test -- src/lib/parser.test.ts # single file
```

## Adding tests for a new feature

1. Export testable pure functions from lib (avoid testing React hooks directly).
2. Cover: happy path, empty input, malformed input, boundary values.
3. If fixing a bug, add regression test named for the bug behavior.

## Checklist

1. File named `*.test.ts` next to implementation.
2. Imports use relative `./` or `@/` — both work.
3. No `window` / `localStorage` unless mocking — use `safeLocalStorage.test.ts` patterns.
4. Tests pass: `npm run test`.

## Do not

- Add `@testing-library/react` — not in project dependencies.
- Put tests in `__tests__/` folders — repo uses colocated `*.test.ts` only.
- Test implementation details of Zustand stores when pure helpers suffice (`cycleStore.test.ts` tests exported helpers like `ensureCompoundIds`).