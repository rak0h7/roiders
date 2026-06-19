import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const setSession = vi.fn().mockResolvedValue({ error: null });

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { setSession },
  }),
}));

vi.mock("@/lib/supabase/env", () => ({
  getSupabaseUrl: () => "https://example.supabase.co",
  getSupabaseAnonKey: () => "anon-key",
}));

describe("jsonWithSession", () => {
  it("returns session tokens in the JSON body for client setSession", async () => {
    const { jsonWithSession } = await import("./route");
    const request = new NextRequest("https://roiders.club/api/auth/login", { method: "POST" });

    const response = await jsonWithSession(
      request,
      { access_token: "access-123", refresh_token: "refresh-456" },
      { ok: true }
    );

    const body = (await response.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body.access_token).toBe("access-123");
    expect(body.refresh_token).toBe("refresh-456");
    expect(setSession).toHaveBeenCalledWith({
      access_token: "access-123",
      refresh_token: "refresh-456",
    });
  });
});