"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { blocksFromPreset, LAYOUT_PRESETS } from "@ps/lib/contentPresets";
import { layoutBlocksForCanvas } from "@ps/lib/layoutPlacement";
import { getCanvasSize } from "@ps/lib/canvasSizes";
import { spaceBlocksVertically } from "@ps/lib/blockSpacing";
import { CURRENT_SPACING_VERSION, prepareDraftForEditor } from "@ps/lib/draftSanitize";
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

const SPACING_ROLES = new Set<TextBlockRole>(["headline", "subhead", "body"]);

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
  const [draft, setDraft] = useState<EditorDraft>(() => prepareDraftForEditor(postDraft, defaults));
  const onDraftChangeRef = useRef(onDraftChange);
  const spacingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  onDraftChangeRef.current = onDraftChange;

  useEffect(() => {
    return () => {
      if (spacingTimerRef.current) clearTimeout(spacingTimerRef.current);
    };
  }, []);

  const persist = useCallback((updater: EditorDraft | ((prev: EditorDraft) => EditorDraft)) => {
    setDraft((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      onDraftChangeRef.current(next);
      return next;
    });
  }, []);

  const scheduleSpacing = useCallback(() => {
    if (spacingTimerRef.current) clearTimeout(spacingTimerRef.current);
    spacingTimerRef.current = setTimeout(() => {
      persist((prev) => ({
        ...prev,
        blocks: spaceBlocksVertically(prev.blocks),
        spacingVersion: CURRENT_SPACING_VERSION,
      }));
    }, 300);
  }, [persist]);

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
          spacingVersion: CURRENT_SPACING_VERSION,
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
          blocks: layoutBlocksForCanvas(
            blocksFromPreset(id, canvasSizeId),
            id,
            canvasSizeId,
          ),
          selectedBlockId: null,
          spacingVersion: CURRENT_SPACING_VERSION,
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
      persist((prev) => {
        const blocks = prev.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b));
        const updated = blocks.find((b) => b.id === id);
        if (patch.text !== undefined && updated && SPACING_ROLES.has(updated.role)) {
          scheduleSpacing();
        }
        return { ...prev, blocks };
      });
    },
    [persist, scheduleSpacing],
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