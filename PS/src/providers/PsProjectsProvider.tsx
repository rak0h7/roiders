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
import type { Post, Project, ProjectsStore, PsView } from "@ps/lib/projectTypes";

interface AppState {
  store: ProjectsStore;
  view: PsView;
}

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

function getInitialState(): AppState {
  const store = loadProjectsStore();
  const view = resolveView(store, store.lastView ?? { type: "projects" });
  return { store, view };
}

export function PsProjectsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(getInitialState);

  const commit = useCallback((recipe: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = recipe(prev);
      const resolvedView = resolveView(next.store, next.view);
      const persisted = persistStore(next.store, resolvedView);
      return { store: persisted, view: resolvedView };
    });
  }, []);

  const goToProjects = useCallback(() => {
    commit((prev) => ({ ...prev, view: { type: "projects" } }));
  }, [commit]);

  const openProject = useCallback(
    (projectId: string) => {
      commit((prev) => ({ ...prev, view: { type: "project", projectId } }));
    },
    [commit],
  );

  const openEditor = useCallback(
    (projectId: string, postId: string) => {
      commit((prev) => ({ ...prev, view: { type: "editor", projectId, postId } }));
    },
    [commit],
  );

  const handleCreateProject = useCallback(
    (name: string) => {
      commit((prev) => {
        const store = createProject(prev.store, name);
        return { store, view: store.lastView ?? { type: "projects" } };
      });
    },
    [commit],
  );

  const handleUpdateProjectName = useCallback(
    (projectId: string, name: string) => {
      commit((prev) => ({
        ...prev,
        store: updateProject(prev.store, projectId, { name }),
      }));
    },
    [commit],
  );

  const handleUpdateProjectTheme = useCallback(
    (projectId: string, theme: ThemeConfig) => {
      commit((prev) => ({
        ...prev,
        store: updateProject(prev.store, projectId, { theme }),
      }));
    },
    [commit],
  );

  const handleDeleteProject = useCallback(
    (projectId: string) => {
      commit((prev) => {
        const store = deleteProject(prev.store, projectId);
        return { store, view: store.lastView ?? { type: "projects" } };
      });
    },
    [commit],
  );

  const handleCreatePost = useCallback(
    (projectId: string, name?: string) => {
      commit((prev) => {
        const store = createPost(prev.store, projectId, name);
        return { store, view: store.lastView ?? prev.view };
      });
    },
    [commit],
  );

  const handleDuplicatePost = useCallback(
    (projectId: string, postId: string) => {
      commit((prev) => {
        const store = duplicatePost(prev.store, projectId, postId);
        return { store, view: store.lastView ?? prev.view };
      });
    },
    [commit],
  );

  const handleRenamePost = useCallback(
    (projectId: string, postId: string, name: string) => {
      commit((prev) => ({
        ...prev,
        store: renamePost(prev.store, projectId, postId, name),
      }));
    },
    [commit],
  );

  const handleDeletePost = useCallback(
    (projectId: string, postId: string) => {
      commit((prev) => {
        const store = deletePost(prev.store, projectId, postId);
        return { store, view: store.lastView ?? prev.view };
      });
    },
    [commit],
  );

  const handleSavePostDraft = useCallback(
    (projectId: string, postId: string, draft: EditorDraft) => {
      commit((prev) => ({
        ...prev,
        store: savePostDraft(prev.store, projectId, postId, draft),
      }));
    },
    [commit],
  );

  const { store, view } = state;

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