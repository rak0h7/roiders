import { describe, expect, it } from "vitest";
import type { CycleCompound } from "@/lib/cycleTypes";
import {
  has19Nor,
  hasEstrogenControl,
  hasAromatizer,
} from "@/lib/stackAnalysis";

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

const provironTestStack: CycleCompound[] = [
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

describe("stackAnalysis", () => {
  it("does not treat EQ as a 19-nor", () => {
    expect(has19Nor(eqStack)).toBe(false);
  });

  it("recognizes proviron as estrogen control via AI tag", () => {
    expect(hasAromatizer(provironTestStack)).toBe(true);
    expect(hasEstrogenControl(provironTestStack)).toBe(true);
  });

  it("flags deca as 19-nor", () => {
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
    expect(has19Nor(decaStack)).toBe(true);
  });
});