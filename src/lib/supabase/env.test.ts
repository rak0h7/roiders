import { afterEach, describe, expect, it, vi } from "vitest";

describe("hasServiceRoleKey", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns true for sb_secret service keys", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "sb_secret_test_key");
    const { hasServiceRoleKey, hasSupabaseServiceKey } = await import("./env");
    expect(hasServiceRoleKey()).toBe(true);
    expect(hasSupabaseServiceKey()).toBe(false);
  });

  it("returns false when no service key is configured", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const { hasServiceRoleKey } = await import("./env");
    expect(hasServiceRoleKey()).toBe(false);
  });
});