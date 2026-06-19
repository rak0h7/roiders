"use client";

import { useState } from "react";
import { ArrowLeft, FilePlus, FolderOpen, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@ps/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";
import { usePsProjects } from "@ps/providers/PsProjectsProvider";
import { PostCard } from "./PostCard";

export function ProjectDetailPage() {
  const {
    activeProject,
    goToProjects,
    openEditor,
    createPost,
    duplicatePost,
    renamePost,
    deletePost,
    updateProjectName,
    deleteProject,
  } = usePsProjects();

  const [renamingProject, setRenamingProject] = useState(false);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);
  const [projectName, setProjectName] = useState(activeProject?.name ?? "");

  if (!activeProject) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className={cn(ui.card, ui.cardPad, "text-center")}>
          <p className={ui.sectionTitle}>Project not found</p>
          <button type="button" onClick={goToProjects} className={cn(ui.btnSecondary, "mt-4")}>
            Back to projects
          </button>
        </div>
      </div>
    );
  }

  const submitProjectRename = () => {
    updateProjectName(activeProject.id, projectName.trim() || activeProject.name);
    setRenamingProject(false);
  };

  return (
    <div className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-[var(--border)] bg-[var(--bg-elevated)]/50 px-4 py-4 backdrop-blur-sm sm:px-6">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={goToProjects}
            className={cn(ui.btnGhost, "mb-3 -ml-1 gap-1.5")}
          >
            <ArrowLeft className="h-4 w-4" />
            All projects
          </button>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--accent)]/30 bg-[var(--labs-dim)]">
                <FolderOpen className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <div className="min-w-0">
                {renamingProject ? (
                  <input
                    autoFocus
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onBlur={submitProjectRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitProjectRename();
                      if (e.key === "Escape") {
                        setProjectName(activeProject.name);
                        setRenamingProject(false);
                      }
                    }}
                    className={ui.input}
                  />
                ) : (
                  <h1 className={ui.pageTitle}>{activeProject.name}</h1>
                )}
                <p className={ui.pageSub}>
                  {activeProject.posts.length} post{activeProject.posts.length === 1 ? "" : "s"} · one shared theme
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setProjectName(activeProject.name);
                  setRenamingProject(true);
                }}
                className={cn(ui.btnSecondary, "gap-2")}
              >
                <Pencil className="h-4 w-4" />
                Rename
              </button>
              <button
                type="button"
                onClick={() => createPost(activeProject.id)}
                className={cn(ui.btnPrimary, "gap-2")}
              >
                <FilePlus className="h-4 w-4" />
                New post
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteProject(true)}
                className={cn(ui.btnSecondary, "gap-2 text-red-400")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-5xl">
          {activeProject.posts.length === 0 ? (
            <div className={cn(ui.card, ui.cardPad, "text-center")}>
              <p className={ui.sectionTitle}>Add your first post</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Each post is one graphic. Use the filmstrip in the editor to switch between them.
              </p>
              <button
                type="button"
                onClick={() => createPost(activeProject.id)}
                className={cn(ui.btnPrimary, "mt-4 gap-2")}
              >
                <FilePlus className="h-4 w-4" />
                Create post
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeProject.posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onOpen={() => openEditor(activeProject.id, post.id)}
                  onDuplicate={() => duplicatePost(activeProject.id, post.id)}
                  onRename={(name) => renamePost(activeProject.id, post.id, name)}
                  onDelete={() => deletePost(activeProject.id, post.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <ConfirmDialog
        open={confirmDeleteProject}
        title="Delete project?"
        description={`"${activeProject.name}" and all its posts will be permanently removed.`}
        confirmLabel="Delete project"
        destructive
        onConfirm={() => {
          setConfirmDeleteProject(false);
          deleteProject(activeProject.id);
        }}
        onCancel={() => setConfirmDeleteProject(false)}
      />
    </div>
  );
}