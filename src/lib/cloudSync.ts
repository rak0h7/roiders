import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_GOALS } from "@/lib/nutritionTypes";

export type CloudModule = "labs" | "cycle" | "gym" | "nutrition" | "settings";

export const LOCAL_STORAGE_KEYS: Record<CloudModule, string> = {
  labs: "roiders-club-labs-v1",
  cycle: "cycle-planner-store-v2",
  gym: "roiders-club-gym-store-v1",
  nutrition: "roiders-club-nutrition-store-v1",
  settings: "roiders-club-settings-v2",
};

const SYNC_META_KEY = "roiders-club-sync-meta";

/** Unknown-age local data (legacy writes) defers to remote when timestamps are compared. */
export const LEGACY_LOCAL_EPOCH = "1970-01-01T00:00:00.000Z";

type SyncMeta = Partial<Record<CloudModule, string>>;

export interface SyncConflict {
  module: CloudModule;
  localUpdatedAt: string;
  remoteUpdatedAt: string;
}

export interface SyncResult {
  pulled: CloudModule[];
  pushed: CloudModule[];
  merged: boolean;
  conflicts: SyncConflict[];
}

export function readLocalModule(module: CloudModule): unknown | null {
  return readLocalModuleRaw(module);
}

export function writeLocalModule(
  module: CloudModule,
  data: unknown,
  updatedAt?: string,
  options?: { touchLocal?: boolean }
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS[module], JSON.stringify(data));
  } catch {
    return;
  }
  if (updatedAt) {
    setLocalUpdatedAt(module, updatedAt);
  } else if (options?.touchLocal !== false) {
    touchLocalModule(module);
  }
}

function readSyncMeta(): SyncMeta {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SYNC_META_KEY);
    return raw ? (JSON.parse(raw) as SyncMeta) : {};
  } catch {
    return {};
  }
}

function writeSyncMeta(meta: SyncMeta): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
  } catch {
    return;
  }
}

function getLocalUpdatedAt(module: CloudModule): string | null {
  return readSyncMeta()[module] ?? null;
}

function setLocalUpdatedAt(module: CloudModule, updatedAt: string): void {
  writeSyncMeta({ ...readSyncMeta(), [module]: updatedAt });
}

function readLocalModuleRaw(module: CloudModule): unknown | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LOCAL_STORAGE_KEYS[module]);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Backfill sync meta for module data written before timestamps existed. */
export function ensureModuleSyncMeta(module: CloudModule): void {
  if (typeof window === "undefined") return;
  if (getLocalUpdatedAt(module)) return;
  const data = readLocalModuleRaw(module);
  if (data == null || isModuleDataEmpty(module, data)) return;
  setLocalUpdatedAt(module, LEGACY_LOCAL_EPOCH);
}

export function touchLocalModule(module: CloudModule, at = new Date().toISOString()): void {
  setLocalUpdatedAt(module, at);
}

function moduleRichness(module: CloudModule, data: unknown): number {
  if (data == null) return 0;
  if (module === "labs" && Array.isArray(data)) return data.length;
  if (typeof data === "object" && "state" in data) {
    const state = (data as { state: Record<string, unknown> }).state;
    if (module === "cycle") return (state.compounds as unknown[])?.length ?? 0;
    if (module === "gym") {
      const history = (state.history as unknown[])?.length ?? 0;
      const routines = (state.routines as unknown[])?.length ?? 0;
      return history + routines;
    }
    if (module === "nutrition") {
      const logs = state.logs as Record<string, unknown[]> | undefined;
      if (!logs) return 0;
      return Object.keys(logs).filter((d) => (logs[d]?.length ?? 0) > 0).length;
    }
  }
  if (module === "settings" && typeof data === "object") {
    return Object.keys(data as object).length;
  }
  return 1;
}

function remoteHasMoreData(module: CloudModule, local: unknown, remote: unknown): boolean {
  return moduleRichness(module, remote) > moduleRichness(module, local);
}

export function shouldPushModule(module: CloudModule, remoteUpdatedAt: string | null): boolean {
  const data = readLocalModule(module);
  if (data == null || isModuleDataEmpty(module, data)) return false;
  ensureModuleSyncMeta(module);
  const localUpdatedAt = getLocalUpdatedAt(module);
  if (!localUpdatedAt) return !remoteUpdatedAt;
  if (!remoteUpdatedAt) return true;
  return new Date(localUpdatedAt).getTime() > new Date(remoteUpdatedAt).getTime();
}

export function shouldTakeRemote(
  module: CloudModule,
  local: unknown,
  remote: unknown,
  remoteUpdatedAt: string
): boolean {
  if (local == null || isModuleDataEmpty(module, local)) return true;
  if (remote == null || isModuleDataEmpty(module, remote)) return false;

  ensureModuleSyncMeta(module);
  const localUpdatedAt = getLocalUpdatedAt(module);
  if (!localUpdatedAt) return true;

  const localTime = new Date(localUpdatedAt).getTime();
  const remoteTime = new Date(remoteUpdatedAt).getTime();
  if (remoteTime > localTime) return true;
  if (localTime > remoteTime) return false;

  return remoteHasMoreData(module, local, remote);
}

function detectConflict(
  module: CloudModule,
  local: unknown,
  remoteUpdatedAt: string
): SyncConflict | null {
  if (local == null || isModuleDataEmpty(module, local)) return null;
  ensureModuleSyncMeta(module);
  const localUpdatedAt = getLocalUpdatedAt(module);
  if (!localUpdatedAt) return null;
  const localTime = new Date(localUpdatedAt).getTime();
  const remoteTime = new Date(remoteUpdatedAt).getTime();
  if (localTime > remoteTime) {
    return { module, localUpdatedAt, remoteUpdatedAt };
  }
  return null;
}

export function summarizeModuleData(module: CloudModule, data: unknown): string {
  if (data == null) return "Empty";
  if (module === "labs" && Array.isArray(data)) {
    return `${data.length} report${data.length === 1 ? "" : "s"}`;
  }
  if (typeof data === "object" && data && "state" in data) {
    const state = (data as { state: Record<string, unknown> }).state;
    if (module === "cycle") {
      const count = (state.compounds as unknown[])?.length ?? 0;
      return `${count} compound${count === 1 ? "" : "s"}`;
    }
    if (module === "gym") {
      const history = (state.history as unknown[])?.length ?? 0;
      const routines = (state.routines as unknown[])?.length ?? 0;
      return `${history} workout${history === 1 ? "" : "s"}, ${routines} program${routines === 1 ? "" : "s"}`;
    }
    if (module === "nutrition") {
      const days = Object.keys(state.logs ?? {}).length;
      return `${days} day${days === 1 ? "" : "s"} logged`;
    }
  }
  if (module === "settings") return "Preferences";
  return "Has data";
}

export async function pullUserData(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  pulled: CloudModule[];
  merged: boolean;
  conflicts: SyncConflict[];
  remoteTimes: Map<CloudModule, string>;
}> {
  const { data, error } = await supabase
    .from("user_modules")
    .select("module, data, updated_at")
    .eq("user_id", userId);

  if (error) throw error;

  const pulled: CloudModule[] = [];
  const conflicts: SyncConflict[] = [];
  const remoteTimes = new Map<CloudModule, string>();
  let merged = false;

  for (const row of data ?? []) {
    const mod = row.module as CloudModule;
    if (!LOCAL_STORAGE_KEYS[mod]) continue;
    const local = readLocalModule(mod);
    const remote = row.data;
    const remoteUpdatedAt = row.updated_at as string;
    remoteTimes.set(mod, remoteUpdatedAt);

    const conflict = detectConflict(mod, local, remoteUpdatedAt);
    if (conflict) conflicts.push(conflict);

    if (shouldTakeRemote(mod, local, remote, remoteUpdatedAt)) {
      writeLocalModule(mod, remote, remoteUpdatedAt, { touchLocal: false });
      pulled.push(mod);
      merged = true;
    }
  }

  return { pulled, merged, conflicts, remoteTimes };
}

export async function resolveSyncConflict(
  supabase: SupabaseClient,
  userId: string,
  module: CloudModule,
  choice: "local" | "remote"
): Promise<void> {
  if (choice === "local") {
    await pushUserData(supabase, userId, [module]);
    return;
  }

  const { data, error } = await supabase
    .from("user_modules")
    .select("data, updated_at")
    .eq("user_id", userId)
    .eq("module", module)
    .maybeSingle();

  if (error) throw error;
  if (!data) return;
  writeLocalModule(module, data.data, data.updated_at as string, { touchLocal: false });
}

async function fetchRemoteUpdatedAt(
  supabase: SupabaseClient,
  userId: string
): Promise<Map<CloudModule, string>> {
  const { data, error } = await supabase
    .from("user_modules")
    .select("module, updated_at")
    .eq("user_id", userId);

  if (error) throw error;

  const map = new Map<CloudModule, string>();
  for (const row of data ?? []) {
    map.set(row.module as CloudModule, row.updated_at as string);
  }
  return map;
}

export async function pushUserData(
  supabase: SupabaseClient,
  userId: string,
  modules: CloudModule[] = Object.keys(LOCAL_STORAGE_KEYS) as CloudModule[],
  remoteTimes?: Map<CloudModule, string>
): Promise<CloudModule[]> {
  const remoteMap = remoteTimes ?? (await fetchRemoteUpdatedAt(supabase, userId));
  const now = new Date().toISOString();
  const rows: { user_id: string; module: CloudModule; data: unknown; updated_at: string }[] = [];
  const pushed: CloudModule[] = [];

  for (const cloudModule of modules) {
    if (!shouldPushModule(cloudModule, remoteMap.get(cloudModule) ?? null)) continue;
    const data = readLocalModule(cloudModule);
    if (data == null || isModuleDataEmpty(cloudModule, data)) continue;
    rows.push({ user_id: userId, module: cloudModule, data, updated_at: now });
    setLocalUpdatedAt(cloudModule, now);
    pushed.push(cloudModule);
  }

  if (!rows.length) return pushed;

  const { error } = await supabase.from("user_modules").upsert(rows, {
    onConflict: "user_id,module",
  });
  if (error) throw error;
  return pushed;
}

/** Pull remote changes first, then push only modules with newer local edits. */
export async function syncUserData(
  supabase: SupabaseClient,
  userId: string
): Promise<SyncResult> {
  const pull = await pullUserData(supabase, userId);
  const pushed = await pushUserData(supabase, userId, undefined, pull.remoteTimes);
  return { pulled: pull.pulled, pushed, merged: pull.merged, conflicts: pull.conflicts };
}

/** Pull cloud module rows for sign-in / session bootstrap. Rehydration is handled by pullAndApplyUserData. */
export async function bootstrapUserCloudSync(
  supabase: SupabaseClient,
  userId: string
): Promise<{ pulled: CloudModule[]; merged: boolean; conflicts: SyncConflict[] }> {
  return pullUserData(supabase, userId);
}

function goalsMatchDefaults(goals: unknown): boolean {
  if (!goals || typeof goals !== "object") return true;
  const g = goals as Record<string, number>;
  return Object.keys(DEFAULT_GOALS).every((key) => (g[key] ?? DEFAULT_GOALS[key]) === DEFAULT_GOALS[key]);
}

export function isNutritionPersistedDataEmpty(data: unknown): boolean {
  if (typeof data !== "object" || data === null || !("state" in data)) return true;
  const state = (data as { state: Record<string, unknown> }).state;
  const logs = state.logs as Record<string, unknown[]> | undefined;
  const hasLogs = Boolean(
    logs && Object.keys(logs).some((day) => (logs[day]?.length ?? 0) > 0)
  );
  if (hasLogs) return false;
  if (state.onboardingComplete === true) return false;
  if (state.profile != null) return false;
  if (!goalsMatchDefaults(state.goals)) return false;
  if ((state.customFoods as unknown[] | undefined)?.length) return false;
  if ((state.favorites as unknown[] | undefined)?.length) return false;
  return true;
}

export function isModuleDataEmpty(module: CloudModule, data: unknown): boolean {
  if (module === "labs") return Array.isArray(data) && data.length === 0;
  if (module === "settings") {
    return typeof data === "object" && data !== null && Object.keys(data).length === 0;
  }
  if (typeof data === "object" && data && "state" in data) {
    const state = (data as { state: Record<string, unknown> }).state;
    if (module === "cycle") return (state.compounds as unknown[])?.length === 0;
    if (module === "gym") return (state.history as unknown[])?.length === 0;
    if (module === "nutrition") return isNutritionPersistedDataEmpty(data);
  }
  return false;
}