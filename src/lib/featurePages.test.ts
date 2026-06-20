import { describe, expect, it } from "vitest";
import { FEATURE_PAGES, FEATURE_SLUGS, getFeaturePage } from "./featurePages";

describe("featurePages", () => {
  it("defines three unique feature slugs", () => {
    expect(FEATURE_SLUGS).toEqual(["labs", "gear", "training"]);
    expect(new Set(FEATURE_SLUGS).size).toBe(3);
  });

  it("provides unique meta descriptions and semantic headings per page", () => {
    const descriptions = FEATURE_PAGES.map((page) => page.metaDescription);
    expect(new Set(descriptions).size).toBe(3);

    for (const page of FEATURE_PAGES) {
      expect(page.h1.trim().length).toBeGreaterThan(10);
      expect(page.sections.length).toBeGreaterThanOrEqual(3);
      expect(page.sections.every((section) => section.subFeatures.length >= 3)).toBe(true);
    }
  });

  it("resolves pages by slug", () => {
    expect(getFeaturePage("labs")?.h1).toContain("Bloodwork");
    expect(getFeaturePage("invalid")).toBeUndefined();
  });
});