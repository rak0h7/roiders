import { describe, expect, it } from "vitest";
import type { TextBlock } from "./canvasTypes";
import { spaceBlocksVertically } from "./blockSpacing";

function block(partial: Partial<TextBlock> & Pick<TextBlock, "role" | "y" | "text">): TextBlock {
  return {
    id: "b1",
    x: 0,
    width: 100,
    align: "left",
    ...partial,
  };
}

describe("spaceBlocksVertically", () => {
  it("pushes subhead below a multi-line headline", () => {
    const blocks = spaceBlocksVertically([
      block({
        id: "h",
        role: "headline",
        y: 18,
        text: "HOW TO RUN YOUR FIRST CYCLE",
      }),
      block({
        id: "s",
        role: "subhead",
        y: 32,
        text: "A guide from roiders.club",
      }),
    ]);

    expect(blocks[1].y).toBeGreaterThanOrEqual(blocks[0].y + 20);
  });
});