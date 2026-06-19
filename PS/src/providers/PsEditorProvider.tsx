"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { blocksFromPreset, LAYOUT_PRESETS } from "@ps/lib/contentPresets";
import { repositionBlocksForCanvas } from "@ps/lib/layoutPlacement";
import { getCanvasSize, normalizeCanvasSizeId } from "@ps/lib/canvasSizes";
import {
  createBlockId,
  type CanvasSizeId,
  type EditorDraft,
  type LayoutPresetId,
  type TextBlock,
  type TextBlockRole,
  type TextAlign,
} from "@ps/lib/canvasTypes";
import { readDraft, writeDraft } from "@ps/lib/psStorage";

interface PsEditorContextValue {
  blocks: TextBlock[];
  canvasSizeId: CanvasSizeId;
  canvasSize: ReturnType<typeof getCanvasSize>;
  layoutPresetId: LayoutPresetId;
  selectedBlockId: string | null;
  selectedBlock: TextBlock | null;
  setCanvasSizeId: (id: CanvasSizeId) => void;
  applyLayoutPreset: (id: LayoutPresetId) => void;
  selectBlock: (id: string | null) => void;
  addBlock: () => void;
  updateBlock: (id: string, patch: Partial<TextBlock>) => void;
  deleteBlock: (id: string) => void;
  moveBlock: (id: string, x: number, y: number) => void;
}

const PsEditorContext = createContext<PsEditorContextValue | null>(null);

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

function createDefaultDraft(): EditorDraft {
  return {
    blocks: blocksFromPreset("roiders-club", "9:16"),
    canvasSizeId: "9:16",
    layoutPresetId: "roiders-club",
    selectedBlockId: null,
  };
}

function loadDraft(): EditorDraft {
  const defaults = createDefaultDraft();
  const stored = readDraft();
  if (!stored) return defaults;

  const canvasSizeId = normalizeCanvasSizeId(stored.canvasSizeId);
  const layoutPresetId = isLayoutPresetId(stored.layoutPresetId ?? "")
    ? stored.layoutPresetId
    : defaults.layoutPresetId;
  const blocks = sanitizeBlocks(stored.blocks);

  if (blocks.length === 0) {
    return {
      blocks: blocksFromPreset(layoutPresetId, canvasSizeId),
      canvasSizeId,
      layoutPresetId,
      selectedBlockId: null,
    };
  }

  return {
    blocks: repositionBlocksForCanvas(blocks, layoutPresetId, canvasSizeId),
    canvasSizeId,
    layoutPresetId,
    selectedBlockId:
      typeof stored.selectedBlockId === "string" &&
      blocks.some((b) => b.id === stored.selectedBlockId)
        ? stored.selectedBlockId
        : null,
  };
}

export function PsEditorProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<EditorDraft>(loadDraft);

  const persist = useCallback((updater: EditorDraft | ((prev: EditorDraft) => EditorDraft)) => {
    setDraft((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      writeDraft(next);
      return next;
    });
  }, []);

  const canvasSize = useMemo(() => getCanvasSize(draft.canvasSizeId), [draft.canvasSizeId]);

  const selectedBlock = useMemo(
    () => draft.blocks.find((b) => b.id === draft.selectedBlockId) ?? null,
    [draft.blocks, draft.selectedBlockId],
  );

  const setCanvasSizeId = useCallback(
    (id: CanvasSizeId) => {
      persist((prev) => {
        if (id === prev.canvasSizeId) return prev;
        return {
          ...prev,
          canvasSizeId: id,
          blocks: repositionBlocksForCanvas(prev.blocks, prev.layoutPresetId, id),
        };
      });
    },
    [persist],
  );

  const applyLayoutPreset = useCallback(
    (id: LayoutPresetId) => {
      persist((prev) => {
        if (id === prev.layoutPresetId) return prev;

        const preset = LAYOUT_PRESETS.find((p) => p.id === id);
        const canvasSizeId = preset?.defaultCanvasSizeId ?? prev.canvasSizeId;

        return {
          layoutPresetId: id,
          canvasSizeId,
          blocks: blocksFromPreset(id, canvasSizeId),
          selectedBlockId: null,
        };
      });
    },
    [persist],
  );

  const selectBlock = useCallback(
    (id: string | null) => persist((prev) => ({ ...prev, selectedBlockId: id })),
    [persist],
  );

  const addBlock = useCallback(() => {
    persist((prev) => {
      const block: TextBlock = {
        id: createBlockId(),
        x: 15,
        y: 20,
        width: 70,
        text: "New text",
        role: "body",
        align: "left",
      };
      return {
        ...prev,
        blocks: [...prev.blocks, block],
        selectedBlockId: block.id,
      };
    });
  }, [persist]);

  const updateBlock = useCallback(
    (id: string, patch: Partial<TextBlock>) => {
      persist((prev) => ({
        ...prev,
        blocks: prev.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      }));
    },
    [persist],
  );

  const deleteBlock = useCallback(
    (id: string) => {
      persist((prev) => ({
        ...prev,
        blocks: prev.blocks.filter((b) => b.id !== id),
        selectedBlockId: prev.selectedBlockId === id ? null : prev.selectedBlockId,
      }));
    },
    [persist],
  );

  const moveBlock = useCallback(
    (id: string, x: number, y: number) => {
      persist((prev) => ({
        ...prev,
        blocks: prev.blocks.map((b) =>
          b.id === id
            ? {
                ...b,
                x: Math.min(95, Math.max(0, x)),
                y: Math.min(95, Math.max(0, y)),
              }
            : b,
        ),
      }));
    },
    [persist],
  );

  return (
    <PsEditorContext.Provider
      value={{
        blocks: draft.blocks,
        canvasSizeId: draft.canvasSizeId,
        canvasSize,
        layoutPresetId: draft.layoutPresetId,
        selectedBlockId: draft.selectedBlockId,
        selectedBlock,
        setCanvasSizeId,
        applyLayoutPreset,
        selectBlock,
        addBlock,
        updateBlock,
        deleteBlock,
        moveBlock,
      }}
    >
      {children}
    </PsEditorContext.Provider>
  );
}

export function usePsEditor() {
  const ctx = useContext(PsEditorContext);
  if (!ctx) throw new Error("usePsEditor must be used within PsEditorProvider");
  return ctx;
}

export type { TextBlockRole, TextAlign };