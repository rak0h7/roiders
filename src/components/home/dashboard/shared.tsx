"use client";

import type { AppRoute } from "@/context/NavigationContext";
import { useNavigation } from "@/context/NavigationContext";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export const fade = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35 } }),
};

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function Stat({
  label, value, sub, onClick,
}: {
  label: string; value: string | number; sub?: string; onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        ui.cardInner,
        "flex min-h-[5.5rem] flex-col justify-center p-2.5 text-left transition sm:min-h-0 sm:p-3",
        onClick && "cursor-pointer hover:border-[var(--border-strong)]"
      )}
    >
      <p className={cn(ui.overline, "truncate text-[10px] sm:text-[11px]")}>{label}</p>
      <p className="mt-1 text-lg font-bold text-[var(--foreground)] sm:text-xl">{value}</p>
      {sub && <p className="mt-0.5 line-clamp-2 text-[10px] text-[var(--muted)]">{sub}</p>}
    </button>
  );
}

export function ModuleHeader({
  title, status, statusColor, route, routeLabel, icon: Icon, accentClass,
}: {
  title: string;
  status: string;
  statusColor: string;
  route: AppRoute;
  routeLabel: string;
  icon: React.ElementType;
  accentClass: string;
}) {
  const { setRoute } = useNavigation();
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]", accentClass)}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className={ui.sectionTitle}>{title}</h3>
          <p className={cn("text-[11px] font-medium", statusColor)}>{status}</p>
        </div>
      </div>
      <button onClick={() => setRoute(route)} className={cn(ui.btnGhost, "h-auto shrink-0 px-0 py-0 text-xs")}>
        {routeLabel} →
      </button>
    </div>
  );
}