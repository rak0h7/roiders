import { describe, expect, it } from "vitest";
import {
  annotateExtractedHistorical,
  DEMO_LAB_TEXT,
  SAMPLE_LAB_TEXT,
  parseCSV,
  parseLabText,
} from "./parser";

describe("parseLabText", () => {
  it("parses sample lab text with correct values", () => {
    const results = parseLabText(SAMPLE_LAB_TEXT);
    const byId = Object.fromEntries(results.map((r) => [r.markerId, r]));

    expect(byId["total-testosterone"]?.value).toBe(850);
    expect(byId["estradiol"]?.value).toBe(42);
    expect(byId.alt?.value).toBe(35);
    expect(byId.hematocrit?.value).toBe(45.1);
    expect(byId.platelets?.value).toBe(265);
    expect(byId.wbc?.value).toBe(6.8);
  });

  it("parses demo panel including SI units", () => {
    const results = parseLabText(DEMO_LAB_TEXT);
    const byId = Object.fromEntries(results.map((r) => [r.markerId, r]));

    expect(results.length).toBeGreaterThan(25);
    expect(byId.platelets?.value).toBe(610);
    expect(byId.platelets?.unit).toBe("K/µL");
    expect(byId.wbc?.value).toBe(13.2);
    expect(byId["total-testosterone"]?.value).toBe(1500);
    expect(byId.alt?.value).toBe(145);
    expect(byId.creatinine?.value).toBe(1.64);
  });

  it("selects only abnormal rows from CSV import", () => {
    const csv = `Marker,Value,Unit
Total Testosterone,850,ng/dL
Estradiol,42,pg/mL
LH,5,mIU/mL`;

    const results = parseCSV(csv);
    const byId = Object.fromEntries(results.map((r) => [r.markerId, r]));

    expect(byId["total-testosterone"]?.selected).toBe(false);
    expect(byId.estradiol?.selected).toBe(true);
    expect(byId.lh?.selected).toBe(false);
  });

  it("marks extracted markers as historical when they match loaded values", () => {
    const extracted = parseLabText("Total Testosterone: 850 ng/dL\nEstradiol: 42 pg/mL");
    const annotated = annotateExtractedHistorical(extracted, {
      "total-testosterone": { markerId: "total-testosterone", value: 800, unit: "ng/dL" },
    });

    const byId = Object.fromEntries(annotated.map((r) => [r.markerId, r]));
    expect(byId["total-testosterone"]?.isHistorical).toBe(true);
    expect(byId.estradiol?.isHistorical).toBe(false);
  });

  it("parses tab-separated PDF-style rows", () => {
    const text = `Total Testosterone\t850\tng/dL
Estradiol\t42\tpg/mL
ALT\t35\tU/L`;
    const results = parseLabText(text);
    expect(results).toHaveLength(3);
    expect(results[0].markerId).toBe("total-testosterone");
    expect(results[0].value).toBe(850);
  });
});