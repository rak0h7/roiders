"use client";

import {
  Calendar,
  LineChart,
  Flame,
  BarChart3,
  Radar,
  HeartPulse,
  Syringe,
  Shield,
} from "lucide-react";
import { useCycleStore } from "@/store/cycleStore";
import { AppIcon } from "@/components/ui/AppIcon";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

const TABS = [
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "pk-curves", label: "Saturation", icon: LineChart },
  { id: "heatmap", label: "Heatmap", icon: Flame },
  { id: "stacked", label: "Stacked Load", icon: BarChart3 },
  { id: "risk", label: "Risk Radar", icon: Radar },
  { id: "er-card", label: "ER Card", icon: HeartPulse },
  { id: "injection", label: "Injection Sites", icon: Syringe },
  { id: "defense", label: "Defense", icon: Shield },
];

export function DashboardNav() {
  const { dashboardTab, setDashboardTab } = useCycleStore();

  return (
    <div className="no-print mb-6 flex justify-center">
      <div className={cn(ui.navBar, "inline-flex max-w-full flex-wrap justify-center")}>
        {TABS.map((tab) => {
          const active = dashboardTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDashboardTab(tab.id)}
              className={cn(
                ui.navBarBtn,
                "gap-1.5 uppercase tracking-wider",
                active ? ui.pillProtocolActive : ui.navBarBtnInactive
              )}
            >
              <AppIcon icon={tab.icon} size="sm" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}