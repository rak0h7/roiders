"use client";

import { useApp } from "@/context/AppContext";
import { useCycleStore } from "@/store/cycleStore";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import { AppIcon } from "@/components/ui/AppIcon";

export function SecondaryNav() {
  const { rangeMode, setRangeMode, setSecondaryTab } = useApp();
  const { compounds } = useCycleStore();
  const onCycle = compounds.length > 0;

  return (
    <div className={cn(ui.navBar, "flex-wrap gap-2")}>
      <div className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)] p-0.5">
        <button
          type="button"
          onClick={() => setRangeMode("lab")}
          className={cn(
            "rounded-[calc(var(--radius-md)-2px)] px-3 py-1.5 text-xs font-medium transition-colors",
            rangeMode === "lab"
              ? "bg-[var(--labs-dim)] text-[var(--labs)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          )}
        >
          Lab ranges
        </button>
        <button
          type="button"
          onClick={() => setRangeMode("optimized")}
          className={cn(
            "rounded-[calc(var(--radius-md)-2px)] px-3 py-1.5 text-xs font-medium transition-colors",
            rangeMode === "optimized"
              ? "bg-[var(--labs-dim)] text-[var(--labs)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          )}
        >
          On-cycle
        </button>
      </div>

      {onCycle && rangeMode === "optimized" && (
        <span className="text-[10px] text-[var(--muted)]">
          Performance ranges for your active stack
        </span>
      )}

      <button
        type="button"
        onClick={() => setSecondaryTab("cheat-sheet")}
        className={cn(ui.navBarBtn, ui.navBarBtnInactive, "ml-auto")}
      >
        <AppIcon icon={BookOpen} size="sm" />
        Reference
      </button>
    </div>
  );
}