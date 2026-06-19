"use client";

import { useState } from "react";
import { FolderPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  title?: string;
  placeholder?: string;
}

export function CreateProjectDialog({
  open,
  onClose,
  onCreate,
  title = "New project",
  placeholder = "Project name",
}: CreateProjectDialogProps) {
  const [name, setName] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(name.trim() || "Untitled project");
    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className={cn(ui.card, ui.cardPad, "relative z-10 w-full max-w-md space-y-4")}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--accent)]/30 bg-[var(--labs-dim)]">
              <FolderPlus className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className={ui.sectionTitle}>{title}</h2>
              <p className={ui.sectionSub}>Group related posts together</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className={ui.btnIcon} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <label htmlFor="project-name" className={cn(ui.label, "mb-1.5")}>
            Name
          </label>
          <input
            id="project-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={placeholder}
            className={ui.input}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={ui.btnSecondary}>
            Cancel
          </button>
          <button type="submit" className={ui.btnPrimary}>
            Create
          </button>
        </div>
      </form>
    </div>
  );
}