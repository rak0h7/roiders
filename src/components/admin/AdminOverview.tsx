"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Cloud,
  Database,
  HardDrive,
  KeyRound,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import type { AdminStats } from "@/lib/adminStats";
import {
  formatBytes,
  RECOMMENDED_MAX_ACCOUNTS,
  SUPABASE_FREE_DB_BYTES,
  SUPABASE_FREE_EGRESS_GB,
} from "@/lib/adminStats";
import { getChartTheme } from "@/lib/charts";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

type AdminOverviewProps = {
  stats: AdminStats;
  onOpenAccounts?: () => void;
  onOpenSettings?: () => void;
  onSelectUser?: (userId: string) => void;
};

const MODULE_COLORS: Record<string, string> = {
  labs: "var(--labs)",
  cycle: "var(--protocol)",
  gym: "var(--protocol)",
  nutrition: "var(--intel)",
  settings: "var(--muted)",
};

function UsageMeter({
  label,
  value,
  max,
  pct,
  hint,
  tone = "labs",
}: {
  label: string;
  value: string;
  max: string;
  pct: number | null;
  hint?: string;
  tone?: "labs" | "warning" | "intel";
}) {
  const barTone = {
    labs: "bg-[var(--labs)]",
    warning: "bg-[var(--warning)]",
    intel: "bg-[var(--intel)]",
  }[tone];

  const displayPct = pct ?? 0;
  const warn = displayPct >= 85;
  const caution = displayPct >= 65;

  return (
    <div className={cn(ui.cardInner, "p-4")}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={ui.overline}>{label}</p>
          <p className="mt-1 font-display text-lg font-semibold">
            {value}
            <span className="text-sm font-normal text-[var(--muted)]"> / {max}</span>
          </p>
        </div>
        {pct != null && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-semibold",
              warn
                ? "bg-[var(--danger)]/15 text-[var(--danger)]"
                : caution
                  ? "bg-[var(--warning)]/15 text-[var(--warning)]"
                  : "bg-[var(--success)]/15 text-[var(--success)]"
            )}
          >
            {displayPct}%
          </span>
        )}
      </div>
      {pct != null && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
          <div
            className={cn("h-full rounded-full transition-all", barTone)}
            style={{ width: `${Math.min(100, displayPct)}%` }}
          />
        </div>
      )}
      {hint && <p className="mt-2 text-[11px] leading-relaxed text-[var(--muted)]">{hint}</p>}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(ui.card, ui.cardPad)}>
      <h3 className={ui.sectionTitle}>{title}</h3>
      {subtitle && <p className={ui.sectionSub}>{subtitle}</p>}
      <div className="mt-4 h-56 sm:h-64">{children}</div>
    </div>
  );
}

export function AdminOverview({
  stats,
  onOpenAccounts,
  onOpenSettings,
  onSelectUser,
}: AdminOverviewProps) {
  const chartTheme = getChartTheme();
  const [chartRange, setChartRange] = useState<14 | 30>(30);

  const signups = useMemo(
    () => (chartRange === 30 ? stats.signupsByDay : stats.signupsByDay.slice(-14)),
    [stats.signupsByDay, chartRange]
  );

  const syncActivity = useMemo(
    () => (chartRange === 30 ? stats.syncActivityByDay : stats.syncActivityByDay.slice(-14)),
    [stats.syncActivityByDay, chartRange]
  );

  const moduleChartData = useMemo(
    () =>
      Object.entries(stats.moduleBreakdown)
        .map(([module, count]) => ({ module, count }))
        .sort((a, b) => b.count - a.count),
    [stats.moduleBreakdown]
  );

  const storageChartData = useMemo(
    () =>
      stats.storageByModule.map((row) => ({
        module: row.module,
        mb: Math.round((row.bytes / (1024 * 1024)) * 10) / 10,
        users: row.users,
      })),
    [stats.storageByModule]
  );

  const accessMode =
    !stats.allowPublicSignup && stats.maxAccounts === RECOMMENDED_MAX_ACCOUNTS
      ? "Sell-access (recommended)"
      : !stats.allowPublicSignup
        ? "Invite-only"
        : stats.maxAccounts > 0
          ? "Open signup (capped)"
          : "Open signup (unlimited)";

  return (
    <div className="space-y-6">
      {/* Platform status */}
      <div className="flex flex-wrap gap-2">
        {[
          {
            label: accessMode,
            ok: !stats.allowPublicSignup,
            icon: KeyRound,
          },
          {
            label: stats.cloudSyncEnabled ? "Cloud sync on" : "Cloud sync off",
            ok: stats.cloudSyncEnabled,
            icon: Cloud,
          },
          {
            label: stats.maintenanceMode ? "Maintenance mode" : "Site live",
            ok: !stats.maintenanceMode,
            icon: stats.maintenanceMode ? AlertTriangle : TrendingUp,
          },
        ].map((chip) => {
          const Icon = chip.icon;
          return (
            <span
              key={chip.label}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                chip.ok
                  ? "border-[var(--border)] bg-[var(--bg-elevated)]/80 text-[var(--foreground)]"
                  : "border-[var(--warning)]/40 bg-[var(--warning)]/10 text-[var(--warning)]"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {chip.label}
            </span>
          );
        })}
        <button type="button" onClick={onOpenSettings} className={cn(ui.btnGhost, "text-xs")}>
          Edit in settings →
        </button>
      </div>

      {/* KPI row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total accounts", value: stats.totalAccounts, sub: `${stats.accountsLast7Days} this week`, icon: Users },
          { label: "Active sync (7d)", value: stats.activeSyncUsers7d, sub: `${stats.usersWithSync} with cloud data`, icon: Cloud },
          { label: "Cloud rows", value: stats.syncedModules, sub: formatBytes(stats.totalStorageBytes), icon: Database },
          { label: "Pending usernames", value: stats.pendingUsernames, sub: `${stats.usersWithoutSync} never synced`, icon: UserPlus },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <button
              key={kpi.label}
              type="button"
              onClick={onOpenAccounts}
              className={cn(ui.card, ui.cardPad, ui.cardHover, "text-left")}
            >
              <div className="flex items-center justify-between">
                <p className={ui.overline}>{kpi.label}</p>
                <Icon className="h-4 w-4 text-[var(--muted)]" />
              </div>
              <p className="mt-2 font-display text-3xl font-bold">{kpi.value}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{kpi.sub}</p>
            </button>
          );
        })}
      </div>

      {/* Capacity */}
      <div className={cn(ui.card, ui.cardPad)}>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className={ui.sectionTitle}>Hosting capacity</h2>
            <p className={ui.sectionSub}>
              Free-tier estimates for Supabase ({formatBytes(SUPABASE_FREE_DB_BYTES)} DB, {SUPABASE_FREE_EGRESS_GB} GB egress).
              Egress is not measured in-app — watch the Supabase dashboard.
            </p>
          </div>
          <HardDrive className="h-5 w-5 shrink-0 text-[var(--muted)]" />
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          <UsageMeter
            label="Account slots"
            value={String(stats.totalAccounts)}
            max={stats.maxAccounts > 0 ? String(stats.maxAccounts) : "∞"}
            pct={stats.accountUtilizationPct}
            hint={
              stats.accountsRemaining != null
                ? `${stats.accountsRemaining} slots left before new keys are blocked`
                : "Set max accounts in Settings → Access to cap growth"
            }
            tone={stats.accountUtilizationPct != null && stats.accountUtilizationPct >= 85 ? "warning" : "labs"}
          />
          <UsageMeter
            label="Cloud data (DB)"
            value={formatBytes(stats.totalStorageBytes)}
            max="500 MB"
            pct={stats.estimatedDbUsagePct}
            hint="Sum of synced JSON across all user_modules rows"
            tone={stats.estimatedDbUsagePct >= 85 ? "warning" : "intel"}
          />
          <UsageMeter
            label="Egress risk"
            value={`${stats.activeSyncUsers7d} active`}
            max={`~${Math.max(10, Math.round(stats.activeSyncUsers7d * 1.5))} users safe`}
            pct={
              stats.activeSyncUsers7d > 0
                ? Math.min(100, Math.round((stats.activeSyncUsers7d / 40) * 100))
                : 0
            }
            hint="Rough guide: 45s sync while signed in. Fewer concurrent long sessions = more headroom."
            tone={stats.activeSyncUsers7d >= 30 ? "warning" : "labs"}
          />
        </div>
      </div>

      {/* Chart range toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={ui.overline}>Activity (last {chartRange} days)</p>
        <div className="flex rounded-[var(--radius-sm)] border border-[var(--border)] p-0.5 text-[10px]">
          {([14, 30] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setChartRange(n)}
              className={cn(
                "rounded px-2.5 py-1 font-semibold",
                chartRange === n ? "bg-[var(--labs-dim)] text-[var(--labs)]" : "text-[var(--muted)]"
              )}
            >
              {n}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="New accounts" subtitle="Signups per day">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={signups} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: chartTheme.axis, fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fill: chartTheme.axis, fontSize: 10 }} width={28} />
              <Tooltip
                contentStyle={chartTheme.tooltip}
                labelStyle={{ color: chartTheme.axis }}
                formatter={(v) => [v ?? 0, "Signups"]}
              />
              <Bar dataKey="count" fill="var(--labs)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Cloud sync writes" subtitle="Module row updates per day">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={syncActivity} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: chartTheme.axis, fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fill: chartTheme.axis, fontSize: 10 }} width={28} />
              <Tooltip
                contentStyle={chartTheme.tooltip}
                labelStyle={{ color: chartTheme.axis }}
                formatter={(v) => [v ?? 0, "Updates"]}
              />
              <Line
                type="monotone"
                dataKey="syncs"
                stroke="var(--intel)"
                strokeWidth={2}
                dot={{ r: 2, fill: "var(--intel)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Synced modules" subtitle="Rows in user_modules by type">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moduleChartData} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
              <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: chartTheme.axis, fontSize: 10 }} />
              <YAxis type="category" dataKey="module" tick={{ fill: chartTheme.axis, fontSize: 11 }} width={72} />
              <Tooltip contentStyle={chartTheme.tooltip} formatter={(v) => [v ?? 0, "Rows"]} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {moduleChartData.map((entry) => (
                  <Cell key={entry.module} fill={MODULE_COLORS[entry.module] ?? "var(--muted)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Storage by module" subtitle="Megabytes of JSON payload">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={storageChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="module" tick={{ fill: chartTheme.axis, fontSize: 10 }} />
              <YAxis tick={{ fill: chartTheme.axis, fontSize: 10 }} width={36} />
              <Tooltip
                contentStyle={chartTheme.tooltip}
                formatter={(v, _n, props) => {
                  const users = (props?.payload as { users?: number })?.users;
                  return [`${v ?? 0} MB`, users != null ? `${users} users` : "Size"];
                }}
              />
              <Bar dataKey="mb" radius={[4, 4, 0, 0]}>
                {storageChartData.map((entry) => (
                  <Cell key={entry.module} fill={MODULE_COLORS[entry.module] ?? "var(--muted)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Tables */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={cn(ui.card, ui.cardPad)}>
          <h3 className={ui.sectionTitle}>Largest cloud footprints</h3>
          <p className={ui.sectionSub}>Click a row to inspect module data</p>
          <div className="mt-4 space-y-2">
            {stats.topStorageUsers.length === 0 && (
              <p className="text-sm text-[var(--muted)]">No synced data yet.</p>
            )}
            {stats.topStorageUsers.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => onSelectUser?.(row.id)}
                className={cn(
                  ui.cardInner,
                  "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:border-[var(--border-strong)]"
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.label}</p>
                  <p className="text-[10px] text-[var(--muted)]">
                    {row.modules} module{row.modules !== 1 ? "s" : ""}
                    {row.last_sync_at && ` · ${new Date(row.last_sync_at).toLocaleDateString()}`}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs text-[var(--intel)]">{formatBytes(row.bytes)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={cn(ui.card, ui.cardPad)}>
          <h3 className={ui.sectionTitle}>Recent signups</h3>
          <p className={ui.sectionSub}>Newest accounts first</p>
          <div className="mt-4 space-y-2">
            {stats.recentSignups.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => onSelectUser?.(row.id)}
                className={cn(
                  ui.cardInner,
                  "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:border-[var(--border-strong)]"
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.label}</p>
                  <p className="text-[10px] text-[var(--muted)]">
                    {new Date(row.created_at).toLocaleString()}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    row.has_sync
                      ? "bg-[var(--success)]/15 text-[var(--success)]"
                      : "bg-[var(--bg-elevated)] text-[var(--muted)]"
                  )}
                >
                  {row.has_sync ? formatBytes(row.bytes) : "No sync"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}