import { MARKER_MAP } from "./markers";
import type { MarkerDefinition, MarkerRange, ReviewFlag, Severity } from "./types";
import { normalizeToDefaultUnit } from "./units";

export function formatOptimalRange(range: MarkerRange): string {
  if (range.upperOnly && range.optimalMax !== undefined) return `<${range.optimalMax} `;
  if (range.lowerOnly && range.optimalMin !== undefined) return `>${range.optimalMin} `;
  if (range.optimalMin !== undefined && range.optimalMax !== undefined) {
    return `${range.optimalMin}-${range.optimalMax} `;
  }
  return "";
}

export function formatCautionRange(range: MarkerRange): string {
  if (range.cautionMin !== undefined && range.cautionMax !== undefined) {
    return `${range.cautionMin}-${range.cautionMax} `;
  }
  return "";
}

/** Whether a value sits within optimal bounds (for extraction pre-selection). */
export function getOptimalStatus(
  marker: MarkerDefinition,
  value: number,
  unit: string,
): "in-range" | "high" | "low" {
  const normalized = normalizeToDefaultUnit(marker.id, value, unit, marker.defaultUnit);
  const v = normalized.value;
  const r = marker.range;

  if (r.upperOnly && r.optimalMax !== undefined && v > r.optimalMax) return "high";
  if (r.lowerOnly && r.optimalMin !== undefined && v < r.optimalMin) return "low";
  if (r.optimalMin !== undefined && v < r.optimalMin) return "low";
  if (r.optimalMax !== undefined && v > r.optimalMax) return "high";
  return "in-range";
}

/** @deprecated Use getOptimalStatus */
export const getLabStatus = getOptimalStatus;

export function evaluateSeverity(
  marker: MarkerDefinition,
  value: number,
  unit: string,
): { severity: Severity; deviation: string; isHigh: boolean; isLow: boolean } {
  const normalized = normalizeToDefaultUnit(marker.id, value, unit, marker.defaultUnit);
  const v = normalized.value;
  const r = marker.range;
  const optMin = r.optimalMin;
  const optMax = r.optimalMax;

  let severity: Severity = "normal";
  let deviation = "";
  let isHigh = false;
  let isLow = false;

  if (r.upperOnly && optMax !== undefined && v > optMax) {
    isHigh = true;
    const diff = v - optMax;
    const pct = Math.round((diff / optMax) * 100);
    deviation = `↑ ${diff.toFixed(1)} ${marker.defaultUnit} above optimal max (×${(v / optMax).toFixed(2)})`;

    if (r.strictThreshold && v >= r.strictThreshold) {
      severity = "stop";
      deviation += " above strict app threshold";
    } else if (r.cautionMax && v > r.cautionMax) {
      severity = "high";
      deviation += " above caution band";
    } else if (r.cautionMin && v >= r.cautionMin) {
      severity = "yellow";
      deviation += " in caution band";
    } else {
      severity = "yellow";
    }
    deviation += ` (+${pct}%)`;
  } else if (r.lowerOnly && optMin !== undefined && v < optMin) {
    isLow = true;
    const diff = optMin - v;
    const pct = Math.round((diff / optMin) * 100);
    deviation = `↓ ${diff.toFixed(1)} ${marker.defaultUnit} below optimal min (×${(v / optMin).toFixed(2)}) (+${pct}%)`;
    severity = r.strictThreshold && v <= r.strictThreshold ? "stop" : "low";
  } else if (optMin !== undefined && v < optMin) {
    isLow = true;
    const diff = optMin - v;
    deviation = `↓ ${diff.toFixed(1)} ${marker.defaultUnit} below optimal min`;
    severity = "low";
  } else if (optMax !== undefined && v > optMax) {
    isHigh = true;
    const diff = v - optMax;
    const pct = Math.round((diff / optMax) * 100);
    deviation = `↑ ${diff.toFixed(1)} ${marker.defaultUnit} above optimal max (×${(v / optMax).toFixed(2)}) (+${pct}%)`;

    if (r.strictThreshold && v >= r.strictThreshold) {
      severity = "stop";
      deviation += " above strict app threshold";
    } else if (r.cautionMin !== undefined && r.cautionMax !== undefined && v >= r.cautionMin && v <= r.cautionMax) {
      severity = "yellow";
      deviation += " in caution band";
    } else if (r.cautionMax && v > r.cautionMax) {
      severity = "high";
    } else {
      severity = "yellow";
    }
  }

  return { severity, deviation, isHigh, isLow };
}

export function buildReviewFlags(
  values: { markerId: string; value: number; unit: string; sourceValue?: number; sourceUnit?: string }[],
  date: string,
): ReviewFlag[] {
  const flags: ReviewFlag[] = [];

  for (const val of values) {
    const marker = MARKER_MAP.get(val.markerId);
    if (!marker) continue;

    const { severity, deviation } = evaluateSeverity(marker, val.value, val.unit);
    if (severity === "normal") continue;

    const normalized = normalizeToDefaultUnit(marker.id, val.value, val.unit, marker.defaultUnit);
    const optimalRange = formatOptimalRange(marker.range) + marker.defaultUnit;
    const cautionRange =
      marker.range.cautionMin !== undefined
        ? formatCautionRange(marker.range) + marker.defaultUnit
        : undefined;

    flags.push({
      markerId: marker.id,
      name: marker.name,
      value: normalized.value,
      unit: marker.defaultUnit,
      sourceValue: normalized.sourceValue,
      sourceUnit: normalized.sourceUnit,
      date,
      severity,
      optimalRange: optimalRange.trim(),
      cautionRange: cautionRange?.trim(),
      strictThreshold: marker.range.strictThreshold,
      deviation,
      noDosing: true,
    });
  }

  const order: Severity[] = ["stop", "high", "yellow", "low"];
  return flags.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
}