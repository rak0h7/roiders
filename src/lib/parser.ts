import { MARKERS } from "./markers";
import type { ExtractedMarker, MarkerValue } from "./types";
import { getOptimalStatus } from "./ranges";
import { normalizeToDefaultUnit, normalizeUnitString } from "./units";

function normalizeAlias(s: string): string {
  return s
    .toLowerCase()
    .replace(/[®™]/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findMarker(name: string) {
  const normalized = normalizeAlias(name);
  if (!normalized || normalized.length < 2) return null;

  let best: (typeof MARKERS)[number] | null = null;
  let bestScore = 0;

  for (const marker of MARKERS) {
    const candidates = [marker.name, ...marker.aliases];
    for (const alias of candidates) {
      const aliasNorm = normalizeAlias(alias);
      if (!aliasNorm) continue;

      if (aliasNorm === normalized) return marker;

      if (normalized.startsWith(aliasNorm) || aliasNorm.startsWith(normalized)) {
        const score = aliasNorm.length;
        if (score > bestScore) {
          best = marker;
          bestScore = score;
        }
      }
    }
  }

  return bestScore >= 4 ? best : null;
}

const DATE_PATTERN = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/;

const UNIT_PATTERN =
  /(?:%|ratio|mmol\/L|µmol\/L|umol\/L|nmol\/L|pmol\/L|mg\/dL|ng\/dL|ng\/mL|pg\/mL|g\/dL|g\/L|U\/L|IU\/L|mIU\/L|µIU\/mL|mEq\/L|mmol\/mol|mL\/min\/1\.73m²|K\/µL|M\/µL|x10\^\d+\/L|x10\^\d+\/µL|fL|pg|mg\/L|IU\/mL|kU\/L)/i;

function parseNumericValue(raw: string): number | null {
  const cleaned = raw.replace(/[<>≤≥\s]/g, "").replace(",", ".");
  const value = parseFloat(cleaned);
  return Number.isFinite(value) ? value : null;
}

function extractUnitFromTail(tail: string): string | undefined {
  const unitMatch = tail.match(UNIT_PATTERN);
  return unitMatch ? normalizeUnitString(unitMatch[0]) : undefined;
}

function tryParseLine(line: string, reportDate: string, seen: Set<string>): ExtractedMarker | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length < 4) return null;

  const patterns: RegExp[] = [
    /^(.+?)[\s:,]+([<>≤≥]?\s*[\d.,]+)\s+([^\d\s].+)$/i,
    /^(.+?)[\s:,]+([<>≤≥]?\s*[\d.,]+)\s*(%)\s*$/i,
    /^(.+?)[\s:,]+([<>≤≥]?\s*[\d.,]+)\s*$/i,
    /^(.+?)\t+([<>≤≥]?\s*[\d.,]+)\s*(.*)$/i,
    /^(.+?)\s{2,}([<>≤≥]?\s*[\d.,]+)\s*(.*)$/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (!match) continue;

    let name = match[1].trim().replace(/^[\-›•*\s]+/, "").replace(/:+$/, "").trim();
    name = name.replace(/\s*\(.*?\)\s*$/, "").trim();
    if (!name || /^(test|result|value|reference|range|unit|flag)$/i.test(name)) continue;

    const value = parseNumericValue(match[2]);
    if (value === null) continue;

    const marker = findMarker(name);
    if (!marker || seen.has(marker.id)) continue;

    const unitFromMatch = match[3] ? extractUnitFromTail(match[3]) : undefined;
    const unit = unitFromMatch || marker.defaultUnit;
    const normalized = normalizeToDefaultUnit(marker.id, value, unit, marker.defaultUnit);
    const labStatus = getOptimalStatus(marker, normalized.value, normalized.unit);

    seen.add(marker.id);
    return {
      id: `${marker.id}-${Date.now()}-${seen.size}`,
      markerId: marker.id,
      name: marker.name,
      value: normalized.value,
      unit: normalized.unit,
      sourceValue: normalized.sourceValue,
      sourceUnit: normalized.sourceUnit,
      converted: normalized.converted,
      date: reportDate,
      labStatus,
      selected: labStatus !== "in-range",
      needsReview: labStatus !== "in-range",
    };
  }

  return null;
}

export function preprocessLabText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/(\d)\s+(\d)/g, "$1$2")
    .split("\n")
    .map((line) => line.replace(/\s{2,}/g, "\t").trim())
    .filter(Boolean)
    .join("\n");
}

export function parseLabText(text: string, defaultDate?: string): ExtractedMarker[] {
  const lines = preprocessLabText(text).split("\n");
  const results: ExtractedMarker[] = [];
  const seen = new Set<string>();
  let reportDate = defaultDate ?? new Date().toLocaleDateString("en-GB");

  for (const line of lines) {
    const dateMatch = line.match(DATE_PATTERN);
    if (dateMatch) reportDate = dateMatch[1];

    const parsed = tryParseLine(line, reportDate, seen);
    if (parsed) results.push(parsed);
  }

  if (results.length === 0) {
    const blob = preprocessLabText(text).replace(/\n/g, " ");
    const fallbackPattern =
      /([A-Za-z][A-Za-z0-9\s\-\/\(\)\.]{2,40}?)[\s:,]+([<>≤≥]?\s*[\d.,]+)\s*([A-Za-z%µ\/\^0-9²³\.]+)?/g;
    let match: RegExpExecArray | null;

    while ((match = fallbackPattern.exec(blob)) !== null) {
      const parsed = tryParseLine(
        `${match[1]} ${match[2]}${match[3] ? ` ${match[3]}` : ""}`,
        reportDate,
        seen
      );
      if (parsed) results.push(parsed);
    }
  }

  return results;
}

export function parseCSV(text: string): ExtractedMarker[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const results: ExtractedMarker[] = [];
  const seen = new Set<string>();
  const reportDate = new Date().toLocaleDateString("en-GB");

  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split(/[,;\t]/).map((p) => p.trim().replace(/^"|"$/g, ""));
    if (parts.length < 2) continue;
    if (i === 0 && /marker|test|name/i.test(parts[0])) continue;

    const name = parts[0];
    const value = parseNumericValue(parts[1]);
    if (value === null) continue;

    const marker = findMarker(name);
    if (!marker || seen.has(marker.id)) continue;

    const unit = parts[2] ? normalizeUnitString(parts[2]) : marker.defaultUnit;
    const normalized = normalizeToDefaultUnit(marker.id, value, unit, marker.defaultUnit);
    const labStatus = getOptimalStatus(marker, normalized.value, normalized.unit);

    seen.add(marker.id);
    results.push({
      id: `${marker.id}-${Date.now()}-${results.length}`,
      markerId: marker.id,
      name: marker.name,
      value: normalized.value,
      unit: normalized.unit,
      sourceValue: normalized.sourceValue,
      sourceUnit: normalized.sourceUnit,
      converted: normalized.converted,
      date: parts[3] || reportDate,
      labStatus,
      selected: labStatus !== "in-range",
      needsReview: labStatus !== "in-range",
    });
  }

  return results;
}

export const SAMPLE_LAB_TEXT = `Testosterone, Total: 850 ng/dL
Estradiol: 42 pg/mL
ALT: 35 U/L
Hematocrit: 45.1 %
Hemoglobin: 15.2 g/dL
Platelets: 265 K/µL
WBC Count: 6.80 K/µL
Creatinine: 0.92 mg/dL
LDL Cholesterol: 95 mg/dL
HDL Cholesterol: 55 mg/dL
Triglycerides: 110 mg/dL
Fasting Glucose: 88 mg/dL`;

export const DEMO_LAB_TEXT = `Albumin: 4.00 g/dL
ALP: 98.0 U/L
ALT: 145 U/L
Anion Gap: 12.0 mEq/L
AST: 88.0 U/L
Basophils (abs): 0.10 x10^9/L
Bicarbonate / CO2: 29.0 mmol/L
Bilirubin (Total): 0.58 mg/dL
Chloride: 103 mmol/L
Chol/HDL Ratio: 5.78 ratio
Creatinine: 1.64 mg/dL
eGFR: 55.0 mL/min/1.73m²
Eosinophils (abs): 0.30 x10^9/L
Fasting Glucose: 82.9 mg/dL
GGT: 92.0 U/L
Globulin: 2.90 g/dL
HDL Cholesterol: 38.7 mg/dL
Hematocrit: 57.0 %
Hemoglobin: 17.8 g/dL
LDL Cholesterol: 147 mg/dL
Lymphocytes (abs): 2.80 x10^9/L
MCH: 29.0 pg
MCHC: 35.5 g/dL
MCV: 88.0 fL
Monocytes (abs): 0.70 x10^9/L
Neutrophils (abs): 9.40 x10^9/L
Non-HDL Cholesterol: 182 mg/dL
Platelets: 610 x10^9/L
Potassium: 4.60 mmol/L
RBC Count: 6.10 x10^12/L
RDW: 13.2 %
Sodium: 139 mmol/L
Total Cholesterol: 220 mg/dL
Total Protein: 6.90 g/dL
Triglycerides: 221 mg/dL
Urea: 5.70 mmol/L
WBC Count: 13.2 x10^9/L
Total Testosterone: 1500 ng/dL
Free Testosterone: 433 pg/mL
Estradiol: 49.0 pg/mL`;

/** Mark extracted rows that match markers already loaded in the active panel. */
export function annotateExtractedHistorical(
  extracted: ExtractedMarker[],
  currentValues: Record<string, MarkerValue>
): ExtractedMarker[] {
  if (Object.keys(currentValues).length === 0) return extracted;
  return extracted.map((m) => ({
    ...m,
    isHistorical: currentValues[m.markerId] !== undefined,
  }));
}