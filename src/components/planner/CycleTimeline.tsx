"use client";

import { useMemo } from "react";
import { parseISO } from "date-fns";
import { useCycleStore } from "@/store/cycleStore";
import {
  generateTimelineMilestones,
  generateTimelineRows,
  type TimelineMilestone,
  type TimelineRow,
} from "@/lib/cycleCalculations";
import { formatDate, getEndDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type Props = {
  variant?: "compact" | "full";
  className?: string;
};

function weekTicks(total: number): number[] {
  if (total <= 12) return Array.from({ length: total }, (_, i) => i + 1);
  const step = total <= 20 ? 2 : total <= 32 ? 4 : 5;
  const ticks: number[] = [1];
  for (let w = step; w < total; w += step) ticks.push(w);
  if (ticks[ticks.length - 1] !== total) ticks.push(total);
  return ticks;
}

function MilestoneMarker({ milestone, weeks }: { milestone: TimelineMilestone; weeks: number }) {
  const left = ((milestone.week - 0.5) / weeks) * 100;
  const color =
    milestone.type === "end"
      ? "var(--protocol)"
      : milestone.type === "pct"
        ? "var(--warning)"
        : milestone.type === "start"
          ? "var(--success)"
          : milestone.color ?? "var(--muted)";

  return (
    <div
      className="pointer-events-none absolute top-0 z-10 h-full w-px"
      style={{ left: `${left}%`, background: color, opacity: milestone.type === "saturation" ? 0.45 : 0.7 }}
      title={milestone.label}
    >
      {milestone.type !== "saturation" ? (
        <span
          className="absolute -top-0.5 left-1 whitespace-nowrap text-[8px] font-bold uppercase tracking-wide"
          style={{ color }}
        >
          {milestone.label}
        </span>
      ) : null}
    </div>
  );
}

function TimelineBar({
  row,
  weeks,
  onSelect,
}: {
  row: TimelineRow;
  weeks: number;
  onSelect: (id: string) => void;
}) {
  const span = row.endWeek - row.startWeek + 1;
  const left = ((row.startWeek - 1) / weeks) * 100;
  const width = (span / weeks) * 100;

  return (
    <button
      type="button"
      onClick={() => onSelect(row.entryId)}
      className="absolute top-1/2 h-[calc(var(--control-height-xs)-4px)] min-h-[1.25rem] -translate-y-1/2 rounded-[var(--radius-sm)] px-1.5 text-left transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--protocol)]"
      style={{
        left: `${left}%`,
        width: `${Math.max(width, 100 / weeks)}%`,
        background: row.color,
        opacity: 0.92,
      }}
      title={`${row.label}: ${row.doseLabel} (W${row.startWeek}–${row.endWeek})`}
    >
      <span className="block truncate text-[9px] font-bold text-white sm:text-[10px]">
        {row.label}
        <span className="hidden font-medium opacity-90 sm:inline"> · {row.doseLabel}</span>
      </span>
    </button>
  );
}

export function CycleTimeline({ variant = "full", className }: Props) {
  const { compounds, startDate, getEffectiveWeeks, setConfiguringEntryId } = useCycleStore();
  const weeks = getEffectiveWeeks();
  const start = parseISO(startDate);
  const end = getEndDate(start, weeks);

  const rows = useMemo(() => generateTimelineRows(compounds, weeks), [compounds, weeks]);
  const milestones = useMemo(
    () => generateTimelineMilestones(weeks, compounds, start),
    [weeks, compounds, start],
  );
  const ticks = weekTicks(weeks);
  const maxRows = variant === "compact" ? 6 : undefined;
  const visibleRows = maxRows ? rows.slice(0, maxRows) : rows;
  const hiddenCount = maxRows && rows.length > maxRows ? rows.length - maxRows : 0;

  const cardClass = variant === "compact" ? ui.cardInner : ui.card;

  return (
    <div className={cn(cardClass, ui.cardPad, className)}>
      <div className={`${ui.rowBetween} mb-4 flex-wrap gap-2`}>
        <div>
          <h3 className={variant === "compact" ? ui.sectionTitle : "font-display text-lg font-bold text-[var(--protocol)]"}>
            Cycle Timeline
          </h3>
          <p className={ui.sectionSub}>
            {compounds.length === 0
              ? "Week-by-week layout of your stack"
              : `${formatDate(start)} → ${formatDate(end)} · ${weeks} weeks`}
          </p>
        </div>
        {compounds.length > 0 ? (
          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
            Click a bar to edit
          </p>
        ) : null}
      </div>

      {compounds.length === 0 ? (
        <div className="flex min-h-[8rem] items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)]">
          <p className="text-sm text-[var(--muted)]">Add compounds or load a template to plot your cycle.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative ml-[4.5rem] sm:ml-[5.5rem]">
            <div className="relative h-4 border-b border-[var(--border)]">
              {milestones.map((m) => (
                <MilestoneMarker key={`${m.type}-${m.week}-${m.label}`} milestone={m} weeks={weeks} />
              ))}
              {ticks.map((w) => (
                <span
                  key={w}
                  className="absolute -translate-x-1/2 text-[9px] font-medium text-[var(--muted-2)]"
                  style={{ left: `${((w - 0.5) / weeks) * 100}%` }}
                >
                  {w}
                </span>
              ))}
            </div>
          </div>

          <div
            className={cn(
              "space-y-1.5",
              variant === "compact" && rows.length > 6 ? "max-h-[14rem] overflow-y-auto pr-1" : "",
            )}
          >
            {visibleRows.map((row) => (
              <div key={row.entryId} className="flex items-center gap-2">
                <div className="w-[4.5rem] shrink-0 sm:w-[5.5rem]">
                  <p className="truncate text-[10px] font-semibold text-[var(--foreground)]">{row.label}</p>
                  <p className="truncate text-[8px] uppercase tracking-wide text-[var(--muted-2)]">
                    {row.categoryLabel}
                  </p>
                </div>
                <div className="relative h-8 flex-1 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)]">
                  <TimelineBar row={row} weeks={weeks} onSelect={setConfiguringEntryId} />
                </div>
              </div>
            ))}
          </div>

          {hiddenCount > 0 ? (
            <p className="text-center text-[10px] text-[var(--muted)]">
              +{hiddenCount} more — open Simulation for full timeline
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}