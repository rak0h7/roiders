import { describe, expect, it } from "vitest";
import { labsModuleChanged } from "./storeRehydrate";

describe("labsModuleChanged", () => {
  it("returns true when labs is included", () => {
    expect(labsModuleChanged({ modules: ["cycle", "labs"] })).toBe(true);
  });

  it("returns false when only non-labs modules changed", () => {
    expect(labsModuleChanged({ modules: ["cycle", "gym"] })).toBe(false);
  });

  it("returns true for legacy events without module detail", () => {
    expect(labsModuleChanged(undefined)).toBe(true);
    expect(labsModuleChanged({ modules: [] })).toBe(true);
  });
});