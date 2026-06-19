"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { blocksFromPreset, LAYOUT_PRESETS } from "@ps/lib/contentPresets";
import { layoutBlocksForCanvas } from "@ps/lib/layoutPlacement";
import { getCanvasSize } from "@ps/lib/canvasSizes";
import { sanitizeDraft } from "@ps/lib/draftSanitize";
import { createDefaultDraft } from "@ps/lib/projectTypes";
import {
  createBlockId,
  type CanvasSizeId,
  type EditorDraft,
  type LayoutPresetId,
  type TextBlock,
  type TextBlockRole,
  type TextAlign,
} from "@ps/lib/canvasTypes";

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

interface PsEditorProviderProps {
  postDraft: EditorDraft;
  onDraftChange: (draft: EditorDraft) => void;
  children: React.ReactNode;
}

export function PsEditorProvider({ postDraft, onDraftChange, children }: PsEditorProviderProps) {
  const defaults = useMemo(() => createDefaultDraft(), []);
  const [draft, setDraft] = useState<EditorDraft>(() => sanitizeDraft(postDraft, defaults));
  const onDraftChangeRef = useRef(onDraftChange);
  onDraftChangeRef.current = onDraftChange;

  const persist = useCallback((updater: EditorDraft | ((prev: EditorDraft) => EditorDraft)) => {
    setDraft((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      onDraftChangeRef.current(next);
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
          blocks: layoutBlocksForCanvas(prev.blocks, prev.layoutPresetId, id),
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