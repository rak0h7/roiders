"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { blocksFromPreset, LAYOUT_PRESETS } from "@ps/lib/contentPresets";
import { repositionBlocksForCanvas } from "@ps/lib/layoutPlacement";
import {
  CANVAS_SIZES,
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
  canvasSize: (typeof CANVAS_SIZES)[number];
  layoutPresetId: LayoutPresetId;
  selectedBlockId: string | null;
  selectedBlock: TextBlock | null;
  setCanvasSizeId: (id: CanvasSizeId) => void;
  applyLayoutPreset: (id: LayoutPresetId, force?: boolean) => boolean;
  selectBlock: (id: string | null) => void;
  addBlock: () => void;
  updateBlock: (id: string, patch: Partial<TextBlock>) => void;
  deleteBlock: (id: string) => void;
  moveBlock: (id: string, x: number, y: number) => void;
}

const PsEditorContext = createContext<PsEditorContextValue | null>(null);

const DEFAULT_DRAFT: EditorDraft = {
  blocks: blocksFromPreset("roiders-club", "9:16"),
  canvasSizeId: "9:16",
  layoutPresetId: "roiders-club",
  selectedBlockId: null,
};

function loadDraft(): EditorDraft {
  const stored = readDraft();
  if (!stored || !Array.isArray(stored.blocks) || stored.blocks.length === 0) return DEFAULT_DRAFT;
  return {
    ...DEFAULT_DRAFT,
    ...stored,
    blocks: stored.blocks,
  };
}

export function PsEditorProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<EditorDraft>(loadDraft);

  const persist = useCallback((next: EditorDraft) => {
    setDraft(next);
    writeDraft(next);
  }, []);

  const canvasSize = useMemo(
    () => CANVAS_SIZES.find((s) => s.id === draft.canvasSizeId) ?? CANVAS_SIZES[0],
    [draft.canvasSizeId],
  );

  const selectedBlock = useMemo(
    () => draft.blocks.find((b) => b.id === draft.selectedBlockId) ?? null,
    [draft.blocks, draft.selectedBlockId],
  );

  const setCanvasSizeId = useCallback(
    (id: CanvasSizeId) => {
      if (id === draft.canvasSizeId) return;
      persist({
        ...draft,
        canvasSizeId: id,
        blocks: repositionBlocksForCanvas(draft.blocks, draft.layoutPresetId, id),
        selectedBlockId: draft.selectedBlockId,
      });
    },
    [draft, persist],
  );

  const applyLayoutPreset = useCallback(
    (id: LayoutPresetId, force = false) => {
      const hasContent = draft.blocks.some((b) => b.text.trim().length > 0 && b.text !== "Your text here");
      if (hasContent && !force) {
        const ok = window.confirm("Replace current text blocks with this layout preset?");
        if (!ok) return false;
      }
      const preset = LAYOUT_PRESETS.find((p) => p.id === id);
      const canvasSizeId = preset?.defaultCanvasSizeId ?? draft.canvasSizeId;
      persist({
        ...draft,
        layoutPresetId: id,
        canvasSizeId,
        blocks: blocksFromPreset(id, canvasSizeId),
        selectedBlockId: null,
      });
      return true;
    },
    [draft, persist],
  );

  const selectBlock = useCallback(
    (id: string | null) => persist({ ...draft, selectedBlockId: id }),
    [draft, persist],
  );

  const addBlock = useCallback(() => {
    const block: TextBlock = {
      id: createBlockId(),
      x: 15,
      y: 20,
      width: 70,
      text: "New text",
      role: "body",
      align: "left",
    };
    persist({
      ...draft,
      blocks: [...draft.blocks, block],
      selectedBlockId: block.id,
    });
  }, [draft, persist]);

  const updateBlock = useCallback(
    (id: string, patch: Partial<TextBlock>) => {
      persist({
        ...draft,
        blocks: draft.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      });
    },
    [draft, persist],
  );

  const deleteBlock = useCallback(
    (id: string) => {
      persist({
        ...draft,
        blocks: draft.blocks.filter((b) => b.id !== id),
        selectedBlockId: draft.selectedBlockId === id ? null : draft.selectedBlockId,
      });
    },
    [draft, persist],
  );

  const moveBlock = useCallback(
    (id: string, x: number, y: number) => {
      persist({
        ...draft,
        blocks: draft.blocks.map((b) =>
          b.id === id
            ? {
                ...b,
                x: Math.min(95, Math.max(0, x)),
                y: Math.min(95, Math.max(0, y)),
              }
            : b,
        ),
      });
    },
    [draft, persist],
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