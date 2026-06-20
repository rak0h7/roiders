---
name: theme-ui-component
description: Build UI using ui.ts token bundles, CSS variables, Panel, and cn() without hardcoded colours. Use when creating components, forms, cards, or buttons in the Roiders Club design system, or when the user runs /theme-ui-component.
---

# Theme UI Component

Design system is CSS-variable driven — not shadcn. Read `src/lib/ui.ts` and `src/app/globals.css` before styling.

## Core utilities

```tsx
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";
import { Panel } from "@/components/ui/Panel";
```

- `cn()` — `clsx` + `tailwind-merge`
- `ui.*` — pre-composed class strings for buttons, inputs, cards, typography
- `Panel` — glass card with `variant`: `default` | `glass` | `labs` | `protocol` | `intel`

## Colour rules

**Use CSS variables**, not hex in components:

```
var(--foreground)   var(--muted)        var(--muted-2)
var(--bg-base)      var(--bg-elevated)  var(--bg-surface)  var(--bg-hover)
var(--border)       var(--border-strong)
var(--labs)         var(--protocol)     var(--intel)
var(--danger)       var(--warning)      var(--success)
var(--text-on-labs) var(--text-on-protocol)  etc.
```

Module accents:
- Labs / bloodwork → `labs` variant, `ui.btnPrimary`, `ui.cardLabs`
- Protocol / cycle / gym → `protocol`, `ui.btnProtocol`, `ui.cardProtocol`
- Insights / nutrition → `intel`, `ui.cardIntel`

## Typography

```tsx
<h1 className={ui.pageTitle}>Title</h1>
<p className={ui.pageSub}>Subtitle</p>
<h2 className={ui.sectionTitle}>Section</h2>
<p className={ui.sectionSub}>Section description</p>
<span className={ui.overline}>LABEL</span>
<label className={ui.label}>Field</label>
```

Display headings: add `font-display` or use `ui.pageTitle` (includes it).

## Controls

| Need | Use |
|------|-----|
| Primary CTA | `ui.btnPrimary` |
| Protocol action | `ui.btnProtocol` or `ui.btnProtocolSm` |
| Secondary | `ui.btnSecondary` |
| Ghost | `ui.btnGhost` |
| Icon button | `ui.btnIcon` / `ui.btnIconSm` |
| Text input | `ui.input` / `ui.inputCompact` |
| Tabs/pills | `ui.pillActive` / `ui.pillInactive` |
| Segmented | `ui.segment` + `ui.segmentActiveLabs` etc. |

Sizing uses `var(--control-height*)` and `var(--radius-*)` — theme engine scales these.

## Layout

```tsx
<div className={cn(ui.card, ui.cardPad, ui.cardHover)}>...</div>
<div className={cn(CONTENT_WIDTH_CLASS[theme.contentWidth], "mx-auto")}>...</div>
```

Import `CONTENT_WIDTH_CLASS` from `@/lib/themes` when page width follows user theme.

## Icons

```tsx
import { AppIcon } from "@/components/ui/AppIcon";
// or lucide with ui.icon / ui.iconSm classes
<SomeLucideIcon className={ui.icon} />
```

## Motion

`Panel` uses `framer-motion`. Respect `useSettings().reducedMotion` for custom animations (see `AppShell` `pageTransitionDuration`).

## Client boundary

Interactive components need `"use client"` at top. Pure presentational pieces inside client trees do not need their own directive.

## Checklist

1. No raw `#ff2e4a` / `text-pink-500` for semantic colours — use tokens.
2. Buttons/inputs use `ui.*` bundles before inventing Tailwind.
3. Cards use `Panel` or `ui.card` + `ui.cardPad`.
4. Spacing uses `var(--space-unit)` where existing patterns do (`ui.cardPad`).
5. Mobile: check bottom nav padding (`app-main-with-mobile-nav` class on main).

## Reference components

- `src/components/ui/ChoiceCard.tsx`
- `src/components/ui/EmptyState.tsx`
- `src/components/labs/labsUi.tsx`
- `src/components/settings/appearance/shared.tsx`