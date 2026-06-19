import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./safeRedirect";

describe("safeRedirectPath", () => {
  it("allows same-origin relative paths", () => {
    expect(safeRedirectPath("/labs/log")).toBe("/labs/log");
    expect(safeRedirectPath("/settings")).toBe("/settings");
  });

  it("blocks external and protocol-relative redirects", () => {
    expect(safeRedirectPath("https://evil.com")).toBe("/");
    expect(safeRedirectPath("//evil.com")).toBe("/");
    expect(safeRedirectPath("javascript:alert(1)")).toBe("/");
  });

  it("falls back when empty", () => {
    expect(safeRedirectPath(null)).toBe("/");
    expect(safeRedirectPath("  ")).toBe("/");
  });
});