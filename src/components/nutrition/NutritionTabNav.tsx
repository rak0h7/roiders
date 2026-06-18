"use client";

import { useNavigation } from "@/context/NavigationContext";
import { useNutritionStore } from "@/store/nutritionStore";
import { ModuleTabBar, ModuleTabButton } from "@/components/ui/ModuleTabButton";

const TABS = [
  { id: "diary" as const, label: "Diary", route: "nutrition-diary" as const },
  { id: "search" as const, label: "Add Food", route: "nutrition-search" as const },
  { id: "micro" as const, label: "Micros", route: "nutrition-micro" as const },
  { id: "goals" as const, label: "Goals", route: "nutrition-goals" as const },
  { id: "foods" as const, label: "Foods", route: "nutrition-foods" as const },
];

export function NutritionTabNav() {
  const { nutritionView } = useNutritionStore();
  const { setRoute } = useNavigation();

  return (
    <ModuleTabBar>
      {TABS.map((tab) => (
        <ModuleTabButton
          key={tab.id}
          active={nutritionView === tab.id}
          onClick={() => setRoute(tab.route)}
        >
          {tab.label}
        </ModuleTabButton>
      ))}
    </ModuleTabBar>
  );
}