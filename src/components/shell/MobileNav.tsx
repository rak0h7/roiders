"use client";

import { Blocks, BookOpen, Compass, Dumbbell, FlaskConical } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useNavigation, type AppRoute } from "@/context/NavigationContext";
import { isModuleEnabled } from "@/lib/siteSettings";
import { AppIcon } from "@/components/ui/AppIcon";
import { cn } from "@/lib/utils";

type MobileNavItem = {
  id: AppRoute;
  match: (route: AppRoute) => boolean;
  icon: LucideIcon;
  label: string;
  accent: string;
  module?: "labs" | "cycle" | "gym" | "articles" | null;
};

const ITEMS: MobileNavItem[] = [
  { id: "home", match: (r) => r === "home", icon: Compass, label: "Dashboard", accent: "text-[var(--intel)]", module: null },
  { id: "bloodwork-insights", match: (r) => r.startsWith("bloodwork"), icon: FlaskConical, label: "Labs", accent: "text-[var(--labs)]", module: "labs" },
  { id: "cycle-planner", match: (r) => r.startsWith("cycle"), icon: Blocks, label: "Build", accent: "text-[var(--protocol)]", module: "cycle" },
  { id: "gym-workout", match: (r) => r.startsWith("gym"), icon: Dumbbell, label: "Train", accent: "text-[var(--protocol)]", module: "gym" },
  { id: "articles", match: (r) => r === "articles", icon: BookOpen, label: "Articles", accent: "text-[var(--intel)]", module: "articles" },
];

export function MobileNav() {
  const { route, setRoute } = useNavigation();
  const { settings } = useSiteConfig();

  const visibleItems = ITEMS.filter((item) => {
    if (!item.module) return true;
    return isModuleEnabled(settings, item.module);
  });

  return (
    <nav
      className="mobile-nav-dock fixed bottom-0 left-0 right-0 z-40 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Main navigation"
    >
      <div className="mobile-nav-dock__fill" aria-hidden />
      <div className="relative z-10 flex min-h-[var(--mobile-nav-inner)] items-stretch justify-around px-0.5">
        {visibleItems.map((item) => {
          const active = item.match(route);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setRoute(item.id)}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-2 transition",
                active ? item.accent : "text-[var(--muted-2)]",
              )}
            >
              <AppIcon icon={item.icon} />
              <span className="max-w-full truncate text-[10px] font-medium leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}