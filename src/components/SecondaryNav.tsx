"use client";

import { useApp } from "@/context/AppContext";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";

const ITEMS = [
  { id: "pre-cycle" as const, label: "Baseline" },
  { id: "during-cycle" as const, label: "On-cycle" },
  { id: "cheat-sheet" as const, label: "Reference" },
  { id: "reports" as const, label: "Panels" },
  { id: "debug" as const, label: "Debug" },
];

export function SecondaryNav() {
  const { secondaryTab, setSecondaryTab, cycleMode, setCycleMode, rangeMode, resetAll } = useApp();

  return (
    <div className={ui.navBar}>
      {ITEMS.map((item) => {
        const active = secondaryTab === item.id || cycleMode === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (item.id === "pre-cycle" || item.id === "during-cycle") {
                setCycleMode(cycleMode === item.id ? null : item.id);
              }
              setSecondaryTab(secondaryTab === item.id ? null : item.id);
            }}
            className={cn(ui.navBarBtn, active ? ui.navBarBtnActive : ui.navBarBtnInactive)}
          >
            {item.label}
          </button>
        );
      })}
      {cycleMode && (
        <span className={cn(ui.tag, "border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--muted)]")}>
          Ranges: {rangeMode === "lab" ? "lab reference" : "optimized"}
        </span>
      )}
      <button
        type="button"
        onClick={() => confirm("Reset all lab data?") && resetAll()}
        className={cn(ui.navBarBtn, "text-[var(--danger)] hover:bg-[var(--danger)]/10")}
      >
        Reset
      </button>
    </div>
  );
}