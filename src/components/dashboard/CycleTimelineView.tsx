"use client";

import { useState } from "react";
import { useCycleStore } from "@/store/cycleStore";
import { CycleTimeline } from "@/components/planner/CycleTimeline";
import { generateWeekProtocol } from "@/lib/cycleCalculations";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function CycleTimelineView() {
  const { compounds, getEffectiveWeeks, setConfiguringEntryId } = useCycleStore();
  const weeks = getEffectiveWeeks();
  const [selectedWeek, setSelectedWeek] = useState(1);
  const protocol = generateWeekProtocol(selectedWeek, compounds);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <CycleTimeline variant="full" />
      </div>

      <div className={`${ui.card} ${ui.cardPad} flex flex-col`}>
        <p className={ui.overline}>Week protocol</p>
        <p className={`${ui.sectionSub} mb-4`}>What is active in a given week</p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {Array.from({ length: weeks }, (_, i) => i + 1).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setSelectedWeek(w)}
              className={cn(
                "min-w-[2rem] rounded-[var(--radius-sm)] px-2 py-1 text-[10px] font-bold",
                selectedWeek === w ? ui.pillProtocolActive : ui.pillInactive,
              )}
            >
              {w}
            </button>
          ))}
        </div>

        {compounds.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Build a stack in the Builder tab first.</p>
        ) : protocol.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Nothing scheduled for week {selectedWeek}.</p>
        ) : (
          <ul className="space-y-2">
            {protocol.map((entry) => (
              <li key={entry.entryId}>
                <button
                  type="button"
                  onClick={() => setConfiguringEntryId(entry.entryId)}
                  className={cn(ui.cardInner, "flex w-full items-center gap-3 p-3 text-left hover:border-[var(--protocol)]/30")}
                >
                  <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: entry.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--foreground)]">{entry.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {entry.doseLabel} · {entry.weeklyDose}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}