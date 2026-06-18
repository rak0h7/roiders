import { describe, expect, it } from "vitest";
import { DEFAULT_SITE_DESCRIPTION, resolveSiteDescription } from "./seo";

describe("seo", () => {
  it("uses default description when empty", () => {
    expect(resolveSiteDescription("")).toBe(DEFAULT_SITE_DESCRIPTION);
    expect(resolveSiteDescription("  ", "tag")).toContain("tag");
  });

  it("prefers explicit site description", () => {
    expect(resolveSiteDescription("Custom copy")).toBe("Custom copy");
  });
});