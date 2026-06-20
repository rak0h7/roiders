"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CategoryScore } from "@/lib/types";
import { getChartTheme } from "@/lib/charts";
import { Panel } from "@/components/ui/Panel";

import { ui } from "@/lib/ui";

type LabsCategoryScoreChartProps = {
  categoryScores: CategoryScore[];
};

export function LabsCategoryScoreChart({ categoryScores }: LabsCategoryScoreChartProps) {
  const chartTheme = getChartTheme();

  const data = useMemo(
    () =>
      categoryScores
        .filter((c) => c.assessed > 0)
        .map((c) => ({
          name: c.label.split(" ")[0],
          fullLabel: c.label,
          score: c.score ?? 0,
        })),
    [categoryScores]
  );

  if (data.length === 0) return null;

  return (
    <Panel variant="labs" className="p-4 sm:p-5">
      <h3 className={ui.sectionTitle}>Category scores</h3>
      <p className={ui.sectionSub}>Per-system health score for this panel.</p>
      <div className="mt-4 h-48 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 4, right: 8, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: chartTheme.axis, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={72}
              tick={{ fill: chartTheme.axis, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={chartTheme.tooltip}
              formatter={(value, _name, item) => [`${value}`, (item.payload as { fullLabel: string }).fullLabel]}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={18}>
              {data.map((entry) => (
                <Cell
                  key={entry.fullLabel}
                  fill={
                    entry.score >= 90
                      ? "var(--success)"
                      : entry.score >= 75
                        ? "var(--warning)"
                        : "var(--danger)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}