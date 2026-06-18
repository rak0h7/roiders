"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Database, ExternalLink, Plus, RefreshCw, Shield, Trash2, Users } from "lucide-react";
import { AdminUserModules } from "@/components/admin/AdminUserModules";
import type { AdminUser } from "@/lib/admin";
import { AccessKeyReveal } from "@/components/auth/AccessKeyReveal";
import { AdminSiteSettings } from "@/components/admin/AdminSiteSettings";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type Stats = {
  totalAccounts: number;
  adminAccounts: number;
  syncedModules: number;
  accountsLast7Days: number;
  moduleBreakdown: Record<string, number>;
};

export function AdminPanel() {
  const { user, accountName } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [modulesUser, setModulesUser] = useState<AdminUser | null>(null);

  const load = useCallback(async (options?: { showLoading?: boolean }) => {
    if (options?.showLoading) setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats", { credentials: "same-origin" }),
        fetch("/api/admin/users", { credentials: "same-origin" }),
      ]);

      const statsJson = await statsRes.json();
      const usersJson = await usersRes.json();

      if (!statsRes.ok) throw new Error(statsJson.error ?? "Failed to load stats");
      if (!usersRes.ok) throw new Error(usersJson.error ?? "Failed to load users");

      setStats(statsJson);
      setUsers(usersJson.users ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch("/api/admin/stats", { credentials: "same-origin" }),
          fetch("/api/admin/users", { credentials: "same-origin" }),
        ]);
        const statsJson = await statsRes.json();
        const usersJson = await usersRes.json();
        if (!statsRes.ok) throw new Error(statsJson.error ?? "Failed to load stats");
        if (!usersRes.ok) throw new Error(usersJson.error ?? "Failed to load users");
        if (!cancelled) {
          setStats(statsJson);
          setUsers(usersJson.users ?? []);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load admin data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const generateAccount = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users/generate", {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate account");
      setGeneratedKey(data.accessKey);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate account");
    } finally {
      setGenerating(false);
    }
  };

  const deleteUser = async (target: AdminUser) => {
    if (target.is_admin) return;
    const label = target.username ? `@${target.username}` : target.display_name ?? target.id;
    if (!confirm(`Delete account ${label}? This cannot be undone.`)) return;

    setBusyId(target.id);
    try {
      const res = await fetch(`/api/admin/users/${target.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      setUsers((list) => list.filter((u) => u.id !== target.id));
      void load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/" className={cn(ui.btnGhost, "mb-3 -ml-2")}>
              <ArrowLeft className="h-4 w-4" />
              Back to app
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-[var(--labs)]" />
              <h1 className="font-display text-2xl font-bold text-gradient">Site Admin</h1>
            </div>
            <p className={`${ui.pageSub} mt-1`}>
              Owner panel — signed in as {accountName ?? "Admin"}
            </p>
          </div>
          <button type="button" onClick={() => void load({ showLoading: true })} className={ui.btnSecondary} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
            {error}
            {error.includes("is_admin") && (
              <p className="mt-2 text-xs">
                Run <code className="rounded bg-black/20 px-1">npm run db:migrate</code> or paste{" "}
                <code className="rounded bg-black/20 px-1">supabase/migrate-pending.sql</code> in the Supabase SQL Editor.
              </p>
            )}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total accounts", value: stats?.totalAccounts ?? "—" },
            { label: "New (7 days)", value: stats?.accountsLast7Days ?? "—" },
            { label: "Synced modules", value: stats?.syncedModules ?? "—" },
            { label: "Admins", value: stats?.adminAccounts ?? "—" },
          ].map((card) => (
            <div key={card.label} className={cn(ui.card, ui.cardPad)}>
              <p className={ui.overline}>{card.label}</p>
              <p className="mt-2 font-display text-3xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <AdminSiteSettings />
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          <div className={cn(ui.card, ui.cardPad)}>
            <h2 className={ui.sectionTitle}>Module sync breakdown</h2>
            <div className="mt-4 space-y-2">
              {stats &&
                Object.entries(stats.moduleBreakdown).map(([mod, count]) => (
                  <div key={mod} className="flex justify-between text-sm">
                    <span className="capitalize text-[var(--muted)]">{mod}</span>
                    <span className="font-mono">{count}</span>
                  </div>
                ))}
              {stats && Object.keys(stats.moduleBreakdown).length === 0 && (
                <p className="text-sm text-[var(--muted)]">No synced module data yet.</p>
              )}
            </div>
          </div>

          <div className={cn(ui.card, ui.cardPad)}>
            <h2 className={ui.sectionTitle}>Quick links</h2>
            <div className="mt-4 space-y-2">
              <a
                href="https://supabase.com/dashboard/project/uhssspbmgsijvygrxvaw"
                target="_blank"
                rel="noreferrer"
                className={cn(ui.btnSecondary, "w-full justify-between")}
              >
                Supabase dashboard
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href="https://vercel.com/roiders-club/roiders"
                target="_blank"
                rel="noreferrer"
                className={cn(ui.btnSecondary, "w-full justify-between")}
              >
                Vercel deployments
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href="https://roiders.vercel.app"
                target="_blank"
                rel="noreferrer"
                className={cn(ui.btnSecondary, "w-full justify-between")}
              >
                Production site
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {generatedKey && (
          <div className="mb-8 max-w-xl">
            <AccessKeyReveal
              accessKey={generatedKey}
              title="New account access key"
              description="Copy this key and send it to the user securely. They sign in with it, then pick a username. You will not see it again."
              confirmLabel="Done — I've saved the key"
              checkboxLabel="I have copied the access key"
              onConfirm={() => {
                setGeneratedKey(null);
                void load();
              }}
            />
          </div>
        )}

        <div className={cn(ui.card, "overflow-hidden")}>
          <div className={cn(ui.cardPad, "flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)]")}>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[var(--muted)]" />
              <h2 className={ui.sectionTitle}>Accounts</h2>
            </div>
            <button
              type="button"
              onClick={() => void generateAccount()}
              disabled={generating || Boolean(generatedKey)}
              className={ui.btnPrimary}
            >
              <Plus className="h-4 w-4" />
              {generating ? "Generating…" : "Generate account"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                  <th className="px-4 py-3 font-medium">Account</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Modules</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {users.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)]/60 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {row.display_name ??
                          (row.username ? `@${row.username}` : (
                            <span className="text-[var(--muted)]">No username yet</span>
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
                    <td className="px-4 py-3 text-[var(--muted)]">
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
                          onClick={() => setModulesUser(row)}
                          className={cn(ui.btnGhost, "text-[var(--muted)] hover:text-[var(--foreground)]")}
                          title="View cloud data"
                        >
                          <Database className="h-4 w-4" />
                        </button>
                        {!row.is_admin && row.id !== user?.id && (
                          <button
                            type="button"
                            disabled={busyId === row.id}
                            onClick={() => void deleteUser(row)}
                            className={cn(ui.btnGhost, "text-[var(--danger)] hover:bg-[var(--danger)]/10")}
                            title="Delete account"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && users.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-[var(--muted)]">No accounts found.</p>
            )}
          </div>
        </div>

        {modulesUser && (
          <AdminUserModules
            user={modulesUser}
            onClose={() => setModulesUser(null)}
            onReset={() => void load()}
          />
        )}
      </div>
    </div>
  );
}