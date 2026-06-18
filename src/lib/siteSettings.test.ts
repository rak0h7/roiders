import { describe, expect, it } from "vitest";
import { DEFAULT_SITE_SETTINGS, validateSiteSettingsPatch } from "@/lib/siteSettings";

describe("siteSettings", () => {
  it("validates new extended fields", () => {
    expect(validateSiteSettingsPatch({ default_labs_range_mode: "optimized" })).toBeNull();
    expect(validateSiteSettingsPatch({ default_labs_range_mode: "lab" })).toBeNull();
    expect(validateSiteSettingsPatch({ default_labs_range_mode: "invalid" as "lab" })).toContain("range mode");

    expect(validateSiteSettingsPatch({ site_description: "x".repeat(201) })).toContain("description");
    expect(validateSiteSettingsPatch({ signup_closed_message: "x".repeat(301) })).toContain("Signup closed");
  });

  it("includes extended defaults", () => {
    expect(DEFAULT_SITE_SETTINGS.public_landing_enabled).toBe(true);
    expect(DEFAULT_SITE_SETTINGS.premium_sources_enabled).toBe(true);
    expect(DEFAULT_SITE_SETTINGS.default_labs_range_mode).toBe("optimized");
  });
});