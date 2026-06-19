import { blocksFromPreset, LAYOUT_PRESETS } from "./contentPresets";
import { layoutBlocksForCanvas } from "./layoutPlacement";
import { isCustomCanvasSizeId, isCanvasSizeId, normalizeCanvasSizeId } from "./canvasSizes";
import { spaceBlocksVertically } from "./blockSpacing";
import type { EditorDraft, LayoutPresetId, TextBlock } from "./canvasTypes";

export const CURRENT_SPACING_VERSION = 1;

const LAYOUT_IDS = new Set<string>(LAYOUT_PRESETS.map((p) => p.id));

function isLayoutPresetId(id: string): id is LayoutPresetId {
  return LAYOUT_IDS.has(id);
}

function sanitizeBlocks(blocks: unknown): TextBlock[] {
  if (!Array.isArray(blocks)) return [];
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

function initializedDraft(
  layoutPresetId: LayoutPresetId,
  canvasSizeId: EditorDraft["canvasSizeId"],
): EditorDraft {
  return {
    blocks: layoutBlocksForCanvas(
      blocksFromPreset(layoutPresetId, canvasSizeId),
      layoutPresetId,
      canvasSizeId,
    ),
    canvasSizeId,
    layoutPresetId,
    selectedBlockId: null,
    spacingVersion: CURRENT_SPACING_VERSION,
  };
}

/** Validate shape and IDs only — preserve block positions and text. */
export function validateDraft(
  stored: Partial<EditorDraft> | null | undefined,
  defaults: EditorDraft,
): EditorDraft {
  if (!stored) return initializedDraft(defaults.layoutPresetId, defaults.canvasSizeId);

  const rawSizeId = stored.canvasSizeId ?? defaults.canvasSizeId;
  const canvasSizeId =
    typeof rawSizeId === "string" && (isCanvasSizeId(rawSizeId) || isCustomCanvasSizeId(rawSizeId))
      ? rawSizeId
      : normalizeCanvasSizeId(rawSizeId);
  const rawLayoutId = stored.layoutPresetId ?? "";
  const layoutPresetId: LayoutPresetId = isLayoutPresetId(rawLayoutId)
    ? rawLayoutId
    : defaults.layoutPresetId;

  if (!Array.isArray(stored.blocks)) {
    return initializedDraft(layoutPresetId, canvasSizeId);
  }

  const blocks = sanitizeBlocks(stored.blocks);

  return {
    blocks,
    canvasSizeId,
    layoutPresetId,
    selectedBlockId:
      typeof stored.selectedBlockId === "string" &&
      blocks.some((b) => b.id === stored.selectedBlockId)
        ? stored.selectedBlockId
        : null,
    spacingVersion:
      typeof stored.spacingVersion === "number" ? stored.spacingVersion : 0,
  };
}

/** One-time vertical spacing pass for existing posts (no template reposition). */
export function migrateDraftSpacing(draft: EditorDraft): EditorDraft {
  if ((draft.spacingVersion ?? 0) >= CURRENT_SPACING_VERSION) return draft;
  if (draft.blocks.length === 0) {
    return { ...draft, spacingVersion: CURRENT_SPACING_VERSION };
  }
  return {
    ...draft,
    blocks: spaceBlocksVertically(draft.blocks),
    spacingVersion: CURRENT_SPACING_VERSION,
  };
}

/** Load path: validate shape, then apply spacing migration if needed. */
export function prepareDraftForEditor(
  stored: Partial<EditorDraft> | null | undefined,
  defaults: EditorDraft,
): EditorDraft {
  return migrateDraftSpacing(validateDraft(stored, defaults));
}

