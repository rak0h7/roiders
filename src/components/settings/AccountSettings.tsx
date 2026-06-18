"use client";

import Link from "next/link";
import { useState } from "react";
import { AtSign, Cloud, LogIn, LogOut, RefreshCw, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useToast } from "@/context/ToastContext";
import { PREMIUM_SYNC_REQUIRED_MESSAGE } from "@/lib/cloudSyncAccess";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

function requestHref(supportUrl: string) {
  return supportUrl.trim() || "mailto:support@roiders.club?subject=Premium%20sync%20request";
}

export function AccountSettings() {
  const {
    configured,
    user,
    username,
    accountName,
    isAdmin,
    canCloudSync,
    premiumSyncEnabled,
    loading,
    signOut,
    syncNow,
    syncStatus,
    syncConflicts,
    resolveConflict,
    setUsername,
  } = useAuth();
  const { settings } = useSiteConfig();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSync = async () => {
    const { error, pulled } = await syncNow();
    if (error) toast({ type: "error", title: "Sync failed", description: error });
    else {
      const restored = pulled?.length ? ` · restored ${pulled.join(", ")}` : "";
      toast({ type: "success", title: "Synced", description: `Cloud data is up to date${restored}` });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ type: "info", title: "Signed out" });
  };

  const handleUsernameSave = async () => {
    setBusy(true);
    const { error } = await setUsername(draft);
    setBusy(false);
    if (error) {
      toast({ type: "error", title: "Username", description: error });
      return;
    }
    toast({ type: "success", title: "Username updated" });
    setEditing(false);
  };

  return (
    <div className={cn(ui.card, ui.cardPad)}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--intel)]/30 bg-[var(--intel-dim)]">
          <Cloud className="h-5 w-5 text-[var(--intel)]" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={ui.sectionTitle}>Account & cloud sync</h3>
          <p className={`${ui.sectionSub} mt-1`}>
            {configured
              ? "Your username is your public identity. Your access key stays private."
              : "Add Supabase keys to enable accounts."}
          </p>
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <p className="text-sm text-[var(--muted)]">Checking session…</p>
        ) : user ? (
          <div className="space-y-4">
            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)]/60 p-3">
              <p className={ui.label}>Username</p>
              {editing ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  <div className="relative min-w-[200px] flex-1">
                    <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      className={cn(ui.input, "pl-9 font-mono")}
                      placeholder="new_username"
                    />
                  </div>
                  <button type="button" disabled={busy} onClick={() => void handleUsernameSave()} className={ui.btnPrimary}>
                    Save
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className={ui.btnGhost}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg font-semibold">{accountName ?? "—"}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(username ?? "");
                      setEditing(true);
                    }}
                    className={cn(ui.btnGhost, "text-xs")}
                  >
                    {username ? "Change" : "Set username"}
                  </button>
                </div>
              )}
            </div>

            <p className="text-[11px] text-[var(--muted)]">
              Sign in with your access key. It is never shown here after account creation.
            </p>

            {isAdmin && (
              <Link href="/admin" className={cn(ui.btnPrimary, "text-xs w-full sm:w-auto")}>
                <Shield className="mr-1.5 h-3.5 w-3.5" />
                Site Admin
              </Link>
            )}

            {!canCloudSync && (
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)]/60 p-3">
                <p className="text-sm font-medium">Local-only account</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                  {settings.cloud_sync_enabled
                    ? PREMIUM_SYNC_REQUIRED_MESSAGE
                    : "Cloud sync is currently disabled site-wide."}
                </p>
                {settings.cloud_sync_enabled && (
                  <a
                    href={requestHref(settings.support_url)}
                    className={cn(ui.btnSecondary, "mt-3 text-xs")}
                  >
                    Request premium sync
                  </a>
                )}
              </div>
            )}

            {canCloudSync && syncConflicts.length > 0 && (
              <div className="space-y-2 rounded-[var(--radius-md)] border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-3">
                <p className="text-xs font-semibold text-[var(--warning)]">Sync conflicts</p>
                <p className="text-[11px] text-[var(--muted)]">
                  Local data is newer than cloud on these modules. Choose which copy to keep.
                </p>
                {syncConflicts.map((conflict) => (
                  <div key={conflict.module} className="flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--border)] bg-[var(--bg-elevated)]/60 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium capitalize">{conflict.module}</p>
                      <p className="text-[10px] text-[var(--muted)]">
                        Local {new Date(conflict.localUpdatedAt).toLocaleString()} · Cloud {new Date(conflict.remoteUpdatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        className={cn(ui.btnGhost, "text-[10px]")}
                        onClick={() => void resolveConflict(conflict.module, "local").then(({ error }) => {
                          if (error) toast({ type: "error", title: "Sync", description: error });
                          else toast({ type: "success", title: "Kept local copy", description: conflict.module });
                        })}
                      >
                        Keep local
                      </button>
                      <button
                        type="button"
                        className={cn(ui.btnSecondary, "text-[10px]")}
                        onClick={() => void resolveConflict(conflict.module, "remote").then(({ error }) => {
                          if (error) toast({ type: "error", title: "Sync", description: error });
                          else toast({ type: "success", title: "Restored from cloud", description: conflict.module });
                        })}
                      >
                        Use cloud
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {canCloudSync && (syncStatus.lastSyncAt || syncStatus.lastError) && (
              <p className="text-[11px] text-[var(--muted)]">
                {syncStatus.syncing
                  ? "Syncing…"
                  : syncStatus.lastError
                    ? `Last sync failed: ${syncStatus.lastError}`
                    : syncStatus.lastSyncAt
                      ? `Last synced ${new Date(syncStatus.lastSyncAt).toLocaleString()}`
                      : null}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {canCloudSync && (
                <button
                  type="button"
                  disabled={syncStatus.syncing}
                  onClick={handleSync}
                  className={cn(ui.btnSecondary, "text-xs")}
                >
                  <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", syncStatus.syncing && "animate-spin")} />
                  {syncStatus.syncing ? "Syncing…" : "Sync now"}
                </button>
              )}
              <button type="button" onClick={handleSignOut} className={cn(ui.btnGhost, "text-xs text-[var(--danger)]")}>
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
            {canCloudSync && (
              <p className="text-[11px] text-[var(--muted)]">
                Premium sync runs every 45 seconds while signed in.
                {premiumSyncEnabled && !isAdmin ? " Enabled on your account." : null}
              </p>
            )}
          </div>
        ) : (
          <Link href="/auth/login" className={cn(ui.btnPrimary, "inline-flex text-xs")}>
            <LogIn className="mr-1.5 h-3.5 w-3.5" />
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}