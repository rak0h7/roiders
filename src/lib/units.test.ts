import { describe, expect, it } from "vitest";
import { normalizeToDefaultUnit, normalizeUnitString } from "./units";

describe("normalizeUnitString", () => {
  it("normalizes scientific cell count units", () => {
    expect(normalizeUnitString("10^9/L")).toBe("x10^9/L");
    expect(normalizeUnitString("x10*9/L")).toBe("x10^9/L");
  });
});

describe("normalizeToDefaultUnit", () => {
  it("converts testosterone nmol/L to ng/dL", () => {
    const r = normalizeToDefaultUnit("total-testosterone", 30, "nmol/L", "ng/dL");
    expect(r.converted).toBe(true);
    expect(r.value).toBeCloseTo(865.4, 0);
  });

  it("converts platelets x10^9/L to K/µL", () => {
    const r = normalizeToDefaultUnit("platelets", 610, "x10^9/L", "K/µL");
    expect(r.value).toBe(610);
    expect(r.unit).toBe("K/µL");
  });

  it("converts LDL mmol/L to mg/dL", () => {
    const r = normalizeToDefaultUnit("ldl", 3.8, "mmol/L", "mg/dL");
    expect(r.converted).toBe(true);
    expect(r.value).toBeCloseTo(146.9, 0);
  });

  it("converts creatinine µmol/L to mg/dL", () => {
    const r = normalizeToDefaultUnit("creatinine", 145, "µmol/L", "mg/dL");
    expect(r.converted).toBe(true);
    expect(r.value).toBeCloseTo(1.64, 1);
  });

  it("converts urea mmol/L to mg/dL BUN", () => {
    const r = normalizeToDefaultUnit("urea", 5.7, "mmol/L", "mg/dL");
    expect(r.converted).toBe(true);
    expect(r.value).toBeCloseTo(15.97, 0);
  });
});