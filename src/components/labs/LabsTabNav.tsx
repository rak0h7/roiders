"use client";

import { BookOpen } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useNavigation } from "@/context/NavigationContext";
import { ModuleTabBar, ModuleTabButton } from "@/components/ui/ModuleTabButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

const TABS = [
  { id: "log" as const, label: "Log", route: "bloodwork-log" as const },
  { id: "analysis" as const, label: "Analysis", route: "bloodwork-insights" as const },
] as const;

export function LabsTabNav() {
  const { route, setRoute } = useNavigation();
  const { setSecondaryTab } = useApp();

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <ModuleTabBar>
        {TABS.map((tab) => (
          <ModuleTabButton
            key={tab.id}
            accent="labs"
            active={route === tab.route}
            onClick={() => setRoute(tab.route)}
          >
            {tab.label}
          </ModuleTabButton>
        ))}
      </ModuleTabBar>
      <button
        type="button"
        onClick={() => setSecondaryTab("cheat-sheet")}
        className={cn(ui.btnToolbar, "shrink-0 text-xs")}
      >
        <AppIcon icon={BookOpen} size="sm" />
        Reference
      </button>
    </div>
  );
}