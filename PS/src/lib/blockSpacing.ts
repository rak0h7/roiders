import type { TextBlock, TextBlockRole } from "./canvasTypes";

const LINE_HEIGHT_BY_ROLE: Record<TextBlockRole, number> = {
  headline: 14,
  subhead: 7,
  body: 6,
  label: 5,
  badge: 6,
  cta: 8,
  footer: 9,
};

const MIN_GAP = 3;

const CHARS_PER_LINE: Record<TextBlockRole, number> = {
  headline: 11,
  subhead: 20,
  body: 26,
  label: 24,
  badge: 16,
  cta: 14,
  footer: 18,
};

function estimateLines(block: TextBlock): number {
  const explicit = block.text.split("\n").length;
  const charsPerLine = Math.max(8, Math.round((block.width / 100) * CHARS_PER_LINE[block.role]));
  const wrapped = Math.ceil(block.text.length / charsPerLine);
  return Math.max(explicit, wrapped, 1);
}

function estimateHeightPercent(block: TextBlock): number {
  const lines = estimateLines(block);
  const lineHeight = block.fontSize
    ? Math.min(14, Math.max(6, block.fontSize / 6))
    : LINE_HEIGHT_BY_ROLE[block.role];
  return Math.min(55, lines * lineHeight);
}

/** Push blocks down so multi-line text does not overlap the next block. */
export function spaceBlocksVertically(blocks: TextBlock[]): TextBlock[] {
  if (blocks.length <= 1) return blocks;

  const sorted = [...blocks].sort((a, b) => a.y - b.y || a.x - b.x);
  let cursor = sorted[0].y;

  return sorted.map((block, index) => {
    const y = index === 0 ? block.y : Math.max(block.y, cursor);
    cursor = y + estimateHeightPercent(block) + MIN_GAP;
    return { ...block, y: Math.min(92, y) };
  });
}