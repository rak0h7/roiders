"use client";

import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export interface ActionMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  destructive?: boolean;
  onClick: () => void;
}

interface ActionsMenuProps {
  items: ActionMenuItem[];
  ariaLabel?: string;
}

export function ActionsMenu({ items, ariaLabel = "Actions" }: ActionsMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className={cn(ui.btnIconSm, open && "border-[var(--border-strong)]")}
        aria-label={ariaLabel}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-1 min-w-[9rem] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-1 shadow-lg">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-xs hover:bg-[var(--bg-hover)]",
                  item.destructive && "text-red-400",
                )}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}