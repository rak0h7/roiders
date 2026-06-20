---
name: recharts-chart
description: Scaffold a Recharts chart component using getChartTheme(), Panel, and ui tokens following LabTrendChart.tsx patterns. Use when adding lab trends, gym stats, nutrition charts, or cycle simulation graphs, or when the user runs /recharts-chart.
---

# Recharts Chart

Follow `src/components/labs/LabTrendChart.tsx` and `src/lib/charts.ts`.

## Imports

```tsx
"use client";

import { useMemo } from "react";
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
  // Bar, BarChart, Area, AreaChart — as needed
} from "recharts";
import { getChartTheme, getChartColors } from "@/lib/charts";
import { Panel } from "@/components/ui/Panel";
import { ui } from "@/lib/ui";
```

Use `"use client"` — Recharts requires client rendering.

## Theme (required)

```tsx
const chartTheme = getChartTheme();
// chartTheme.grid, chartTheme.axis, chartTheme.tooltip
```

Series colours: prefer CSS variables, not hardcoded hex:

```tsx
const colors = [
  "var(--labs)", "var(--protocol)", "var(--intel)",
  "var(--warning)", "var(--danger)", "var(--success)",
];
// or getChartColors() for fallback palette
```

## Layout shell

```tsx
<Panel className="p-4 sm:p-5">
  <h3 className={ui.sectionTitle}>Title</h3>
  <p className={ui.sectionSub}>Subtitle.</p>
  <div className="mt-4 h-64 sm:h-72">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
        <XAxis dataKey="label" tick={{ fill: chartTheme.axis, fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: chartTheme.axis, fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
        <Tooltip contentStyle={chartTheme.tooltip} />
        <Legend />
        {/* series */}
      </LineChart>
    </ResponsiveContainer>
  </div>
</Panel>
```

## Data prep

- Use `useMemo` for transformed rows.
- Return `null` when insufficient data (see `LabTrendChart` guard: `< 2` reports).
- Date labels: `date-fns` `format()` — match existing `"MMM d, yy"` pattern.

## Module accent

Wrap in `Panel` variant when section-specific:

- Labs: `variant="labs"`
- Protocol/cycle: `variant="protocol"`
- Insights/nutrition: `variant="intel"`

## Existing chart locations

- `src/components/labs/LabTrendChart.tsx` — lab trends
- `src/components/dashboard/*View.tsx` — cycle simulation (may use custom SVG + Recharts)
- `src/components/gym/GymAnalytics.tsx` — training stats

Read the nearest sibling before inventing new layout.

## Checklist

1. `getChartTheme()` for grid/axis/tooltip.
2. CSS variable colours for series.
3. `Panel` + `ui.sectionTitle` / `ui.sectionSub`.
4. Empty state returns `null` or `EmptyState` — not a broken chart.
5. Respect `prefers-reduced-motion` if adding animation (parent may already handle via `SettingsContext.reducedMotion`).

## Do not

- Hardcode `#ff2e4a` etc. when `var(--labs)` works.
- Import chart components into server components without a client wrapper.