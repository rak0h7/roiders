import { beforeEach, describe, expect, it, vi } from "vitest";
import { safeSetLocalStorage, STORAGE_QUOTA_EVENT } from "./safeLocalStorage";

function mockBrowserStorage(options?: { throwOnSet?: boolean }) {
  vi.stubGlobal("window", {
    dispatchEvent: vi.fn(),
  });
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (options?.throwOnSet) throw new DOMException("QuotaExceededError");
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

describe("safeSetLocalStorage", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("writes successfully", () => {
    mockBrowserStorage();
    expect(safeSetLocalStorage("test-key", "value")).toBe(true);
    expect(localStorage.getItem("test-key")).toBe("value");
  });

  it("returns false and dispatches event on quota failure", () => {
    mockBrowserStorage({ throwOnSet: true });
    const dispatchEvent = vi.spyOn(window, "dispatchEvent");

    expect(safeSetLocalStorage("test-key", "value")).toBe(false);
    expect(dispatchEvent).toHaveBeenCalledOnce();
    expect(dispatchEvent.mock.calls[0]?.[0]).toBeInstanceOf(CustomEvent);
    expect((dispatchEvent.mock.calls[0]?.[0] as CustomEvent).type).toBe(STORAGE_QUOTA_EVENT);
  });
});