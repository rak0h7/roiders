"use client";

import { useMemo, useState } from "react";
import { Database, KeyRound, Plus, Search, Trash2 } from "lucide-react";
import type { AdminUser } from "@/lib/admin";
import { formatBytes } from "@/lib/adminStats";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type AdminAccountsProps = {
  users: AdminUser[];
  currentUserId?: string;
  generating: boolean;
  generatedKeyPending: boolean;
  busyId: string | null;
  storageByUser?: Record<string, number>;
  onGenerate: () => void;
  onDelete: (user: AdminUser) => void;
  onInspect: (user: AdminUser) => void;
  onRevealKey: (user: AdminUser) => void;
  onTogglePremiumSync: (user: AdminUser, enabled: boolean) => void;
};

export function AdminAccounts({
  users,
  currentUserId,
  generating,
  generatedKeyPending,
  busyId,
  storageByUser = {},
  onGenerate,
  onDelete,
  onInspect,
  onRevealKey,
  onTogglePremiumSync,
}: AdminAccountsProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "synced" | "pending" | "admin">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((row) => {
      if (filter === "synced" && row.module_count === 0) return false;
      if (filter === "pending" && row.username) return false;
      if (filter === "admin" && !row.is_admin) return false;

      if (!q) return true;
      const hay = [
        row.display_name,
        row.username,
        row.key_fingerprint,
        row.id,
        row.modules.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [users, query, filter]);

  return (
    <div className={cn(ui.card, "overflow-hidden")}>
      <div className={cn(ui.cardPad, "space-y-4 border-b border-[var(--border)]")}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={ui.sectionTitle}>Accounts</h2>
            <p className={ui.sectionSub}>
              {filtered.length} of {users.length} shown · generate keys and send to paying users
            </p>
          </div>
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating || generatedKeyPending}
            className={ui.btnPrimary}
          >
            <Plus className="h-4 w-4" />
            {generating ? "Generating…" : "Generate access key"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[12rem] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search username, name, key…"
              className={cn(ui.input, "pl-9")}
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {(
              [
                ["all", "All"],
                ["synced", "Has sync"],
                ["pending", "No username"],
                ["admin", "Admins"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition",
                  filter === id
                    ? "bg-[var(--labs-dim)] text-[var(--labs)]"
                    : "text-[var(--muted)] hover:bg-[var(--bg-hover)]"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
              <th className="px-4 py-3 font-medium">Account</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Premium</th>
              <th className="px-4 py-3 font-medium">Cloud data</th>
              <th className="px-4 py-3 font-medium">Modules</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const bytes = storageByUser[row.id] ?? 0;
              return (
                <tr key={row.id} className="border-b border-[var(--border)]/60 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {row.display_name ??
                        (row.username ? `@${row.username}` : (
                          <span className="text-[var(--muted)]">Awaiting username</span>
                        ))}
                    </p>
                    {row.display_name && row.username && (
                      <p className="text-xs text-[var(--muted)]">@{row.username}</p>
                    )}
                    <p className="text-xs font-mono text-[var(--muted)]">
                      key ···{row.key_fingerprint?.slice(-4) ?? row.id.slice(0, 8)}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                    {new Date(row.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {row.is_admin ? (
                      <span className="rounded-full bg-[var(--labs-dim)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--labs)]">
                        Owner
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={busyId === row.id}
                        onClick={() => onTogglePremiumSync(row, !row.premium_sync_enabled)}
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition",
                          row.premium_sync_enabled
                            ? "bg-[var(--success)]/15 text-[var(--success)] hover:bg-[var(--success)]/25"
                            : "bg-[var(--bg-elevated)] text-[var(--muted)] hover:text-[var(--foreground)]",
                        )}
                        title={row.premium_sync_enabled ? "Disable premium sync" : "Enable premium sync"}
                      >
                        {row.premium_sync_enabled ? "Sync on" : "Local only"}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {bytes > 0 ? (
                      <span className="font-mono text-xs text-[var(--intel)]">{formatBytes(bytes)}</span>
                    ) : (
                      <span className="text-xs text-[var(--muted)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">
                    {row.module_count ? row.modules.join(", ") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {row.is_admin ? (
                      <span className="rounded-full bg-[var(--labs-dim)] px-2 py-0.5 text-xs font-semibold text-[var(--labs)]">
                        Owner
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--muted)]">User</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        disabled={busyId === row.id}
                        onClick={() => onRevealKey(row)}
                        className={cn(ui.btnGhost, "text-[var(--muted)] hover:text-[var(--foreground)]")}
                        title="Reveal escrowed access key"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onInspect(row)}
                        className={cn(ui.btnGhost, "text-[var(--muted)] hover:text-[var(--foreground)]")}
                        title="View cloud data"
                      >
                        <Database className="h-4 w-4" />
                      </button>
                      {!row.is_admin && row.id !== currentUserId && (
                        <button
                          type="button"
                          disabled={busyId === row.id}
                          onClick={() => onDelete(row)}
                          className={cn(ui.btnGhost, "text-[var(--danger)] hover:bg-[var(--danger)]/10")}
                          title="Delete account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-[var(--muted)]">No accounts match your filters.</p>
        )}
      </div>
    </div>
  );
}