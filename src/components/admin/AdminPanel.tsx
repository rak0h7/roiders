"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  LayoutDashboard,
  RefreshCw,
  Settings2,
  Shield,
  Users,
} from "lucide-react";
import { AdminAccounts } from "@/components/admin/AdminAccounts";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminUserModules } from "@/components/admin/AdminUserModules";
import type { AdminUser } from "@/lib/admin";
import type { AdminStats } from "@/lib/adminStats";
import { AccessKeyReveal } from "@/components/auth/AccessKeyReveal";
import { AdminSiteSettings } from "@/components/admin/AdminSiteSettings";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type AdminTab = "overview" | "accounts" | "settings";

const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "accounts", label: "Accounts", icon: <Users className="h-4 w-4" /> },
  { id: "settings", label: "Settings", icon: <Settings2 className="h-4 w-4" /> },
];

export function AdminPanel() {
  const { user, accountName } = useAuth();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [modulesUser, setModulesUser] = useState<AdminUser | null>(null);

  const storageByUser = stats?.userStorageBytes ?? {};

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
      setTab("accounts");
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

  const openUserById = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setModulesUser(found);
      setTab("accounts");
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
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
          <div className="flex flex-wrap gap-2">
            <a
              href="https://supabase.com/dashboard/project/uhssspbmgsijvygrxvaw"
              target="_blank"
              rel="noreferrer"
              className={cn(ui.btnSecondary, "text-xs")}
            >
              Supabase
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://vercel.com/roiders-club/roiders"
              target="_blank"
              rel="noreferrer"
              className={cn(ui.btnSecondary, "text-xs")}
            >
              Vercel
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={() => void load({ showLoading: true })}
              className={ui.btnSecondary}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </button>
          </div>
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

        <div className="mb-6 flex flex-wrap gap-1 border-b border-[var(--border)]">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition",
                tab === item.id
                  ? "border-[var(--labs)] text-[var(--labs)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {loading && !stats ? (
          <div className={cn(ui.card, ui.cardPad)}>
            <p className="text-sm text-[var(--muted)]">Loading admin data…</p>
          </div>
        ) : (
          <>
            {tab === "overview" && stats && (
              <AdminOverview
                stats={stats}
                onOpenAccounts={() => setTab("accounts")}
                onOpenSettings={() => setTab("settings")}
                onSelectUser={openUserById}
              />
            )}

            {tab === "accounts" && (
              <>
                {generatedKey && (
                  <div className="mb-6 max-w-xl">
                    <AccessKeyReveal
                      accessKey={generatedKey}
                      title="New account access key"
                      description="Copy this key and send it to the buyer securely. They sign in with it, then pick a username. You will not see it again."
                      confirmLabel="Done — I've saved the key"
                      checkboxLabel="I have copied the access key"
                      onConfirm={() => {
                        setGeneratedKey(null);
                        void load();
                      }}
                    />
                  </div>
                )}
                <AdminAccounts
                  users={users}
                  currentUserId={user?.id}
                  generating={generating}
                  generatedKeyPending={Boolean(generatedKey)}
                  busyId={busyId}
                  storageByUser={storageByUser}
                  onGenerate={() => void generateAccount()}
                  onDelete={(target) => void deleteUser(target)}
                  onInspect={setModulesUser}
                />
              </>
            )}

            {tab === "settings" && (
              <AdminSiteSettings onSaved={() => void load()} />
            )}
          </>
        )}

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