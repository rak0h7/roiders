"use client";

import { motion } from "framer-motion";
import {
  Activity, Blocks, BookOpen, ChevronRight, ClipboardList, Dumbbell, Droplet,
  Leaf, Spline, TrendingUp, UtensilsCrossed,
} from "lucide-react";
import type { AppRoute } from "@/context/NavigationContext";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { fade } from "./shared";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type DashboardQuickNavProps = {
  setRoute: (route: AppRoute) => void;
};

const NAV_ITEMS: {
  icon: typeof Droplet;
  label: string;
  desc: string;
  route: AppRoute;
  accent: "labs" | "protocol" | "intel";
  module: "labs" | "cycle" | "gym" | "nutrition" | null;
}[] = [
  { icon: Droplet, label: "Log Labs", desc: "Upload or manual entry", route: "bloodwork-log", accent: "labs", module: "labs" },
  { icon: Activity, label: "Lab Analysis", desc: "Scores, flags & past logs", route: "bloodwork-insights", accent: "labs", module: "labs" },
  { icon: Blocks, label: "Cycle Builder", desc: "Compose your stack", route: "cycle-planner", accent: "protocol", module: "cycle" },
  { icon: BookOpen, label: "Compound Guides", desc: "Injectables & orals reference", route: "cycle-guides", accent: "protocol", module: "cycle" },
  { icon: Spline, label: "Saturation Sim", desc: "Steady-state curves & risk", route: "cycle-dashboard", accent: "protocol", module: "cycle" },
  { icon: Dumbbell, label: "Train", desc: "Active workout logging", route: "gym-workout", accent: "protocol", module: "gym" },
  { icon: ClipboardList, label: "Programs", desc: "Routines & templates", route: "gym-routines", accent: "protocol", module: "gym" },
  { icon: TrendingUp, label: "Training Stats", desc: "Volume, PRs & charts", route: "gym-progress", accent: "intel", module: "gym" },
  { icon: UtensilsCrossed, label: "Food Diary", desc: "Daily macro tracking", route: "nutrition-diary", accent: "intel", module: "nutrition" },
  { icon: Leaf, label: "Micronutrients", desc: "Vitamins & minerals", route: "nutrition-micro", accent: "intel", module: "nutrition" },
];

export function DashboardQuickNav({ setRoute }: DashboardQuickNavProps) {
  const { moduleEnabled } = useSiteConfig();
  const items = NAV_ITEMS.filter((item) => !item.module || moduleEnabled(item.module));

  if (!items.length) return null;

  return (
    <div>
      <p className={cn(ui.overline, "mb-3")}>Quick navigation</p>
      <div className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((action, i) => (
          <motion.button
            key={action.label}
            custom={i + 5}
            variants={fade}
            initial="hidden"
            animate="show"
            onClick={() => setRoute(action.route)}
            className={cn(
              ui.card,
              ui.cardHover,
              "group flex h-full items-center gap-3 p-3.5 text-left",
              action.accent === "labs" && "hover:border-[var(--labs)]/30",
              action.accent === "protocol" && "hover:border-[var(--protocol)]/30",
              action.accent === "intel" && "hover:border-[var(--intel)]/30"
            )}
          >
            <div className={cn(
              "flex h-[var(--control-height-icon)] w-[var(--control-height-icon)] shrink-0 items-center justify-center rounded-[var(--radius-md)]",
              action.accent === "labs" && "bg-[var(--labs-dim)] text-[var(--labs)]",
              action.accent === "protocol" && "bg-[var(--protocol-dim)] text-[var(--protocol)]",
              action.accent === "intel" && "bg-[var(--intel-dim)] text-[var(--intel)]"
            )}>
              <action.icon className="app-icon app-icon--sm" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--foreground)]">{action.label}</p>
              <p className={ui.sectionSub}>{action.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted-2)] opacity-0 transition group-hover:opacity-100" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}