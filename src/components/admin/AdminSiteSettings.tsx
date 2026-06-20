"use client";

import { useEffect, useState } from "react";
import {
  Blocks,
  BookOpen,
  Cloud,
  FlaskConical,
  Globe,
  LayoutGrid,
  Link2,
  Megaphone,
  MessageSquare,
  Save,
  Settings2,
  Shield,
  Sparkles,
  Store,
} from "lucide-react";
import { AdminToggleRow } from "@/components/admin/AdminToggleRow";
import { useSiteConfig } from "@/context/SiteConfigContext";
import type { AnnouncementLevel, SiteSettings } from "@/lib/siteSettings";
import { RECOMMENDED_MAX_ACCOUNTS, recommendedAccessDefaults } from "@/lib/adminStats";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type Props = { onSaved?: () => void };

type SettingsTab =
  | "general"
  | "access"
  | "modules"
  | "premium"
  | "messaging"
  | "announcements"
  | "platform";

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: "general", label: "General", icon: <Settings2 className="h-4 w-4" /> },
  { id: "access", label: "Access", icon: <Shield className="h-4 w-4" /> },
  { id: "modules", label: "Modules", icon: <LayoutGrid className="h-4 w-4" /> },
  { id: "premium", label: "Premium", icon: <Sparkles className="h-4 w-4" /> },
  { id: "messaging", label: "Messaging", icon: <MessageSquare className="h-4 w-4" /> },
  { id: "announcements", label: "Announcements", icon: <Megaphone className="h-4 w-4" /> },
  { id: "platform", label: "Platform", icon: <Cloud className="h-4 w-4" /> },
];

const ANNOUNCEMENT_LEVELS: { id: AnnouncementLevel; label: string }[] = [
  { id: "info", label: "Info" },
  { id: "warning", label: "Warning" },
  { id: "danger", label: "Alert" },
];

function SectionHeader({
  icon,
  title,
  description,
  accent = "labs",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: "labs" | "warning" | "intel" | "protocol";
}) {
  const accentClass = {
    labs: "border-[var(--labs)]/30 bg-[var(--labs-dim)] text-[var(--labs)]",
    warning: "border-[var(--warning)]/30 bg-[var(--warning)]/10 text-[var(--warning)]",
    intel: "border-[var(--intel)]/30 bg-[var(--intel-dim)] text-[var(--intel)]",
    protocol: "border-[var(--protocol)]/30 bg-[var(--protocol-dim)] text-[var(--protocol)]",
  }[accent];

  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border",
          accentClass
        )}
      >
        {icon}
      </div>
      <div>
        <h2 className={ui.sectionTitle}>{title}</h2>
        <p className={ui.sectionSub}>{description}</p>
      </div>
    </div>
  );
}

export function AdminSiteSettings({ onSaved }: Props) {
  const { refresh: refreshSiteConfig } = useSiteConfig();
  const [tab, setTab] = useState<SettingsTab>("general");
  const [draft, setDraft] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      try {
        const res = await fetch("/api/admin/settings", { credentials: "same-origin" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load settings");
        if (!cancelled) setDraft(data.settings);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const patch = (next: Partial<SiteSettings>) => {
    if (!draft) return;
    setDraft({ ...draft, ...next });
    setSaved(false);
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save settings");
      setDraft(data.settings);
      setSaved(true);
      await refreshSiteConfig();
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !draft) {
    return (
      <div className={cn(ui.card, ui.cardPad)}>
        <p className="text-sm text-[var(--muted)]">Loading site settings…</p>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className={cn(ui.card, ui.cardPad)}>
        <p className="text-sm text-[var(--danger)]">{error ?? "Settings unavailable"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-[var(--radius-md)] border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
          {error.includes("site_settings") && (
            <p className="mt-2 text-xs">
              Run <code className="rounded bg-black/20 px-1">npm run db:migrate</code> or paste{" "}
              <code className="rounded bg-black/20 px-1">supabase/migrate-pending.sql</code> in the Supabase SQL Editor.
            </p>
          )}
        </div>
      )}

      <div className={cn(ui.card, "overflow-hidden")}>
        <div className="flex flex-wrap gap-1 border-b border-[var(--border)] p-2">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-xs font-medium transition",
                tab === item.id
                  ? "bg-[var(--labs-dim)] text-[var(--labs)]"
                  : "text-[var(--muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--foreground)]"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className={cn(ui.cardPad, "space-y-5")}>
          {tab === "general" && (
            <>
              <SectionHeader
                icon={<Settings2 className="h-5 w-5" />}
                title="Site identity"
                description="Branding shown across auth pages and the app shell."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={ui.label} htmlFor="site_name">
                    Site name
                  </label>
                  <input
                    id="site_name"
                    value={draft.site_name}
                    onChange={(e) => patch({ site_name: e.target.value })}
                    className={cn(ui.input, "mt-1.5")}
                    maxLength={60}
                  />
                </div>
                <div>
                  <label className={ui.label} htmlFor="site_tagline">
                    Tagline
                  </label>
                  <input
                    id="site_tagline"
                    value={draft.site_tagline}
                    onChange={(e) => patch({ site_tagline: e.target.value })}
                    className={cn(ui.input, "mt-1.5")}
                    maxLength={120}
                  />
                </div>
              </div>
              <div>
                <label className={ui.label} htmlFor="site_description">
                  Public description
                </label>
                <textarea
                  id="site_description"
                  value={draft.site_description}
                  onChange={(e) => patch({ site_description: e.target.value })}
                  rows={2}
                  maxLength={200}
                  placeholder="Shown on the public landing page when set."
                  className={cn(ui.input, "mt-1.5 min-h-[4rem] resize-y py-2.5 leading-relaxed")}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={ui.label} htmlFor="support_url">
                    Support / premium request URL
                  </label>
                  <input
                    id="support_url"
                    type="url"
                    value={draft.support_url}
                    onChange={(e) => patch({ support_url: e.target.value })}
                    placeholder="https://... or mailto:..."
                    className={cn(ui.input, "mt-1.5")}
                  />
                </div>
                <div>
                  <label className={ui.label} htmlFor="legal_contact_email">
                    Legal contact email
                  </label>
                  <input
                    id="legal_contact_email"
                    type="email"
                    value={draft.legal_contact_email}
                    onChange={(e) => patch({ legal_contact_email: e.target.value })}
                    placeholder="privacy@example.com"
                    className={cn(ui.input, "mt-1.5")}
                  />
                </div>
              </div>
              <p className={ui.sectionSub}>
                Support URL is used for premium requests, maintenance contact, and footer links. Legal email appears on Privacy and Terms pages.
              </p>
              <AdminToggleRow
                label="Public marketing landing"
                description="When off, visitors at / are sent straight to login instead of the marketing page. Keep enabled for SEO — disabling hides the homepage from Google."
                checked={draft.public_landing_enabled}
                onChange={(public_landing_enabled) => patch({ public_landing_enabled })}
              />
            </>
          )}

          {tab === "access" && (
            <>
              <SectionHeader
                icon={<Shield className="h-5 w-5" />}
                title="Access control"
                description="Who can register and use the site."
                accent="warning"
              />
              <div className={cn(ui.cardInner, "flex flex-wrap items-center justify-between gap-3 p-3")}>
                <div>
                  <p className="text-sm font-medium">Sell-access preset</p>
                  <p className="text-xs text-[var(--muted)]">
                    Disable public signup and cap at {RECOMMENDED_MAX_ACCOUNTS} accounts — you issue keys manually.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => patch(recommendedAccessDefaults())}
                  className={cn(ui.btnSecondary, "text-xs")}
                >
                  Apply preset
                </button>
              </div>
              <AdminToggleRow
                label="Public signup"
                description="Allow visitors to generate their own access key at /auth/signup"
                checked={draft.allow_public_signup}
                onChange={(allow_public_signup) => patch({ allow_public_signup })}
              />
              <AdminToggleRow
                label="Maintenance mode"
                description="Block non-admin users; admins can still sign in"
                checked={draft.maintenance_mode}
                onChange={(maintenance_mode) => patch({ maintenance_mode })}
              />
              {draft.maintenance_mode && (
                <div>
                  <label className={ui.label} htmlFor="maintenance_message">
                    Maintenance message
                  </label>
                  <textarea
                    id="maintenance_message"
                    value={draft.maintenance_message}
                    onChange={(e) => patch({ maintenance_message: e.target.value })}
                    rows={3}
                    maxLength={500}
                    className={cn(ui.input, "mt-1.5 min-h-[5rem] resize-y py-2.5 leading-relaxed")}
                  />
                </div>
              )}
              {!draft.allow_public_signup && (
                <div>
                  <label className={ui.label} htmlFor="signup_closed_message">
                    Signup closed message
                  </label>
                  <textarea
                    id="signup_closed_message"
                    value={draft.signup_closed_message}
                    onChange={(e) => patch({ signup_closed_message: e.target.value })}
                    rows={2}
                    maxLength={300}
                    placeholder="Public signup is disabled. Contact the site owner for an access key."
                    className={cn(ui.input, "mt-1.5 min-h-[4rem] resize-y py-2.5 leading-relaxed")}
                  />
                </div>
              )}
              <div>
                <label className={ui.label} htmlFor="max_accounts">
                  Maximum accounts
                </label>
                <input
                  id="max_accounts"
                  type="number"
                  min={0}
                  max={10000}
                  value={draft.max_accounts}
                  onChange={(e) => patch({ max_accounts: Number(e.target.value) })}
                  className={cn(ui.input, "mt-1.5 max-w-[10rem]")}
                />
                <p className={`${ui.sectionSub} mt-1.5`}>
                  0 = unlimited. Recommended: {RECOMMENDED_MAX_ACCOUNTS} for free-tier hosting. Applies to admin-generated and public signups.
                </p>
              </div>
            </>
          )}

          {tab === "modules" && (
            <>
              <SectionHeader
                icon={<LayoutGrid className="h-5 w-5" />}
                title="Feature modules"
                description="Hide entire sections from navigation for all non-admin users."
                accent="protocol"
              />
              {[
                {
                  key: "module_labs_enabled" as const,
                  label: "Labs",
                  description: "Bloodwork log, archive, and analysis",
                  icon: <FlaskConical className="h-4 w-4" />,
                },
                {
                  key: "module_cycle_enabled" as const,
                  label: "Gear",
                  description: "Cycle builder, guides, and simulation",
                  icon: <Blocks className="h-4 w-4" />,
                },
                {
                  key: "module_gym_enabled" as const,
                  label: "Training",
                  description: "Workouts, programs, history, and progress",
                  icon: <LayoutGrid className="h-4 w-4" />,
                },
                {
                  key: "module_articles_enabled" as const,
                  label: "Articles",
                  description: "Public reference library at /articles",
                  icon: <BookOpen className="h-4 w-4" />,
                },
              ].map((mod) => (
                <AdminToggleRow
                  key={mod.key}
                  label={mod.label}
                  description={mod.description}
                  checked={draft[mod.key]}
                  onChange={(checked) => patch({ [mod.key]: checked })}
                />
              ))}
            </>
          )}

          {tab === "premium" && (
            <>
              <SectionHeader
                icon={<Sparkles className="h-5 w-5" />}
                title="Premium features"
                description="Gated capabilities beyond the free local-only tier."
                accent="protocol"
              />
              <AdminToggleRow
                label="Cloud sync platform"
                description="Master switch — also in Platform tab. Per-user access is granted in Accounts → Premium."
                checked={draft.cloud_sync_enabled}
                onChange={(cloud_sync_enabled) => patch({ cloud_sync_enabled })}
              />
              <AdminToggleRow
                label="Cycle sources directory"
                description="Verified supplier contacts in Gear → Sources. Requires per-user premium in Accounts."
                checked={draft.premium_sources_enabled}
                onChange={(premium_sources_enabled) => patch({ premium_sources_enabled })}
              />
              <AdminToggleRow
                label="Vendor partner portal"
                description="Approved vendors can issue customer keys from /admin when signed in as a vendor"
                checked={draft.vendor_portal_enabled}
                onChange={(vendor_portal_enabled) => patch({ vendor_portal_enabled })}
              />
              <div className={cn(ui.cardInner, "flex items-start gap-3 p-3 text-xs text-[var(--muted)]")}>
                <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--protocol)]" />
                <p>
                  Premium is granted per account in <strong className="text-[var(--foreground)]">Accounts → Premium</strong>.
                  Site admins created before the premium column may already have sync enabled automatically.
                </p>
              </div>
            </>
          )}

          {tab === "messaging" && (
            <>
              <SectionHeader
                icon={<MessageSquare className="h-5 w-5" />}
                title="Auth & onboarding copy"
                description="Custom subtitles on login, signup, and username setup pages."
                accent="intel"
              />
              {[
                { id: "login_message" as const, label: "Login page", placeholder: DEFAULT_LOGIN },
                { id: "signup_message" as const, label: "Signup page", placeholder: DEFAULT_SIGNUP },
                { id: "welcome_message" as const, label: "Welcome / username page", placeholder: DEFAULT_WELCOME },
              ].map((field) => (
                <div key={field.id}>
                  <label className={ui.label} htmlFor={field.id}>
                    {field.label}
                  </label>
                  <textarea
                    id={field.id}
                    value={draft[field.id]}
                    onChange={(e) => patch({ [field.id]: e.target.value })}
                    rows={2}
                    maxLength={300}
                    placeholder={field.placeholder}
                    className={cn(ui.input, "mt-1.5 min-h-[4rem] resize-y py-2.5 leading-relaxed")}
                  />
                </div>
              ))}
            </>
          )}

          {tab === "announcements" && (
            <>
              <SectionHeader
                icon={<Megaphone className="h-5 w-5" />}
                title="Announcement banner"
                description="Top-of-app message for all signed-in users."
                accent="intel"
              />
              <AdminToggleRow
                label="Show banner"
                description="Display the announcement below the top bar for signed-in users"
                checked={draft.announcement_enabled}
                onChange={(announcement_enabled) => patch({ announcement_enabled })}
              />
              <AdminToggleRow
                label="Show to guests"
                description="Also show the banner on the public landing page (unsigned visitors)"
                checked={draft.announcement_guest_visible}
                onChange={(announcement_guest_visible) => patch({ announcement_guest_visible })}
              />
              {draft.announcement_enabled && (
                <>
                  <div>
                    <p className={cn(ui.overline, "mb-2")}>Severity</p>
                    <div className="flex flex-wrap gap-2">
                      {ANNOUNCEMENT_LEVELS.map((level) => (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => patch({ announcement_level: level.id })}
                          className={cn(
                            "rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs font-medium transition",
                            draft.announcement_level === level.id
                              ? "border-[var(--intel)]/40 bg-[var(--intel-dim)] text-[var(--intel)]"
                              : "border-[var(--border)] text-[var(--muted)]"
                          )}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={ui.label} htmlFor="announcement_message">
                      Message
                    </label>
                    <textarea
                      id="announcement_message"
                      value={draft.announcement_message}
                      onChange={(e) => patch({ announcement_message: e.target.value })}
                      rows={2}
                      maxLength={500}
                      className={cn(ui.input, "mt-1.5 min-h-[4rem] resize-y py-2.5 leading-relaxed")}
                    />
                  </div>
                  <div>
                    <label className={ui.label} htmlFor="announcement_link">
                      Optional link
                    </label>
                    <input
                      id="announcement_link"
                      type="url"
                      value={draft.announcement_link}
                      onChange={(e) => patch({ announcement_link: e.target.value })}
                      placeholder="https://..."
                      className={cn(ui.input, "mt-1.5")}
                    />
                  </div>
                </>
              )}
            </>
          )}

          {tab === "platform" && (
            <>
              <SectionHeader
                icon={<Cloud className="h-5 w-5" />}
                title="Platform behavior"
                description="Global toggles that affect every signed-in user."
              />
              <AdminToggleRow
                label="Cloud sync platform"
                description="Master switch for cloud sync. Per-user premium access is granted in Accounts → Premium column."
                checked={draft.cloud_sync_enabled}
                onChange={(cloud_sync_enabled) => patch({ cloud_sync_enabled })}
              />
              <AdminToggleRow
                label="Debug panel"
                description="Allow the debug panel in the command palette (developer tooling)"
                checked={draft.debug_panel_enabled}
                onChange={(debug_panel_enabled) => patch({ debug_panel_enabled })}
              />
              <div className={cn(ui.cardInner, "grid gap-3 p-3 sm:grid-cols-2")}>
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <Globe className="h-4 w-4 shrink-0 text-[var(--labs)]" />
                  <span>
                    Landing:{" "}
                    <strong className="text-[var(--foreground)]">
                      {draft.public_landing_enabled ? "Public" : "Login only"}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <Store className="h-4 w-4 shrink-0 text-[var(--protocol)]" />
                  <span>
                    Vendors:{" "}
                    <strong className="text-[var(--foreground)]">
                      {draft.vendor_portal_enabled ? "Enabled" : "Disabled"}
                    </strong>
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[var(--muted)]">
          Last updated {new Date(draft.updated_at).toLocaleString()}
          {saved && <span className="ml-2 text-[var(--success)]">Saved</span>}
        </p>
        <button type="button" onClick={() => void save()} disabled={saving} className={ui.btnPrimary}>
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
}

const DEFAULT_LOGIN = "Enter your private access key. No email required.";
const DEFAULT_SIGNUP = "Create your free account. Save your access key — it cannot be recovered.";
const DEFAULT_WELCOME = "Pick a username to finish setting up your account.";