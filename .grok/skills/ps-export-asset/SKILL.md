---
name: ps-export-asset
description: Add or modify PS Vite content-maker templates and PNG export flows sharing globals.css theme tokens. Use when creating social assets, TikTok slides, or branded graphics in PS/, or when the user runs /ps-export-asset.
---

# PS Export Asset

`PS/` is a separate Vite app (`ps-content-maker`) for designing and exporting branded social/content images. Excluded from root Next.js `tsconfig` — run via `npm run dev:ps` (port 5174).

## Architecture

```
PS/
├── package.json          # own deps: vite, html-to-image, framer-motion
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css         # imports ../../src/app/globals.css
│   ├── components/
│   │   ├── CanvasStage.tsx
│   │   ├── ContentCanvas.tsx
│   │   ├── ExportBar.tsx
│   │   └── editor/       # design panels
│   └── lib/
│       ├── exportPng.ts      # html-to-image export
│       ├── canvasSizes.ts    # preset dimensions
│       ├── contentPresets.ts
│       └── projectStorage.ts
```

Root scripts generate static assets without PS UI:
- `npm run assets:tiktok`
- `npm run assets:og`
- `scripts/generate-*.mjs`

Use PS skill for **interactive editor** work; use root scripts for **batch/automated** PNG generation.

## Theme sharing

`PS/src/index.css`:

```css
@import "../../src/app/globals.css";
```

Theme applied via `applyThemeToElement()` from `src/lib/themes.ts` — see `PS/src/components/theme/CanvasThemeScope.tsx` and `ProjectThemeBridge.tsx`.

**Do not duplicate colour tokens in PS** — extend `globals.css` or theme engine in main app.

## Export flow

1. `CanvasStage` lays out artboard at `CanvasSize` dimensions.
2. `exportCanvasPng(node, size, pixelRatio, filename)` in `PS/src/lib/exportPng.ts`:
   - Sets `data-exporting="true"` on node (hides editor chrome via `index.css` rules)
   - Waits fonts + paint
   - `html-to-image` `toPng()` at native size
3. `index.css` `[data-exporting="true"]` rules strip outlines/borders from `[data-text-block]` and `[data-canvas-stage]`.

## Canvas sizes

Add presets in `PS/src/lib/canvasSizes.ts` — test in `canvasSizes.test.ts`. Common: TikTok 1080×1920, square 1080×1080, OG 1200×630.

## Content blocks

- Text blocks: `TextBlockLayer.tsx`, `data-text-block` attribute
- Editor-only UI: `data-editor-only` (hidden on export)
- Layout presets: `PS/src/lib/layoutPlacement.ts`, `contentPresets.ts`

## Adding a new template/preset

1. Define `CanvasSize` if new aspect ratio.
2. Add `contentPresets` or template asset reference (`templateAssets.ts`).
3. Wire picker UI (`CanvasSizePicker`, `LayoutPresetPicker`).
4. Preview with `CanvasThemeScope` so tokens match production app.
5. Test export at `pixelRatio` 1 and 2.
6. Add `PS/src/lib/*.test.ts` for pure sizing/sanitize logic.

## Branded chrome

`PS/src/components/RoidersClubChrome.tsx` — optional brand frame. Main app components can be referenced via `@source` in `index.css` for Tailwind class scanning.

## Commands

```bash
npm run dev:ps      # http://localhost:5174
npm run build:ps    # outputs PS/dist/
npm run build:all   # Next + PS
```

## Checklist

1. Theme comes from shared `globals.css` / `themes.ts` — no orphan hex palette in PS-only CSS.
2. Export hides editor UI (`data-exporting`, `data-editor-only`).
3. Fonts loaded before export (`waitForFonts` in `exportPng.ts`).
4. Vitest for new pure lib helpers in `PS/src/lib/`.
5. `npm run build:ps` succeeds.

## Do not

- Import PS code into main Next.js app bundle (`tsconfig` excludes `PS`).
- Break `data-exporting` CSS rules — exported PNGs will show editor chrome.
- Commit large binary outputs without user intent (`PS/dist/` is gitignored).