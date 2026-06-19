import type { ThemeConfig } from "@/lib/themes";
import { DEFAULT_THEME } from "@/lib/themes";
import type { EditorDraft } from "./canvasTypes";
import { blocksFromPreset } from "./contentPresets";

export type PsView =
  | { type: "projects" }
  | { type: "project"; projectId: string }
  | { type: "editor"; projectId: string; postId: string };

export interface Post {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  draft: EditorDraft;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  theme: ThemeConfig;
  posts: Post[];
}

export interface ProjectsStore {
  version: 1;
  projects: Project[];
  lastView?: PsView;
}

export function createProjectId(): string {
  return `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createPostId(): string {
  return `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createDefaultDraft(): EditorDraft {
  return {
    blocks: blocksFromPreset("roiders-club", "9:16"),
    canvasSizeId: "9:16",
    layoutPresetId: "roiders-club",
    selectedBlockId: null,
  };
}

export function createDefaultPost(name = "Untitled post"): Post {
  const now = Date.now();
  return {
    id: createPostId(),
    name,
    createdAt: now,
    updatedAt: now,
    draft: createDefaultDraft(),
  };
}

export function createDefaultProject(name = "Untitled project", theme: ThemeConfig = DEFAULT_THEME): Project {
  const now = Date.now();
  return {
    id: createProjectId(),
    name,
    createdAt: now,
    updatedAt: now,
    theme,
    posts: [createDefaultPost("Post 1")],
  };
}