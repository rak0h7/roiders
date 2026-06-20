"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BloodworkReport, ReviewFlag } from "@/lib/types";
import { MARKER_MAP } from "@/lib/markers";
import { getChartTheme } from "@/lib/charts";
import { Panel } from "@/components/ui/Panel";
import { ui } from "@/lib/ui";

type LabsFlaggedTrendChartProps = {
  reports: BloodworkReport[];
  reviewFlags: ReviewFlag[];
};

const COLORS = [
  "var(--labs)",
  "var(--protocol)",
  "var(--intel)",
  "var(--warning)",
  "var(--danger)",
  "var(--success)",
];

export function LabsFlaggedTrendChart({ reports, reviewFlags }: LabsFlaggedTrendChartProps) {
  const chartTheme = getChartTheme();

  const flaggedIds = useMemo(
    () =>
      reviewFlags
        .filter((f) => f.severity !== "normal" && f.value !== undefined && !f.markerId.startsWith("cycle-"))
        .map((f) => f.markerId.replace(/^cycle-watch-/, ""))
        .slice(0, 6),
    [reviewFlags]
  );

  const { data, markers } = useMemo(() => {
    const sorted = [...reports].sort((a, b) => a.date.localeCompare(b.date));
    const active = flaggedIds
      .map((id) => MARKER_MAP.get(id))
      .filter(Boolean)
      .map((m) => ({ id: m!.id, label: m!.name }));

    const rows = sorted.map((report) => {
      const row: Record<string, string | number> = {
        date: report.date,
        label: report.date.includes("/")
          ? report.date
          : format(new Date(report.date), "MMM d, yy"),
      };
      for (const marker of active) {
        const val = report.values.find((v) => v.markerId === marker.id);
        if (val) row[marker.id] = val.value;
      }
      return row;
    });

    return { data: rows, markers: active };
  }, [reports, flaggedIds]);

  if (reports.length < 2 || markers.length === 0) return null;

  return (
    <Panel variant="labs" className="p-4 sm:p-5">
      <h3 className={ui.sectionTitle}>Flagged marker trends</h3>
      <p className={ui.sectionSub}>Markers with active flags across saved panels.</p>
      <div className="mt-4 h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis dataKey="label" tick={{ fill: chartTheme.axis, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: chartTheme.axis, fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
            <Tooltip contentStyle={chartTheme.tooltip} />
            <Legend />
            {markers.map((marker, i) => (
              <Line
                key={marker.id}
                type="monotone"
                dataKey={marker.id}
                name={marker.label}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}