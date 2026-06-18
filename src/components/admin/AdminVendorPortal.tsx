"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, RefreshCw, Store, Users } from "lucide-react";
import type { VendorCustomer, VendorRecord } from "@/lib/vendors";
import { AccessKeyReveal } from "@/components/auth/AccessKeyReveal";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type VendorMeResponse = {
  vendor: VendorRecord;
  keys_remaining: number | null;
  customers: VendorCustomer[];
};

export function AdminVendorPortal() {
  const { accountName } = useAuth();
  const [data, setData] = useState<VendorMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const load = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/vendor/me", { credentials: "same-origin" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load vendor data");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load vendor data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(true);
  }, [load]);

  const generateKey = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/vendor/generate", {
        method: "POST",
        credentials: "same-origin",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to generate key");
      setGeneratedKey(json.accessKey);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate key");
    } finally {
      setGenerating(false);
    }
  };

  const vendor = data?.vendor;
  const keysRemaining = data?.keys_remaining;
  const customers = data?.customers ?? [];
  const quotaLabel =
    vendor && vendor.key_quota > 0
      ? `${vendor.keys_issued} / ${vendor.key_quota} issued`
      : `${vendor?.keys_issued ?? 0} issued · unlimited quota`;

  return (
    <div className="relative min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/" className={cn(ui.btnGhost, "mb-3 -ml-2")}>
              <ArrowLeft className="h-4 w-4" />
              Back to app
            </Link>
            <div className="flex items-center gap-2">
              <Store className="h-6 w-6 text-[var(--protocol)]" />
              <h1 className="font-display text-2xl font-bold text-gradient">Vendor Portal</h1>
            </div>
            <p className={`${ui.pageSub} mt-1`}>
              {vendor?.name ?? "Vendor"} · signed in as {accountName ?? "Vendor"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load(true)}
            className={ui.btnSecondary}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-[var(--radius-md)] border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        )}

        {loading && !vendor ? (
          <div className={cn(ui.card, ui.cardPad)}>
            <p className="text-sm text-[var(--muted)]">Loading vendor portal…</p>
          </div>
        ) : vendor ? (
          <div className="space-y-6">
            {!vendor.enabled && (
              <div className="rounded-[var(--radius-md)] border border-[var(--warning)]/30 bg-[var(--warning)]/10 px-4 py-3 text-sm text-[var(--warning)]">
                Your vendor account is disabled. Contact the site owner to re-enable key generation.
              </div>
            )}

            {generatedKey && (
              <div className="max-w-xl">
                <AccessKeyReveal
                  accessKey={generatedKey}
                  title="Customer access key"
                  description="Send this key to your customer. They sign in at /auth/login and pick a username. You will not see it again."
                  confirmLabel="Done — I've saved the key"
                  checkboxLabel="I have copied the customer access key"
                  onConfirm={() => {
                    setGeneratedKey(null);
                    void load();
                  }}
                />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <div className={cn(ui.card, ui.cardPad)}>
                <p className={ui.overline}>Keys issued</p>
                <p className="font-display mt-2 text-2xl font-bold">{vendor.keys_issued}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{quotaLabel}</p>
              </div>
              <div className={cn(ui.card, ui.cardPad)}>
                <p className={ui.overline}>Remaining</p>
                <p className="font-display mt-2 text-2xl font-bold">
                  {keysRemaining === null ? "∞" : keysRemaining}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {vendor.key_quota > 0 ? "Quota resets when owner raises limit" : "No quota cap"}
                </p>
              </div>
              <div className={cn(ui.card, ui.cardPad)}>
                <p className={ui.overline}>Active customers</p>
                <p className="font-display mt-2 text-2xl font-bold">{customers.length}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">Accounts you issued</p>
              </div>
            </div>

            <div className={cn(ui.card, ui.cardPad, "flex flex-wrap items-center justify-between gap-3")}>
              <div>
                <h2 className={ui.sectionTitle}>Issue customer key</h2>
                <p className={ui.sectionSub}>
                  Generate a new access key attributed to your vendor account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void generateKey()}
                disabled={generating || !vendor.enabled || Boolean(generatedKey) || keysRemaining === 0}
                className={ui.btnPrimary}
              >
                <KeyRound className="h-4 w-4" />
                {generating ? "Generating…" : "Generate customer key"}
              </button>
            </div>

            <div className={cn(ui.card, "overflow-hidden")}>
              <div className={cn(ui.cardPad, "border-b border-[var(--border)]")}>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[var(--muted)]" />
                  <h2 className={ui.sectionTitle}>Your customers</h2>
                </div>
                <p className={ui.sectionSub}>{customers.length} accounts issued by you</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                      <th className="px-4 py-3 font-medium">Account</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                      <th className="px-4 py-3 font-medium">Cloud modules</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-sm text-[var(--muted)]">
                          No customer keys issued yet.
                        </td>
                      </tr>
                    ) : (
                      customers.map((row) => (
                        <tr key={row.id} className="border-b border-[var(--border)]/60 last:border-0">
                          <td className="px-4 py-3">
                            <p className="font-medium">
                              {row.display_name ??
                                (row.username ? `@${row.username}` : (
                                  <span className="text-[var(--muted)]">Awaiting username</span>
                                ))}
                            </p>
                            <p className="text-xs font-mono text-[var(--muted)]">
                              key ···{row.key_fingerprint?.slice(-4) ?? row.id.slice(0, 8)}
                            </p>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                            {new Date(row.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-xs text-[var(--muted)]">{row.module_count}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}