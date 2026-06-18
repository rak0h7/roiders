import { beforeEach, describe, expect, it, vi } from "vitest";
import { LOCAL_STORAGE_KEYS, readLocalModule, writeLocalModule } from "./cloudSync";

function mockBrowserStorage() {
  vi.stubGlobal("window", {});
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
  });
  return store;
}

describe("cloudSync", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    mockBrowserStorage();
  });

  it("reads and writes local modules", () => {
    const data = [{ id: "r1", name: "Panel", date: "2026-01-01", values: [] }];
    writeLocalModule("labs", data, "2026-01-01T00:00:00.000Z");
    expect(readLocalModule("labs")).toEqual(data);
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.labs)).toBeTruthy();
  });

  it("stores sync metadata on write", () => {
    writeLocalModule("cycle", { state: { compounds: [] } }, "2026-06-01T12:00:00.000Z");
    const meta = JSON.parse(localStorage.getItem("roiders-club-sync-meta") ?? "{}");
    expect(meta.cycle).toBe("2026-06-01T12:00:00.000Z");
  });
});