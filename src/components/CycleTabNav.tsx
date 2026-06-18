"use client";

import { useCycleStore } from "@/store/cycleStore";
import { useNavigation } from "@/context/NavigationContext";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { ModuleTabBar, ModuleTabButton } from "@/components/ui/ModuleTabButton";

const TABS = [
  { id: "planner" as const, label: "Builder", route: "cycle-planner" as const },
  { id: "guides" as const, label: "Guides", route: "cycle-guides" as const },
  { id: "dashboard" as const, label: "Simulation", route: "cycle-dashboard" as const },
  { id: "sources" as const, label: "Sources", route: "cycle-sources" as const, requiresSources: true },
] as const;

export function CycleTabNav() {
  const { view, compounds, setSelectedGuideId } = useCycleStore();
  const { route, setRoute } = useNavigation();
  const { settings } = useSiteConfig();
  const visibleTabs = TABS.filter(
    (tab) => tab.id !== "sources" || settings.premium_sources_enabled
  );

  return (
    <ModuleTabBar>
      {visibleTabs.map((tab) => (
        <ModuleTabButton
          key={tab.id}
          active={tab.route === "cycle-sources" ? route === "cycle-sources" : view === tab.id}
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