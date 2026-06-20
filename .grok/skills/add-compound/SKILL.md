---
name: add-compound
description: Add a compound to the Roiders Club library in src/data/compounds.ts or omaCompounds.ts. Use when adding a new steroid, peptide, ancillary, or support compound to the cycle planner, or when the user runs /add-compound.
---

# Add Compound

Add an entry to the static compound catalog used by the cycle planner, saturation simulation, and cross-intelligence.

## Before you start

Read `AGENTS.md` hard constraints. Compound data is reference content — do not invent clinical claims beyond what the user provides.

## Choose the file

| File | When |
|------|------|
| `src/data/compounds.ts` | Core AAS, common ancillaries, compounds with PK fields (`halfLife`, `pkMultiplier`) |
| `src/data/omaCompounds.ts` | OMA/guide-sourced compounds; spread into `COMPOUNDS` via `...OMA_COMPOUNDS` at end of `compounds.ts` |

Never duplicate an `id` across both files.

## Required shape (`Compound` in `compounds.ts`)

```ts
{
  id: string;           // kebab-case, unique, stable forever
  name: string;         // full display name
  shortName: string;    // compact label for UI
  category: CompoundCategory;  // see COMPOUND_CATEGORIES
  route: "injectable" | "oral" | "topical";
  tags: string[];       // e.g. ["IM", "17aa", "Guide"]
  dosageInfo: string;   // short range text for browser cards
  color: string;        // hex accent for charts/UI
  unit: "mg" | "mcg" | "iu";
  halfLife?: number;    // days — required for simulation if injectable/oral with PK
  pkMultiplier?: number;
  hepatotoxic?: boolean; // oral 17aa compounds
}
```

Categories: `anabolics` | `fat-loss` | `estrogen` | `peptides` | `cognitive` | `hair` | `support`.

## PK defaults (if missing)

- Injectable esters: set `halfLife` (days) and `pkMultiplier` (relative to test-e = 1.0). See existing entries in same family.
- Orals without PK: omit `halfLife` only if simulation does not need them; check `src/lib/saturation.ts` usage.
- Peptides / ancillaries with negligible load: `pkMultiplier: 0.05–0.2`, short `halfLife`.

## Dosing frequency

If the compound appears in templates or quick-add flows, check `src/data/frequencies.ts` for `DEFAULT_DOSES` / `inferDefaultDose` compatibility.

## Checklist

1. Add entry in correct file, alphabetically or grouped with similar compounds.
2. Confirm `getCompoundById(id)` resolves (export is from `compounds.ts` `COMPOUNDS` array).
3. If compound needs a guide page, invoke **add-compound-guide** skill separately.
4. If compound affects lab flags, check `src/lib/compoundMonitorMarkers.ts` — add mapping only if user requests cross-intelligence linkage.
5. Run `npm run typecheck` and `npm run test` if you touched inference logic.

## Do not

- Change `LOCAL_STORAGE_KEYS` or store shapes.
- Rename existing compound `id` values (breaks saved cycles).
- Add compounds only to `omaCompounds.ts` without verifying the spread in `compounds.ts` line 85.