"use client";

import { useCycleStore } from "@/store/cycleStore";
import { useNavigation } from "@/context/NavigationContext";
import { ModuleTabBar, ModuleTabButton } from "@/components/ui/ModuleTabButton";

const TABS = [
  { id: "planner" as const, label: "Builder", route: "cycle-planner" as const },
  { id: "guides" as const, label: "Guides", route: "cycle-guides" as const },
  { id: "dashboard" as const, label: "Simulation", route: "cycle-dashboard" as const },
];

export function CycleTabNav() {
  const { view, compounds, setSelectedGuideId } = useCycleStore();
  const { setRoute } = useNavigation();

  return (
    <ModuleTabBar>
      {TABS.map((tab) => (
        <ModuleTabButton
          key={tab.id}
          active={view === tab.id}
          disabled={tab.id === "dashboard" && compounds.length === 0}
          onClick={() => {
            if (tab.id === "guides") setSelectedGuideId(null);
            setRoute(tab.route);
          }}
        >
          {tab.label}
        </ModuleTabButton>
      ))}
    </ModuleTabBar>
  );
}