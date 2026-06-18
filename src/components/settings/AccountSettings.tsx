"use client";

import Link from "next/link";
import { useState } from "react";
import { AtSign, Cloud, LogIn, LogOut, RefreshCw, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function AccountSettings() {
  const { configured, user, username, accountName, isAdmin, loading, signOut, syncNow, setUsername } =
    useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSync = async () => {
    const { error } = await syncNow();
    if (error) toast({ type: "error", title: "Sync failed", description: error });
    else toast({ type: "success", title: "Cloud backup saved" });
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

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleSync} className={cn(ui.btnSecondary, "text-xs")}>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Sync now
              </button>
              <button type="button" onClick={handleSignOut} className={cn(ui.btnGhost, "text-xs text-[var(--danger)]")}>
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
            <p className="text-[11px] text-[var(--muted)]">Auto-sync runs every 45 seconds while signed in.</p>
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