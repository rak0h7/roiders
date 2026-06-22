import type { CycleCompound, DosePhase } from "@/lib/cycleTypes";

export type { DosePhase };

/** Legacy entries without dosePhases → single flat phase. */
export function migrateToPhases(
  cc: Pick<CycleCompound, "activeWeeks" | "doseMg"> & { dosePhases?: DosePhase[] },
): DosePhase[] {
  if (cc.dosePhases && cc.dosePhases.length > 0) {
    return cc.dosePhases.map((p) => ({ ...p }));
  }
  return [
    {
      startWeek: cc.activeWeeks[0],
      endWeek: cc.activeWeeks[1],
      doseMg: cc.doseMg,
    },
  ];
}

export function mergeAdjacentPhases(phases: DosePhase[]): DosePhase[] {
  const sorted = [...phases].sort((a, b) => a.startWeek - b.startWeek);
  const merged: DosePhase[] = [];
  for (const phase of sorted) {
    const last = merged[merged.length - 1];
    if (last && last.doseMg === phase.doseMg && last.endWeek + 1 === phase.startWeek) {
      last.endWeek = phase.endWeek;
    } else {
      merged.push({ ...phase });
    }
  }
  return merged;
}

export function normalizeCompoundPhases(cc: CycleCompound, totalWeeks: number): CycleCompound {
  const clamped = migrateToPhases(cc)
    .map((p) => ({
      startWeek: Math.max(1, Math.min(p.startWeek, totalWeeks)),
      endWeek: Math.max(1, Math.min(p.endWeek, totalWeeks)),
      doseMg: p.doseMg,
    }))
    .filter((p) => p.startWeek <= p.endWeek && p.doseMg > 0);

  const phases =
    clamped.length > 0
      ? mergeAdjacentPhases(clamped)
      : [
          {
            startWeek: Math.min(cc.activeWeeks[0], totalWeeks),
            endWeek: Math.min(cc.activeWeeks[1], totalWeeks),
            doseMg: cc.doseMg > 0 ? cc.doseMg : 1,
          },
        ];

  const activeWeeks: [number, number] = [phases[0].startWeek, phases[phases.length - 1].endWeek];
  const doseMg = phases[phases.length - 1].doseMg;

  return { ...cc, dosePhases: phases, activeWeeks, doseMg };
}

export function ensureCompoundPhases(compounds: CycleCompound[], totalWeeks: number): CycleCompound[] {
  return compounds.map((c) => normalizeCompoundPhases(c, totalWeeks));
}

export function doseForWeek(cc: CycleCompound, week: number): number {
  for (const phase of cc.dosePhases ?? migrateToPhases(cc)) {
    if (week >= phase.startWeek && week <= phase.endWeek) {
      return phase.doseMg;
    }
  }
  return 0;
}

export function peakDoseMg(cc: CycleCompound): number {
  const phases = cc.dosePhases ?? migrateToPhases(cc);
  return phases.reduce((max, p) => Math.max(max, p.doseMg), 0);
}

/** Split the phase containing `week` so dosing from `week` onward uses `newDoseMg`. */
export function splitPhaseAtWeek(phases: DosePhase[], week: number, newDoseMg: number): DosePhase[] {
  const sorted = [...phases].sort((a, b) => a.startWeek - b.startWeek);
  const next: DosePhase[] = [];

  for (const phase of sorted) {
    if (week < phase.startWeek || week > phase.endWeek) {
      next.push({ ...phase });
      continue;
    }
    if (week === phase.startWeek) {
      next.push({ startWeek: phase.startWeek, endWeek: phase.endWeek, doseMg: newDoseMg });
      continue;
    }
    next.push({ startWeek: phase.startWeek, endWeek: week - 1, doseMg: phase.doseMg });
    next.push({ startWeek: week, endWeek: phase.endWeek, doseMg: newDoseMg });
  }

  return mergeAdjacentPhases(next);
}

export function addTitrationStep(
  phases: DosePhase[],
  splitWeek: number,
  newDoseMg: number,
): DosePhase[] {
  return splitPhaseAtWeek(phases, splitWeek, newDoseMg);
}

/** Build linear ramp phases every `stepWeeks` from startDose to endDose. */
export function buildLinearRampPhases(
  startWeek: number,
  endWeek: number,
  startDose: number,
  endDose: number,
  stepWeeks: number,
): DosePhase[] {
  if (startWeek > endWeek || stepWeeks < 1) return [];
  const span = endWeek - startWeek + 1;
  const steps = Math.max(1, Math.ceil(span / stepWeeks));
  const phases: DosePhase[] = [];
  for (let i = 0; i < steps; i++) {
    const phaseStart = startWeek + i * stepWeeks;
    if (phaseStart > endWeek) break;
    const phaseEnd = Math.min(endWeek, phaseStart + stepWeeks - 1);
    const t = steps === 1 ? 1 : i / (steps - 1);
    const dose = Math.round((startDose + (endDose - startDose) * t) * 100) / 100;
    phases.push({ startWeek: phaseStart, endWeek: phaseEnd, doseMg: dose });
  }
  return mergeAdjacentPhases(phases);
}