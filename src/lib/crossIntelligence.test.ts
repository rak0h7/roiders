import { describe, expect, it } from "vitest";
import { generateCrossAlerts } from "@/lib/crossIntelligence";
import type { CycleCompound } from "@/lib/cycleTypes";

const testWithProviron: CycleCompound[] = [
  {
    id: "test-1",
    compoundId: "test-e",
    doseMg: 500,
    frequency: "weekly",
    activeWeeks: [1, 12],
    route: "injectable",
  },
  {
    id: "proviron-1",
    compoundId: "proviron",
    doseMg: 50,
    frequency: "daily",
    activeWeeks: [1, 12],
    route: "oral",
  },
];

describe("generateCrossAlerts", () => {
  it("does not warn about missing AI when proviron is on stack", () => {
    const alerts = generateCrossAlerts(
      { estradiol: { markerId: "estradiol", value: 45, unit: "pg/mL" } },
      [
        {
          markerId: "estradiol",
          name: "Estradiol",
          value: 45,
          unit: "pg/mL",
          date: "2026-01-01",
          severity: "high",
          labRange: "",
          optimalRange: "",
          deviation: "high",
          noDosing: true,
        },
      ],
      testWithProviron
    );
    expect(alerts.some((a) => a.id === "e2-no-ai")).toBe(false);
  });

  it("does not flag prolactin for EQ-only stack", () => {
    const eqStack: CycleCompound[] = [
      {
        id: "eq-1",
        compoundId: "eq",
        doseMg: 400,
        frequency: "weekly",
        activeWeeks: [1, 12],
        route: "injectable",
      },
    ];
    const alerts = generateCrossAlerts(
      { prolactin: { markerId: "prolactin", value: 18, unit: "ng/mL" } },
      [
        {
          markerId: "prolactin",
          name: "Prolactin",
          value: 18,
          unit: "ng/mL",
          date: "2026-01-01",
          severity: "high",
          labRange: "",
          optimalRange: "",
          deviation: "high",
          noDosing: true,
        },
      ],
      eqStack
    );
    expect(alerts.some((a) => a.id === "prolactin-19nor")).toBe(false);
  });
});