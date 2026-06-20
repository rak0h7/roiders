"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Zap } from "lucide-react";
import type { AppRoute } from "@/context/NavigationContext";
import { CrossAlerts } from "../CrossAlerts";
import type { DashboardData } from "./useDashboardData";
import { fade } from "./shared";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type DashboardActivityRowProps = Pick<DashboardData, "activity" | "crossAlerts"> & {
  setRoute: (route: AppRoute) => void;
};

export function DashboardActivityRow({ activity, crossAlerts, setRoute }: DashboardActivityRowProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <motion.div custom={3} variants={fade} initial="hidden" animate="show" className="lg:col-span-2">
        <div className={cn(ui.card, ui.cardPad)}>
          <div className={ui.rowBetween}>
            <h3 className={ui.sectionTitle}>Recent activity</h3>
            <span className="text-[10px] text-[var(--muted)]">Across all modules</span>
          </div>
          {activity.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--muted)]">
              Activity from labs, gear, and training will appear here
            </p>
          ) : (
            <ul className="mt-4 space-y-1">
              {activity.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setRoute(item.route)}
                    className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-2 py-2.5 text-left transition hover:bg-[var(--bg-hover)]"
                  >
                    <span className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[10px] font-bold uppercase",
                      item.module === "labs" && "bg-[var(--labs-dim)] text-[var(--labs)]",
                      item.module === "gear" && "bg-[var(--protocol-dim)] text-[var(--protocol)]",
                      item.module === "training" && "bg-[var(--protocol-dim)] text-[var(--protocol)]"
                    )}>
                      {item.module.slice(0, 3)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="text-[11px] text-[var(--muted)]">{item.subtitle}</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-[var(--muted-2)]">
                      {formatDistanceToNow(new Date(item.at), { addSuffix: true })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>

      <motion.div custom={4} variants={fade} initial="hidden" animate="show" className="lg:col-span-3">
        {crossAlerts.length > 0 ? (
          <CrossAlerts alerts={crossAlerts} />
        ) : (
          <div className={cn(ui.cardIntel, ui.cardPad)}>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--intel-dim)] text-[var(--intel)]">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className={ui.sectionTitle}>Cross-domain intelligence</h3>
                <p className={`${ui.sectionSub} mt-1 max-w-md`}>
                  Roiders Club correlates labs, training, and your gear stack. Log data across modules to unlock automated insights.
                </p>
                <button
                  onClick={() => setRoute("bloodwork-log")}
                  className={cn(ui.btnGhost, "mt-3 text-xs text-[var(--intel)]")}
                >
                  Get started with labs <ArrowRight className="ml-1 inline h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}