import type { BloodworkReport, MarkerValue } from "./types";
import { LOCAL_STORAGE_KEYS, writeLocalModule } from "./cloudSync";

const LEGACY_STORAGE_KEY = "bloodwork-logger-reports";

function migrateLabsStorage(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(LOCAL_STORAGE_KEYS.labs)) return;
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacy) return;
  try {
    writeLocalModule("labs", JSON.parse(legacy));
  } catch {
    return;
  }
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
  writeLocalModule("labs", reports);
}

export function generateId(): string {
  return `report-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function reportToValuesRecord(report: BloodworkReport): Record<string, MarkerValue> {
  const currentValues: Record<string, MarkerValue> = {};
  for (const v of report.values) {
    currentValues[v.markerId] = v;
  }
  return currentValues;
}

export function pickLatestReport(reports: BloodworkReport[]): BloodworkReport | null {
  if (reports.length === 0) return null;
  return [...reports].sort((a, b) => {
    const aTime = new Date(a.createdAt || a.date).getTime();
    const bTime = new Date(b.createdAt || b.date).getTime();
    return bTime - aTime;
  })[0];
}

export function hydrateLabsState(
  reports: BloodworkReport[],
  activeReportId: string | null
): { currentValues: Record<string, MarkerValue>; activeReportId: string | null } {
  if (reports.length === 0) {
    return { currentValues: {}, activeReportId: null };
  }

  const active =
    (activeReportId ? reports.find((r) => r.id === activeReportId) : null) ??
    pickLatestReport(reports)!;

  return {
    currentValues: reportToValuesRecord(active),
    activeReportId: active.id,
  };
}