import { differenceInDays, addWeeks, addDays } from "date-fns";
import type { CycleCompound } from "@/lib/cycleTypes";
import { doseForWeek, migrateToPhases, peakDoseMg } from "@/lib/dosePhases";
import { getCompoundById, type Compound, type CompoundCategory } from "@/data/compounds";
import { frequencyLabel, type FrequencyPattern } from "@/data/frequencies";
import {
  findSaturationWeek,
  getSaturationProfile,
  percentOfSaturation,
  usesClassicSaturation,
} from "@/lib/saturation";

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

export function weeklyDoseAmountForDose(cc: CycleCompound, doseMg: number): number {
  return doseMg * dosesPerWeek(cc.frequency);
}

export function weeklyDoseAmount(cc: CycleCompound): number {
  return weeklyDoseAmountForDose(cc, cc.doseMg);
}

export function weeklyDoseAmountAtWeek(cc: CycleCompound, week: number): number {
  return weeklyDoseAmountForDose(cc, doseForWeek(cc, week));
}

/** Convert stored dose to mg-equivalent for load/intensity math across unit types. */
export function doseToMgEquivalent(dose: number, unit: Compound["unit"]): number {
  switch (unit) {
    case "mg":
      return dose;
    case "mcg":
      // Values below 1 are stored as mg-equivalent (e.g. 0.25 = 250mcg); otherwise native mcg.
      return dose < 1 ? dose : dose / 1000;
    case "iu":
      return dose / 3;
  }
}

/** Mg-equivalent weekly load for a specific dose amount. */
export function weeklyMgLoadForDose(cc: CycleCompound, doseMg: number): number {
  const compound = getCompoundById(cc.compoundId);
  if (!compound || doseMg <= 0) return 0;
  return (
    doseToMgEquivalent(doseMg, compound.unit) *
    dosesPerWeek(cc.frequency) *
    (compound.pkMultiplier ?? 1)
  );
}

/** Mg-equivalent weekly load used for intensity, stacked charts, and averages. */
export function weeklyMgLoad(cc: CycleCompound): number {
  return weeklyMgLoadForDose(cc, peakDoseMg(cc));
}

export function weeklyMgLoadAtWeekForEntry(cc: CycleCompound, week: number): number {
  return weeklyMgLoadForDose(cc, doseForWeek(cc, week));
}

/** Weekly mg-equivalent input for PK compartment math (aligned with stacked load). */
export function weeklyPkInputAtWeek(cc: CycleCompound, week: number): number {
  return weeklyMgLoadAtWeekForEntry(cc, week);
}

export function formatChartWeek(weekIndex: number): string {
  return weekIndex === 0 ? "Pre" : `W${weekIndex}`;
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
    load += weeklyMgLoadAtWeekForEntry(cc, week);
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
  return formatWeeklyAmount(weekly, compound.unit);
}

export function formatWeeklyAmount(weekly: number, unit: Compound["unit"]): string {
  if (unit === "iu") return `${Math.round(weekly)}iu/wk`;
  if (unit === "mcg") {
    return weekly < 1 ? `${Math.round(weekly * 1000)}mcg/wk` : `${Math.round(weekly * 10) / 10}mg/wk`;
  }
  return `${Math.round(weekly)}mg/wk`;
}

export function formatDoseRange(cc: CycleCompound, unit: string): string {
  const phases = cc.dosePhases ?? migrateToPhases(cc);
  if (phases.length <= 1) {
    return formatDose(phases[0]?.doseMg ?? cc.doseMg, unit);
  }
  const doses = phases.map((p) => p.doseMg);
  const min = Math.min(...doses);
  const max = Math.max(...doses);
  if (min === max) return formatDose(min, unit);
  return `${formatDose(min, unit)}→${formatDose(max, unit)}`;
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

    const doseMg = doseForWeek(cc, weekNum);
    if (doseMg <= 0) return;

    if (shouldDoseOnDay(cc.frequency, dayIndex, dayOfWeek)) {
      doses.push({
        name: compound.shortName,
        dose: formatDose(doseMg, compound.unit),
        color: compound.color,
      });
      if (cc.frequency === "bid") {
        doses.push({
          name: compound.shortName,
          dose: `${formatDose(doseMg, compound.unit)} PM`,
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
    const doseMg = doseForWeek(cc, weekNum);
    if (doseMg <= 0) return;
    if (shouldDoseOnDay(cc.frequency, dayIndex, dayOfWeek)) {
      load +=
        doseToMgEquivalent(doseMg, compound.unit) *
        (compound.pkMultiplier ?? 0.5) *
        doseMultiplierForDay(cc.frequency);
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

export function generatePKData(
  weeks: number,
  compounds: CycleCompound[],
  options?: { washoutWeeks?: number },
) {
  const washout = options?.washoutWeeks ?? 0;
  const totalWeeks = weeks + washout;
  const levels = new Map<string, number>();
  const data: { week: string; [key: string]: string | number }[] = [];

  for (let w = 0; w <= totalWeeks; w++) {
    const point: { week: string; [key: string]: string | number } = { week: formatChartWeek(w) };

    compounds.forEach((cc) => {
      const compound = getCompoundById(cc.compoundId);
      if (!compound) return;

      const decay = decayPerWeek(compound.halfLife ?? 1);
      const prev = levels.get(cc.id) ?? 0;
      const inActive = w >= cc.activeWeeks[0] && w <= cc.activeWeeks[1];
      const weeklyInput = inActive ? weeklyPkInputAtWeek(cc, w) : 0;
      const level = prev * decay + weeklyInput;
      levels.set(cc.id, level);
      point[cc.id] = Math.max(0, Math.round(level * 10) / 10);
    });

    data.push(point);
  }

  return data;
}

export function generatePKDataPercentSteadyState(weeks: number, compounds: CycleCompound[]) {
  const cards = generatePKCards(weeks, compounds);
  const steadyById = new Map(
    cards
      .filter((c) => c.saturationPct !== null)
      .map((c) => {
        const level = c.level > 0 ? c.level : 1;
        const steady = c.saturationPct! > 0 ? level / (c.saturationPct! / 100) : level;
        return [c.id, steady] as const;
      }),
  );
  const raw = generatePKData(weeks, compounds, { washoutWeeks: 4 });
  return raw.map((point) => {
    const next: { week: string; [key: string]: string | number } = { week: point.week };
    for (const cc of compounds) {
      const steady = steadyById.get(cc.id);
      const val = (point[cc.id] as number) ?? 0;
      next[cc.id] = steady && steady > 0 ? Math.min(100, Math.round((val / steady) * 1000) / 10) : val;
    }
    return next;
  });
}

const TIMELINE_CATEGORY_ORDER: Record<string, number> = {
  anabolics: 0,
  estrogen: 1,
  peptides: 2,
  "fat-loss": 3,
  support: 4,
  cognitive: 5,
  hair: 6,
};

const TIMELINE_CATEGORY_LABELS: Record<string, string> = {
  anabolics: "AAS",
  estrogen: "Estrogen",
  peptides: "Peptide",
  "fat-loss": "Fat loss",
  support: "Support",
  cognitive: "Cognitive",
  hair: "Hair",
};

export interface TimelinePhaseSegment {
  entryId: string;
  label: string;
  color: string;
  category: CompoundCategory;
  categoryLabel: string;
  startWeek: number;
  endWeek: number;
  doseMg: number;
  doseLabel: string;
  weeklyLoad: number;
}

export interface TimelineRow {
  entryId: string;
  label: string;
  color: string;
  category: CompoundCategory;
  categoryLabel: string;
  startWeek: number;
  endWeek: number;
  doseLabel: string;
  weeklyLoad: number;
  phases: TimelinePhaseSegment[];
}

export type TimelineMilestoneType = "start" | "end" | "pct" | "saturation";

export interface TimelineMilestone {
  week: number;
  label: string;
  type: TimelineMilestoneType;
  color?: string;
}

export interface WeekProtocolEntry {
  entryId: string;
  name: string;
  doseLabel: string;
  weeklyDose: string;
  color: string;
}

export function timelineCategoryLabel(category: string): string {
  return TIMELINE_CATEGORY_LABELS[category] ?? "Support";
}

export function generateTimelinePhaseSegments(
  compounds: CycleCompound[],
  weeks: number,
): TimelinePhaseSegment[] {
  const segments: TimelinePhaseSegment[] = [];
  for (const cc of compounds) {
    const compound = getCompoundById(cc.compoundId);
    if (!compound) continue;
    const phases = cc.dosePhases ?? migrateToPhases(cc);
    for (const phase of phases) {
      if (phase.endWeek < 1 || phase.startWeek > weeks) continue;
      segments.push({
        entryId: cc.id,
        label: entryLabel(cc),
        color: compound.color,
        category: compound.category,
        categoryLabel: timelineCategoryLabel(compound.category),
        startWeek: Math.max(1, phase.startWeek),
        endWeek: Math.min(weeks, phase.endWeek),
        doseMg: phase.doseMg,
        doseLabel: `${formatDose(phase.doseMg, compound.unit)} • ${frequencyLabel(cc.frequency)}`,
        weeklyLoad: weeklyMgLoadForDose(cc, phase.doseMg),
      });
    }
  }
  return segments.sort((a, b) => {
    const cat = (TIMELINE_CATEGORY_ORDER[a.category] ?? 99) - (TIMELINE_CATEGORY_ORDER[b.category] ?? 99);
    if (cat !== 0) return cat;
    if (a.startWeek !== b.startWeek) return a.startWeek - b.startWeek;
    return a.label.localeCompare(b.label);
  });
}

export function generateTimelineRows(compounds: CycleCompound[], weeks: number): TimelineRow[] {
  const rows: TimelineRow[] = [];
  for (const cc of compounds) {
    const compound = getCompoundById(cc.compoundId);
    if (!compound) continue;
    const phases = generateTimelinePhaseSegments([cc], weeks);
    if (phases.length === 0) continue;
    rows.push({
      entryId: cc.id,
      label: entryLabel(cc),
      color: compound.color,
      category: compound.category,
      categoryLabel: timelineCategoryLabel(compound.category),
      startWeek: Math.min(...phases.map((p) => p.startWeek)),
      endWeek: Math.max(...phases.map((p) => p.endWeek)),
      doseLabel: `${formatDoseRange(cc, compound.unit)} • ${frequencyLabel(cc.frequency)}`,
      weeklyLoad: Math.max(...phases.map((p) => p.weeklyLoad)),
      phases,
    });
  }
  return rows.sort((a, b) => {
    const cat = (TIMELINE_CATEGORY_ORDER[a.category] ?? 99) - (TIMELINE_CATEGORY_ORDER[b.category] ?? 99);
    if (cat !== 0) return cat;
    if (a.startWeek !== b.startWeek) return a.startWeek - b.startWeek;
    return a.label.localeCompare(b.label);
  });
}

export function generateTimelineMilestones(
  weeks: number,
  compounds: CycleCompound[],
  startDate: Date,
): TimelineMilestone[] {
  const milestones: TimelineMilestone[] = [
    { week: 1, label: "Start", type: "start" },
    { week: weeks, label: "Cycle End", type: "end" },
  ];

  const end = getCycleEndDate(startDate, weeks);
  const pct = calculatePctBegin(end, compounds);
  if (pct && hasAnabolicCompounds(compounds)) {
    const pctWeek = Math.min(
      weeks + 4,
      Math.max(1, Math.ceil(differenceInDays(pct, startDate) / 7)),
    );
    milestones.push({ week: pctWeek, label: "PCT Est.", type: "pct", color: "var(--warning)" });
  }

  const satMarkers = getSaturationMarkers(weeks, compounds);
  const seenWeeks = new Set<number>();
  for (const m of satMarkers.slice(0, 4)) {
    if (seenWeeks.has(m.week)) continue;
    seenWeeks.add(m.week);
    milestones.push({
      week: m.week,
      label: m.label,
      type: "saturation",
      color: m.color,
    });
  }

  return milestones.sort((a, b) => a.week - b.week);
}

export function generateWeekProtocol(week: number, compounds: CycleCompound[]): WeekProtocolEntry[] {
  return compounds
    .filter((cc) => week >= cc.activeWeeks[0] && week <= cc.activeWeeks[1])
    .map((cc) => {
      const compound = getCompoundById(cc.compoundId);
      if (!compound) return null;
      const doseMg = doseForWeek(cc, week);
      if (doseMg <= 0) return null;
      return {
        entryId: cc.id,
        name: entryLabel(cc),
        doseLabel: formatDose(doseMg, compound.unit),
        weeklyDose: formatWeeklyAmount(weeklyDoseAmountForDose(cc, doseMg), compound.unit),
        color: compound.color,
      };
    })
    .filter((e): e is WeekProtocolEntry => e !== null);
}

export interface PKCardData {
  id: string;
  short: string;
  peak: number;
  level: number;
  peakW: string;
  levelW: string;
  saturationWeek: number;
  saturationPct: number | null;
  saturated: boolean;
  halfLifeLabel: string;
  saturationEta: string;
  saturationNote?: string;
  color: string;
}

function resolveEntrySaturation(
  cc: CycleCompound,
  level: number,
  evalWeek: number,
  weeks: number,
): { saturationWeek: number; saturationPct: number | null; saturated: boolean } {
  const weeklyInput = weeklyPkInputAtWeek(cc, evalWeek);
  if (weeklyInput <= 0) {
    return { saturationWeek: evalWeek, saturationPct: null, saturated: false };
  }

  const compound = getCompoundById(cc.compoundId);
  const halfLife = compound?.halfLife ?? 1;
  const profile = getSaturationProfile(cc.compoundId);

  if (usesClassicSaturation(cc.compoundId) || profile.model === "peptide" || profile.model === "hcg") {
    const result = findSaturationWeek(
      cc.activeWeeks[0],
      cc.activeWeeks[1],
      weeklyInput,
      halfLife,
      weeks,
    );
    return {
      saturationWeek: result.saturationWeek,
      saturationPct: percentOfSaturation(level, result.steadyState),
      saturated: evalWeek >= result.saturationWeek && result.saturated,
    };
  }

  if (profile.model === "gh") {
    const rampWeeks = 10;
    const weeksOn = Math.max(0, evalWeek - cc.activeWeeks[0] + 1);
    const satWeek = Math.min(cc.activeWeeks[0] + rampWeeks - 1, cc.activeWeeks[1]);
    return {
      saturationWeek: satWeek,
      saturationPct: Math.min(100, Math.round((weeksOn / rampWeeks) * 1000) / 10),
      saturated: weeksOn >= rampWeeks && evalWeek >= satWeek,
    };
  }

  return { saturationWeek: evalWeek, saturationPct: null, saturated: false };
}

export function generatePKCards(weeks: number, compounds: CycleCompound[]): PKCardData[] {
  const data = generatePKData(weeks, compounds);
  const cards: PKCardData[] = [];
  compounds.forEach((cc) => {
    const compound = getCompoundById(cc.compoundId);
    if (!compound) return;
    const values = data.map((d) => (d[cc.id] as number) ?? 0);
    const peak = Math.max(...values);
    const peakIdx = values.indexOf(peak);
    const evalWeek = Math.min(cc.activeWeeks[1], weeks);
    const level = values[evalWeek] ?? values[values.length - 1] ?? 0;
    const profile = getSaturationProfile(cc.compoundId);
    const { saturationWeek, saturationPct, saturated } = resolveEntrySaturation(cc, level, evalWeek, weeks);

    cards.push({
      id: cc.id,
      short: entryLabel(cc),
      peak: Math.round(peak * 10) / 10,
      level: Math.round(level * 10) / 10,
      peakW: (data[peakIdx]?.week as string) ?? formatChartWeek(peakIdx),
      levelW: formatChartWeek(evalWeek),
      saturationWeek,
      saturationPct,
      saturated,
      halfLifeLabel: profile.halfLifeDisplay,
      saturationEta: profile.timeToSaturation,
      saturationNote: profile.note,
      color: compound.color,
    });
  });
  return cards;
}

export function getSaturationMarkers(
  weeks: number,
  compounds: CycleCompound[]
): { id: string; week: number; label: string; color: string }[] {
  const cards = generatePKCards(weeks, compounds);
  return cards
    .filter((c) => c.saturationWeek <= weeks && c.saturationPct !== null)
    .map((c) => ({
      id: c.id,
      week: c.saturationWeek,
      label: `Sat W${c.saturationWeek}`,
      color: c.color,
    }));
}

export function generateStackedLoadData(weeks: number, compounds: CycleCompound[]) {
  const data: {
    week: string;
    anabolics: number;
    estrogen: number;
    fatLoss: number;
    health: number;
    supplements: number;
    total: number;
  }[] = [];

  for (let w = 1; w <= weeks; w++) {
    let anabolics = 0;
    let estrogen = 0;
    let fatLoss = 0;
    let health = 0;
    let supplements = 0;

    compounds.forEach((cc) => {
      if (w < cc.activeWeeks[0] || w > cc.activeWeeks[1]) return;
      const compound = getCompoundById(cc.compoundId);
      if (!compound) return;
      const load = weeklyMgLoadAtWeekForEntry(cc, w);
      if (compound.category === "anabolics") anabolics += load;
      else if (compound.category === "estrogen") estrogen += load;
      else if (compound.category === "peptides") supplements += load;
      else if (compound.category === "fat-loss") fatLoss += load;
      else health += load;
    });

    data.push({
      week: formatChartWeek(w),
      anabolics: Math.round(anabolics),
      estrogen: Math.round(estrogen),
      fatLoss: Math.round(fatLoss),
      health: Math.round(health),
      supplements: Math.round(supplements),
      total: Math.round(anabolics + estrogen + fatLoss + health + supplements),
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
    if (!compound) return;
    const load = weeklyMgLoad(cc) / 100;
    const label = entryLabel(cc);

    if (compound.category === "anabolics") {
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
      if (compound.route === "oral") {
        risks.HEPATIC.score += load * 2;
        risks.METABOLIC.score += load * 1.5;
        risks.METABOLIC.contributors.push(label);
      }
      risks.ENDOCRINE.score += load;
      risks.ENDOCRINE.contributors.push(label);
      return;
    }

    if (compound.category === "estrogen") {
      risks.ENDOCRINE.score += load * 1.5;
      risks.ENDOCRINE.contributors.push(label);
    }
    if (compound.category === "fat-loss") {
      risks.CARDIO.score += load * 1.5;
      risks.METABOLIC.score += load * 1.2;
      risks.CARDIO.contributors.push(label);
      risks.METABOLIC.contributors.push(label);
    }
    if (compound.hepatotoxic) {
      risks.HEPATIC.score += load * 2;
      risks.HEPATIC.contributors.push(label);
    }
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