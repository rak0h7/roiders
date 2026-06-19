"use client";

import { useState } from "react";
import { FolderPlus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";
import { usePsProjects } from "@ps/providers/PsProjectsProvider";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { ProjectCard } from "./ProjectCard";

export function ProjectsPage() {
  const { projects, createProject, openProject, deleteProject } = usePsProjects();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-[var(--border)] bg-[var(--bg-elevated)]/50 px-4 py-4 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--accent)]/30 bg-[var(--labs-dim)]">
              <Sparkles className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <div>
              <h1 className={ui.pageTitle}>Projects</h1>
              <p className={ui.pageSub}>Group and save multiple posts per project</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className={cn(ui.btnPrimary, "gap-2")}
          >
            <FolderPlus className="h-4 w-4" />
            New project
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-5xl">
          {projects.length === 0 ? (
            <div className={cn(ui.card, ui.cardPad, "text-center")}>
              <p className={ui.sectionTitle}>No projects yet</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Create a project to organize your social posts and compositions.
              </p>
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className={cn(ui.btnPrimary, "mt-4 gap-2")}
              >
                <FolderPlus className="h-4 w-4" />
                Create your first project
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={() => openProject(project.id)}
                  onDelete={() => {
                    if (window.confirm(`Delete "${project.name}" and all its posts?`)) {
                      deleteProject(project.id);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={createProject}
      />
    </div>
  );
}