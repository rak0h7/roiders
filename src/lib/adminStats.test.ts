import { describe, expect, it } from "vitest";
import {
  buildSignupsByDay,
  buildSyncActivityByDay,
  computeAccountUtilizationPct,
  computeAccountsRemaining,
  computeDbUsagePct,
  formatBytes,
  SUPABASE_FREE_DB_BYTES,
} from "./adminStats";

describe("adminStats helpers", () => {
  it("formats byte sizes", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(2 * 1024 * 1024)).toBe("2.00 MB");
  });

  it("computes account capacity", () => {
    expect(computeAccountsRemaining(50, 12)).toBe(38);
    expect(computeAccountsRemaining(0, 12)).toBeNull();
    expect(computeAccountUtilizationPct(50, 25)).toBe(50);
    expect(computeAccountUtilizationPct(50, 60)).toBe(100);
  });

  it("computes database usage percent", () => {
    const half = SUPABASE_FREE_DB_BYTES / 2;
    expect(computeDbUsagePct(half)).toBe(50);
  });

  it("builds signup buckets for last 30 days", () => {
    const now = new Date("2026-06-18T12:00:00Z").getTime();
    const rows = buildSignupsByDay(["2026-06-18T10:00:00Z", "2026-06-18T11:00:00Z"], 7, now);
    expect(rows).toHaveLength(7);
    expect(rows.at(-1)?.count).toBe(2);
  });

  it("builds sync activity buckets", () => {
    const now = new Date("2026-06-18T12:00:00Z").getTime();
    const rows = buildSyncActivityByDay(["2026-06-17T10:00:00Z", "2026-06-18T08:00:00Z"], 7, now);
    expect(rows).toHaveLength(7);
    expect(rows.reduce((s, r) => s + r.syncs, 0)).toBe(2);
  });
});