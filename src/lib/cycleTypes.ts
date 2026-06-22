import type { FrequencyPattern } from "@/data/frequencies";

export interface DosePhase {
  startWeek: number;
  endWeek: number;
  /** Dose in the catalog compound's native unit (mg, mcg, or iu). */
  doseMg: number;
}

export interface CycleCompound {
  /** Unique stack entry id (supports duplicate compoundId ramps). */
  id: string;
  compoundId: string;
  /** Synced to last phase dose — convenience for legacy call sites. */
  doseMg: number;
  frequency: FrequencyPattern;
  activeWeeks: [number, number];
  route: "injectable" | "oral" | "topical";
  /** Week-range dose schedule; source of truth for plotting and simulation. */
  dosePhases?: DosePhase[];
}