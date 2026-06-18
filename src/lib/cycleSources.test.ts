import { describe, expect, it } from "vitest";
import { CYCLE_SOURCES } from "@/data/cycleSources";

describe("cycleSources", () => {
  it("lists WWB, PCT.ZONE, and ruo.bio", () => {
    const ids = CYCLE_SOURCES.map((s) => s.id);
    expect(ids).toEqual(["wwb", "pct-zone", "ruo-bio"]);
  });

  it("includes WWB telegram and verification email", () => {
    const wwb = CYCLE_SOURCES.find((s) => s.id === "wwb");
    expect(wwb?.contacts.some((c) => c.href === "https://t.me/Cavan221")).toBe(true);
    expect(wwb?.contacts.some((c) => c.value === "wslabus@gmail.com")).toBe(true);
    expect(wwb?.contacts.filter((c) => c.kind === "whatsapp").length).toBe(9);
  });
});