"use client";

import { useNavigation } from "@/context/NavigationContext";
import { useGymStore } from "@/store/gymStore";
import { ModuleTabBar, ModuleTabButton } from "@/components/ui/ModuleTabButton";

const TABS = [
  { id: "workout" as const, label: "Train", route: "gym-workout" as const },
  { id: "routines" as const, label: "Programs", route: "gym-routines" as const },
  { id: "history" as const, label: "Log", route: "gym-history" as const },
  { id: "progress" as const, label: "Stats", route: "gym-progress" as const },
  { id: "exercises" as const, label: "Library", route: "gym-exercises" as const },
];

export function GymTabNav() {
  const { gymView } = useGymStore();
  const { setRoute } = useNavigation();

  return (
    <ModuleTabBar>
      {TABS.map((tab) => (
        <ModuleTabButton
          key={tab.id}
          active={gymView === tab.id}
          onClick={() => setRoute(tab.route)}
        >
          {tab.label}
        </ModuleTabButton>
      ))}
    </ModuleTabBar>
  );
}