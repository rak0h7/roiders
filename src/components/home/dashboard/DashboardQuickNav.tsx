"use client";

import { motion } from "framer-motion";
import {
  Activity, Blocks, BookOpen, ChevronRight, ClipboardList, Dumbbell, Droplet,
  History, Leaf, Spline, TrendingUp, UtensilsCrossed,
} from "lucide-react";
import type { AppRoute } from "@/context/NavigationContext";
import { fade } from "./shared";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type DashboardQuickNavProps = {
  setRoute: (route: AppRoute) => void;
};

export function DashboardQuickNav({ setRoute }: DashboardQuickNavProps) {
  return (
    <div>
      <p className={cn(ui.overline, "mb-3")}>Quick navigation</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[
          { icon: Droplet, label: "Log Labs", desc: "Upload or manual entry", route: "bloodwork-log" as const, accent: "labs" as const },
          { icon: History, label: "Lab Archive", desc: "Compare past panels", route: "bloodwork-history" as const, accent: "labs" as const },
          { icon: Activity, label: "Lab Analysis", desc: "Scores & flags", route: "bloodwork-insights" as const, accent: "labs" as const },
          { icon: Blocks, label: "Cycle Builder", desc: "Compose your stack", route: "cycle-planner" as const, accent: "protocol" as const },
          { icon: BookOpen, label: "Compound Guides", desc: "Injectables & orals reference", route: "cycle-guides" as const, accent: "protocol" as const },
          { icon: Spline, label: "PK Simulation", desc: "Curves & risk radar", route: "cycle-dashboard" as const, accent: "protocol" as const },
          { icon: Dumbbell, label: "Train", desc: "Active workout logging", route: "gym-workout" as const, accent: "protocol" as const },
          { icon: ClipboardList, label: "Programs", desc: "Routines & templates", route: "gym-routines" as const, accent: "protocol" as const },
          { icon: TrendingUp, label: "Training Stats", desc: "Volume, PRs & charts", route: "gym-progress" as const, accent: "intel" as const },
          { icon: UtensilsCrossed, label: "Food Diary", desc: "Daily macro tracking", route: "nutrition-diary" as const, accent: "intel" as const },
          { icon: Leaf, label: "Micronutrients", desc: "Vitamins & minerals", route: "nutrition-micro" as const, accent: "intel" as const },
        ].map((action, i) => (
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
              "group flex items-center gap-3 p-3.5 text-left",
              action.accent === "labs" && "hover:border-[var(--labs)]/30",
              action.accent === "protocol" && "hover:border-[var(--protocol)]/30",
              action.accent === "intel" && "hover:border-[var(--intel)]/30"
            )}
          >
            <div className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)]",
              action.accent === "labs" && "bg-[var(--labs-dim)] text-[var(--labs)]",
              action.accent === "protocol" && "bg-[var(--protocol-dim)] text-[var(--protocol)]",
              action.accent === "intel" && "bg-[var(--intel-dim)] text-[var(--intel)]"
            )}>
              <action.icon className="h-4 w-4" />
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