"use client";

import { useCallback, useEffect, useState } from "react";
import { Database, RefreshCw, Trash2, X } from "lucide-react";
import type { AdminUser, AdminUserModule } from "@/lib/admin";
import type { CloudModule } from "@/lib/cloudSync";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type AdminUserModulesProps = {
  user: AdminUser;
  onClose: () => void;
  onReset: () => void;
};

export function AdminUserModules({ user, onClose, onReset }: AdminUserModulesProps) {
  const [modules, setModules] = useState<AdminUserModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const label =
    user.display_name ?? (user.username ? `@${user.username}` : user.id.slice(0, 8));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/modules`, { credentials: "same-origin" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setModules(data.modules ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load modules");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/users/${user.id}/modules`, { credentials: "same-origin" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error ?? "Failed to load");
        setModules(data.modules ?? []);
        setError(null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load modules");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const resetModule = async (module: CloudModule | "all") => {
    const name = module === "all" ? "all cloud data" : `the ${module} module`;
    if (!confirm(`Reset ${name} for ${label}? The user will need to re-sync or re-enter data.`)) return;

    setBusy(module);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/modules?module=${module}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reset failed");
      await load();
      onReset();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className={cn(ui.card, "max-h-[85vh] w-full max-w-lg overflow-hidden")}>
        <div className={cn(ui.cardPad, "flex items-start justify-between gap-3 border-b border-[var(--border)]")}>
          <div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-[var(--muted)]" />
              <h3 className={ui.sectionTitle}>Cloud data — {label}</h3>
            </div>
            <p className={ui.sectionSub}>Synced module snapshots stored in Supabase.</p>
          </div>
          <button type="button" onClick={onClose} className={ui.btnGhost}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-4">
          {loading ? (
            <p className="text-sm text-[var(--muted)]">Loading…</p>
          ) : error ? (
            <p className="text-sm text-[var(--danger)]">{error}</p>
          ) : modules.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No synced modules for this account.</p>
          ) : (
            <ul className="space-y-2">
              {modules.map((mod) => (
                <li
                  key={mod.module}
                  className={cn(ui.cardInner, "flex flex-wrap items-center justify-between gap-2 px-3 py-2.5")}
                >
                  <div>
                    <p className="text-sm font-medium capitalize">{mod.module}</p>
                    <p className="text-[11px] text-[var(--muted)]">{mod.summary}</p>
                    <p className="text-[10px] text-[var(--muted-2)]">
                      {new Date(mod.updated_at).toLocaleString()} · {(mod.size_bytes / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busy === mod.module}
                    onClick={() => void resetModule(mod.module)}
                    className={cn(ui.btnGhost, "text-xs text-[var(--danger)]")}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Reset
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={cn(ui.cardPad, "flex flex-wrap gap-2 border-t border-[var(--border)]")}>
          <button type="button" onClick={() => void load()} className={ui.btnSecondary} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </button>
          {modules.length > 0 && (
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => void resetModule("all")}
              className={cn(ui.btnGhost, "text-[var(--danger)]")}
            >
              Reset all modules
            </button>
          )}
        </div>
      </div>
    </div>
  );
}