import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearAccountLocalData,
  ensureAccountStorageScope,
  getActiveAccountUserId,
  setActiveAccountUserId,
} from "./accountStorage";
import { LOCAL_STORAGE_KEYS } from "./cloudSync";

vi.mock("./storeRehydrate", () => ({
  rehydratePersistedStores: vi.fn(async () => undefined),
}));

function mockBrowserStorage() {
  vi.stubGlobal("window", {});
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  });
  return store;
}

describe("accountStorage", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    mockBrowserStorage();
  });

  it("clears module keys and active user marker", () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.labs, "[]");
    localStorage.setItem("roiders-club-sync-meta", "{}");
    setActiveAccountUserId("user-a");

    clearAccountLocalData();

    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.labs)).toBeNull();
    expect(localStorage.getItem("roiders-club-sync-meta")).toBeNull();
    expect(getActiveAccountUserId()).toBeNull();
  });

  it("clears persisted data when the active account changes", async () => {
    setActiveAccountUserId("user-a");
    localStorage.setItem(LOCAL_STORAGE_KEYS.cycle, '{"state":{"compounds":[]}}');

    const switched = await ensureAccountStorageScope("user-b");

    expect(switched).toBe(true);
    expect(getActiveAccountUserId()).toBe("user-b");
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.cycle)).toBeNull();
  });

  it("keeps storage when the same account signs in again", async () => {
    setActiveAccountUserId("user-a");
    localStorage.setItem(LOCAL_STORAGE_KEYS.labs, "[]");

    const switched = await ensureAccountStorageScope("user-a");

    expect(switched).toBe(false);
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.labs)).toBe("[]");
  });
});