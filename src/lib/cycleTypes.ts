import type { FrequencyPattern } from "@/data/frequencies";

export interface CycleCompound {
  /** Unique stack entry id (supports duplicate compoundId ramps). */
  id: string;
  compoundId: string;
  doseMg: number;
  frequency: FrequencyPattern;
  activeWeeks: [number, number];
  route: "injectable" | "oral" | "topical";
}