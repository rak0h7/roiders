import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ensureModuleSyncMeta,
  isModuleDataEmpty,
  isNutritionPersistedDataEmpty,
  LEGACY_LOCAL_EPOCH,
  LOCAL_STORAGE_KEYS,
  SYNC_META_KEY,
  readLocalModule,
  shouldPushModule,
  shouldTakeRemote,
  writeLocalModule,
} from "./cloudSync";

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
    const meta = JSON.parse(localStorage.getItem(SYNC_META_KEY) ?? "{}");
    expect(meta.cycle).toBe("2026-06-01T12:00:00.000Z");
  });

  it("treats empty labs array as empty module data", () => {
    expect(isModuleDataEmpty("labs", [])).toBe(true);
    expect(isModuleDataEmpty("labs", [{ id: "r1", name: "Panel", date: "2026-01-01", values: [] }])).toBe(false);
  });

  it("only pushes modules when local is newer than remote", () => {
    writeLocalModule("labs", [{ id: "r1", name: "Panel", date: "2026-01-01", values: [] }], "2026-06-02T00:00:00.000Z");
    expect(shouldPushModule("labs", "2026-06-01T00:00:00.000Z")).toBe(true);
    expect(shouldPushModule("labs", "2026-06-03T00:00:00.000Z")).toBe(false);
  });

  it("prefers newer local timestamps over richer remote data on pull", () => {
    const local = [{ id: "r1", name: "Trimmed", date: "2026-01-01", values: [] }];
    const remote = [
      { id: "r1", name: "Trimmed", date: "2026-01-01", values: [] },
      { id: "r2", name: "Stale", date: "2026-01-02", values: [] },
    ];
    writeLocalModule("labs", local, "2026-06-03T00:00:00.000Z");

    expect(shouldTakeRemote("labs", local, remote, "2026-06-01T00:00:00.000Z")).toBe(false);
  });

  it("uses richness only when timestamps tie on pull", () => {
    const local = [{ id: "r1", name: "One", date: "2026-01-01", values: [] }];
    const remote = [
      { id: "r1", name: "One", date: "2026-01-01", values: [] },
      { id: "r2", name: "Two", date: "2026-01-02", values: [] },
    ];
    const tiedAt = "2026-06-01T00:00:00.000Z";
    writeLocalModule("labs", local, tiedAt);

    expect(shouldTakeRemote("labs", local, remote, tiedAt)).toBe(true);
    expect(shouldTakeRemote("labs", remote, local, tiedAt)).toBe(false);
  });

  it("aligns pull and push when legacy local data has no sync meta", () => {
    const data = [{ id: "r1", name: "Legacy", date: "2026-01-01", values: [] }];
    localStorage.setItem(LOCAL_STORAGE_KEYS.labs, JSON.stringify(data));

    ensureModuleSyncMeta("labs");
    const meta = JSON.parse(localStorage.getItem(SYNC_META_KEY) ?? "{}");
    expect(meta.labs).toBe(LEGACY_LOCAL_EPOCH);

    expect(shouldTakeRemote("labs", data, data, "2026-06-01T00:00:00.000Z")).toBe(true);
    expect(shouldPushModule("labs", "2026-06-01T00:00:00.000Z")).toBe(false);
    expect(shouldPushModule("labs", null)).toBe(true);
  });

  it("treats nutrition with onboarding or custom goals as non-empty", () => {
    expect(isNutritionPersistedDataEmpty({ state: { logs: {} } })).toBe(true);
    expect(
      isNutritionPersistedDataEmpty({ state: { logs: {}, onboardingComplete: true } })
    ).toBe(false);
    expect(
      isNutritionPersistedDataEmpty({
        state: { logs: {}, goals: { calories: 3000, protein: 165, fat: 73, carbs: 220, fiber: 30 } },
      })
    ).toBe(false);
  });
});