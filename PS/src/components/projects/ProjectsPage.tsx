"use client";

import { useState } from "react";
import { FolderPlus, Sparkles, LayoutTemplate, Palette, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";
import { usePsProjects } from "@ps/providers/PsProjectsProvider";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { ProjectCard } from "./ProjectCard";

const STEPS = [
  { icon: FolderPlus, title: "Create a project", desc: "Group posts for a campaign or content series." },
  { icon: LayoutTemplate, title: "Add posts", desc: "Each post is one exportable graphic." },
  { icon: Palette, title: "Set a theme", desc: "One look shared across every post in the project." },
  { icon: Download, title: "Export PNG", desc: "Download at 1× or 2× resolution." },
];

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
              <h1 className={ui.pageTitle}>Content Maker</h1>
              <p className={ui.pageSub}>Design social posts — organized by project</p>
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
            <div className="space-y-6">
              <div className={cn(ui.card, ui.cardPad, "text-center")}>
                <p className={ui.sectionTitle}>Create your first project</p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Projects keep related posts together — like pages in Canva or artboards in a campaign file.
                </p>
                <button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className={cn(ui.btnPrimary, "mt-4 gap-2")}
                >
                  <FolderPlus className="h-4 w-4" />
                  Get started
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {STEPS.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className={cn(ui.cardInner, "flex gap-3 p-4")}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)]">
                      <Icon className="h-4 w-4 text-[var(--accent)]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-[var(--muted)]">
                {projects.length} project{projects.length === 1 ? "" : "s"} — open one to edit posts
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onOpen={() => openProject(project.id)}
                    onDelete={() => deleteProject(project.id)}
                  />
                ))}
              </div>
            </>
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