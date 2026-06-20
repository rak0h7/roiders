import { MARKER_MAP } from "./markers";
import { evaluateSeverity } from "./ranges";
import type { MarkerDefinition, MarkerRange, Severity } from "./types";
import { normalizeToDefaultUnit } from "./units";

export type RangeBarSegmentKind = "low" | "optimal" | "caution" | "high";

export type RangeBarSegment = {
  kind: RangeBarSegmentKind;
  start: number;
  end: number;
};

export type MarkerRangeBarLayout = {
  value: number;
  unit: string;
  severity: Severity;
  domainMin: number;
  domainMax: number;
  valuePercent: number;
  segments: RangeBarSegment[];
};

function toPercent(value: number, min: number, max: number): number {
  if (max <= min) return 0.5;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function collectBounds(range: MarkerRange, value: number): number[] {
  const bounds: number[] = [value];
  if (range.optimalMin !== undefined) bounds.push(range.optimalMin);
  if (range.optimalMax !== undefined) bounds.push(range.optimalMax);
  if (range.cautionMin !== undefined) bounds.push(range.cautionMin);
  if (range.cautionMax !== undefined) bounds.push(range.cautionMax);
  if (range.strictThreshold !== undefined) bounds.push(range.strictThreshold);
  return bounds;
}

function paddedDomain(bounds: number[]): { min: number; max: number } {
  const rawMin = Math.min(...bounds);
  const rawMax = Math.max(...bounds);
  const span = Math.max(rawMax - rawMin, rawMax * 0.05, 1);
  const pad = span * 0.12;
  return { min: rawMin - pad, max: rawMax + pad };
}

function buildSegments(range: MarkerRange, domainMin: number, domainMax: number): RangeBarSegment[] {
  const pct = (n: number) => toPercent(n, domainMin, domainMax);
  const segments: RangeBarSegment[] = [];

  if (range.lowerOnly && range.optimalMin !== undefined) {
    segments.push({ kind: "low", start: 0, end: pct(range.optimalMin) });
    segments.push({ kind: "optimal", start: pct(range.optimalMin), end: 1 });
    return segments;
  }

  if (range.upperOnly && range.optimalMax !== undefined) {
    segments.push({ kind: "optimal", start: 0, end: pct(range.optimalMax) });
    if (range.cautionMax !== undefined) {
      segments.push({ kind: "caution", start: pct(range.optimalMax), end: pct(range.cautionMax) });
      segments.push({ kind: "high", start: pct(range.cautionMax), end: 1 });
    } else {
      segments.push({ kind: "high", start: pct(range.optimalMax), end: 1 });
    }
    return segments;
  }

  const optMin = range.optimalMin ?? domainMin;
  const optMax = range.optimalMax ?? domainMax;

  if (range.optimalMin !== undefined && optMin > domainMin) {
    segments.push({ kind: "low", start: 0, end: pct(optMin) });
  }

  segments.push({ kind: "optimal", start: pct(optMin), end: pct(optMax) });

  if (range.cautionMax !== undefined && range.cautionMax > optMax) {
    const cautionEnd = range.strictThreshold ?? range.cautionMax;
    segments.push({ kind: "caution", start: pct(optMax), end: pct(Math.max(range.cautionMax, optMax)) });
    if (cautionEnd > (range.cautionMax ?? optMax)) {
      segments.push({ kind: "high", start: pct(range.cautionMax ?? optMax), end: 1 });
    }
  } else if (optMax < domainMax) {
    segments.push({ kind: "high", start: pct(optMax), end: 1 });
  }

  if (range.cautionMin !== undefined && range.cautionMin < optMin) {
    const cautionStart = pct(range.cautionMin);
    const optimalStart = pct(optMin);
    if (cautionStart < optimalStart) {
      segments.unshift({ kind: "caution", start: cautionStart, end: optimalStart });
    }
  }

  return mergeAdjacentSegments(segments);
}

function mergeAdjacentSegments(segments: RangeBarSegment[]): RangeBarSegment[] {
  if (segments.length === 0) return segments;
  const merged: RangeBarSegment[] = [];
  for (const seg of segments) {
    const last = merged[merged.length - 1];
    if (last && last.kind === seg.kind && Math.abs(last.end - seg.start) < 0.001) {
      last.end = seg.end;
    } else {
      merged.push({ ...seg });
    }
  }
  return merged.filter((s) => s.end > s.start);
}

export function buildMarkerRangeBar(
  markerId: string,
  value: number,
  unit: string,
): MarkerRangeBarLayout | null {
  const marker = MARKER_MAP.get(markerId);
  if (!marker) return null;

  const normalized = normalizeToDefaultUnit(markerId, value, unit, marker.defaultUnit);
  const v = normalized.value;
  const { severity } = evaluateSeverity(marker, v, marker.defaultUnit);
  const bounds = collectBounds(marker.range, v);
  const { min: domainMin, max: domainMax } = paddedDomain(bounds);

  return {
    value: v,
    unit: marker.defaultUnit,
    severity,
    domainMin,
    domainMax,
    valuePercent: toPercent(v, domainMin, domainMax),
    segments: buildSegments(marker.range, domainMin, domainMax),
  };
}