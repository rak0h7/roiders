import { describe, expect, it } from "vitest";
import { CYCLE_SOURCES } from "@/data/cycleSources";

describe("cycleSources", () => {
  it("lists all premium sources", () => {
    const ids = CYCLE_SOURCES.map((s) => s.id);
    expect(ids).toEqual(["wwb", "pct-zone", "ruo-bio", "algorx", "opti-usa", "nexus-pharma"]);
  });

  it("includes ALGORX, Opti USA, and Nexus Pharma URLs", () => {
    const urls = CYCLE_SOURCES.flatMap((s) => s.contacts.map((c) => c.href));
    expect(urls).toContain("https://algorx.ai/");
    expect(urls).toContain("https://optiusa.io");
    expect(urls).toContain("https://nexuspharma.to/");
  });

  it("includes WWB telegram and verification email", () => {
    const wwb = CYCLE_SOURCES.find((s) => s.id === "wwb");
    expect(wwb?.contacts.some((c) => c.href === "https://t.me/Cavan221")).toBe(true);
    expect(wwb?.contacts.some((c) => c.value === "wslabus@gmail.com")).toBe(true);
    expect(wwb?.contacts.filter((c) => c.kind === "whatsapp").length).toBe(9);
  });
});