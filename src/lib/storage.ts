import type { BloodworkReport } from "./types";
import { LOCAL_STORAGE_KEYS } from "./cloudSync";

const LEGACY_STORAGE_KEY = "bloodwork-logger-reports";

function migrateLabsStorage(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(LOCAL_STORAGE_KEYS.labs)) return;
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacy) return;
  localStorage.setItem(LOCAL_STORAGE_KEYS.labs, legacy);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}

export function loadReports(): BloodworkReport[] {
  if (typeof window === "undefined") return [];
  migrateLabsStorage();
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEYS.labs);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveReports(reports: BloodworkReport[]): void {
  if (typeof window === "undefined") return;
  migrateLabsStorage();
  localStorage.setItem(LOCAL_STORAGE_KEYS.labs, JSON.stringify(reports));
}

export function generateId(): string {
  return `report-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}