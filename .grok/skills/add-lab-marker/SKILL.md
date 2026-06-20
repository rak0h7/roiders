---
name: add-lab-marker
description: Add a bloodwork marker definition to src/lib/markers.ts with ranges, units, and aliases, and optionally labTrendMarkers.ts. Use when adding a new lab analyte to parsing, scoring, or trends, or when the user runs /add-lab-marker.
---

# Add Lab Marker

Markers are defined in `src/lib/markers.ts` and typed in `src/lib/types.ts`.

## Add to `MARKERS` array

Use the `m()` helper at top of `markers.ts`:

```ts
m(
  id,           // kebab-case, stable — used in reports & storage
  name,         // display name
  category,     // MarkerCategory — see CATEGORY_LABELS
  defaultUnit,
  units[],      // all convertible units
  aliases[],    // lowercase strings for OCR/text parser matching
  range         // MarkerRange
)
```

### `MarkerCategory` values

`hormonal` | `cbc` | `cardiovascular` | `liver` | `kidney` | `electrolytes` | `metabolic` | `thyroid` | `muscle` | `nutrients` | `immune`

### `MarkerRange` fields

- `labMin` / `labMax` — standard lab reference
- `optimalMin` / `optimalMax` — optimized mode targets
- `cautionMin` / `cautionMax` — yellow flags
- `strictThreshold` — hard stop threshold (one-sided)
- `upperOnly` / `lowerOnly` — asymmetric range evaluation

Group new markers with same-category neighbors in the array.

## Parser integration

Aliases must cover common lab report spellings. Check `src/lib/parser.ts` behavior — matching is alias-driven. Add tests in `src/lib/parser.test.ts` with a sample line containing the new marker.

## Unit conversion

If multiple units listed, verify `src/lib/units.ts` converts correctly. Add unit test in `src/lib/units.test.ts` if new unit pair.

## Scoring & flags

Category scores flow through `src/lib/scoring.ts` and `src/lib/categoryBreakdown.ts` automatically by `category`. For cycle cross-flags, see `src/lib/compoundMonitorMarkers.ts` and `src/lib/cycleLabFlags.ts`.

## Trend chart (optional)

To show on `LabTrendChart`, add to `src/lib/labTrendMarkers.ts`:

```ts
{ id: "<marker-id>", label: "Short Label" }
```

`id` must match `MARKERS` entry. Chart only renders markers present in 2+ saved reports.

## Checklist

1. Add marker definition + aliases.
2. Parser test with realistic lab line.
3. Range/scoring test in `src/lib/ranges.test.ts` or `src/lib/scoring.test.ts` if non-trivial.
4. Optional: `labTrendMarkers.ts` + `labTrendMarkers.test.ts`.
5. `npm run test` && `npm run typecheck`.

## Do not

- Change existing marker `id` values (invalidates saved `BloodworkReport.values`).
- Guess clinical ranges without user input — flag as gap in PR description.