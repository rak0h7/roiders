import { LOCAL_STORAGE_KEYS, readLocalModule } from "@/lib/cloudSync";
import { safeSetLocalStorage } from "@/lib/safeLocalStorage";
import type { BloodworkReport } from "@/lib/types";
import type { CycleCompound } from "@/lib/cycleTypes";

export const EXPORT_VERSION = "2.0";

export interface ExportBundle {
  exportedAt: string;
  version: string;
  bloodwork: { reports: BloodworkReport[] };
  cycle: {
    weeks: number;
    startDate: string;
    compounds: CycleCompound[];
  };
  gym?: unknown;
  settings?: unknown;
}

export function buildExportBundle(partial: {
  reports: BloodworkReport[];
  weeks: number;
  startDate: string;
  compounds: CycleCompound[];
}): ExportBundle {
  return {
    exportedAt: new Date().toISOString(),
    version: EXPORT_VERSION,
    bloodwork: { reports: partial.reports },
    cycle: {
      weeks: partial.weeks,
      startDate: partial.startDate,
      compounds: partial.compounds,
    },
    gym: readLocalModule("gym"),
    settings: readLocalModule("settings"),
  };
}

export function exportJSON(bundle: ExportBundle): void {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
  downloadBlob(blob, `roiders-club-export-${dateStamp()}.json`);
}

export interface ImportResult {
  imported: ("bloodwork" | "cycle" | "gym" | "settings")[];
  errors: string[];
}

export function parseImportBundle(raw: string): { bundle: ExportBundle | null; error: string | null } {
  try {
    const data = JSON.parse(raw) as Partial<ExportBundle> & { nutrition?: unknown };
    if (!data.bloodwork?.reports || !data.cycle) {
      return { bundle: null, error: "Invalid bundle: missing bloodwork or cycle section" };
    }
    return {
      bundle: {
        exportedAt: data.exportedAt ?? new Date().toISOString(),
        version: data.version ?? "1.0",
        bloodwork: data.bloodwork,
        cycle: data.cycle,
        gym: data.gym,
        settings: data.settings,
      },
      error: null,
    };
  } catch {
    return { bundle: null, error: "Could not parse JSON file" };
  }
}

export function applyImportBundle(
  bundle: ExportBundle,
  options: { bloodwork?: boolean; cycle?: boolean; gym?: boolean; settings?: boolean } = {}
): ImportResult {
  const opts = {
    bloodwork: true,
    cycle: true,
    gym: true,
    settings: true,
    ...options,
  };
  const imported: ImportResult["imported"] = [];
  const errors: string[] = [];

  if (typeof window === "undefined") {
    return { imported, errors: ["Import only available in browser"] };
  }

  if (opts.bloodwork && bundle.bloodwork?.reports) {
    try {
      safeSetLocalStorage(LOCAL_STORAGE_KEYS.labs, JSON.stringify(bundle.bloodwork.reports));
      imported.push("bloodwork");
    } catch {
      errors.push("Failed to import bloodwork");
    }
  }

  if (opts.cycle && bundle.cycle) {
    try {
      const existing = readLocalModule("cycle") as { state?: Record<string, unknown> } | null;
      const state = existing?.state ?? {};
      safeSetLocalStorage(
        LOCAL_STORAGE_KEYS.cycle,
        JSON.stringify({
          state: {
            ...state,
            weeks: bundle.cycle.weeks,
            startDate: bundle.cycle.startDate,
            compounds: bundle.cycle.compounds,
          },
          version: 0,
        })
      );
      imported.push("cycle");
    } catch {
      errors.push("Failed to import cycle");
    }
  }

  for (const mod of ["gym", "settings"] as const) {
    if (!opts[mod] || bundle[mod] == null) continue;
    try {
      safeSetLocalStorage(LOCAL_STORAGE_KEYS[mod], JSON.stringify(bundle[mod]));
      imported.push(mod);
    } catch {
      errors.push(`Failed to import ${mod}`);
    }
  }

  return { imported, errors };
}

export function exportBloodworkCSV(reports: BloodworkReport[]): void {
  const rows: string[] = ["report_id,report_name,report_date,marker_id,value,unit"];
  for (const report of reports) {
    for (const v of report.values) {
      rows.push(
        [report.id, csvEscape(report.name), report.date, v.markerId, v.value, v.unit].join(",")
      );
    }
  }
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  downloadBlob(blob, `bloodwork-export-${dateStamp()}.csv`);
}

export function exportBloodworkPDF(reports: BloodworkReport[], overallScore?: number | null): void {
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Bloodwork Report</title>
<style>
  body { font-family: system-ui, sans-serif; padding: 40px; color: #111; }
  h1 { color: #dc2626; margin-bottom: 4px; }
  .meta { color: #666; font-size: 14px; margin-bottom: 32px; }
  .report { margin-bottom: 32px; page-break-inside: avoid; }
  .report h2 { border-bottom: 2px solid #dc2626; padding-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #e5e5e5; }
  th { background: #fafafa; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
  .score { font-size: 24px; font-weight: bold; color: #dc2626; }
</style></head><body>
<h1>Bloodwork Report Export</h1>
<p class="meta">Generated ${new Date().toLocaleString()}${overallScore != null ? ` · Overall Score: ${overallScore}` : ""}</p>
${reports.map((r) => `
<div class="report">
  <h2>${escapeHtml(r.name)}</h2>
  <p class="meta">${r.date} · ${r.values.length} markers</p>
  <table><thead><tr><th>Marker</th><th>Value</th><th>Unit</th></tr></thead>
  <tbody>${r.values.map((v) => `<tr><td>${escapeHtml(v.markerId)}</td><td>${v.value}</td><td>${escapeHtml(v.unit)}</td></tr>`).join("")}</tbody></table>
</div>`).join("")}
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => win.print();
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function csvEscape(s: string) {
  return `"${s.replace(/"/g, '""')}"`;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}