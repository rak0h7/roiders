"use client";

import { useApp } from "@/context/AppContext";
import { useCycleStore } from "@/store/cycleStore";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import { AppIcon } from "@/components/ui/AppIcon";

export function SecondaryNav() {
  const { setSecondaryTab } = useApp();
  const { compounds } = useCycleStore();
  const onCycle = compounds.length > 0;

  return (
    <div className={cn(ui.navBar, "flex-wrap gap-2")}>
      <span className="text-[10px] text-[var(--muted)]">
        Optimal ranges for minimal-cycle health
        {onCycle ? " · stack context applied" : ""}
      </span>

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