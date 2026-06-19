"use client";

import { FolderOpen, Trash2 } from "lucide-react";
import { formatRelativeTime } from "@ps/lib/formatRelative";
import { useState } from "react";
import { ActionsMenu } from "@ps/components/ui/ActionsMenu";
import { ConfirmDialog } from "@ps/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";
import type { Project } from "@ps/lib/projectTypes";

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const postCount = project.posts.length;
  const lastUpdated = formatRelativeTime(project.updatedAt);

  return (
    <>
      <div className={cn(ui.card, ui.cardHover, "group relative flex flex-col")}>
        <button type="button" onClick={onOpen} className="flex flex-1 flex-col p-5 text-left">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--accent)]/25 bg-[var(--labs-dim)]">
            <FolderOpen className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <h3 className="truncate font-semibold text-[var(--foreground)]">{project.name}</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {postCount} {postCount === 1 ? "post" : "posts"} · {lastUpdated}
          </p>
        </button>

        <div className="absolute right-3 top-3">
          <ActionsMenu
            ariaLabel="Project actions"
            items={[
              {
                id: "delete",
                label: "Delete",
                icon: <Trash2 className="h-3.5 w-3.5" />,
                destructive: true,
                onClick: () => setConfirmDelete(true),
              },
            ]}
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete project?"
        description={`"${project.name}" and all ${postCount} post${postCount === 1 ? "" : "s"} will be permanently removed.`}
        confirmLabel="Delete project"
        destructive
        onConfirm={() => {
          setConfirmDelete(false);
          onDelete();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}