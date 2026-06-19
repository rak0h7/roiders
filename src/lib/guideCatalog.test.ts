import { describe, expect, it } from "vitest";
import { getProfileById } from "@/data/compoundProfiles";
import {
  buildGuideCatalog,
  cleanText,
  filterGuideEntries,
  getDisplayProfileById,
  matchesGuideQuery,
  sanitizeProfile,
} from "@/lib/guideCatalog";

describe("guideCatalog", () => {
  it("cleans leading colons from imported copy", () => {
    const ll37 = getProfileById("ll-37");
    expect(ll37).toBeDefined();
    const cleaned = sanitizeProfile(ll37!);
    expect(cleaned.sections[0]?.body?.startsWith(":")).toBe(false);
  });

  it("strips concatenated compound titles from side effects", () => {
    const finasteride = getProfileById("finasteride-propecia-proscar");
    expect(finasteride).toBeDefined();
    const cleaned = sanitizeProfile(finasteride!);
    const sideEffects = cleaned.sections.find((s) => s.heading === "Side Effects");
    expect(sideEffects?.body).not.toContain("Dutasteride (Avodart)");
  });

  it("keeps complete taglines without truncation ellipsis", () => {
    const cartalax = getProfileById("cartalax-ala-glu-asp");
    expect(cartalax).toBeDefined();
    const cleaned = sanitizeProfile(cartalax!);
    expect(cleaned.tagline?.endsWith("…")).toBe(false);
    expect(cleaned.tagline?.length).toBeGreaterThan(40);
  });

  it("matches search across aliases and section text", () => {
    const test = getDisplayProfileById("testosterone");
    expect(test).toBeDefined();
    expect(matchesGuideQuery(test!, "test e")).toBe(true);
    expect(matchesGuideQuery(test!, "aromatase")).toBe(true);
    expect(matchesGuideQuery(test!, "zzznomatch")).toBe(false);
  });

  it("builds a catalog entry for every guide section profile", () => {
    const catalog = buildGuideCatalog();
    expect(catalog.length).toBeGreaterThan(100);
    const ids = new Set(catalog.map((e) => e.profile.id));
    expect(ids.has("testosterone")).toBe(true);
    expect(ids.has("nolvadex")).toBe(true);
  });

  it("filters by section and query together", () => {
    const catalog = buildGuideCatalog();
    const peptideOnly = filterGuideEntries(catalog, "", "peptides");
    expect(peptideOnly.every((e) => e.sectionId === "peptides")).toBe(true);

    const trenHits = filterGuideEntries(catalog, "tren", "all");
    expect(trenHits.some((e) => e.profile.id === "trenbolone")).toBe(true);
  });

  it("normalizes whitespace via cleanText", () => {
    expect(cleanText("  hello   world  ")).toBe("hello world");
    expect(cleanText(": leading colon")).toBe("leading colon");
  });

  const NEW_GUIDE_IDS = [
    "epa-dha-omega-3",
    "citrus-bergamot",
    "coq10",
    "taurine",
    "tudca",
    "ketoconazole-shampoo",
    "ru58841",
  ] as const;

  it("includes newly added support and hair guide entries", () => {
    const catalog = buildGuideCatalog();
    const ids = new Set(catalog.map((e) => e.profile.id));
    for (const id of NEW_GUIDE_IDS) {
      expect(ids.has(id), `missing guide ${id}`).toBe(true);
      expect(getDisplayProfileById(id)).toBeDefined();
    }
  });

  it("places TUDCA in support section, not peptides", () => {
    const catalog = buildGuideCatalog();
    const tudca = catalog.find((e) => e.profile.id === "tudca");
    expect(tudca?.sectionId).toBe("support");
  });

  it("matches omega-3 search aliases", () => {
    const omega = getDisplayProfileById("epa-dha-omega-3");
    expect(omega).toBeDefined();
    expect(matchesGuideQuery(omega!, "fish oil")).toBe(true);
    expect(matchesGuideQuery(omega!, "epa")).toBe(true);
  });
});