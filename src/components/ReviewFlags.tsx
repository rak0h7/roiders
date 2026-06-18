"use client";

import { useApp } from "@/context/AppContext";
import { useNavigation } from "@/context/NavigationContext";
import { useCycleStore } from "@/store/cycleStore";
import { getCompoundById } from "@/data/compounds";
import { Panel } from "@/components/ui/Panel";
import { LabsActionBar } from "@/components/labs/LabsActionBar";
import { useLabsActions } from "@/components/labs/useLabsActions";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { ChevronDown, AlertTriangle, FlaskConical } from "lucide-react";
import { useState } from "react";
import type { ReviewFlag, Severity } from "@/lib/types";

const SEVERITY_STYLES: Record<Severity, string> = {
  normal: "border-[var(--success)]/30 bg-[var(--success)]/15 text-[var(--success)]",
  yellow: "border-[var(--warning)]/30 bg-[var(--warning)]/15 text-[var(--warning)]",
  high: "border-[var(--danger)]/30 bg-[var(--danger)]/15 text-[var(--danger)]",
  low: "border-[var(--intel)]/30 bg-[var(--intel-dim)] text-[var(--intel)]",
  stop: "border-[var(--danger)]/50 bg-[var(--danger)]/20 text-[var(--danger)]",
};

function CompoundPills({ compoundIds }: { compoundIds?: string[] }) {
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

export function ReviewFlags() {
  const { reviewFlags, rangeMode, setRangeMode, extractionFileName, setLogView } = useApp();
  const { compounds } = useCycleStore();
  const { setRoute } = useNavigation();
  const { saveAndOpenInsights, openInsights, markerCount } = useLabsActions();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const labFlags = reviewFlags.filter((f) => f.source !== "cycle");
  const cycleFlags = reviewFlags.filter((f) => f.source === "cycle");
  const cycleLinkedLabFlags = labFlags.filter((f) => f.relatedCompounds?.length);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderFlag = (flag: ReviewFlag) => (
    <Panel
      key={flag.markerId}
      className={cn(
        "border-l-4 p-0",
        flag.source === "cycle" ? "border-l-[var(--protocol)]" : "border-l-[var(--warning)]"
      )}
    >
      <button
        onClick={() => toggle(flag.markerId)}
        className="flex w-full items-start justify-between p-4 text-left"
      >
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-semibold text-[var(--foreground)]">{flag.name}</span>
            <span className="text-[10px] text-[var(--muted)]">{flag.date}</span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase",
                SEVERITY_STYLES[flag.severity]
              )}
            >
              {flag.severity === "stop" ? "STOP" : flag.severity.toUpperCase()}
            </span>
            {flag.source === "cycle" && (
              <span className="rounded-full border border-[var(--protocol)]/30 bg-[var(--protocol-dim)] px-2 py-0.5 text-[9px] font-bold uppercase text-[var(--protocol)]">
                Cycle-linked
              </span>
            )}
            <span className="text-[9px] text-[var(--muted-2)]">Interpretation only - No dosing</span>
          </div>

          {flag.value !== undefined && flag.unit ? (
            <p className={cn("mt-1 text-sm font-bold", ui.statDanger)}>
              {flag.value} {flag.unit}
              {flag.sourceUnit && flag.sourceUnit !== flag.unit && (
                <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                  (source {flag.sourceValue} {flag.sourceUnit})
                </span>
              )}
            </p>
          ) : (
            <p className="mt-1 text-sm font-semibold text-[var(--protocol)]">Not on current panel</p>
          )}

          {flag.labRange && flag.optimalRange && (
            <p className="mt-1 text-[10px] text-[var(--muted)]">
              Lab: {flag.labRange} | Optimal: {flag.optimalRange}
              {flag.cautionRange && ` | Caution: ${flag.cautionRange}`}
              {flag.strictThreshold && ` | Strict threshold: #${flag.strictThreshold}`}
            </p>
          )}

          <CompoundPills compoundIds={flag.relatedCompounds} />

          {expanded.has(flag.markerId) && (
            <div className="mt-2 space-y-1">
              <p className="text-xs text-[var(--warning)]">{flag.deviation}</p>
              {flag.recommendation && (
                <p className="text-xs text-[var(--foreground)]/80">{flag.recommendation}</p>
              )}
            </div>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[var(--muted)] transition",
            expanded.has(flag.markerId) && "rotate-180"
          )}
        />
      </button>
    </Panel>
  );

  return (
    <div className="space-y-4">
      <LabsActionBar
        onBack={() => setLogView("entry")}
        backLabel="Back to Entry"
        showSaveInsights
        onSaveInsights={saveAndOpenInsights}
        saveInsightsLabel="Save & View Insights"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={cn(ui.pageTitle, "text-[var(--labs)]")}>Review Flags</h2>
          <p className="text-xs text-[var(--muted)]">
            {extractionFileName || "manual entry"} • {new Date().toLocaleDateString("en-GB")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setRangeMode(rangeMode === "lab" ? "optimized" : "lab")}
            className={cn(ui.btnSecondary, "text-xs font-bold uppercase")}
          >
            {rangeMode === "lab" ? "Lab Reference Mode" : "Optimized Match"} • Switch
          </button>
          <button
            onClick={() => setRangeMode("optimized")}
            className={cn(
              ui.btnSecondary,
              "border-[var(--protocol)]/30 bg-[var(--protocol-dim)] text-xs font-bold uppercase text-[var(--protocol)]"
            )}
          >
            1–3 Optimize Lab Range
          </button>
        </div>
      </div>

      {compounds.length > 0 && (
        <Panel variant="protocol" className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-[var(--protocol)]" />
                <span className="text-xs font-bold uppercase text-[var(--protocol)]">Active cycle stack</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {compounds.map((c) => (
                  <span
                    key={c.compoundId}
                    className="rounded-full border border-[var(--protocol)]/30 bg-[var(--protocol-dim)] px-2.5 py-1 text-[10px] font-semibold text-[var(--foreground)]"
                  >
                    {getCompoundById(c.compoundId)?.shortName ?? c.compoundId}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Flags below are filtered and enriched based on your current compounds.
              </p>
            </div>
            <button onClick={() => setRoute("cycle-planner")} className={cn(ui.btnSecondary, "text-xs")}>
              Edit stack
            </button>
          </div>
        </Panel>
      )}

      <Panel className="p-3 text-xs text-[var(--muted)]">
        <span className="font-bold uppercase text-[var(--foreground)]">Extraction Summary</span>{" "}
        {markerCount} current markers • {reviewFlags.length} need review
        {cycleFlags.length > 0 && ` (${cycleFlags.length} cycle-linked)`}
        {cycleLinkedLabFlags.length > 0 && ` • ${cycleLinkedLabFlags.length} lab flags tied to stack`}
        <br />
        Active report date: {new Date().toLocaleDateString("en-GB")}
      </Panel>

      <Panel variant="protocol" className="p-4 text-xs text-[var(--foreground)]/80">
        <AlertTriangle className="mb-1 inline h-4 w-4 text-[var(--warning)]" />{" "}
        <strong>Interpretation only.</strong> This is not medical advice. Do not stop, or change any medication,
        treatment, or cycle based on this automated read. Discuss any concerns — especially repeat-tested
        abnormalities — with a qualified clinician.
      </Panel>

      {reviewFlags.length === 0 ? (
        <Panel className="border-[var(--success)]/30 bg-[var(--success)]/5 p-8 text-center">
          <p className="text-[var(--success)]">
            {compounds.length > 0
              ? "No flags — assessed markers within range for your current stack."
              : "No flags — all assessed markers within range."}
          </p>
          {compounds.length === 0 && (
            <p className="mt-2 text-xs text-[var(--muted)]">
              Add compounds in the cycle planner to unlock stack-aware monitoring flags.
            </p>
          )}
          <button onClick={openInsights} className={cn(ui.btnPrimary, "mt-4 text-xs font-bold uppercase")}>
            View Insights
          </button>
        </Panel>
      ) : (
        <div className="space-y-4">
          {cycleFlags.length > 0 && (
            <div className="space-y-2">
              <p className={ui.overline}>Cycle-linked flags</p>
              {cycleFlags.map(renderFlag)}
            </div>
          )}
          {labFlags.length > 0 && (
            <div className="space-y-2">
              <p className={ui.overline}>Lab flags</p>
              {labFlags.map(renderFlag)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}