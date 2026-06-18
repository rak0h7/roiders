import { describe, expect, it, beforeEach } from "vitest";
import {
  clearHomeScreenPromptPending,
  isHomeScreenPromptPending,
  markHomeScreenPromptPending,
} from "./homeScreenPrompt";

describe("homeScreenPrompt", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("tracks pending prompt across mark and clear", () => {
    expect(isHomeScreenPromptPending()).toBe(false);
    markHomeScreenPromptPending();
    expect(isHomeScreenPromptPending()).toBe(true);
    clearHomeScreenPromptPending();
    expect(isHomeScreenPromptPending()).toBe(false);
  });
});