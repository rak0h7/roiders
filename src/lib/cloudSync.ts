import type { SupabaseClient } from "@supabase/supabase-js";

export type CloudModule = "labs" | "cycle" | "gym" | "nutrition" | "settings";

export const LOCAL_STORAGE_KEYS: Record<CloudModule, string> = {
  labs: "roiders-club-labs-v1",
  cycle: "cycle-planner-store-v2",
  gym: "roiders-club-gym-store-v1",
  nutrition: "roiders-club-nutrition-store-v1",
  settings: "roiders-club-settings-v2",
};

const SYNC_META_KEY = "roiders-club-sync-meta";

type SyncMeta = Partial<Record<CloudModule, string>>;

export interface SyncResult {
  pulled: CloudModule[];
  pushed: CloudModule[];
  merged: boolean;
}

export function readLocalModule(module: CloudModule): unknown | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LOCAL_STORAGE_KEYS[module]);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeLocalModule(module: CloudModule, data: unknown, updatedAt?: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEYS[module], JSON.stringify(data));
  if (updatedAt) setLocalUpdatedAt(module, updatedAt);
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
  localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
}

function getLocalUpdatedAt(module: CloudModule): string | null {
  return readSyncMeta()[module] ?? null;
}

function setLocalUpdatedAt(module: CloudModule, updatedAt: string): void {
  writeSyncMeta({ ...readSyncMeta(), [module]: updatedAt });
}

function shouldTakeRemote(
  module: CloudModule,
  local: unknown,
  remoteUpdatedAt: string
): boolean {
  if (local == null || isEmptyLocal(module, local)) return true;
  const localUpdatedAt = getLocalUpdatedAt(module);
  if (!localUpdatedAt) return false;
  return new Date(remoteUpdatedAt).getTime() > new Date(localUpdatedAt).getTime();
}

export async function pullUserData(
  supabase: SupabaseClient,
  userId: string
): Promise<{ pulled: CloudModule[]; merged: boolean }> {
  const { data, error } = await supabase
    .from("user_modules")
    .select("module, data, updated_at")
    .eq("user_id", userId);

  if (error) throw error;

  const pulled: CloudModule[] = [];
  let merged = false;

  for (const row of data ?? []) {
    const mod = row.module as CloudModule;
    if (!LOCAL_STORAGE_KEYS[mod]) continue;
    const local = readLocalModule(mod);
    const remote = row.data;
    const remoteUpdatedAt = row.updated_at as string;

    if (shouldTakeRemote(mod, local, remoteUpdatedAt)) {
      writeLocalModule(mod, remote, remoteUpdatedAt);
      pulled.push(mod);
      merged = true;
    }
  }

  return { pulled, merged };
}

export async function pushUserData(
  supabase: SupabaseClient,
  userId: string,
  modules: CloudModule[] = Object.keys(LOCAL_STORAGE_KEYS) as CloudModule[]
): Promise<CloudModule[]> {
  const now = new Date().toISOString();
  const rows: { user_id: string; module: CloudModule; data: unknown; updated_at: string }[] = [];
  const pushed: CloudModule[] = [];

  for (const cloudModule of modules) {
    const data = readLocalModule(cloudModule);
    if (data == null) continue;
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

export async function syncUserData(
  supabase: SupabaseClient,
  userId: string
): Promise<SyncResult> {
  const pull = await pullUserData(supabase, userId);
  const pushed = await pushUserData(supabase, userId);
  return { pulled: pull.pulled, pushed, merged: pull.merged };
}

function isEmptyLocal(module: CloudModule, data: unknown): boolean {
  if (module === "labs") return Array.isArray(data) && data.length === 0;
  if (module === "settings") {
    return typeof data === "object" && data !== null && Object.keys(data).length === 0;
  }
  if (typeof data === "object" && data && "state" in data) {
    const state = (data as { state: Record<string, unknown> }).state;
    if (module === "cycle") return (state.compounds as unknown[])?.length === 0;
    if (module === "gym") return (state.history as unknown[])?.length === 0;
    if (module === "nutrition") return Object.keys(state.logs ?? {}).length === 0;
  }
  return false;
}