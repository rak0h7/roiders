import { describe, expect, it } from "vitest";
import { formatUsername, normalizeUsername, validateUsername } from "./username";

describe("normalizeUsername", () => {
  it("trims, lowercases, and strips leading @", () => {
    expect(normalizeUsername("  @MyUser  ")).toBe("myuser");
  });
});

describe("validateUsername", () => {
  it("rejects empty and short usernames", () => {
    expect(validateUsername("")).toBe("Username is required");
    expect(validateUsername("ab")).toBe("At least 3 characters");
  });

  it("rejects invalid characters", () => {
    expect(validateUsername("1bad")).toMatch(/start with a letter/);
    expect(validateUsername("bad-name")).toMatch(/start with a letter/);
  });

  it("rejects reserved names", () => {
    expect(validateUsername("admin")).toBe("This username is reserved");
  });

  it("accepts valid usernames", () => {
    expect(validateUsername("roider_42")).toBeNull();
  });
});

describe("formatUsername", () => {
  it("prefixes with @ when present", () => {
    expect(formatUsername("roider")).toBe("@roider");
    expect(formatUsername(null)).toBeNull();
  });
});