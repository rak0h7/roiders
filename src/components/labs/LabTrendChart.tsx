"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { BloodworkReport } from "@/lib/types";
import { LAB_TREND_MARKERS } from "@/lib/labTrendMarkers";
import { MARKER_MAP } from "@/lib/markers";
import { getChartTheme } from "@/lib/charts";
import { Panel } from "@/components/ui/Panel";
import { ui } from "@/lib/ui";

type LabTrendChartProps = {
  reports: BloodworkReport[];
};

export function LabTrendChart({ reports }: LabTrendChartProps) {
  const chartTheme = getChartTheme();

  const { data, activeMarkers } = useMemo(() => {
    const sorted = [...reports].sort((a, b) => a.date.localeCompare(b.date));
    const active = LAB_TREND_MARKERS.filter((m) =>
      sorted.some((r) => r.values.some((v) => v.markerId === m.id))
    );
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
    return { data: rows, activeMarkers: active };
  }, [reports]);

  if (reports.length < 2 || activeMarkers.length === 0) return null;

  const colors = ["var(--labs)", "var(--protocol)", "var(--intel)", "var(--warning)", "var(--danger)", "var(--success)", "var(--accent-tertiary)"];

  return (
    <Panel className="p-4 sm:p-5">
      <h3 className={ui.sectionTitle}>Marker trends</h3>
      <p className={ui.sectionSub}>Track key markers across saved panels.</p>
      <div className="mt-4 h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis dataKey="label" tick={{ fill: chartTheme.axis, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: chartTheme.axis, fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
            <Tooltip contentStyle={chartTheme.tooltip} />
            <Legend />
            {activeMarkers.map((marker, i) => (
              <Line
                key={marker.id}
                type="monotone"
                dataKey={marker.id}
                name={`${marker.label}${MARKER_MAP.get(marker.id) ? ` (${MARKER_MAP.get(marker.id)!.defaultUnit})` : ""}`}
                stroke={colors[i % colors.length]}
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