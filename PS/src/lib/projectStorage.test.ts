import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_THEME } from "@/lib/themes";
import type { EditorDraft } from "./canvasTypes";
import {
  createPost,
  createProject,
  deletePost,
  deleteProject,
  migrateLegacyDraft,
  renamePost,
  sanitizeStore,
  savePostDraft,
} from "./projectStorage";
import { PS_DRAFT_KEY, PS_PROJECTS_KEY, PS_SETTINGS_KEY } from "./psStorage";

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  const mockStorage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => storage.clear(),
    key: () => null,
    length: 0,
  };
  vi.stubGlobal("localStorage", mockStorage);
  vi.stubGlobal("window", { localStorage: mockStorage });
});

describe("projectStorage", () => {
  it("migrates legacy draft into a first project", () => {
    const legacyDraft: EditorDraft = {
      blocks: [],
      canvasSizeId: "1:1",
      layoutPresetId: "quote",
      selectedBlockId: null,
    };
    storage.set(PS_DRAFT_KEY, JSON.stringify(legacyDraft));
    storage.set(PS_SETTINGS_KEY, JSON.stringify({ theme: DEFAULT_THEME }));

    const migrated = migrateLegacyDraft();
    expect(migrated?.projects).toHaveLength(1);
    expect(migrated?.projects[0].name).toBe("My first project");
    expect(migrated?.projects[0].posts[0].name).toBe("Post 1");
    expect(migrated?.lastView?.type).toBe("editor");
  });

  it("creates projects and posts", () => {
    let store = sanitizeStore({ version: 1, projects: [] });
    store = createProject(store, "Campaign A");
    expect(store.projects).toHaveLength(1);
    expect(store.projects[0].posts).toHaveLength(1);

    store = createPost(store, store.projects[0].id, "Hook slide");
    expect(store.projects[0].posts).toHaveLength(2);
    expect(store.projects[0].posts[0].name).toBe("Hook slide");
  });

  it("saves post drafts and renames posts", () => {
    let store = createProject(sanitizeStore({ version: 1, projects: [] }), "Test");
    const projectId = store.projects[0].id;
    const postId = store.projects[0].posts[0].id;

    const draft: EditorDraft = {
      blocks: [],
      canvasSizeId: "9:16",
      layoutPresetId: "roiders-club",
      selectedBlockId: null,
    };
    store = savePostDraft(store, projectId, postId, draft);
    expect(store.projects[0].posts[0].draft.layoutPresetId).toBe("roiders-club");

    store = renamePost(store, projectId, postId, "Main post");
    expect(store.projects[0].posts[0].name).toBe("Main post");
  });

  it("deletes posts and projects", () => {
    let store = createProject(sanitizeStore({ version: 1, projects: [] }), "Test");
    const projectId = store.projects[0].id;
    const postId = store.projects[0].posts[0].id;

    store = deletePost(store, projectId, postId);
    expect(store.projects[0].posts).toHaveLength(0);

    store = deleteProject(store, projectId);
    expect(store.projects).toHaveLength(0);
    expect(store.lastView).toEqual({ type: "projects" });
  });

  it("sanitizes invalid lastView", () => {
    const store = sanitizeStore({
      version: 1,
      projects: [],
      lastView: { type: "editor", projectId: "missing", postId: "missing" },
    });
    expect(store.lastView).toEqual({ type: "projects" });
  });

  it("persists to ps-maker-projects key", () => {
    const store = createProject(sanitizeStore({ version: 1, projects: [] }), "Saved");
    storage.set(PS_PROJECTS_KEY, JSON.stringify(store));
    expect(JSON.parse(storage.get(PS_PROJECTS_KEY) ?? "{}").projects[0].name).toBe("Saved");
  });
});