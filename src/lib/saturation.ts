import { getCompoundById } from "@/data/compounds";

/** ~4–5 half-lives to reach full saturation (steady state). */
export const SATURATION_HALF_LIVES = 4.5;
export const SATURATION_THRESHOLD = 0.97;

export type SaturationModel = "classic" | "gh" | "sarm" | "hcg" | "peptide";

export interface SaturationProfile {
  halfLifeDisplay: string;
  timeToSaturation: string;
  note?: string;
  model: SaturationModel;
}

export interface SaturationReferenceRow {
  compound: string;
  halfLife: string;
  timeToSaturation: string;
  notes?: string;
}

export const SATURATION_REFERENCE: {
  testEsters: SaturationReferenceRow[];
  injectables: SaturationReferenceRow[];
  orals: SaturationReferenceRow[];
  other: SaturationReferenceRow[];
} = {
  testEsters: [
    { compound: "Testosterone Propionate", halfLife: "~2 days", timeToSaturation: "10–14 days", notes: "Fastest. Daily or EOD pinning best." },
    { compound: "Testosterone Enanthate / Cypionate", halfLife: "~5–7 days", timeToSaturation: "4–6 weeks", notes: "Most common. Fully saturated around week 5–6." },
    { compound: "Sustanon 250/300", halfLife: "Mixed (4–10+ days)", timeToSaturation: "5–7 weeks", notes: "Blend of esters; long decanoate slows buildup." },
    { compound: "Testosterone Undecanoate (Nebido/Andriol)", halfLife: "Very long (~20+ days)", timeToSaturation: "8–12+ weeks", notes: "Very slow to build up." },
  ],
  injectables: [
    { compound: "Nandrolone Decanoate (Deca)", halfLife: "~7–12 days", timeToSaturation: "5–7 weeks", notes: "Long ester, slow build." },
    { compound: "Nandrolone Phenylpropionate (NPP)", halfLife: "~3–5 days", timeToSaturation: "2–3 weeks" },
    { compound: "Boldenone Undecylenate (EQ)", halfLife: "~7–10 days", timeToSaturation: "5–7 weeks", notes: "Often 6+ weeks to really kick in." },
    { compound: "Trenbolone Acetate", halfLife: "~2–3 days", timeToSaturation: "10–14 days", notes: "Short and fast." },
    { compound: "Trenbolone Enanthate", halfLife: "~5–7 days", timeToSaturation: "4–6 weeks" },
    { compound: "Masteron Propionate", halfLife: "~2–3 days", timeToSaturation: "10–14 days" },
    { compound: "Masteron Enanthate", halfLife: "~5–7 days", timeToSaturation: "4–6 weeks" },
    { compound: "Primobolan Enanthate", halfLife: "~7–10 days", timeToSaturation: "5–7 weeks" },
  ],
  orals: [
    { compound: "Anavar (Oxandrolone)", halfLife: "~9–10 hours", timeToSaturation: "2–3 days" },
    { compound: "Dianabol", halfLife: "~4–6 hours", timeToSaturation: "1–2 days" },
    { compound: "Winstrol", halfLife: "~9 hours", timeToSaturation: "2–3 days" },
    { compound: "Anadrol", halfLife: "~8–9 hours", timeToSaturation: "1–2 days" },
    { compound: "Turinabol", halfLife: "~16 hours", timeToSaturation: "3–4 days" },
  ],
  other: [
    { compound: "Growth Hormone (GH)", halfLife: "Daily injections", timeToSaturation: "Weeks–months", notes: "No classic steroid saturation — IGF-1 builds over time." },
    { compound: "SARMs (Ostarine, RAD-140, LGD, etc.)", halfLife: "Varies", timeToSaturation: "1–3 weeks", notes: "Depends on compound." },
    { compound: "hCG", halfLife: "Short", timeToSaturation: "Days", notes: "Effects noticeable within days at 2–3×/week." },
    { compound: "Peptides (BPC-157, TB-500, etc.)", halfLife: "Short", timeToSaturation: "~1 week", notes: "Usually daily or EOD." },
  ],
};

const COMPOUND_PROFILES: Record<string, SaturationProfile> = {
  "test-p": { halfLifeDisplay: "~2 days", timeToSaturation: "10–14 days", note: "Daily or EOD pinning best.", model: "classic" },
  "test-e": { halfLifeDisplay: "~5–7 days", timeToSaturation: "4–6 weeks", note: "Most common long ester.", model: "classic" },
  "test-c": { halfLifeDisplay: "~5–7 days", timeToSaturation: "4–6 weeks", note: "Same profile as enanthate.", model: "classic" },
  "test-sus": { halfLifeDisplay: "Mixed esters", timeToSaturation: "5–7 weeks", note: "Long decanoate ester slows buildup.", model: "classic" },
  "deca": { halfLifeDisplay: "~7–12 days", timeToSaturation: "5–7 weeks", note: "Long ester, slow build.", model: "classic" },
  "deca-d": { halfLifeDisplay: "~7–12 days", timeToSaturation: "5–7 weeks", model: "classic" },
  "npp": { halfLifeDisplay: "~3–5 days", timeToSaturation: "2–3 weeks", model: "classic" },
  eq: { halfLifeDisplay: "~7–10 days", timeToSaturation: "5–7 weeks", note: "Often 6+ weeks to kick in.", model: "classic" },
  "eq-c": { halfLifeDisplay: "~7–10 days", timeToSaturation: "5–7 weeks", model: "classic" },
  "eq-a": { halfLifeDisplay: "~2–3 days", timeToSaturation: "10–14 days", model: "classic" },
  "tren-a": { halfLifeDisplay: "~2–3 days", timeToSaturation: "10–14 days", note: "Short and fast.", model: "classic" },
  "tren-e": { halfLifeDisplay: "~5–7 days", timeToSaturation: "4–6 weeks", model: "classic" },
  "mast-p": { halfLifeDisplay: "~2–3 days", timeToSaturation: "10–14 days", model: "classic" },
  "mast-e": { halfLifeDisplay: "~5–7 days", timeToSaturation: "4–6 weeks", model: "classic" },
  "primo-e": { halfLifeDisplay: "~7–10 days", timeToSaturation: "5–7 weeks", model: "classic" },
  anavar: { halfLifeDisplay: "~9–10 hours", timeToSaturation: "2–3 days", model: "classic" },
  dbol: { halfLifeDisplay: "~4–6 hours", timeToSaturation: "1–2 days", model: "classic" },
  winstrol: { halfLifeDisplay: "~9 hours", timeToSaturation: "2–3 days", model: "classic" },
  anadrol: { halfLifeDisplay: "~8–9 hours", timeToSaturation: "1–2 days", model: "classic" },
  turinabol: { halfLifeDisplay: "~16 hours", timeToSaturation: "3–4 days", model: "classic" },
  gh: { halfLifeDisplay: "Daily", timeToSaturation: "Weeks–months", note: "IGF-1 builds over time; no classic saturation.", model: "gh" },
  hcg: { halfLifeDisplay: "Short", timeToSaturation: "Days", note: "Effects within days at 2–3×/week.", model: "hcg" },
  bpc157: { halfLifeDisplay: "Short", timeToSaturation: "~1 week", note: "Daily or EOD dosing.", model: "peptide" },
};

export function daysToFullSaturation(halfLifeDays: number): number {
  return halfLifeDays * SATURATION_HALF_LIVES;
}

export function weeksToFullSaturation(halfLifeDays: number): number {
  return daysToFullSaturation(halfLifeDays) / 7;
}

export function formatHalfLifeDays(halfLifeDays: number): string {
  if (halfLifeDays < 1) {
    const hours = Math.round(halfLifeDays * 24);
    return `~${hours}h`;
  }
  if (halfLifeDays < 14) {
    return `~${Math.round(halfLifeDays * 10) / 10}d`;
  }
  return `~${Math.round(halfLifeDays)}d`;
}

export function formatSaturationEta(weeks: number): string {
  if (weeks < 0.5) return "<1 day";
  const days = weeks * 7;
  if (days < 14) return `${Math.round(days)} days`;
  if (weeks < 8) return `${Math.round(weeks)} wk`;
  return `${Math.round(weeks)}+ wk`;
}

export function getSaturationProfile(compoundId: string): SaturationProfile {
  const override = COMPOUND_PROFILES[compoundId];
  if (override) return override;

  const compound = getCompoundById(compoundId);
  if (!compound?.halfLife) {
    return { halfLifeDisplay: "—", timeToSaturation: "—", model: "classic" };
  }

  const weeks = weeksToFullSaturation(compound.halfLife);
  return {
    halfLifeDisplay: formatHalfLifeDays(compound.halfLife),
    timeToSaturation: formatSaturationEta(weeks),
    model: compound.category === "peptides" && compound.id !== "hcg" ? "peptide" : "classic",
  };
}

export function usesClassicSaturation(compoundId: string): boolean {
  return getSaturationProfile(compoundId).model === "classic";
}

export function theoreticalSteadyState(weeklyInput: number, halfLifeDays: number): number {
  const hl = Math.max(halfLifeDays, 0.01);
  const decay = Math.exp(-7 / hl);
  if (decay >= 1 - 1e-9) return weeklyInput;
  return weeklyInput / (1 - decay);
}

export function percentOfSaturation(level: number, steadyState: number): number {
  if (steadyState <= 0) return 0;
  return Math.min(100, Math.round((level / steadyState) * 1000) / 10);
}

export function decayPerWeek(halfLifeDays: number): number {
  const hl = Math.max(halfLifeDays, 0.01);
  return Math.exp(-7 / hl);
}

export interface SaturationResult {
  saturationWeek: number;
  steadyState: number;
  saturated: boolean;
}

/** First week (0-indexed) where level reaches threshold × steady state while dosing. */
export function findSaturationWeek(
  activeStart: number,
  activeEnd: number,
  weeklyInput: number,
  halfLifeDays: number,
  maxWeek: number
): SaturationResult {
  const decay = decayPerWeek(halfLifeDays);
  const steadyState = theoreticalSteadyState(weeklyInput, halfLifeDays);
  const threshold = steadyState * SATURATION_THRESHOLD;
  let level = 0;

  for (let w = 0; w <= maxWeek; w++) {
    const inActive = w >= activeStart && w <= activeEnd;
    const input = inActive ? weeklyInput : 0;
    level = level * decay + input;
    if (inActive && steadyState > 0 && level >= threshold) {
      return { saturationWeek: w, steadyState, saturated: true };
    }
  }

  const projected = Math.ceil(activeStart + weeksToFullSaturation(halfLifeDays));
  return { saturationWeek: projected, steadyState, saturated: projected <= activeEnd && projected <= maxWeek };
}

export function saturationExplainerSummary(): string {
  return "Saturation is when weekly intake equals clearance — blood levels stabilize and effects become consistent. It typically takes ~4–5 half-lives to reach full saturation.";
}