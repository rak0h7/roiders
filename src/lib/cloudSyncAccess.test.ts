import { describe, expect, it } from "vitest";
import { canUserCloudSync, PREMIUM_SYNC_REQUIRED_MESSAGE } from "./cloudSyncAccess";

describe("cloudSyncAccess", () => {
  it("requires site and user premium flags", () => {
    expect(canUserCloudSync(true, { premium_sync_enabled: true })).toBe(true);
    expect(canUserCloudSync(true, { premium_sync_enabled: false })).toBe(false);
    expect(canUserCloudSync(false, { premium_sync_enabled: true })).toBe(false);
  });

  it("documents the premium message", () => {
    expect(PREMIUM_SYNC_REQUIRED_MESSAGE).toContain("premium");
  });
});