"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  KeyRound,
  Plus,
  Store,
  Trash2,
} from "lucide-react";
import type { VendorCustomer, VendorWithProfile } from "@/lib/vendors";
import { AccessKeyReveal } from "@/components/auth/AccessKeyReveal";
import { AdminToggleRow } from "@/components/admin/AdminToggleRow";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type Props = {
  onChanged?: () => void;
};

type CreateDraft = {
  name: string;
  contact_url: string;
  key_quota: number;
};

export function AdminVendors({ onChanged }: Props) {
  const [vendors, setVendors] = useState<VendorWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createDraft, setCreateDraft] = useState<CreateDraft>({
    name: "",
    contact_url: "",
    key_quota: 0,
  });
  const [newVendorKey, setNewVendorKey] = useState<string | null>(null);
  const [generatedCustomerKey, setGeneratedCustomerKey] = useState<string | null>(null);
  const [busyVendorId, setBusyVendorId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [customersByVendor, setCustomersByVendor] = useState<Record<string, VendorCustomer[]>>({});
  const [customersLoadingId, setCustomersLoadingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/vendors", { credentials: "same-origin" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load vendors");
      setVendors(data.vendors ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load vendors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = useMemo(() => {
    return vendors.reduce(
      (acc, vendor) => {
        acc.issued += vendor.keys_issued;
        acc.customers += vendor.active_customers;
        acc.enabled += vendor.enabled ? 1 : 0;
        return acc;
      },
      { issued: 0, customers: 0, enabled: 0 },
    );
  }, [vendors]);

  const loadCustomers = async (vendorId: string) => {
    setCustomersLoadingId(vendorId);
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}/customers`, {
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load customers");
      setCustomersByVendor((prev) => ({ ...prev, [vendorId]: data.customers ?? [] }));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to load customers");
    } finally {
      setCustomersLoadingId(null);
    }
  };

  const toggleExpanded = async (vendorId: string) => {
    if (expandedId === vendorId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(vendorId);
    if (!customersByVendor[vendorId]) {
      await loadCustomers(vendorId);
    }
  };

  const createVendor = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/vendors", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createDraft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create vendor");
      setNewVendorKey(data.accessKey);
      setShowCreate(false);
      setCreateDraft({ name: "", contact_url: "", key_quota: 0 });
      await load();
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create vendor");
    } finally {
      setCreating(false);
    }
  };

  const patchVendor = async (vendorId: string, patch: Record<string, unknown>) => {
    setBusyVendorId(vendorId);
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update vendor");
      setVendors((list) =>
        list.map((row) =>
          row.id === vendorId
            ? {
                ...row,
                ...data.vendor,
                profile_username: row.profile_username,
                profile_display_name: row.profile_display_name,
                profile_fingerprint: row.profile_fingerprint,
                active_customers: row.active_customers,
              }
            : row,
        ),
      );
      onChanged?.();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update vendor");
    } finally {
      setBusyVendorId(null);
    }
  };

  const deleteVendor = async (vendor: VendorWithProfile) => {
    if (
      !confirm(
        `Remove vendor "${vendor.name}"? Their login will be deleted. Customer accounts stay active but lose vendor attribution.`,
      )
    ) {
      return;
    }

    setBusyVendorId(vendor.id);
    try {
      const res = await fetch(`/api/admin/vendors/${vendor.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete vendor");
      setVendors((list) => list.filter((row) => row.id !== vendor.id));
      if (expandedId === vendor.id) setExpandedId(null);
      onChanged?.();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete vendor");
    } finally {
      setBusyVendorId(null);
    }
  };

  const generateCustomerKey = async (vendorId: string) => {
    setBusyVendorId(vendorId);
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}/generate`, {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate key");
      setGeneratedCustomerKey(data.accessKey);
      await load();
      if (expandedId === vendorId) await loadCustomers(vendorId);
      onChanged?.();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to generate key");
    } finally {
      setBusyVendorId(null);
    }
  };

  if (loading) {
    return (
      <div className={cn(ui.card, ui.cardPad)}>
        <p className="text-sm text-[var(--muted)]">Loading vendors…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-[var(--radius-md)] border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
          {error.includes("does not exist") && (
            <p className="mt-2 text-xs">
              Run <code className="rounded bg-black/20 px-1">npm run db:migrate</code> to add vendor tables.
            </p>
          )}
        </div>
      )}

      {newVendorKey && (
        <div className="max-w-xl">
          <AccessKeyReveal
            accessKey={newVendorKey}
            title="Vendor portal access key"
            description="Give this key to your approved vendor. They sign in and use the Vendor Portal to issue customer keys within their quota."
            confirmLabel="Done — vendor key saved"
            checkboxLabel="I have copied the vendor access key"
            onConfirm={() => setNewVendorKey(null)}
          />
        </div>
      )}

      {generatedCustomerKey && (
        <div className="max-w-xl">
          <AccessKeyReveal
            accessKey={generatedCustomerKey}
            title="Customer access key"
            description="Send this key to the customer. It is attributed to the selected vendor."
            confirmLabel="Done — customer key saved"
            checkboxLabel="I have copied the customer access key"
            onConfirm={() => setGeneratedCustomerKey(null)}
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className={cn(ui.card, ui.cardPad)}>
          <p className={ui.overline}>Approved vendors</p>
          <p className="font-display mt-2 text-2xl font-bold">{vendors.length}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{totals.enabled} enabled</p>
        </div>
        <div className={cn(ui.card, ui.cardPad)}>
          <p className={ui.overline}>Keys via vendors</p>
          <p className="font-display mt-2 text-2xl font-bold">{totals.issued}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Total issued by vendors</p>
        </div>
        <div className={cn(ui.card, ui.cardPad)}>
          <p className={ui.overline}>Vendor customers</p>
          <p className="font-display mt-2 text-2xl font-bold">{totals.customers}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Active attributed accounts</p>
        </div>
      </div>

      <div className={cn(ui.card, "overflow-hidden")}>
        <div className={cn(ui.cardPad, "space-y-4 border-b border-[var(--border)]")}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-[var(--protocol)]" />
                <h2 className={ui.sectionTitle}>Approved vendors</h2>
              </div>
              <p className={ui.sectionSub}>
                Create vendor partners, set key quotas, and track customer keys they issue.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreate((open) => !open)}
              className={ui.btnPrimary}
            >
              <Plus className="h-4 w-4" />
              Add vendor
            </button>
          </div>

          {showCreate && (
            <div className={cn(ui.cardInner, "space-y-4 p-4")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={ui.label} htmlFor="vendor_name">
                    Vendor name
                  </label>
                  <input
                    id="vendor_name"
                    value={createDraft.name}
                    onChange={(e) => setCreateDraft((d) => ({ ...d, name: e.target.value }))}
                    className={cn(ui.input, "mt-1.5")}
                    placeholder="e.g. Apex Performance"
                  />
                </div>
                <div>
                  <label className={ui.label} htmlFor="vendor_contact">
                    Contact URL
                  </label>
                  <input
                    id="vendor_contact"
                    value={createDraft.contact_url}
                    onChange={(e) => setCreateDraft((d) => ({ ...d, contact_url: e.target.value }))}
                    className={cn(ui.input, "mt-1.5")}
                    placeholder="https://…"
                  />
                </div>
              </div>
              <div className="max-w-[12rem]">
                <label className={ui.label} htmlFor="vendor_quota">
                  Key quota
                </label>
                <input
                  id="vendor_quota"
                  type="number"
                  min={0}
                  max={10000}
                  value={createDraft.key_quota}
                  onChange={(e) =>
                    setCreateDraft((d) => ({ ...d, key_quota: Number(e.target.value) }))
                  }
                  className={cn(ui.input, "mt-1.5")}
                />
                <p className={`${ui.sectionSub} mt-1.5`}>0 = unlimited keys</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void createVendor()}
                  disabled={creating || !createDraft.name.trim()}
                  className={ui.btnPrimary}
                >
                  {creating ? "Creating…" : "Create vendor & generate login key"}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className={ui.btnSecondary}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="divide-y divide-[var(--border)]/60">
          {vendors.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-[var(--muted)]">
              No vendors yet. Add your first approved partner above.
            </p>
          ) : (
            vendors.map((vendor) => {
              const expanded = expandedId === vendor.id;
              const customers = customersByVendor[vendor.id] ?? [];
              const busy = busyVendorId === vendor.id;
              const quotaLabel =
                vendor.key_quota > 0
                  ? `${vendor.keys_issued}/${vendor.key_quota}`
                  : `${vendor.keys_issued} · ∞`;

              return (
                <div key={vendor.id}>
                  <div className="flex flex-wrap items-center gap-3 px-4 py-4">
                    <button
                      type="button"
                      onClick={() => void toggleExpanded(vendor.id)}
                      className="flex min-w-0 flex-1 items-start gap-3 text-left"
                    >
                      <div className="mt-0.5 text-[var(--muted)]">
                        {expanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{vendor.name}</p>
                          {!vendor.enabled && (
                            <span className="rounded-full bg-[var(--warning)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--warning)]">
                              Disabled
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--muted)]">
                          {vendor.active_customers} customers · {quotaLabel} keys · login ···
                          {vendor.profile_fingerprint?.slice(-4) ?? "????"}
                        </p>
                        {vendor.contact_url && (
                          <a
                            href={vendor.contact_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--labs)] hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Contact
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void generateCustomerKey(vendor.id)}
                        disabled={busy || !vendor.enabled || Boolean(generatedCustomerKey)}
                        className={cn(ui.btnSecondary, "text-xs")}
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                        Issue key
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteVendor(vendor)}
                        disabled={busy}
                        className={cn(ui.btnGhost, "text-xs text-[var(--danger)]")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div className={cn(ui.cardInner, "mx-4 mb-4 space-y-4 p-4")}>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className={ui.label}>Vendor name</label>
                          <input
                            defaultValue={vendor.name}
                            onBlur={(e) => {
                              const next = e.target.value.trim();
                              if (next && next !== vendor.name) {
                                void patchVendor(vendor.id, { name: next });
                              }
                            }}
                            className={cn(ui.input, "mt-1.5")}
                          />
                        </div>
                        <div>
                          <label className={ui.label}>Contact URL</label>
                          <input
                            defaultValue={vendor.contact_url}
                            onBlur={(e) => {
                              if (e.target.value !== vendor.contact_url) {
                                void patchVendor(vendor.id, { contact_url: e.target.value });
                              }
                            }}
                            className={cn(ui.input, "mt-1.5")}
                          />
                        </div>
                      </div>
                      <div className="max-w-[12rem]">
                        <label className={ui.label}>Key quota</label>
                        <input
                          type="number"
                          min={0}
                          max={10000}
                          defaultValue={vendor.key_quota}
                          onBlur={(e) => {
                            const next = Number(e.target.value);
                            if (Number.isFinite(next) && next !== vendor.key_quota) {
                              void patchVendor(vendor.id, { key_quota: next });
                            }
                          }}
                          className={cn(ui.input, "mt-1.5")}
                        />
                      </div>
                      <AdminToggleRow
                        label="Vendor enabled"
                        description="Disabled vendors cannot sign in to issue keys"
                        checked={vendor.enabled}
                        onChange={(enabled) => void patchVendor(vendor.id, { enabled })}
                      />

                      <div>
                        <p className={ui.label}>Customers issued</p>
                        {customersLoadingId === vendor.id ? (
                          <p className="mt-2 text-sm text-[var(--muted)]">Loading customers…</p>
                        ) : customers.length === 0 ? (
                          <p className="mt-2 text-sm text-[var(--muted)]">No customers yet.</p>
                        ) : (
                          <ul className="mt-2 space-y-2">
                            {customers.map((customer) => (
                              <li
                                key={customer.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2 text-sm"
                              >
                                <span>
                                  {customer.display_name ??
                                    (customer.username ? `@${customer.username}` : "Awaiting username")}
                                </span>
                                <span className="font-mono text-xs text-[var(--muted)]">
                                  ···{customer.key_fingerprint?.slice(-4)} ·{" "}
                                  {new Date(customer.created_at).toLocaleDateString()}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}