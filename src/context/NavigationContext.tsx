"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { pathFromRoute, routeFromPathname } from "@/lib/appRoutes";

export type AppRoute =
  | "home"
  | "bloodwork-log"
  | "bloodwork-insights"
  | "cycle-planner"
  | "cycle-guides"
  | "cycle-dashboard"
  | "cycle-sources"
  | "gym-workout"
  | "gym-routines"
  | "gym-history"
  | "gym-progress"
  | "gym-exercises"
  | "articles"
  | "settings";

export type NavItemId = AppRoute;

export type NavGroup = "overview" | "labs" | "protocol" | "training" | "misc";

export interface NavItem {
  id: NavItemId;
  label: string;
  group: NavGroup;
  icon: string;
  description?: string;
  accent: "labs" | "protocol" | "intel" | "neutral";
}

export const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Dashboard", group: "overview", icon: "compass", description: "Site-wide command center", accent: "intel" },
  { id: "bloodwork-log", label: "Log Labs", group: "labs", icon: "flask", description: "Upload or enter results", accent: "labs" },
  { id: "bloodwork-insights", label: "Analysis", group: "labs", icon: "chart", description: "Scores, flags & past logs", accent: "labs" },
  { id: "cycle-planner", label: "Builder", group: "protocol", icon: "blocks", description: "Compose your stack", accent: "protocol" },
  { id: "cycle-guides", label: "Guides", group: "protocol", icon: "book", description: "Compound profiles & reference", accent: "protocol" },
  { id: "cycle-dashboard", label: "Simulation", group: "protocol", icon: "waveform", description: "Saturation curves & risk", accent: "protocol" },
  { id: "cycle-sources", label: "Sources", group: "protocol", icon: "sources", description: "Verified vendors & suppliers", accent: "protocol" },
  { id: "gym-workout", label: "Train", group: "training", icon: "dumbbell", description: "Log sets & track sessions", accent: "protocol" },
  { id: "gym-routines", label: "Programs", group: "training", icon: "clipboard", description: "Routines & templates", accent: "protocol" },
  { id: "gym-history", label: "Workout Log", group: "training", icon: "history", description: "Past training sessions", accent: "protocol" },
  { id: "gym-progress", label: "Training Stats", group: "training", icon: "trending", description: "Volume, PRs & charts", accent: "intel" },
  { id: "gym-exercises", label: "Exercises", group: "training", icon: "library", description: "Browse & create exercises", accent: "neutral" },
  { id: "articles", label: "Articles", group: "misc", icon: "book", description: "Gear, training & diet reference", accent: "intel" },
  { id: "settings", label: "Settings", group: "misc", icon: "sliders", description: "Export & preferences", accent: "neutral" },
];

interface NavigationContextValue {
  route: AppRoute;
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  setRoute: (route: AppRoute) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setCommandOpen: (open: boolean) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const route = useMemo(() => routeFromPathname(pathname) ?? "home", [pathname]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const setRoute = useCallback(
    (r: AppRoute) => {
      const path = pathFromRoute(r);
      if (pathname !== path) {
        router.push(path, { scroll: false });
      }
    },
    [pathname, router]
  );

  const setSidebarCollapsedState = useCallback((collapsed: boolean) => setSidebarCollapsed(collapsed), []);
  const toggleSidebar = useCallback(() => setSidebarCollapsed((c) => !c), []);

  return (
    <NavigationContext.Provider
      value={{
        route,
        sidebarCollapsed,
        commandOpen,
        setRoute,
        setSidebarCollapsed: setSidebarCollapsedState,
        toggleSidebar,
        setCommandOpen,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
}