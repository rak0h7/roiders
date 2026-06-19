import type { EditorDraft } from "./canvasTypes";

export const PS_SETTINGS_KEY = "ps-maker-settings";
export const PS_DRAFT_KEY = "ps-maker-draft";
export const PS_PROJECTS_KEY = "ps-maker-projects";

export function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors in PS tool */
  }
}

export function readDraft(): EditorDraft | null {
  return readJson<EditorDraft>(PS_DRAFT_KEY);
}

export function writeDraft(draft: EditorDraft): void {
  writeJson(PS_DRAFT_KEY, draft);
}