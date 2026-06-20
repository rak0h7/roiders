import { getCompoundById } from "@/data/compounds";
import { COMPOUND_MONITOR_MARKERS } from "@/lib/compoundMonitorMarkers";
import { hasHepatotoxicOrals } from "@/lib/cycleCalculations";
import type { CycleCompound } from "@/lib/cycleTypes";
import { MARKER_MAP } from "@/lib/markers";
import { buildReviewFlags } from "@/lib/ranges";
import {
  compoundsLinkedToMarker,
  has19Nor,
  hasAromatizer,
  hasEstrogenControl,
  hasLiverSupport,
} from "@/lib/stackAnalysis";
import type { MarkerValue, ReviewFlag, Severity } from "@/lib/types";

export { COMPOUND_MONITOR_MARKERS } from "@/lib/compoundMonitorMarkers";

const SEVERITY_ORDER: Severity[] = ["stop", "high", "yellow", "low"];

function compoundLabel(compoundId: string): string {
  return getCompoundById(compoundId)?.shortName ?? compoundId;
}

export function enrichLabFlagsWithCycleContext(flags: ReviewFlag[], compounds: CycleCompound[]): ReviewFlag[] {
  if (compounds.length === 0) return flags;

  return flags.map((flag) => {
    const linked = compoundsLinkedToMarker(flag.markerId, compounds);
    if (linked.length === 0) return { ...flag, source: "lab" as const };

    const names = linked.map((c) => compoundLabel(c.compoundId));
    return {
      ...flag,
      source: "stack" as const,
      relatedCompounds: linked.map((c) => c.compoundId),
      deviation: `${flag.deviation} • Linked to your stack: ${names.join(", ")}`,
    };
  });
}

function collectExpectedMarkers(compounds: CycleCompound[]): Map<string, Set<string>> {
  const expected = new Map<string, Set<string>>();

  for (const compound of compounds) {
    const hint = COMPOUND_MONITOR_MARKERS[compound.compoundId];
    if (!hint) continue;
    for (const markerId of hint.markers) {
      if (!expected.has(markerId)) expected.set(markerId, new Set());
      expected.get(markerId)!.add(compound.compoundId);
    }
  }

  return expected;
}

export function buildCycleReviewFlags(
  compounds: CycleCompound[],
  values: Record<string, MarkerValue>,
  labFlags: ReviewFlag[],
  date: string
): ReviewFlag[] {
  if (compounds.length === 0) return [];

  const flags: ReviewFlag[] = [];
  const onPanel = new Set(Object.keys(values));
  const flaggedMarkers = new Set(labFlags.map((f) => f.markerId));

  for (const [markerId, compoundIds] of collectExpectedMarkers(compounds)) {
    if (onPanel.has(markerId) || flaggedMarkers.has(markerId)) continue;

    const marker = MARKER_MAP.get(markerId);
    if (!marker) continue;

    const names = [...compoundIds].map(compoundLabel);
    const aromatizerNoAi =
      markerId === "estradiol" && hasAromatizer(compounds) && !hasEstrogenControl(compounds);

    flags.push({
      markerId: `cycle-watch-${markerId}`,
      name: `${marker.name} — not on panel`,
      date,
      severity: "yellow",
      deviation: aromatizerNoAi
        ? "Aromatizing compounds on stack with no estrogen control ancillary logged."
        : `${names.join(", ")} on your stack — ${COMPOUND_MONITOR_MARKERS[[...compoundIds][0]]?.note ?? "monitor on-cycle."}`,
      recommendation: aromatizerNoAi
        ? "Monitor estradiol every 4–6 weeks; add an AI to your stack if E2 climbs."
        : `Add ${marker.name.toLowerCase()} to your panel for stack-aware monitoring.`,
      noDosing: true,
      source: "cycle",
      relatedCompounds: [...compoundIds],
    });
  }

  const hepatotoxic = hasHepatotoxicOrals(compounds);
  if (hepatotoxic && !hasLiverSupport(compounds)) {
    flags.push({
      markerId: "cycle-stack-liver-support",
      name: "Liver support missing",
      date,
      severity: "yellow",
      deviation: "Hepatotoxic oral compounds are on your stack without TUDCA/NAC.",
      recommendation: "Consider adding TUDCA (500mg daily) or NAC (600mg daily) to your cycle planner.",
      noDosing: true,
      source: "cycle",
      relatedCompounds: compounds
        .filter((c) => getCompoundById(c.compoundId)?.hepatotoxic)
        .map((c) => c.compoundId),
    });
  }

  const e2Flag = labFlags.find((f) => f.markerId === "estradiol");
  if (e2Flag && hasAromatizer(compounds) && !hasEstrogenControl(compounds)) {
    flags.push({
      markerId: "cycle-stack-e2-no-ai",
      name: "High estradiol without AI",
      value: e2Flag.value,
      unit: e2Flag.unit,
      date,
      severity: e2Flag.severity === "stop" || e2Flag.severity === "high" ? "high" : "yellow",
      optimalRange: e2Flag.optimalRange,
      deviation: "Estradiol is flagged while running aromatizing compounds with no estrogen control on your stack.",
      recommendation: "Add Aromasin or Arimidex to your cycle planner stack.",
      noDosing: true,
      source: "cycle",
      relatedCompounds: compounds
        .filter((c) => {
          const def = getCompoundById(c.compoundId);
          return def?.tags.includes("Test") || def?.id.startsWith("test-") || def?.id === "dbol";
        })
        .map((c) => c.compoundId),
    });
  }

  const prolactinFlag = labFlags.find((f) => f.markerId === "prolactin");
  if (prolactinFlag && has19Nor(compounds)) {
    flags.push({
      markerId: "cycle-stack-prolactin-19nor",
      name: "Prolactin elevation on 19-nor stack",
      value: prolactinFlag.value,
      unit: prolactinFlag.unit,
      date,
      severity: prolactinFlag.severity === "stop" ? "high" : "yellow",
      optimalRange: prolactinFlag.optimalRange,
      deviation: "19-nor compounds commonly elevate prolactin — your flagged value aligns with this stack profile.",
      recommendation: "Consider Cabergoline (0.25mg 2x/week) and monitor prolactin every 4–6 weeks.",
      noDosing: true,
      source: "cycle",
      relatedCompounds: compounds
        .filter((c) => getCompoundById(c.compoundId)?.tags.includes("19-nor"))
        .map((c) => c.compoundId),
    });
  }

  if (hepatotoxic) {
    const liverFlag = labFlags.find((f) => ["alt", "ast", "ggt"].includes(f.markerId));
    if (liverFlag) {
      flags.push({
        markerId: "cycle-stack-liver-enzymes",
        name: "Liver enzymes + hepatotoxic orals",
        value: liverFlag.value,
        unit: liverFlag.unit,
        date,
        severity: liverFlag.severity === "stop" || liverFlag.severity === "high" ? "high" : "yellow",
        optimalRange: liverFlag.optimalRange,
        deviation: `Elevated ${liverFlag.name.toLowerCase()} while running hepatotoxic oral compounds.`,
        recommendation: "Add TUDCA/NAC, reduce oral dose, or pause orals until enzymes normalize.",
        noDosing: true,
        source: "cycle",
        relatedCompounds: compounds
          .filter((c) => getCompoundById(c.compoundId)?.hepatotoxic)
          .map((c) => c.compoundId),
      });
    }
  }

  const hctFlag = labFlags.find((f) => f.markerId === "hematocrit" || f.markerId === "hemoglobin");
  if (hctFlag && compounds.length > 0) {
    const linked = compoundsLinkedToMarker(hctFlag.markerId, compounds);
    if (linked.length > 0) {
      const criticalHct = hctFlag.markerId === "hematocrit" && (hctFlag.value ?? 0) >= 52;
      flags.push({
        markerId: "cycle-stack-polycythemia",
        name: criticalHct ? "Critical hematocrit — stop androgens" : "Elevated hematocrit / hemoglobin",
        value: hctFlag.value,
        unit: hctFlag.unit,
        date,
        severity: criticalHct || hctFlag.severity === "stop" ? "stop" : hctFlag.severity === "high" ? "high" : "yellow",
        optimalRange: hctFlag.optimalRange,
        deviation: criticalHct
          ? "Hematocrit is at or above 52% — major cardiovascular risk on an androgen stack."
          : "Polycythemia risk is elevated — common with testosterone and EQ cycles.",
        recommendation: criticalHct
          ? "Reduce or stop androgen dose immediately. Book therapeutic phlebotomy, stay hydrated, and recheck CBC within a week."
          : "Schedule therapeutic phlebotomy, increase cardio, and monitor CBC weekly.",
        noDosing: true,
        source: "cycle",
        relatedCompounds: linked.map((c) => c.compoundId),
      });
    }
  }

  return flags;
}

export function buildMergedReviewFlags(
  values: MarkerValue[],
  date: string,
  compounds: CycleCompound[],
  valuesRecord: Record<string, MarkerValue>
): ReviewFlag[] {
  const labFlags = buildReviewFlags(values, date);
  const enriched = enrichLabFlagsWithCycleContext(labFlags, compounds);
  const cycleFlags = buildCycleReviewFlags(compounds, valuesRecord, enriched, date);

  const seen = new Set<string>();
  const merged: ReviewFlag[] = [];

  for (const flag of [...enriched, ...cycleFlags]) {
    if (seen.has(flag.markerId)) continue;
    seen.add(flag.markerId);
    merged.push(flag);
  }

  return merged.sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));
}