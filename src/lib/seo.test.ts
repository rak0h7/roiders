import { describe, expect, it } from "vitest";
import { buildPageMetadata, DEFAULT_SITE_DESCRIPTION, PUBLIC_FAQ, resolveSiteDescription } from "./seo";

describe("seo", () => {
  it("uses default description when empty", () => {
    expect(resolveSiteDescription("")).toBe(DEFAULT_SITE_DESCRIPTION);
    expect(resolveSiteDescription("  ", "tag")).toContain("tag");
  });

  it("prefers explicit site description", () => {
    expect(resolveSiteDescription("Custom copy")).toBe("Custom copy");
  });

  it("marks public pages indexable with canonical URLs", () => {
    const meta = buildPageMetadata({
      title: "Test",
      description: "Test description",
      path: "/about",
    });
    expect(meta.robots).toEqual({ index: true, follow: true });
    expect(meta.alternates?.canonical).toBe("https://roiders.club/about");
  });

  it("keeps public FAQ focused on product questions", () => {
    expect(PUBLIC_FAQ.length).toBeGreaterThan(0);
    expect(PUBLIC_FAQ.some((item) => item.question.toLowerCase().includes("riders club"))).toBe(false);
    expect(PUBLIC_FAQ.some((item) => item.question.toLowerCase().includes("steroid shop"))).toBe(false);
  });
});