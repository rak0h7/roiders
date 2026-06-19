import { blocksFromPreset, LAYOUT_PRESETS } from "./contentPresets";
import { layoutBlocksForCanvas } from "./layoutPlacement";
import { normalizeCanvasSizeId } from "./canvasSizes";
import type { EditorDraft, LayoutPresetId, TextBlock } from "./canvasTypes";

const LAYOUT_IDS = new Set<string>(LAYOUT_PRESETS.map((p) => p.id));

function isLayoutPresetId(id: string): id is LayoutPresetId {
  return LAYOUT_IDS.has(id);
}

function sanitizeBlocks(blocks: unknown): TextBlock[] {
  if (!Array.isArray(blocks) || blocks.length === 0) return [];
  return blocks
    .filter((b): b is TextBlock => {
      if (!b || typeof b !== "object") return false;
      const block = b as TextBlock;
      return (
        typeof block.id === "string" &&
        typeof block.text === "string" &&
        typeof block.x === "number" &&
        typeof block.y === "number" &&
        typeof block.width === "number"
      );
    })
    .map((block) => ({
      ...block,
      role: block.role ?? "body",
      align: block.align ?? "left",
    }));
}

export function sanitizeDraft(stored: Partial<EditorDraft> | null | undefined, defaults: EditorDraft): EditorDraft {
  if (!stored) return defaults;

  const canvasSizeId = normalizeCanvasSizeId(stored.canvasSizeId ?? defaults.canvasSizeId);
  const rawLayoutId = stored.layoutPresetId ?? "";
  const layoutPresetId: LayoutPresetId = isLayoutPresetId(rawLayoutId)
    ? rawLayoutId
    : defaults.layoutPresetId;
  const blocks = sanitizeBlocks(stored.blocks);

  if (blocks.length === 0) {
    return {
      blocks: layoutBlocksForCanvas(
        blocksFromPreset(layoutPresetId, canvasSizeId),
        layoutPresetId,
        canvasSizeId,
      ),
      canvasSizeId,
      layoutPresetId,
      selectedBlockId: null,
    };
  }

  return {
    blocks: layoutBlocksForCanvas(blocks, layoutPresetId, canvasSizeId),
    canvasSizeId,
    layoutPresetId,
    selectedBlockId:
      typeof stored.selectedBlockId === "string" &&
      blocks.some((b) => b.id === stored.selectedBlockId)
        ? stored.selectedBlockId
        : null,
  };
}