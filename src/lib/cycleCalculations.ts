import { differenceInDays, addWeeks, addDays } from "date-fns";
import type { CycleCompound } from "@/lib/cycleTypes";
import { getCompoundById } from "@/data/compounds";
import type { FrequencyPattern } from "@/data/frequencies";

export interface CycleStats {
  weeks: number;
  days: number;
  monthsApprox: string;
  compoundCount: number;
  anabolicCount: number;
  peptideCount: number;
  ancillaryCount: number;
  totalDoses: number;
  injections: number;
  oralDoses: number;
  topicalApps: number;
  avgMgPerWeek: number;
  peakMgPerWeek: number;
}

export function dosesPerWeek(freq: FrequencyPattern): number {
  switch (freq) {
    case "daily": return 7;
    case "eod": return 3.5;
    case "2x-weekly": return 2;
    case "weekly": return 1;
    case "bid": return 14;
    case "pre-workout": return 5;
    default: return 1;
  }
}

export function weeklyDoseAmount(cc: CycleCompound): number {
  return cc.doseMg * dosesPerWeek(cc.frequency);
}

/** Mg-equivalent weekly load used for intensity, stacked charts, and averages. */
export function weeklyMgLoad(cc: CycleCompound): number {
  const compound = getCompoundById(cc.compoundId);
  if (!compound || compound.unit !== "mg") return 0;
  return weeklyDoseAmount(cc) * (compound.pkMultiplier ?? 1);
}

export function activeWeekCount(cc: CycleCompound): number {
  return Math.max(0, cc.activeWeeks[1] - cc.activeWeeks[0] + 1);
}

export function doseCountForEntry(cc: CycleCompound): number {
  return Math.round(dosesPerWeek(cc.frequency) * activeWeekCount(cc));
}

function decayPerWeek(halfLifeDays: number): number {
  const hl = Math.max(halfLifeDays, 0.01);
  return Math.exp(-7 / hl);
}

function shouldDoseOnDay(freq: FrequencyPattern, dayIndex: number, dayOfWeek: number): boolean {
  switch (freq) {
    case "daily":
    case "bid":
      return true;
    case "eod":
      return dayIndex % 2 === 0;
    case "2x-weekly":
      return dayOfWeek === 1 || dayOfWeek === 4;
    case "weekly":
      return dayOfWeek === 1;
    case "pre-workout":
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    default:
      return dayIndex % 3 === 0;
  }
}

function doseMultiplierForDay(freq: FrequencyPattern): number {
  return freq === "bid" ? 2 : 1;
}

export function weeklyMgLoadAtWeek(week: number, compounds: CycleCompound[]): number {
  let load = 0;
  for (const cc of compounds) {
    if (week < cc.activeWeeks[0] || week > cc.activeWeeks[1]) continue;
    load += weeklyMgLoad(cc);
  }
  return load;
}

export function formatDose(doseMg: number, unit: string): string {
  if (unit === "mcg") return doseMg < 1 ? `${Math.round(doseMg * 1000)}mcg` : `${doseMg}mcg`;
  if (unit === "iu") return `${doseMg}iu`;
  if (unit === "mg" && doseMg < 1) return `${Math.round(doseMg * 1000)}mcg`;
  return `${doseMg}mg`;
}

export function formatWeeklyDose(cc: CycleCompound): string {
  const compound = getCompoundById(cc.compoundId);
  if (!compound) return "—";
  const weekly = weeklyDoseAmount(cc);
  if (compound.unit === "iu") return `${Math.round(weekly)}iu/wk`;
  if (compound.unit === "mcg") {
    return weekly < 1 ? `${Math.round(weekly * 1000)}mcg/wk` : `${Math.round(weekly * 10) / 10}mg/wk`;
  }
  return `${Math.round(weekly)}mg/wk`;
}

export function entryLabel(cc: CycleCompound): string {
  const compound = getCompoundById(cc.compoundId);
  const base = compound?.shortName ?? cc.compoundId;
  if (cc.activeWeeks[0] === cc.activeWeeks[1]) {
    return `${base} (W${cc.activeWeeks[0]})`;
  }
  return `${base} (W${cc.activeWeeks[0]}–${cc.activeWeeks[1]})`;
}

export function hasAnabolicCompounds(compounds: CycleCompound[]): boolean {
  return compounds.some((cc) => getCompoundById(cc.compoundId)?.category === "anabolics");
}

export function hasHepatotoxicOrals(compounds: CycleCompound[]): boolean {
  return compounds.some((cc) => getCompoundById(cc.compoundId)?.hepatotoxic === true);
}

export function calculateStats(compounds: CycleCompound[], weeks: number): CycleStats {
  const days = weeks * 7;
  let injections = 0;
  let oralDoses = 0;
  let topicalApps = 0;
  let anabolicCount = 0;
  let peptideCount = 0;
  let ancillaryCount = 0;

  compounds.forEach((cc) => {
    const compound = getCompoundById(cc.compoundId);
    if (!compound) return;

    const total = doseCountForEntry(cc);

    if (compound.category === "anabolics") anabolicCount++;
    else if (compound.category === "peptides") peptideCount++;
    else ancillaryCount++;

    if (cc.route === "injectable") injections += total;
    else if (cc.route === "oral") oralDoses += total;
    else topicalApps += total;
  });

  const weeklyLoads = Array.from({ length: weeks }, (_, i) => weeklyMgLoadAtWeek(i + 1, compounds));
  const activeWeeks = weeklyLoads.filter((l) => l > 0);
  const avgMgPerWeek = activeWeeks.length > 0
    ? Math.round(activeWeeks.reduce((s, l) => s + l, 0) / activeWeeks.length)
    : 0;
  const peakMgPerWeek = weeklyLoads.length > 0 ? Math.round(Math.max(...weeklyLoads)) : 0;

  return {
    weeks,
    days,
    monthsApprox: (weeks / 4.33).toFixed(1),
    compoundCount: compounds.length,
    anabolicCount,
    peptideCount,
    ancillaryCount,
    totalDoses: injections + oralDoses + topicalApps,
    injections,
    oralDoses,
    topicalApps,
    avgMgPerWeek,
    peakMgPerWeek,
  };
}

export function getIntensityScore(compounds: CycleCompound[]): number {
  if (compounds.length === 0) return 0;
  const peakWeek = compounds.reduce((max, cc) => Math.max(max, cc.activeWeeks[1]), 0);
  const peakLoad = weeklyMgLoadAtWeek(peakWeek || 1, compounds);
  if (peakLoad < 200) return 1;
  if (peakLoad < 450) return 2;
  if (peakLoad < 750) return 3;
  if (peakLoad < 1100) return 4;
  return 5;
}

export function getIntensityLabel(score: number): string {
  const labels = ["", "mild", "moderate", "heavy", "blast", "nuclear"];
  return labels[score] ?? "";
}

export function calculatePctBegin(endDate: Date, compounds: CycleCompound[]): Date | null {
  if (!hasAnabolicCompounds(compounds)) return null;
  let maxClearanceDays = 14;
  compounds.forEach((cc) => {
    const compound = getCompoundById(cc.compoundId);
    if (!compound || compound.category !== "anabolics") return;
    const hl = compound.halfLife ?? 1;
    const clearanceDays = Math.ceil(hl * 5);
    maxClearanceDays = Math.max(maxClearanceDays, clearanceDays);
  });
  return addDays(endDate, maxClearanceDays);
}

export function generateDosesForDay(
  date: Date,
  startDate: Date,
  compounds: CycleCompound[]
): { name: string; dose: string; color: string }[] {
  const dayIndex = differenceInDays(date, startDate);
  if (dayIndex < 0) return [];

  const weekNum = Math.floor(dayIndex / 7) + 1;
  const dayOfWeek = date.getDay();
  const doses: { name: string; dose: string; color: string }[] = [];

  compounds.forEach((cc) => {
    if (weekNum < cc.activeWeeks[0] || weekNum > cc.activeWeeks[1]) return;
    const compound = getCompoundById(cc.compoundId);
    if (!compound) return;

    if (shouldDoseOnDay(cc.frequency, dayIndex, dayOfWeek)) {
      doses.push({
        name: compound.shortName,
        dose: formatDose(cc.doseMg, compound.unit),
        color: compound.color,
      });
      if (cc.frequency === "bid") {
        doses.push({
          name: compound.shortName,
          dose: `${formatDose(cc.doseMg, compound.unit)} PM`,
          color: compound.color,
        });
      }
    }
  });

  return doses;
}

export function getDayIntensity(date: Date, startDate: Date, compounds: CycleCompound[]): number {
  const dayIndex = differenceInDays(date, startDate);
  if (dayIndex < 0) return 0;

  const weekNum = Math.floor(dayIndex / 7) + 1;
  const dayOfWeek = date.getDay();
  let load = 0;

  compounds.forEach((cc) => {
    if (weekNum < cc.activeWeeks[0] || weekNum > cc.activeWeeks[1]) return;
    const compound = getCompoundById(cc.compoundId);
    if (!compound) return;
    if (shouldDoseOnDay(cc.frequency, dayIndex, dayOfWeek)) {
      load += cc.doseMg * (compound.pkMultiplier ?? 0.5) * doseMultiplierForDay(cc.frequency);
    }
  });

  if (load <= 0) return 0;
  if (load < 50) return 1;
  if (load < 120) return 2;
  if (load < 220) return 3;
  if (load < 350) return 4;
  return 5;
}

export function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];
  const startPad = (firstDay.getDay() + 6) % 7;
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

export function generatePKData(weeks: number, compounds: CycleCompound[]) {
  const levels = new Map<string, number>();
  const data: { week: string; [key: string]: string | number }[] = [];

  for (let w = 0; w <= weeks; w++) {
    const point: { week: string; [key: string]: string | number } = { week: `W${w}` };

    compounds.forEach((cc) => {
      const compound = getCompoundById(cc.compoundId);
      if (!compound) return;

      const decay = decayPerWeek(compound.halfLife ?? 1);
      const prev = levels.get(cc.id) ?? 0;
      const inActive = w >= cc.activeWeeks[0] && w <= cc.activeWeeks[1];
      const weeklyInput = inActive ? weeklyDoseAmount(cc) * (compound.pkMultiplier ?? 1) : 0;
      const level = prev * decay + weeklyInput;
      levels.set(cc.id, level);
      point[cc.id] = Math.max(0, Math.round(level * 10) / 10);
    });

    data.push(point);
  }

  return data;
}

export interface PKCardData {
  id: string;
  short: string;
  peak: number;
  steady: number;
  peakW: string;
  steadyW: string;
  color: string;
}

export function generatePKCards(weeks: number, compounds: CycleCompound[]): PKCardData[] {
  const data = generatePKData(weeks, compounds);
  return compounds.map((cc) => {
    const compound = getCompoundById(cc.compoundId);
    if (!compound) return null;
    const values = data.map((d) => (d[cc.id] as number) ?? 0);
    const peak = Math.max(...values);
    const peakIdx = values.indexOf(peak);
    const activeEnd = cc.activeWeeks[1];
    const steady = values[Math.min(activeEnd, weeks)] ?? values[values.length - 1] ?? 0;
    return {
      id: cc.id,
      short: entryLabel(cc),
      peak: Math.round(peak * 10) / 10,
      steady: Math.round(steady * 10) / 10,
      peakW: `W${peakIdx}`,
      steadyW: `W${activeEnd}`,
      color: compound.color,
    };
  }).filter((c): c is PKCardData => c !== null);
}

export function generateStackedLoadData(weeks: number, compounds: CycleCompound[]) {
  const data: { week: string; anabolics: number; estrogen: number; health: number; supplements: number; total: number }[] = [];

  for (let w = 0; w <= weeks; w++) {
    let anabolics = 0;
    let estrogen = 0;
    let health = 0;
    let supplements = 0;

    compounds.forEach((cc) => {
      if (w < cc.activeWeeks[0] || w > cc.activeWeeks[1]) return;
      const compound = getCompoundById(cc.compoundId);
      if (!compound) return;
      const load = weeklyMgLoad(cc);
      if (compound.category === "anabolics") anabolics += load;
      else if (compound.category === "estrogen") estrogen += load;
      else if (compound.category === "peptides") supplements += load;
      else health += load;
    });

    data.push({
      week: `W${w}`,
      anabolics: Math.round(anabolics),
      estrogen: Math.round(estrogen),
      health: Math.round(health),
      supplements: Math.round(supplements),
      total: Math.round(anabolics + estrogen + health + supplements),
    });
  }

  return data;
}

export interface RiskAxis {
  axis: string;
  value: number;
  score: number;
  contributors: string;
  color: string;
}

export function calculateRiskProfile(compounds: CycleCompound[]): RiskAxis[] {
  const risks: Record<string, { score: number; contributors: string[] }> = {
    HEPATIC: { score: 0, contributors: [] },
    CARDIO: { score: 0, contributors: [] },
    NEURO: { score: 0, contributors: [] },
    ENDOCRINE: { score: 0, contributors: [] },
    DERM: { score: 0, contributors: [] },
    METABOLIC: { score: 0, contributors: [] },
  };

  compounds.forEach((cc) => {
    const compound = getCompoundById(cc.compoundId);
    if (!compound || compound.category !== "anabolics") return;
    const load = weeklyMgLoad(cc) / 100;
    const label = entryLabel(cc);

    if (compound.hepatotoxic) {
      risks.HEPATIC.score += load * 3;
      risks.HEPATIC.contributors.push(label);
    }
    if (compound.tags.includes("19-nor") || compound.id.includes("tren")) {
      risks.CARDIO.score += load * 2;
      risks.NEURO.score += load * 2.5;
      risks.ENDOCRINE.score += load * 2;
      risks.CARDIO.contributors.push(label);
      risks.NEURO.contributors.push(label);
    }
    if (compound.tags.includes("DHT") || compound.id === "halo") {
      risks.DERM.score += load * 1.5;
      risks.DERM.contributors.push(label);
    }
    if (compound.route === "oral" && compound.category === "anabolics") {
      risks.HEPATIC.score += load * 2;
      risks.METABOLIC.score += load * 1.5;
      risks.METABOLIC.contributors.push(label);
    }
    risks.ENDOCRINE.score += load;
    risks.ENDOCRINE.contributors.push(label);
  });

  const colors: Record<string, string> = {
    HEPATIC: "#eab308", CARDIO: "#ef4444", NEURO: "#a855f7",
    ENDOCRINE: "#ec4899", DERM: "#00d4e8", METABOLIC: "#f97316",
  };

  return Object.entries(risks).map(([axis, data]) => {
    const score = Math.min(20, Math.round(data.score * 10) / 10);
    return {
      axis,
      value: Math.min(100, score * 5),
      score,
      contributors: [...new Set(data.contributors)].slice(0, 3).join(", ") || "—",
      color: colors[axis],
    };
  });
}

export function getCycleEndDate(startDate: Date, weeks: number) {
  return addWeeks(startDate, weeks);
}