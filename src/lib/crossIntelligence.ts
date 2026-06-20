import { getCompoundById } from "@/data/compounds";
import type { CycleCompound } from "@/lib/cycleTypes";
import { calculateRiskProfile, hasHepatotoxicOrals } from "@/lib/cycleCalculations";
import { COMPOUND_MONITOR_MARKERS } from "@/lib/compoundMonitorMarkers";
import {
  has19Nor,
  hasAromatizer,
  hasEstrogenControl,
  hasLiverSupport,
} from "@/lib/stackAnalysis";
import type { AppRoute } from "@/context/NavigationContext";
import type { MarkerValue, ReviewFlag } from "@/lib/types";

export type CrossAlertSeverity = "critical" | "warning" | "info";

export interface CrossAlert {
  id: string;
  severity: CrossAlertSeverity;
  title: string;
  message: string;
  recommendation: string;
  route: AppRoute;
  markers?: string[];
  compounds?: string[];
}

function hasMarker(values: Record<string, MarkerValue>, id: string): MarkerValue | undefined {
  return values[id];
}

function flagForMarker(flags: ReviewFlag[], id: string): ReviewFlag | undefined {
  return flags.find((f) => f.markerId === id);
}

export function generateCrossAlerts(
  values: Record<string, MarkerValue>,
  flags: ReviewFlag[],
  compounds: CycleCompound[]
): CrossAlert[] {
  const alerts: CrossAlert[] = [];

  if (compounds.length === 0 && Object.keys(values).length === 0) return alerts;

  const hepatotoxic = hasHepatotoxicOrals(compounds);
  const altFlag = flagForMarker(flags, "alt");
  const astFlag = flagForMarker(flags, "ast");
  const ggtFlag = flagForMarker(flags, "ggt");

  if (hepatotoxic && (altFlag || astFlag || ggtFlag)) {
    const sev = [altFlag, astFlag, ggtFlag].some((f) => f?.severity === "stop" || f?.severity === "high")
      ? "critical" as const
      : "warning" as const;
    alerts.push({
      id: "liver-hepatotoxic",
      severity: sev,
      title: "Liver stress + hepatotoxic orals",
      message: "Elevated liver enzymes detected while running hepatotoxic oral compounds.",
      recommendation: "Add TUDCA/NAC, reduce oral dose, or pause orals until enzymes normalize.",
      route: "cycle-planner",
      markers: ["alt", "ast", "ggt"].filter((m) => values[m]),
      compounds: compounds.filter((c) => getCompoundById(c.compoundId)?.hepatotoxic).map((c) => c.compoundId),
    });
  } else if (hepatotoxic && !hasLiverSupport(compounds)) {
    alerts.push({
      id: "liver-no-support",
      severity: "warning",
      title: "Hepatotoxic stack without liver support",
      message: "Your cycle includes oral hepatotoxic compounds but no liver support ancillary.",
      recommendation: "Consider adding TUDCA (500mg daily) or NAC (600mg daily) to your stack.",
      route: "cycle-planner",
      compounds: compounds.filter((c) => getCompoundById(c.compoundId)?.hepatotoxic).map((c) => c.compoundId),
    });
  }

  const hctFlag = flagForMarker(flags, "hematocrit");
  const hgbFlag = flagForMarker(flags, "hemoglobin");
  if ((hctFlag || hgbFlag) && compounds.length > 0) {
    const sev = hctFlag?.severity === "stop" || hctFlag?.severity === "high" ? "critical" : "warning";
    alerts.push({
      id: "polycythemia",
      severity: sev,
      title: "Elevated hematocrit / hemoglobin",
      message: "Polycythemia risk is elevated — common with testosterone and EQ cycles.",
      recommendation: "Schedule therapeutic phlebotomy, increase cardio, and monitor CBC weekly.",
      route: "bloodwork-insights",
      markers: ["hematocrit", "hemoglobin"].filter((m) => values[m]),
    });
  }

  const e2Flag = flagForMarker(flags, "estradiol");
  if (e2Flag && hasAromatizer(compounds) && !hasEstrogenControl(compounds)) {
    alerts.push({
      id: "e2-no-ai",
      severity: e2Flag.severity === "stop" || e2Flag.severity === "high" ? "critical" : "warning",
      title: "High estradiol without AI on stack",
      message: "Estradiol is flagged while running aromatizing compounds with no estrogen control.",
      recommendation: "Add Aromasin or Arimidex to your cycle planner stack.",
      route: "cycle-planner",
      markers: ["estradiol"],
    });
  }

  const prolactinFlag = flagForMarker(flags, "prolactin");
  if (prolactinFlag && has19Nor(compounds)) {
    alerts.push({
      id: "prolactin-19nor",
      severity: prolactinFlag.severity === "stop" ? "critical" : "warning",
      title: "Prolactin elevation on 19-nor stack",
      message: "19-nor compounds (Deca/NPP/Tren) commonly elevate prolactin.",
      recommendation: "Consider Cabergoline (0.25mg 2x/week) and monitor prolactin every 4–6 weeks.",
      route: "cycle-planner",
      markers: ["prolactin"],
      compounds: compounds.filter((c) => getCompoundById(c.compoundId)?.tags.includes("19-nor")).map((c) => c.compoundId),
    });
  }

  const ldlFlag = flagForMarker(flags, "ldl");
  const hdlFlag = flagForMarker(flags, "hdl");
  const riskProfile = calculateRiskProfile(compounds);
  const cardioRisk = riskProfile.find((r) => r.axis === "CARDIO");

  if ((ldlFlag || hdlFlag) && cardioRisk && cardioRisk.score > 3) {
    alerts.push({
      id: "lipids-cardio",
      severity: ldlFlag?.severity === "stop" || hdlFlag?.severity === "high" ? "critical" : "warning",
      title: "Lipid panel + cardiovascular load",
      message: "Lipid markers are flagged while your cycle carries elevated cardiovascular risk.",
      recommendation: "Add omega-3, citrus bergamot, increase cardio. Consider reducing tren/oral load.",
      route: "cycle-dashboard",
      markers: ["ldl", "hdl", "triglycerides"].filter((m) => values[m]),
    });
  }

  const creatFlag = flagForMarker(flags, "creatinine");
  const egfrVal = hasMarker(values, "egfr");
  if (creatFlag && compounds.length >= 3) {
    alerts.push({
      id: "kidney-load",
      severity: "warning",
      title: "Kidney markers under multi-compound load",
      message: "Creatinine is flagged with a complex multi-compound cycle running.",
      recommendation: "Increase hydration, monitor eGFR, and avoid NSAIDs during cycle.",
      route: "bloodwork-insights",
      markers: ["creatinine", "egfr"].filter((m) => values[m] || egfrVal),
    });
  }

  if (compounds.length > 0 && Object.keys(values).length === 0) {
    alerts.push({
      id: "no-bloodwork",
      severity: "info",
      title: "Cycle active — no bloodwork logged",
      message: "You have compounds configured but no lab values on file.",
      recommendation: "Log a baseline blood panel before starting your cycle.",
      route: "bloodwork-log",
    });
  }

  if (Object.keys(values).length > 0 && compounds.length === 0) {
    alerts.push({
      id: "no-cycle",
      severity: "info",
      title: "Bloodwork logged — no cycle planned",
      message: "Lab values are on file. Plan your cycle to get cross-module risk analysis.",
      recommendation: "Open the cycle planner to build your stack and see saturation projections.",
      route: "cycle-planner",
    });
  }

  for (const compound of compounds) {
    const hint = COMPOUND_MONITOR_MARKERS[compound.compoundId];
    if (!hint) continue;
    const def = getCompoundById(compound.compoundId);
    const title = def ? `${def.shortName} — on-cycle monitoring` : "On-cycle monitoring";
    const missing = hint.markers.filter((m) => !values[m]);
    if (missing.length === hint.markers.length) {
      alerts.push({
        id: `markers-missing-${compound.compoundId}`,
        severity: "info",
        title,
        message: `${hint.note} None of the expected markers (${hint.markers.join(", ")}) are on your current panel.`,
        recommendation: "Add these markers to your next blood draw for on-cycle monitoring.",
        route: "bloodwork-log",
        markers: hint.markers,
        compounds: [compound.compoundId],
      });
    }
  }

  const severityOrder: Record<CrossAlertSeverity, number> = { critical: 0, warning: 1, info: 2 };
  return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}