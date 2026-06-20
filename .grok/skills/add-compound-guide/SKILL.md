---
name: add-compound-guide
description: Add a compound guide profile to compoundProfiles.ts or omaCompoundProfiles.ts and wire it into guideCatalog.ts. Use when adding/editing compound reference guides in the cycle guides section, or when the user runs /add-compound-guide.
---

# Add Compound Guide

Guides live in static TypeScript — not the database. They power `/cycle/guides` via `src/lib/guideCatalog.ts`.

## Files

| File | When |
|------|------|
| `src/data/compoundProfiles.ts` | Core steroid/support guides + `STEROID_GUIDE_PROFILES` |
| `src/data/omaCompoundProfiles.ts` | OMA-sourced profiles; spread at end of `COMPOUND_PROFILES` |

## Required shape (`CompoundProfile` in `src/lib/compoundProfileTypes.ts`)

```ts
{
  id: string;              // kebab-case, unique
  title: string;
  aliases?: string[];
  route: "injectable" | "oral" | "topical" | "concept";
  tagline?: string;
  compoundIds: string[]; // must match ids in src/data/compounds.ts
  sections: ProfileBlock[];
}
```

`ProfileBlock`: `{ heading?, body?, list?, blocks? }` — nested `blocks` for sub-sections (see testosterone profile in `compoundProfiles.ts`).

## Wire into catalog

After adding the profile:

1. If it fits an existing `GuideSectionId` in `src/lib/guideCatalog.ts` (`concepts`, `injectables`, `orals`, `estrogen`, `peptides`, `fat-loss`, `cognitive`, `hair`, `support`), ensure the section's `getProfiles()` includes it (often via `listInjectableProfiles`, `listOralProfiles`, or category filter).
2. For OMA-only profiles, `omaCompoundProfiles.ts` may use `OMA_COMPOUND_PROFILES.filter` helpers at file bottom — follow existing pattern.
3. Concept pages (`route: "concept"`) use `listConceptProfiles()` — no `compoundIds` required.

## Link compounds

Every `compoundIds` entry must exist in `COMPOUNDS` (`getCompoundById`). Add missing compounds via **add-compound** first.

## Content rules

- Match tone of existing profiles: direct, mechanism-focused, bloodwork-aware.
- Do not invent dosage ranges the user did not supply; mirror `dosageInfo` on compound entries when unsure.
- **Product-level rules** in `AGENTS.md` may restrict content — ask owner if section is still TODO.

## Checklist

1. Add `CompoundProfile` object.
2. Verify catalog section lists it (browse logic in `guideCatalog.ts` / `CyclePlannerView` guides tab).
3. Run `npm run test -- src/lib/guideCatalog.test.ts` if search/list behavior changed.
4. `npm run typecheck`.