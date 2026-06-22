"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useCycleStore } from "@/store/cycleStore";
import { generateStackedLoadData } from "@/lib/cycleCalculations";
import { ui } from "@/lib/ui";
import { getChartTheme } from "@/lib/charts";
import { useSettings } from "@/context/SettingsContext";

const SERIES = [
  { key: "anabolics", name: "Anabolics", color: "var(--protocol)" },
  { key: "estrogen", name: "Estrogen / SERM", color: "var(--intel)" },
  { key: "supplements", name: "Peptides", color: "var(--success)" },
  { key: "fatLoss", name: "Fat loss", color: "#f97316" },
  { key: "health", name: "Support / Other", color: "var(--warning)" },
] as const;

export function StackedLoadView() {
  useSettings();
  const chart = getChartTheme();
  const { compounds, getEffectiveWeeks } = useCycleStore();
  const data = generateStackedLoadData(getEffectiveWeeks(), compounds);

  if (compounds.length === 0) {
    return (
      <div className={`${ui.card} flex min-h-[12rem] items-center justify-center ${ui.cardPad}`}>
        <p className="text-[var(--muted)]">Add compounds to see load over time.</p>
      </div>
    );
  }

  return (
    <div className={`${ui.card} ${ui.cardPad}`}>
      <h2 className="font-display text-lg font-bold text-[var(--protocol)]">Stacked Compound Load</h2>
      <p className={`${ui.sectionSub} mb-4`}>Weekly mg-equivalent load by category</p>
      <div className="h-[22rem] w-full sm:h-[24rem]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              {SERIES.map((s) => (
                <linearGradient key={s.key} id={`load-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
            <XAxis dataKey="week" stroke={chart.axis} fontSize={11} tick={{ fill: chart.axis }} />
            <YAxis stroke={chart.axis} fontSize={11} tick={{ fill: chart.axis }} width={40} />
            <Tooltip contentStyle={chart.tooltip} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {SERIES.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stackId="load"
                stroke={s.color}
                fill={`url(#load-${s.key})`}
                name={s.name}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}