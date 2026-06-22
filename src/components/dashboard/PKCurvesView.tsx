"use client";

import { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import { useCycleStore } from "@/store/cycleStore";
import { getCompoundById } from "@/data/compounds";
import {
  generatePKData,
  generatePKDataPercentSteadyState,
  generatePKCards,
  getSaturationMarkers,
} from "@/lib/cycleCalculations";
import { SaturationExplainer } from "@/components/dashboard/SaturationExplainer";
import { ui } from "@/lib/ui";
import { getChartColors, getChartTheme } from "@/lib/charts";
import { useSettings } from "@/context/SettingsContext";
import { cn } from "@/lib/utils";

const WASHOUT_WEEKS = 4;

export function PKCurvesView() {
  useSettings();
  const chart = getChartTheme();
  const colors = getChartColors();
  const [mode, setMode] = useState<"absolute" | "percent">("absolute");
  const { compounds, getEffectiveWeeks } = useCycleStore();
  const weeks = getEffectiveWeeks();

  const cards = useMemo(() => generatePKCards(weeks, compounds), [weeks, compounds]);
  const data = useMemo(
    () =>
      mode === "percent"
        ? generatePKDataPercentSteadyState(weeks, compounds)
        : generatePKData(weeks, compounds, { washoutWeeks: WASHOUT_WEEKS }),
    [mode, weeks, compounds],
  );
  const saturationMarkers = useMemo(() => getSaturationMarkers(weeks, compounds), [weeks, compounds]);

  if (compounds.length === 0) {
    return (
      <div className="space-y-4">
        <SaturationExplainer />
        <div className={`${ui.card} flex min-h-[12rem] items-center justify-center ${ui.cardPad}`}>
          <p className="text-[var(--muted)]">Add compounds to see saturation curves.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SaturationExplainer />

      <div className={`${ui.card} ${ui.cardPad}`}>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Blood Level Projection</p>
            <p className="text-xs text-[var(--muted)]">
              Pre = baseline before week 1 · dashed lines mark ~4–5 half-life saturation
              {mode === "absolute" ? ` · +${WASHOUT_WEEKS}wk washout after cycle end` : ""}
            </p>
          </div>
          <div className="flex gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] p-0.5">
            <button
              type="button"
              onClick={() => setMode("absolute")}
              className={cn(
                "rounded-[var(--radius-sm)] px-2.5 py-1 text-[10px] font-bold uppercase",
                mode === "absolute" ? ui.pillProtocolActive : "text-[var(--muted)]",
              )}
            >
              Absolute
            </button>
            <button
              type="button"
              onClick={() => setMode("percent")}
              className={cn(
                "rounded-[var(--radius-sm)] px-2.5 py-1 text-[10px] font-bold uppercase",
                mode === "percent" ? ui.pillProtocolActive : "text-[var(--muted)]",
              )}
            >
              % Steady
            </button>
          </div>
        </div>
        <div className="h-[22rem] w-full sm:h-[24rem]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
              <XAxis dataKey="week" stroke={chart.axis} fontSize={11} tick={{ fill: chart.axis }} />
              <YAxis
                stroke={chart.axis}
                fontSize={11}
                tick={{ fill: chart.axis }}
                width={40}
                domain={mode === "percent" ? [0, 100] : undefined}
              />
              <Tooltip contentStyle={chart.tooltip} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <ReferenceLine
                x={`W${weeks}`}
                stroke={chart.accent}
                strokeDasharray="5 5"
                label={{ value: "Cycle End", fill: chart.accent, fontSize: 10 }}
              />
              {saturationMarkers.map((marker) => (
                <ReferenceLine
                  key={marker.id}
                  x={`W${marker.week}`}
                  stroke={marker.color}
                  strokeDasharray="4 4"
                  strokeOpacity={0.55}
                  label={{ value: marker.label, fill: marker.color, fontSize: 9, position: "insideTopLeft" }}
                />
              ))}
              {compounds.map((cc, i) => (
                <Line
                  key={cc.id}
                  type="monotone"
                  dataKey={cc.id}
                  stroke={colors[i % colors.length]}
                  strokeWidth={i === 0 ? 2.5 : 1.5}
                  dot={false}
                  name={cards.find((c) => c.id === cc.id)?.short ?? getCompoundById(cc.compoundId)?.shortName ?? cc.compoundId}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.id} className={`${ui.cardInner} flex flex-col p-3`}>
            <p className="text-sm font-bold" style={{ color: card.color }}>{card.short}</p>
            <p className="mt-0.5 text-[9px] text-[var(--muted-2)]">HL {card.halfLifeLabel}</p>
            <div className="mt-auto grid grid-cols-2 gap-2 pt-2 text-center">
              <div>
                <p className="text-lg font-black leading-none text-white">{card.peak}</p>
                <p className="mt-1 text-[9px] uppercase text-[var(--muted-2)]">Peak</p>
                <p className="text-[9px] text-[var(--muted-2)]">{card.peakW}</p>
              </div>
              <div>
                {card.saturationPct !== null ? (
                  <>
                    <p className="text-lg font-black leading-none text-white">{card.saturationPct}%</p>
                    <p className="mt-1 text-[9px] uppercase text-[var(--muted-2)]">Saturation</p>
                    <p className="text-[9px] text-[var(--muted-2)]">
                      {card.saturated ? `Full W${card.saturationWeek}` : `W${card.saturationWeek} est.`}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-black leading-none text-white">—</p>
                    <p className="mt-1 text-[9px] uppercase text-[var(--muted-2)]">Saturation</p>
                    <p className="text-[9px] text-[var(--muted-2)]">{card.saturationEta}</p>
                  </>
                )}
              </div>
            </div>
            {card.saturationNote ? (
              <p className="mt-2 text-[9px] leading-snug text-[var(--muted-2)]">{card.saturationNote}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}