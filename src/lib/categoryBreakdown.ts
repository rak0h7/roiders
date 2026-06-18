import { MARKERS_BY_CATEGORY } from "./markers";
import { evaluateSeverity, formatRange } from "./ranges";
import type { MarkerCategory, MarkerValue, RangeMode, ReviewFlag, Severity } from "./types";

export const CATEGORY_DESCRIPTIONS: Record<MarkerCategory, string> = {
  hormonal:
    "Sex hormones, gonadotropins, and growth-axis markers — heavily shifted by exogenous androgens, aromatization, and 19-nor compounds.",
  cbc:
    "Red cell mass and oxygen-carrying capacity. Testosterone and EQ commonly push hematocrit — primary polycythemia risk marker on-cycle.",
  cardiovascular:
    "Lipid panel and cardiovascular load. Oral steroids and tren often crush HDL; monitor alongside protocol risk.",
  liver:
    "Hepatocellular enzymes and synthetic function. 17α-alkylated orals and high-dose tren elevate ALT/AST.",
  kidney:
    "Filtration markers and waste clearance. Dehydration, high protein, and certain compounds can stress kidney markers.",
  electrolytes:
    "Sodium, potassium, and related balance — relevant for cramping, blood pressure, and diuretic use.",
  metabolic:
    "Glucose regulation and insulin sensitivity. GH, slin, and some orals can shift fasting glucose and HbA1c.",
  thyroid:
    "TSH and peripheral thyroid hormones. Androgens and caloric stress can subtly affect thyroid axis.",
  muscle:
    "Muscle breakdown and tissue turnover markers. Elevated CK/LDH after heavy training or rhabdo risk.",
  nutrients:
    "Vitamins, iron, and micronutrient status — often overlooked but critical for recovery and hematology.",
  immune:
    "White cell differentials and immune markers beyond core CBC counts.",
};

export interface CategoryMarkerRow {
  markerId: string;
  name: string;
  value: number | null;
  unit: string;
  severity: Severity;
  deviation: string;
  labRange: string;
  activeRange: string;
  cautionRange?: string;
  strictThreshold?: number;
  relatedCompounds?: string[];
  recommendation?: string;
  source?: ReviewFlag["source"];
  logged: boolean;
}

const SEVERITY_ORDER: Severity[] = ["stop", "high", "yellow", "low", "normal"];

export function cycleWatchFlagId(markerId: string): string {
  return `cycle-watch-${markerId}`;
}

export function resolveFlagForMarker(
  markerId: string,
  flagMap: Map<string, ReviewFlag>
): ReviewFlag | undefined {
  return (
    flagMap.get(markerId) ??
    flagMap.get(cycleWatchFlagId(markerId)) ??
    (markerId === "estradiol" ? flagMap.get("cycle-watch-estradiol-control") : undefined)
  );
}

export function buildCategoryMarkerRows(
  category: MarkerCategory,
  values: Record<string, MarkerValue>,
  reviewFlags: ReviewFlag[],
  rangeMode: RangeMode
): CategoryMarkerRow[] {
  const markers = MARKERS_BY_CATEGORY[category] ?? [];
  const flagMap = new Map(reviewFlags.map((f) => [f.markerId, f]));

  const rows: CategoryMarkerRow[] = markers.map((marker) => {
    const val = values[marker.id];
    const flag = resolveFlagForMarker(marker.id, flagMap);
    const labRange = (formatRange(marker.range, "lab", "lab") + marker.defaultUnit).trim();
    const activeRange = (formatRange(marker.range, rangeMode, "optimal") + marker.defaultUnit).trim();
    const cautionRange =
      marker.range.cautionMin !== undefined
        ? (formatRange(marker.range, rangeMode, "caution") + marker.defaultUnit).trim()
        : undefined;

    const shared = {
      markerId: marker.id,
      name: marker.name,
      labRange,
      activeRange,
      cautionRange,
      strictThreshold: marker.range.strictThreshold,
      relatedCompounds: flag?.relatedCompounds,
      recommendation: flag?.recommendation,
      source: flag?.source,
    };

    if (!val) {
      return {
        ...shared,
        value: null,
        unit: marker.defaultUnit,
        severity: flag?.severity ?? "normal",
        deviation: flag?.deviation ?? "",
        logged: false,
      };
    }

    const { severity, deviation } = evaluateSeverity(marker, val.value, val.unit, rangeMode);

    return {
      ...shared,
      value: val.value,
      unit: val.unit,
      severity,
      deviation: deviation || flag?.deviation || "",
      logged: true,
    };
  });

  return rows.sort((a, b) => {
    const aFlagged = a.severity !== "normal" || !a.logged;
    const bFlagged = b.severity !== "normal" || !b.logged;
    if (aFlagged !== bFlagged) return aFlagged ? -1 : 1;
    const aIdx = SEVERITY_ORDER.indexOf(a.severity);
    const bIdx = SEVERITY_ORDER.indexOf(b.severity);
    if (aIdx !== bIdx) return aIdx - bIdx;
    return a.name.localeCompare(b.name);
  });
}

export function summarizeCategoryRows(rows: CategoryMarkerRow[]) {
  const flagged = rows.filter((r) => r.logged && r.severity !== "normal").length;
  const normal = rows.filter((r) => r.logged && r.severity === "normal").length;
  const missing = rows.filter((r) => !r.logged).length;
  const cycleLinked = rows.filter((r) => r.source === "cycle" || r.relatedCompounds?.length).length;
  return { flagged, normal, missing, cycleLinked, total: rows.length };
}