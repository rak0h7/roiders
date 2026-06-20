import { describe, expect, it } from "vitest";
import { calculateCategoryScores } from "./scoring";
import type { MarkerValue } from "./types";

describe("calculateCategoryScores", () => {
  it("shows EASY tag with assessed count when all markers are normal", () => {
    const values: Record<string, MarkerValue> = {
      lh: { markerId: "lh", value: 5, unit: "mIU/mL" },
      fsh: { markerId: "fsh", value: 3, unit: "mIU/mL" },
    };

    const scores = calculateCategoryScores(values);
    const hormonal = scores.find((s) => s.category === "hormonal");
    expect(hormonal?.tags.some((t) => t.label === "2 EASY")).toBe(true);
  });

  it("does not show EASY tag when markers have penalties", () => {
    const values: Record<string, MarkerValue> = {
      "free-testosterone": { markerId: "free-testosterone", value: 5, unit: "pg/mL" },
    };

    const scores = calculateCategoryScores(values);
    const hormonal = scores.find((s) => s.category === "hormonal");
    expect(hormonal?.tags.some((t) => t.type === "easy")).toBe(false);
  });
});