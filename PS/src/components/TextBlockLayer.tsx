"use client";

import { useCallback, useRef } from "react";
import { usePsEditor } from "@ps/providers/PsEditorProvider";
import type { TextBlock } from "@ps/lib/canvasTypes";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

function roleClass(role: TextBlock["role"], branded: boolean): string {
  switch (role) {
    case "headline":
      return branded
        ? "font-display font-extrabold leading-[0.95] tracking-tight text-gradient [font-size:clamp(1.5rem,9cqw,3.25rem)]"
        : "font-display font-bold tracking-tight text-[var(--foreground)] [font-size:clamp(1.35rem,7.5cqw,2.75rem)]";
    case "subhead":
      return "font-semibold leading-snug text-[var(--muted)] [font-size:clamp(0.8rem,3.8cqw,1.2rem)]";
    case "label":
      return cn(ui.overline, "[font-size:clamp(0.55rem,2.2cqw,0.7rem)]");
    case "badge":
      return cn(
        "inline-flex max-w-full items-center rounded-full border border-[var(--accent)]/40 bg-[var(--labs-dim)] px-3 py-1 font-semibold uppercase tracking-[0.12em] text-[var(--accent)]",
        "[font-size:clamp(0.55rem,2.4cqw,0.7rem)]",
      );
    case "footer":
      return "font-display font-bold text-[var(--accent)] [font-size:clamp(1rem,5.5cqw,1.75rem)]";
    case "cta":
      return cn(ui.btnPrimary, "pointer-events-none inline-flex px-5 py-2 [font-size:clamp(0.75rem,3cqw,0.95rem)]");
    default:
      return "leading-relaxed text-[var(--foreground)]/90 [font-size:clamp(0.8rem,3.6cqw,1.05rem)]";
  }
}

function BlockText({
  block,
  selected,
  branded,
  onTextChange,
}: {
  block: TextBlock;
  selected: boolean;
  branded: boolean;
  onTextChange: (text: string) => void;
}) {
  const style = block.fontSize ? { fontSize: block.fontSize } : undefined;

  if (block.role === "cta" || block.role === "badge") {
    return (
      <span className={roleClass(block.role, branded)} style={style}>
        {block.text}
      </span>
    );
  }

  if (selected) {
    return (
      <textarea
        value={block.text}
        onChange={(e) => onTextChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        rows={block.role === "body" ? 4 : 2}
        className={cn(
          roleClass(block.role, branded),
          "w-full resize-none border-none bg-transparent p-0 outline-none focus:ring-0",
        )}
        style={{ ...style, textAlign: block.align }}
      />
    );
  }

  return (
    <p
      className={cn(roleClass(block.role, branded), "w-full whitespace-pre-wrap")}
      style={{ ...style, textAlign: block.align }}
    >
      {block.text}
    </p>
  );
}

export function TextBlockLayer({ branded = false }: { branded?: boolean }) {
  const { blocks, selectedBlockId, selectBlock, updateBlock, moveBlock } = usePsEditor();
  const layerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; originX: number; originY: number } | null>(
    null,
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent, block: TextBlock) => {
      if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
      e.preventDefault();
      selectBlock(block.id);
      dragRef.current = {
        id: block.id,
        startX: e.clientX,
        startY: e.clientY,
        originX: block.x,
        originY: block.y,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [selectBlock],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current || !layerRef.current) return;
      const rect = layerRef.current.getBoundingClientRect();
      const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
      const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;
      moveBlock(dragRef.current.id, dragRef.current.originX + dx, dragRef.current.originY + dy);
    },
    [moveBlock],
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  return (
    <div
      ref={layerRef}
      className="@container relative h-full w-full"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {blocks.map((block) => {
        const selected = block.id === selectedBlockId;
        const alignItems =
          block.align === "center" ? "items-center" : block.align === "right" ? "items-end" : "items-start";

        return (
          <div
            key={block.id}
            data-text-block
            className={cn(
              "absolute flex flex-col",
              alignItems,
              selected
                ? "z-20 cursor-grab ring-2 ring-[var(--accent)]/70 ring-offset-2 ring-offset-[var(--bg-base)] active:cursor-grabbing"
                : "z-10 cursor-grab active:cursor-grabbing",
            )}
            style={{
              left: `${block.x}%`,
              top: `${block.y}%`,
              width: `${block.width}%`,
              maxWidth: `${block.width}%`,
            }}
            onPointerDown={(e) => onPointerDown(e, block)}
            onClick={(e) => {
              e.stopPropagation();
              selectBlock(block.id);
            }}
          >
            {selected && (
              <span
                data-editor-only
                className="absolute -top-6 left-0 z-30 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]"
              >
                {block.role}
              </span>
            )}
            <BlockText
              block={block}
              selected={selected}
              branded={branded}
              onTextChange={(text) => updateBlock(block.id, { text })}
            />
          </div>
        );
      })}
    </div>
  );
}