import { describe, expect, it } from "vitest";
import {
  buildCycleReviewFlags,
  buildMergedReviewFlags,
  enrichLabFlagsWithCycleContext,
} from "@/lib/cycleLabFlags";
import type { CycleCompound } from "@/lib/cycleTypes";
import type { ReviewFlag } from "@/lib/types";

const decaStack: CycleCompound[] = [
  {
    id: "deca-1",
    compoundId: "deca",
    doseMg: 200,
    frequency: "weekly",
    activeWeeks: [1, 12],
    route: "injectable",
  },
];

const testStack: CycleCompound[] = [
  {
    id: "test-e-1",
    compoundId: "test-e",
    doseMg: 500,
    frequency: "weekly",
    activeWeeks: [1, 12],
    route: "injectable",
  },
];

const anavarStack: CycleCompound[] = [
  {
    id: "anavar-1",
    compoundId: "anavar",
    doseMg: 50,
    frequency: "daily",
    activeWeeks: [1, 8],
    route: "oral",
  },
];

describe("enrichLabFlagsWithCycleContext", () => {
  it("adds compound context to flagged markers linked to the stack", () => {
    const flags: ReviewFlag[] = [
      {
        markerId: "prolactin",
        name: "Prolactin",
        value: 18,
        unit: "ng/mL",
        date: "18/06/2026",
        severity: "high",
        labRange: "4-15 ng/mL",
        optimalRange: "4-12 ng/mL",
        deviation: "↑ above optimal max",
        noDosing: true,
      },
    ];

    const enriched = enrichLabFlagsWithCycleContext(flags, decaStack);
    expect(enriched[0].relatedCompounds).toContain("deca");
    expect(enriched[0].deviation).toContain("Deca");
  });
});

describe("buildCycleReviewFlags", () => {
  it("flags missing on-cycle markers for the active stack", () => {
    const flags = buildCycleReviewFlags(decaStack, {}, [], "18/06/2026");
    expect(flags.some((f) => f.markerId === "cycle-watch-prolactin")).toBe(true);
    expect(flags.some((f) => f.markerId === "cycle-watch-estradiol")).toBe(true);
  });

  it("warns when hepatotoxic orals lack liver support", () => {
    const flags = buildCycleReviewFlags(anavarStack, {}, [], "18/06/2026");
    expect(flags.some((f) => f.markerId === "cycle-stack-liver-support")).toBe(true);
  });

  it("warns once when aromatizing test is on stack without estradiol on panel", () => {
    const flags = buildCycleReviewFlags(testStack, {}, [], "18/06/2026");
    const estradiolFlags = flags.filter((f) => f.markerId.startsWith("cycle-watch-estradiol"));
    expect(estradiolFlags).toHaveLength(1);
    expect(estradiolFlags[0]?.deviation).toContain("no estrogen control");
  });
});

describe("buildMergedReviewFlags", () => {
  it("merges lab and cycle flags for a deca stack with elevated prolactin", () => {
    const values = {
      prolactin: { markerId: "prolactin", value: 22, unit: "ng/mL" },
    };

    const merged = buildMergedReviewFlags(
      Object.values(values),
      "18/06/2026",
      "optimized",
      decaStack,
      values
    );

    const prolactinLab = merged.find((f) => f.markerId === "prolactin");
    expect(prolactinLab?.relatedCompounds).toContain("deca");
    expect(merged.some((f) => f.markerId === "cycle-stack-prolactin-19nor")).toBe(true);
  });
});