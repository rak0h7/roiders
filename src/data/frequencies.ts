import type { Compound } from "@/data/compounds";
import { COMPOUNDS } from "@/data/compounds";

export const FREQUENCY_OPTIONS = [
  { id: "daily", label: "Daily", pattern: "daily" },
  { id: "eod", label: "Every Other Day (EOD)", pattern: "eod" },
  { id: "2x-weekly", label: "2x weekly (Mon, Thu)", pattern: "2x-weekly" },
  { id: "weekly", label: "Weekly", pattern: "weekly" },
  { id: "bid", label: "2x daily (BID)", pattern: "bid" },
  { id: "pre-workout", label: "Pre-workout only", pattern: "pre-workout" },
] as const;

export type FrequencyPattern = (typeof FREQUENCY_OPTIONS)[number]["pattern"];

export function frequencyLabel(pattern: string): string {
  return FREQUENCY_OPTIONS.find((f) => f.pattern === pattern)?.label ?? pattern;
}

export const DEFAULT_DOSES: Record<string, { doseMg: number; frequency: FrequencyPattern }> = {
  "test-e": { doseMg: 250, frequency: "2x-weekly" },
  "test-c": { doseMg: 150, frequency: "weekly" },
  "test-p": { doseMg: 50, frequency: "eod" },
  "test-sus": { doseMg: 250, frequency: "weekly" },
  "test-trt": { doseMg: 100, frequency: "weekly" },
  "test-tne": { doseMg: 50, frequency: "pre-workout" },
  "tren-a": { doseMg: 50, frequency: "eod" },
  "tren-e": { doseMg: 200, frequency: "weekly" },
  "deca": { doseMg: 200, frequency: "weekly" },
  "npp": { doseMg: 100, frequency: "eod" },
  "eq": { doseMg: 400, frequency: "weekly" },
  "anadrol": { doseMg: 50, frequency: "daily" },
  "dbol": { doseMg: 30, frequency: "daily" },
  "sdrol": { doseMg: 10, frequency: "daily" },
  "halo": { doseMg: 10, frequency: "pre-workout" },
  "anavar": { doseMg: 40, frequency: "daily" },
  "winstrol": { doseMg: 50, frequency: "daily" },
  "winstrol-inj": { doseMg: 50, frequency: "eod" },
  "turinabol": { doseMg: 40, frequency: "daily" },
  "proviron": { doseMg: 50, frequency: "daily" },
  "aromasin": { doseMg: 12.5, frequency: "eod" },
  "arimidex": { doseMg: 0.5, frequency: "eod" },
  "nolvadex": { doseMg: 20, frequency: "daily" },
  "caber": { doseMg: 0.25, frequency: "2x-weekly" },
  "hcg": { doseMg: 250, frequency: "2x-weekly" },
  "tudca": { doseMg: 500, frequency: "daily" },
  "epa-dha-omega-3": { doseMg: 3000, frequency: "daily" },
  "citrus-bergamot": { doseMg: 1000, frequency: "daily" },
  "coq10": { doseMg: 200, frequency: "daily" },
  "taurine": { doseMg: 3000, frequency: "daily" },
  "nac": { doseMg: 600, frequency: "daily" },
  "clen": { doseMg: 40, frequency: "daily" },
  "t3": { doseMg: 25, frequency: "daily" },
  "gh": { doseMg: 2, frequency: "daily" },
  "bpc157": { doseMg: 0.25, frequency: "daily" },
};

function inferFrequency(info: string, route: Compound["route"]): FrequencyPattern {
  const lower = info.toLowerCase();
  if (lower.includes("eod") || lower.includes("every other day")) return "eod";
  if (lower.includes("2x/wk") || lower.includes("2x/wk") || lower.includes("twice weekly") || lower.includes("2x weekly")) return "2x-weekly";
  if (lower.includes("weekly") || lower.includes("/wk")) return "weekly";
  if (lower.includes("pre-workout") || lower.includes("pre workout")) return "pre-workout";
  if (lower.includes("/day") || lower.includes("daily") || lower.includes("orally") || route === "oral") return "daily";
  if (route === "injectable") return "weekly";
  return "daily";
}

function parseDoseFromInfo(info: string, unit: Compound["unit"]): number | null {
  const nums = info.match(/(\d+(?:\.\d+)?)/g)?.map(Number) ?? [];
  if (!nums.length) return null;
  const mid = nums.length >= 2 ? (nums[0] + nums[1]) / 2 : nums[0];
  if (unit === "mcg" && mid >= 50) return mid / 1000;
  if (unit === "iu") return mid;
  return mid;
}

export function inferDefaultDose(compound: Compound): { doseMg: number; frequency: FrequencyPattern } {
  const explicit = DEFAULT_DOSES[compound.id];
  if (explicit) return explicit;

  const parsed = parseDoseFromInfo(compound.dosageInfo, compound.unit);
  const doseMg = parsed ?? (compound.unit === "mcg" ? 0.25 : compound.unit === "iu" ? 250 : 100);
  return { doseMg, frequency: inferFrequency(compound.dosageInfo, compound.route) };
}

/** Populate DEFAULT_DOSES entries for OMA compounds missing explicit defaults */
for (const compound of COMPOUNDS) {
  if (!DEFAULT_DOSES[compound.id]) {
    DEFAULT_DOSES[compound.id] = inferDefaultDose(compound);
  }
}