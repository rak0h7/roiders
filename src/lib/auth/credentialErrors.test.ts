import { describe, expect, it } from "vitest";
import { isInvalidCredentialsError } from "./credentialErrors";

describe("isInvalidCredentialsError", () => {
  it("detects Supabase invalid credential messages", () => {
    expect(isInvalidCredentialsError("Invalid login credentials")).toBe(true);
    expect(isInvalidCredentialsError("invalid credentials")).toBe(true);
    expect(isInvalidCredentialsError("Profile lookup failed")).toBe(false);
    expect(isInvalidCredentialsError(undefined)).toBe(false);
  });
});