"use client";

import type { ReactNode } from "react";
import {
  Activity,
  Beaker,
  Droplets,
  Flame,
  Heart,
  Pill,
  Shield,
  TestTube,
  Zap,
} from "lucide-react";
import { getCompoundById } from "@/data/compounds";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";
import type { MarkerCategory, Severity } from "@/lib/types";

export const CATEGORY_ICONS: Record<MarkerCategory, ReactNode> = {
  hormonal: <Zap className="h-3 w-3" />,
  cbc: <Droplets className="h-3 w-3" />,
  cardiovascular: <Heart className="h-3 w-3" />,
  liver: <Flame className="h-3 w-3" />,
  kidney: <Beaker className="h-3 w-3" />,
  electrolytes: <Activity className="h-3 w-3" />,
  metabolic: <Pill className="h-3 w-3" />,
  thyroid: <TestTube className="h-3 w-3" />,
  muscle: <Activity className="h-3 w-3" />,
  nutrients: <Pill className="h-3 w-3" />,
  immune: <Shield className="h-3 w-3" />,
};

export const SEVERITY_STYLES: Record<Severity, string> = {
  normal: "border-[var(--success)]/30 bg-[var(--success)]/10 text-[var(--success)]",
  yellow: "border-[var(--warning)]/30 bg-[var(--warning)]/15 text-[var(--warning)]",
  high: "border-[var(--danger)]/30 bg-[var(--danger)]/15 text-[var(--danger)]",
  low: "border-[var(--intel)]/30 bg-[var(--intel-dim)] text-[var(--intel)]",
  stop: "border-[var(--danger)]/50 bg-[var(--danger)]/20 text-[var(--danger)]",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  normal: "Normal",
  yellow: "Caution",
  high: "High",
  low: "Low",
  stop: "Stop",
};

export const CATEGORY_TAG_STYLES = {
  stop: "border-[var(--danger)]/40 bg-[var(--danger)]/15 text-[var(--danger)]",
  caut: "border-[var(--warning)]/30 bg-[var(--warning)]/15 text-[var(--warning)]",
  easy: "border-[var(--success)]/30 bg-[var(--success)]/15 text-[var(--success)]",
  step: "border-[var(--protocol)]/30 bg-[var(--protocol-dim)] text-[var(--protocol)]",
} as const;

export function severityBadgeLabel(severity: Severity): string {
  return severity === "stop" ? "STOP" : SEVERITY_LABELS[severity].toUpperCase();
}

export function scoreColor(score: number | null): string {
  if (score === null) return "text-[var(--muted)]";
  if (score >= 90) return ui.statSuccess;
  if (score >= 75) return ui.statWarning;
  return ui.statDanger;
}

export function scoreBarColor(score: number | null): string {
  if (score === null) return "bg-[var(--bg-hover)]";
  if (score >= 90) return "bg-[var(--success)]";
  if (score >= 75) return "bg-[var(--warning)]";
  if (score >= 60) return "bg-[var(--warning)]";
  return "bg-[var(--danger)]";
}

export function optimalRangeLabel(): string {
  return "Optimal target";
}

export function CompoundPills({ compoundIds }: { compoundIds?: string[] }) {
  if (!compoundIds?.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {compoundIds.map((id) => (
        <span
          key={id}
          className="rounded-full border border-[var(--protocol)]/30 bg-[var(--protocol-dim)] px-2 py-0.5 text-[9px] font-bold uppercase text-[var(--protocol)]"
        >
          {getCompoundById(id)?.shortName ?? id}
        </span>
      ))}
    </div>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase",
        SEVERITY_STYLES[severity]
      )}
    >
      {severityBadgeLabel(severity)}
    </span>
  );
}