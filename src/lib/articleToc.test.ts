import { describe, expect, it } from "vitest";
import { buildArticleToc } from "./articleToc";
import type { ArticleBlock } from "./articleTypes";

const SECTIONS: ArticleBlock[] = [
  { heading: "Introduction", body: "Hello" },
  { body: "No heading" },
  { heading: "Dosing", body: "Details" },
];

describe("buildArticleToc", () => {
  it("skips sections without headings", () => {
    expect(buildArticleToc(SECTIONS)).toEqual([
      { heading: "Introduction", slug: "introduction" },
      { heading: "Dosing", slug: "dosing" },
    ]);
  });

  it("includes section kinds when requested", () => {
    const toc = buildArticleToc(SECTIONS, { includeKind: true });
    expect(toc[0]?.kind).toBeDefined();
    expect(toc[1]?.heading).toBe("Dosing");
  });
});