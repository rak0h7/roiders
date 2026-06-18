/**
 * Multipliers convert FROM the alternate unit TO the marker's default unit.
 * e.g. testosterone nmol/L → ng/dL: value * 28.846
 */
const TO_DEFAULT: Record<string, Record<string, number>> = {
  "total-testosterone": { "nmol/L": 28.846 },
  "free-testosterone": { "pmol/L": 0.28846, "nmol/L": 288.46 },
  estradiol: { "pmol/L": 0.27242 },
  hematocrit: { "L/L": 100 },
  hemoglobin: { "g/L": 0.1 },
  rbc: { "x10^12/L": 1, "x10^6/µL": 1, "M/µL": 1 },
  platelets: { "x10^9/L": 1, "x10^3/µL": 1, "10^9/L": 1, "10^3/uL": 1 },
  wbc: { "x10^9/L": 1, "x10^3/µL": 1, "10^9/L": 1, "10^3/uL": 1 },
  neutrophils: { "x10^9/L": 1, "x10^3/µL": 1, "10^9/L": 1 },
  lymphocytes: { "x10^9/L": 1, "x10^3/µL": 1, "10^9/L": 1 },
  monocytes: { "x10^9/L": 1, "x10^3/µL": 1, "10^9/L": 1 },
  eosinophils: { "x10^9/L": 1, "x10^3/µL": 1, "10^9/L": 1 },
  basophils: { "x10^9/L": 1, "x10^3/µL": 1, "10^9/L": 1 },
  ldl: { "mmol/L": 38.67 },
  hdl: { "mmol/L": 38.67 },
  triglycerides: { "mmol/L": 88.57 },
  "non-hdl": { "mmol/L": 38.67 },
  "total-cholesterol": { "mmol/L": 38.67 },
  creatinine: { "µmol/L": 0.011312, "umol/L": 0.011312 },
  urea: { "mmol/L": 2.801 },
  "fasting-glucose": { "mmol/L": 18.018 },
  albumin: { "g/L": 0.1 },
  "total-protein": { "g/L": 0.1 },
  globulin: { "g/L": 0.1 },
  "bilirubin-total": { "µmol/L": 0.0585, "umol/L": 0.0585 },
  "vitamin-d": { "nmol/L": 0.4006 },
  calcium: { "mmol/L": 4.0 },
  "calcium-corrected": { "mmol/L": 4.0 },
  "uric-acid": { "µmol/L": 0.01681, "umol/L": 0.01681 },
  "dhea-s": { "µmol/L": 36.85, "umol/L": 36.85 },
  dht: { "nmol/L": 29.0 },
  progesterone: { "nmol/L": 0.3145 },
  "cortisol-am": { "nmol/L": 0.0362 },
  iron: { "µmol/L": 5.585, "umol/L": 5.585 },
  b12: { "pmol/L": 1.355 },
  folate: { "nmol/L": 0.4413 },
  shbg: { "nmol/L": 1 },
  hcg: { "IU/L": 1 },
  lh: { "IU/L": 1 },
  fsh: { "IU/L": 1 },
  alt: { "IU/L": 1 },
  ast: { "IU/L": 1 },
  ggt: { "IU/L": 1 },
  alp: { "IU/L": 1 },
  ck: { "IU/L": 1 },
  ldh: { "IU/L": 1 },
  igg: { "g/L": 100 },
  iga: { "g/L": 100 },
  igm: { "g/L": 100 },
  apob: { "g/L": 100 },
  lpa: { "nmol/L": 0.04 },
  hba1c: { "mmol/mol": 0.09148 },
  ige: { "kU/L": 1 },
  c3: { "g/L": 100 },
  c4: { "g/L": 100 },
  transferrin: { "g/L": 100 },
  "cystatin-c": { "mg/L": 1 },
  sodium: { "mEq/L": 1 },
  potassium: { "mEq/L": 1 },
  chloride: { "mEq/L": 1 },
  bicarbonate: { "mEq/L": 1 },
  "anion-gap": { "mmol/L": 1 },
  prolactin: { "mIU/L": 0.04717 },
  magnesium: { "mg/dL": 0.4114 },
  insulin: { "mIU/L": 1 },
  "free-t4": { "pmol/L": 0.0777 },
  "free-t3": { "pmol/L": 0.651 },
  igf1: { "nmol/L": 7.649 },
  mchc: { "g/L": 0.1 },
};

/** Normalize unit strings from PDFs, CSVs, and lab portals. */
export function normalizeUnitString(raw: string): string {
  let u = raw
    .trim()
    .replace(/\s+/g, "")
    .replace(/μ/g, "µ")
    .replace(/ug\//gi, "µg/")
    .replace(/mcg\//gi, "µg/")
    .replace(/UI\//gi, "U/")
    .replace(/units?\//gi, "U/")
    .replace(/\/uL/gi, "/µL")
    .replace(/x10\^(\d+)\/L/gi, "x10^$1/L")
    .replace(/x10\*(\d+)\/L/gi, "x10^$1/L")
    .replace(/(^|[^x\d])10\^(\d+)\/L/gi, "$1x10^$2/L")
    .replace(/10e(\d+)\/L/gi, "x10^$1/L");

  if (/^x10\^9\/L$/i.test(u) || /^10\^9\/L$/i.test(u)) return "x10^9/L";
  if (/^x10\^3\/µL$/i.test(u) || /^10\^3\/µL$/i.test(u)) return "x10^3/µL";
  if (/^K\/µL$/i.test(u)) return "K/µL";
  if (/^M\/µL$/i.test(u)) return "M/µL";
  if (/^g\/dL$/i.test(u)) return "g/dL";
  if (/^mg\/dL$/i.test(u)) return "mg/dL";
  if (/^ng\/dL$/i.test(u)) return "ng/dL";
  if (/^ng\/mL$/i.test(u)) return "ng/mL";
  if (/^pg\/mL$/i.test(u)) return "pg/mL";
  if (/^U\/L$/i.test(u) || /^IU\/L$/i.test(u)) return "U/L";
  if (/^mmol\/L$/i.test(u)) return "mmol/L";
  if (/^µmol\/L$/i.test(u) || /^umol\/L$/i.test(u)) return "µmol/L";
  if (/^nmol\/L$/i.test(u)) return "nmol/L";
  if (/^pmol\/L$/i.test(u)) return "pmol/L";
  if (/^mEq\/L$/i.test(u)) return "mEq/L";
  if (/^mL\/min\/1\.73m²$/i.test(u)) return "mL/min/1.73m²";
  if (/^%$/.test(u)) return "%";

  return u;
}

export function convertValue(
  markerId: string,
  value: number,
  fromUnit: string,
  toUnit: string
): { value: number; converted: boolean } {
  const from = normalizeUnitString(fromUnit);
  const to = normalizeUnitString(toUnit);
  if (from === to) return { value, converted: false };

  // K/µL and x10^9/L are numerically identical for CBC counts
  if (
    (from === "x10^9/L" && to === "K/µL") ||
    (from === "K/µL" && to === "x10^9/L") ||
    (from === "x10^3/µL" && to === "K/µL") ||
    (from === "K/µL" && to === "x10^3/µL")
  ) {
    return { value, converted: true };
  }

  const markerConversions = TO_DEFAULT[markerId];
  if (!markerConversions) return { value, converted: false };

  if (markerId === "hba1c" && from === "mmol/mol" && to === "%") {
    return { value: value * 0.09148 + 2.152, converted: true };
  }

  if (markerConversions[from]) {
    return { value: value * markerConversions[from], converted: true };
  }

  if (markerConversions[to]) {
    return { value: value / markerConversions[to], converted: true };
  }

  return { value, converted: false };
}

export function normalizeToDefaultUnit(
  markerId: string,
  value: number,
  unit: string,
  defaultUnit: string
): { value: number; unit: string; sourceValue: number; sourceUnit: string; converted: boolean } {
  const normalizedUnit = normalizeUnitString(unit);
  const normalizedDefault = normalizeUnitString(defaultUnit);
  const result = convertValue(markerId, value, normalizedUnit, normalizedDefault);

  if (result.converted) {
    return {
      value: roundLabValue(result.value),
      unit: normalizedDefault,
      sourceValue: value,
      sourceUnit: normalizedUnit,
      converted: true,
    };
  }

  return {
    value: roundLabValue(value),
    unit: normalizedUnit || defaultUnit,
    sourceValue: value,
    sourceUnit: normalizedUnit || defaultUnit,
    converted: false,
  };
}

function roundLabValue(value: number): number {
  if (!Number.isFinite(value)) return value;
  const abs = Math.abs(value);
  if (abs >= 1000) return Math.round(value);
  if (abs >= 100) return Math.round(value * 10) / 10;
  if (abs >= 10) return Math.round(value * 100) / 100;
  return Math.round(value * 1000) / 1000;
}