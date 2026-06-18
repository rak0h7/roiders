import { isAdminFingerprint } from "@/lib/adminFingerprint";
import { resolveProfileGate } from "@/lib/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchSiteSettings, type SiteSettings } from "@/lib/siteSettings";

/** Supabase free-tier reference limits (for capacity UI). */
export const SUPABASE_FREE_DB_BYTES = 500 * 1024 * 1024;
export const SUPABASE_FREE_EGRESS_GB = 5;
export const RECOMMENDED_MAX_ACCOUNTS = 50;

export type SignupDay = { date: string; label: string; count: number };
export type ActivityDay = { date: string; label: string; syncs: number };
export type StorageByModule = { module: string; bytes: number; users: number };
export type TopStorageUser = {
  id: string;
  label: string;
  bytes: number;
  modules: number;
  last_sync_at: string | null;
};

export type AdminStats = {
  totalAccounts: number;
  adminAccounts: number;
  syncedModules: number;
  accountsLast7Days: number;
  accountsLast30Days: number;
  moduleBreakdown: Record<string, number>;
  maxAccounts: number;
  accountsRemaining: number | null;
  accountUtilizationPct: number | null;
  allowPublicSignup: boolean;
  cloudSyncEnabled: boolean;
  maintenanceMode: boolean;
  totalStorageBytes: number;
  estimatedDbUsagePct: number;
  usersWithSync: number;
  usersWithoutSync: number;
  activeSyncUsers7d: number;
  pendingUsernames: number;
  signupsByDay: SignupDay[];
  syncActivityByDay: ActivityDay[];
  storageByModule: StorageByModule[];
  topStorageUsers: TopStorageUser[];
  userStorageBytes: Record<string, number>;
  recentSignups: { id: string; label: string; created_at: string; has_sync: boolean; bytes: number }[];
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function computeAccountsRemaining(maxAccounts: number, total: number): number | null {
  if (maxAccounts <= 0) return null;
  return Math.max(0, maxAccounts - total);
}

export function computeAccountUtilizationPct(maxAccounts: number, total: number): number | null {
  if (maxAccounts <= 0) return null;
  return Math.min(100, Math.round((total / maxAccounts) * 100));
}

export function computeDbUsagePct(totalBytes: number, limitBytes = SUPABASE_FREE_DB_BYTES): number {
  return Math.min(100, Math.round((totalBytes / limitBytes) * 100));
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shortDayLabel(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function buildSignupsByDay(
  createdAts: string[],
  days = 30,
  now = Date.now()
): SignupDay[] {
  const start = now - days * 86_400_000;
  const buckets = new Map<string, number>();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000);
    buckets.set(dayKey(d), 0);
  }

  for (const raw of createdAts) {
    const t = new Date(raw).getTime();
    if (t < start) continue;
    const key = dayKey(new Date(raw));
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return [...buckets.entries()].map(([date, count]) => ({
    date,
    label: shortDayLabel(date),
    count,
  }));
}

export function buildSyncActivityByDay(
  updatedAts: string[],
  days = 30,
  now = Date.now()
): ActivityDay[] {
  const start = now - days * 86_400_000;
  const buckets = new Map<string, number>();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000);
    buckets.set(dayKey(d), 0);
  }

  for (const raw of updatedAts) {
    const t = new Date(raw).getTime();
    if (t < start) continue;
    const key = dayKey(new Date(raw));
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return [...buckets.entries()].map(([date, syncs]) => ({
    date,
    label: shortDayLabel(date),
    syncs,
  }));
}

function accountLabel(row: Record<string, unknown>): string {
  const profile = resolveProfileGate(row);
  if (profile.display_name) return profile.display_name;
  if (profile.username) return `@${profile.username}`;
  return `···${(profile.key_fingerprint ?? "").slice(-4) || String(row.id).slice(0, 8)}`;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const admin = createAdminClient();
  const siteSettings = await fetchSiteSettings();

  let profilesRes = await admin
    .from("profiles")
    .select("id, username, display_name, is_admin, key_fingerprint, created_at, updated_at", {
      count: "exact",
    });

  if (profilesRes.error?.message?.includes("does not exist")) {
    profilesRes = await admin
      .from("profiles")
      .select("id, display_name, key_fingerprint, created_at, updated_at", { count: "exact" });
  }

  const modulesRes = await admin
    .from("user_modules")
    .select("user_id, module, data, updated_at", { count: "exact" });

  if (profilesRes.error) throw profilesRes.error;
  if (modulesRes.error) throw modulesRes.error;

  const profileRows = (profilesRes.data ?? []) as Record<string, unknown>[];
  const modules = modulesRes.data ?? [];
  const totalAccounts = profilesRes.count ?? profileRows.length;
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 86_400_000;
  const thirtyDaysAgo = now - 30 * 86_400_000;

  const adminAccounts = profileRows.filter(
    (p) => Boolean(p.is_admin) || isAdminFingerprint(p.key_fingerprint as string | null)
  ).length;

  const accountsLast7Days = profileRows.filter(
    (p) => new Date(p.created_at as string).getTime() >= sevenDaysAgo
  ).length;

  const accountsLast30Days = profileRows.filter(
    (p) => new Date(p.created_at as string).getTime() >= thirtyDaysAgo
  ).length;

  const moduleBreakdown = modules.reduce<Record<string, number>>((acc, row) => {
    acc[row.module] = (acc[row.module] ?? 0) + 1;
    return acc;
  }, {});

  const bytesByUser = new Map<string, { bytes: number; modules: number; last_sync_at: string | null }>();
  const storageByModuleMap = new Map<string, { bytes: number; users: Set<string> }>();
  let totalStorageBytes = 0;
  const moduleUpdatedAts: string[] = [];
  let activeSyncUsers7d = 0;
  const activeUserIds7d = new Set<string>();

  for (const row of modules) {
    const serialized = JSON.stringify(row.data ?? {});
    const size = serialized.length;
    totalStorageBytes += size;
    moduleUpdatedAts.push(row.updated_at as string);

    const uid = row.user_id as string;
    const existing = bytesByUser.get(uid) ?? { bytes: 0, modules: 0, last_sync_at: null };
    existing.bytes += size;
    existing.modules += 1;
    const updated = row.updated_at as string;
    if (!existing.last_sync_at || new Date(updated) > new Date(existing.last_sync_at)) {
      existing.last_sync_at = updated;
    }
    bytesByUser.set(uid, existing);

    const mod = row.module as string;
    const modEntry = storageByModuleMap.get(mod) ?? { bytes: 0, users: new Set<string>() };
    modEntry.bytes += size;
    modEntry.users.add(uid);
    storageByModuleMap.set(mod, modEntry);

    if (new Date(updated).getTime() >= sevenDaysAgo) {
      activeUserIds7d.add(uid);
    }
  }

  activeSyncUsers7d = activeUserIds7d.size;
  const usersWithSync = bytesByUser.size;
  const usersWithoutSync = Math.max(0, totalAccounts - usersWithSync);

  const pendingUsernames = profileRows.filter((p) => {
    const profile = resolveProfileGate(p);
    return !profile.is_admin && !profile.username;
  }).length;

  const userStorageBytes = Object.fromEntries(
    [...bytesByUser.entries()].map(([id, meta]) => [id, meta.bytes])
  );

  const topStorageUsers: TopStorageUser[] = [...bytesByUser.entries()]
    .map(([id, meta]) => {
      const row = profileRows.find((p) => p.id === id);
      return {
        id,
        label: row ? accountLabel(row) : id.slice(0, 8),
        bytes: meta.bytes,
        modules: meta.modules,
        last_sync_at: meta.last_sync_at,
      };
    })
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 8);

  const recentSignups = [...profileRows]
    .sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime())
    .slice(0, 8)
    .map((row) => {
      const id = row.id as string;
      const meta = bytesByUser.get(id);
      return {
        id,
        label: accountLabel(row),
        created_at: row.created_at as string,
        has_sync: Boolean(meta),
        bytes: meta?.bytes ?? 0,
      };
    });

  const storageByModule: StorageByModule[] = [...storageByModuleMap.entries()]
    .map(([module, meta]) => ({
      module,
      bytes: meta.bytes,
      users: meta.users.size,
    }))
    .sort((a, b) => b.bytes - a.bytes);

  const maxAccounts = siteSettings.max_accounts;
  const accountsRemaining = computeAccountsRemaining(maxAccounts, totalAccounts);
  const accountUtilizationPct = computeAccountUtilizationPct(maxAccounts, totalAccounts);

  return {
    totalAccounts,
    adminAccounts,
    syncedModules: modulesRes.count ?? modules.length,
    accountsLast7Days,
    accountsLast30Days,
    moduleBreakdown,
    maxAccounts,
    accountsRemaining,
    accountUtilizationPct,
    allowPublicSignup: siteSettings.allow_public_signup,
    cloudSyncEnabled: siteSettings.cloud_sync_enabled,
    maintenanceMode: siteSettings.maintenance_mode,
    totalStorageBytes,
    estimatedDbUsagePct: computeDbUsagePct(totalStorageBytes),
    usersWithSync,
    usersWithoutSync,
    activeSyncUsers7d,
    pendingUsernames,
    signupsByDay: buildSignupsByDay(profileRows.map((p) => p.created_at as string)),
    syncActivityByDay: buildSyncActivityByDay(moduleUpdatedAts),
    storageByModule,
    topStorageUsers,
    userStorageBytes,
    recentSignups,
  };
}

export function recommendedAccessDefaults(): Pick<
  SiteSettings,
  "allow_public_signup" | "max_accounts"
> {
  return {
    allow_public_signup: false,
    max_accounts: RECOMMENDED_MAX_ACCOUNTS,
  };
}