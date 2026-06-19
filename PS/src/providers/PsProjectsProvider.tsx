"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ThemeConfig } from "@/lib/themes";
import type { EditorDraft } from "@ps/lib/canvasTypes";
import {
  createPost,
  createProject,
  deletePost,
  deleteProject,
  duplicatePost,
  findPost,
  findProject,
  loadProjectsStore,
  persistStore,
  renamePost,
  resolveView,
  savePostDraft,
  updateProject,
} from "@ps/lib/projectStorage";
import type { Post, Project, PsView } from "@ps/lib/projectTypes";

interface PsProjectsContextValue {
  view: PsView;
  projects: Project[];
  activeProject: Project | null;
  activePost: Post | null;
  goToProjects: () => void;
  openProject: (projectId: string) => void;
  openEditor: (projectId: string, postId: string) => void;
  createProject: (name: string) => void;
  updateProjectName: (projectId: string, name: string) => void;
  updateProjectTheme: (projectId: string, theme: ThemeConfig) => void;
  deleteProject: (projectId: string) => void;
  createPost: (projectId: string, name?: string) => void;
  duplicatePost: (projectId: string, postId: string) => void;
  renamePost: (projectId: string, postId: string, name: string) => void;
  deletePost: (projectId: string, postId: string) => void;
  savePostDraft: (projectId: string, postId: string, draft: EditorDraft) => void;
}

const PsProjectsContext = createContext<PsProjectsContextValue | null>(null);

function getInitialState(): { store: ReturnType<typeof loadProjectsStore>; view: PsView } {
  const store = loadProjectsStore();
  const view = resolveView(store, store.lastView ?? { type: "projects" });
  return { store, view };
}

export function PsProjectsProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo(getInitialState, []);
  const [store, setStore] = useState(initial.store);
  const [view, setView] = useState<PsView>(initial.view);

  const commit = useCallback((nextStore: typeof store, nextView?: PsView) => {
    const resolvedView = nextView ? resolveView(nextStore, nextView) : view;
    const persisted = persistStore(nextStore, resolvedView);
    setStore(persisted);
    setView(resolvedView);
  }, [view]);

  const goToProjects = useCallback(() => {
    commit(store, { type: "projects" });
  }, [commit, store]);

  const openProject = useCallback(
    (projectId: string) => {
      commit(store, { type: "project", projectId });
    },
    [commit, store],
  );

  const openEditor = useCallback(
    (projectId: string, postId: string) => {
      commit(store, { type: "editor", projectId, postId });
    },
    [commit, store],
  );

  const handleCreateProject = useCallback(
    (name: string) => {
      const next = createProject(store, name);
      commit(next, next.lastView);
    },
    [commit, store],
  );

  const handleUpdateProjectName = useCallback(
    (projectId: string, name: string) => {
      commit(updateProject(store, projectId, { name }));
    },
    [commit, store],
  );

  const handleUpdateProjectTheme = useCallback(
    (projectId: string, theme: ThemeConfig) => {
      commit(updateProject(store, projectId, { theme }));
    },
    [commit, store],
  );

  const handleDeleteProject = useCallback(
    (projectId: string) => {
      const next = deleteProject(store, projectId);
      commit(next, next.lastView);
    },
    [commit, store],
  );

  const handleCreatePost = useCallback(
    (projectId: string, name?: string) => {
      const next = createPost(store, projectId, name);
      commit(next, next.lastView);
    },
    [commit, store],
  );

  const handleDuplicatePost = useCallback(
    (projectId: string, postId: string) => {
      const next = duplicatePost(store, projectId, postId);
      commit(next, next.lastView);
    },
    [commit, store],
  );

  const handleRenamePost = useCallback(
    (projectId: string, postId: string, name: string) => {
      commit(renamePost(store, projectId, postId, name));
    },
    [commit, store],
  );

  const handleDeletePost = useCallback(
    (projectId: string, postId: string) => {
      const next = deletePost(store, projectId, postId);
      commit(next, next.lastView);
    },
    [commit, store],
  );

  const handleSavePostDraft = useCallback(
    (projectId: string, postId: string, draft: EditorDraft) => {
      commit(savePostDraft(store, projectId, postId, draft));
    },
    [commit, store],
  );

  const activeProject = useMemo(() => {
    if (view.type === "projects") return null;
    return findProject(store, view.projectId);
  }, [store, view]);

  const activePost = useMemo(() => {
    if (view.type !== "editor") return null;
    return findPost(store, view.projectId, view.postId);
  }, [store, view]);

  return (
    <PsProjectsContext.Provider
      value={{
        view,
        projects: store.projects,
        activeProject,
        activePost,
        goToProjects,
        openProject,
        openEditor,
        createProject: handleCreateProject,
        updateProjectName: handleUpdateProjectName,
        updateProjectTheme: handleUpdateProjectTheme,
        deleteProject: handleDeleteProject,
        createPost: handleCreatePost,
        duplicatePost: handleDuplicatePost,
        renamePost: handleRenamePost,
        deletePost: handleDeletePost,
        savePostDraft: handleSavePostDraft,
      }}
    >
      {children}
    </PsProjectsContext.Provider>
  );
}

export function usePsProjects() {
  const ctx = useContext(PsProjectsContext);
  if (!ctx) throw new Error("usePsProjects must be used within PsProjectsProvider");
  return ctx;
}