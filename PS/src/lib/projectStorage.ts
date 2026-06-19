import { DEFAULT_THEME, normalizeTheme, type ThemeConfig } from "@/lib/themes";
import type { EditorDraft } from "./canvasTypes";
import { prepareDraftForEditor } from "./draftSanitize";
import {
  createDefaultDraft,
  createDefaultPost,
  createDefaultProject,
  createPostId,
  type Post,
  type Project,
  type ProjectsStore,
  type PsView,
} from "./projectTypes";
import { PS_DRAFT_KEY, PS_PROJECTS_KEY, PS_SETTINGS_KEY, readJson, writeJson } from "./psStorage";

const EMPTY_STORE: ProjectsStore = { version: 1, projects: [] };

function now(): number {
  return Date.now();
}

function touchProject(project: Project): Project {
  return { ...project, updatedAt: now() };
}

function touchPost(post: Post): Post {
  return { ...post, updatedAt: now() };
}

function sanitizePost(raw: unknown, index: number): Post | null {
  if (!raw || typeof raw !== "object") return null;
  const post = raw as Partial<Post>;
  if (typeof post.id !== "string" || typeof post.name !== "string") return null;

  const createdAt = typeof post.createdAt === "number" ? post.createdAt : now();
  const updatedAt = typeof post.updatedAt === "number" ? post.updatedAt : createdAt;

  return {
    id: post.id,
    name: post.name.trim() || `Post ${index + 1}`,
    createdAt,
    updatedAt,
    draft: prepareDraftForEditor(post.draft as Partial<EditorDraft>, createDefaultDraft()),
  };
}

function sanitizeProject(raw: unknown): Project | null {
  if (!raw || typeof raw !== "object") return null;
  const project = raw as Partial<Project>;
  if (typeof project.id !== "string" || typeof project.name !== "string") return null;

  const createdAt = typeof project.createdAt === "number" ? project.createdAt : now();
  const updatedAt = typeof project.updatedAt === "number" ? project.updatedAt : createdAt;
  const posts = Array.isArray(project.posts)
    ? project.posts
        .map((p, i) => sanitizePost(p, i))
        .filter((p): p is Post => p !== null)
    : [];

  return {
    id: project.id,
    name: project.name.trim() || "Untitled project",
    createdAt,
    updatedAt,
    theme: normalizeTheme(project.theme ?? DEFAULT_THEME),
    posts,
  };
}

function sanitizeView(raw: unknown, projects: Project[]): PsView {
  if (!raw || typeof raw !== "object") return { type: "projects" };
  const view = raw as PsView;

  if (view.type === "project" && typeof view.projectId === "string") {
    return projects.some((p) => p.id === view.projectId)
      ? { type: "project", projectId: view.projectId }
      : { type: "projects" };
  }

  if (
    view.type === "editor" &&
    typeof view.projectId === "string" &&
    typeof view.postId === "string"
  ) {
    const project = projects.find((p) => p.id === view.projectId);
    if (project?.posts.some((p) => p.id === view.postId)) {
      return { type: "editor", projectId: view.projectId, postId: view.postId };
    }
  }

  return { type: "projects" };
}

export function sanitizeStore(raw: unknown): ProjectsStore {
  if (!raw || typeof raw !== "object") return { ...EMPTY_STORE };
  const data = raw as Partial<ProjectsStore>;
  const projects = Array.isArray(data.projects)
    ? data.projects.map(sanitizeProject).filter((p): p is Project => p !== null)
    : [];

  return {
    version: 1,
    projects,
    lastView: sanitizeView(data.lastView, projects),
  };
}

function readLegacyTheme(): ThemeConfig {
  const settings = readJson<{ theme?: ThemeConfig }>(PS_SETTINGS_KEY);
  return normalizeTheme(settings?.theme ?? DEFAULT_THEME);
}

export function migrateLegacyDraft(): ProjectsStore | null {
  const legacyDraft = readJson<EditorDraft>(PS_DRAFT_KEY);
  if (!legacyDraft) return null;

  const project = createDefaultProject("My first project", readLegacyTheme());
  project.posts[0] = {
    ...project.posts[0],
    name: "Post 1",
    draft: prepareDraftForEditor(legacyDraft, createDefaultDraft()),
  };

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(PS_DRAFT_KEY);
  }

  return {
    version: 1,
    projects: [project],
    lastView: {
      type: "editor",
      projectId: project.id,
      postId: project.posts[0].id,
    },
  };
}

export function loadProjectsStore(): ProjectsStore {
  const stored = readJson<ProjectsStore>(PS_PROJECTS_KEY);
  if (stored && Array.isArray(stored.projects) && stored.projects.length > 0) {
    const store = sanitizeStore(stored);
    const view = resolveView(store, store.lastView ?? { type: "projects" });
    return persistStore(store, view);
  }

  const migrated = migrateLegacyDraft();
  if (migrated) {
    writeJson(PS_PROJECTS_KEY, migrated);
    return migrated;
  }

  return { ...EMPTY_STORE };
}

export function saveProjectsStore(store: ProjectsStore): void {
  writeJson(PS_PROJECTS_KEY, store);
}

export function persistStore(store: ProjectsStore, view?: PsView): ProjectsStore {
  const next: ProjectsStore = {
    ...store,
    lastView: view ?? store.lastView ?? { type: "projects" },
  };
  saveProjectsStore(next);
  return next;
}

export function createProject(store: ProjectsStore, name: string, theme?: ThemeConfig): ProjectsStore {
  const project = createDefaultProject(name.trim() || "Untitled project", theme ?? readLegacyTheme());
  return {
    ...store,
    projects: [project, ...store.projects],
    lastView: { type: "project", projectId: project.id },
  };
}

export function updateProject(
  store: ProjectsStore,
  projectId: string,
  patch: Partial<Pick<Project, "name" | "theme">>,
): ProjectsStore {
  return {
    ...store,
    projects: store.projects.map((p) => {
      if (p.id !== projectId) return p;
      return touchProject({
        ...p,
        ...patch,
        name: patch.name !== undefined ? patch.name.trim() || "Untitled project" : p.name,
        theme: patch.theme !== undefined ? normalizeTheme(patch.theme) : p.theme,
      });
    }),
  };
}

export function deleteProject(store: ProjectsStore, projectId: string): ProjectsStore {
  const projects = store.projects.filter((p) => p.id !== projectId);
  let lastView: PsView = { type: "projects" };
  if (store.lastView?.type === "project" && store.lastView.projectId === projectId) {
    lastView = { type: "projects" };
  } else if (
    store.lastView?.type === "editor" &&
    store.lastView.projectId === projectId
  ) {
    lastView = { type: "projects" };
  } else if (store.lastView) {
    lastView = store.lastView;
  }
  return { ...store, projects, lastView };
}

export function createPost(store: ProjectsStore, projectId: string, name?: string): ProjectsStore {
  const postCount =
    store.projects.find((p) => p.id === projectId)?.posts.length ?? 0;
  const post = createDefaultPost(name ?? `Post ${postCount + 1}`);

  return {
    ...store,
    projects: store.projects.map((p) => {
      if (p.id !== projectId) return p;
      return touchProject({ ...p, posts: [post, ...p.posts] });
    }),
    lastView: { type: "editor", projectId, postId: post.id },
  };
}

export function duplicatePost(
  store: ProjectsStore,
  projectId: string,
  postId: string,
): ProjectsStore {
  let newPostId: string | null = null;

  const projects = store.projects.map((p) => {
    if (p.id !== projectId) return p;
    const source = p.posts.find((post) => post.id === postId);
    if (!source) return p;

    const duplicate: Post = {
      ...source,
      id: createPostId(),
      name: `${source.name} (copy)`,
      createdAt: now(),
      updatedAt: now(),
      draft: structuredClone(source.draft),
    };
    newPostId = duplicate.id;

    return touchProject({ ...p, posts: [duplicate, ...p.posts] });
  });

  if (!newPostId) return store;

  return {
    ...store,
    projects,
    lastView: { type: "editor", projectId, postId: newPostId },
  };
}

export function renamePost(
  store: ProjectsStore,
  projectId: string,
  postId: string,
  name: string,
): ProjectsStore {
  return {
    ...store,
    projects: store.projects.map((p) => {
      if (p.id !== projectId) return p;
      return touchProject({
        ...p,
        posts: p.posts.map((post) =>
          post.id === postId
            ? touchPost({ ...post, name: name.trim() || post.name })
            : post,
        ),
      });
    }),
  };
}

export function deletePost(
  store: ProjectsStore,
  projectId: string,
  postId: string,
): ProjectsStore {
  return {
    ...store,
    projects: store.projects.map((p) => {
      if (p.id !== projectId) return p;
      return touchProject({
        ...p,
        posts: p.posts.filter((post) => post.id !== postId),
      });
    }),
    lastView:
      store.lastView?.type === "editor" &&
      store.lastView.projectId === projectId &&
      store.lastView.postId === postId
        ? { type: "project", projectId }
        : store.lastView,
  };
}

export function savePostDraft(
  store: ProjectsStore,
  projectId: string,
  postId: string,
  draft: EditorDraft,
): ProjectsStore {
  return {
    ...store,
    projects: store.projects.map((p) => {
      if (p.id !== projectId) return p;
      return touchProject({
        ...p,
        posts: p.posts.map((post) =>
          post.id === postId ? touchPost({ ...post, draft }) : post,
        ),
      });
    }),
  };
}

export function findProject(store: ProjectsStore, projectId: string): Project | null {
  return store.projects.find((p) => p.id === projectId) ?? null;
}

export function findPost(store: ProjectsStore, projectId: string, postId: string): Post | null {
  const project = findProject(store, projectId);
  return project?.posts.find((p) => p.id === postId) ?? null;
}

export function resolveView(store: ProjectsStore, view: PsView): PsView {
  return sanitizeView(view, store.projects);
}