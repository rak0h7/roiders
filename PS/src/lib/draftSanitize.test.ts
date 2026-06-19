import { describe, expect, it } from "vitest";
import type { EditorDraft, TextBlock } from "./canvasTypes";
import { validateDraft, migrateDraftSpacing, CURRENT_SPACING_VERSION } from "./draftSanitize";
import { createDefaultDraft } from "./projectTypes";

const defaults = createDefaultDraft();

function block(overrides: Partial<TextBlock>): TextBlock {
  return {
    id: "b1",
    x: 42,
    y: 55,
    width: 80,
    text: "Saved text",
    role: "headline",
    align: "left",
    ...overrides,
  };
}

describe("validateDraft", () => {
  it("preserves saved block positions", () => {
    const stored: EditorDraft = {
      blocks: [block({ x: 42, y: 55 })],
      canvasSizeId: "pinterest-pin",
      layoutPresetId: "roiders-club",
      selectedBlockId: null,
    };

    const result = validateDraft(stored, defaults);
    expect(result.blocks[0].x).toBe(42);
    expect(result.blocks[0].y).toBe(55);
    expect(result.blocks[0].text).toBe("Saved text");
  });

  it("preserves intentionally empty canvas", () => {
    const stored: EditorDraft = {
      blocks: [],
      canvasSizeId: "9:16",
      layoutPresetId: "roiders-club",
      selectedBlockId: null,
    };

    const result = validateDraft(stored, defaults);
    expect(result.blocks).toHaveLength(0);
  });

  it("does not reset positions to template values", () => {
    const stored: EditorDraft = {
      blocks: [
        block({ id: "h", role: "headline", x: 5, y: 20 }),
        block({ id: "s", role: "subhead", x: 5, y: 60, text: "Sub" }),
      ],
      canvasSizeId: "pinterest-pin",
      layoutPresetId: "roiders-club",
      selectedBlockId: null,
    };

    const result = validateDraft(stored, defaults);
    expect(result.blocks.find((b) => b.id === "h")?.y).toBe(20);
    expect(result.blocks.find((b) => b.id === "s")?.y).toBe(60);
  });
});

describe("migrateDraftSpacing", () => {
  it("applies spacing once and sets spacingVersion", () => {
    const draft: EditorDraft = {
      blocks: [
        block({ id: "h", role: "headline", y: 14, text: "HOW TO RUN YOUR FIRST CYCLE" }),
        block({ id: "s", role: "subhead", y: 32, text: "A guide" }),
      ],
      canvasSizeId: "pinterest-pin",
      layoutPresetId: "roiders-club",
      selectedBlockId: null,
      spacingVersion: 0,
    };

    const migrated = migrateDraftSpacing(draft);
    expect(migrated.spacingVersion).toBe(CURRENT_SPACING_VERSION);
    expect(migrated.blocks[1].y).toBeGreaterThan(migrated.blocks[0].y + 20);

    const again = migrateDraftSpacing(migrated);
    expect(again.blocks[1].y).toBe(migrated.blocks[1].y);
  });
});