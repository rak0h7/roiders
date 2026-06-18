import { describe, expect, it } from "vitest";
import { accountLabel, internalEmail, normalizeAccessKey } from "./accessKey.shared";

describe("normalizeAccessKey", () => {
  it("lowercases and removes whitespace", () => {
    expect(normalizeAccessKey("  Roiders_ABCD_EFGH_IJKL  ")).toBe("roiders_abcd_efgh_ijkl");
  });
});

describe("internalEmail", () => {
  it("uses internal domain", () => {
    expect(internalEmail("uuid-123")).toBe("uuid-123@users.roidersclub.internal");
  });
});

describe("accountLabel", () => {
  it("shows last four fingerprint chars", () => {
    expect(accountLabel("bc264c3071b8db19")).toBe("Account ···db19");
  });
});