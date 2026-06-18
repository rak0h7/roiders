"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  bootstrapUserCloudSync,
  syncUserData,
  type CloudModule,
  type SyncConflict,
  type SyncResult,
} from "@/lib/cloudSync";
import { rehydratePersistedStores } from "@/lib/storeRehydrate";

export interface AppliedSyncResult {
  pulled: CloudModule[];
  pushed: CloudModule[];
  merged: boolean;
  conflicts: SyncConflict[];
}

/** Pull remote modules, rehydrate all client stores, return sync metadata. */
export async function pullAndApplyUserData(
  supabase: SupabaseClient,
  userId: string
): Promise<AppliedSyncResult> {
  const pull = await bootstrapUserCloudSync(supabase, userId);
  if (pull.merged) await rehydratePersistedStores(pull.pulled);
  return { pulled: pull.pulled, pushed: [], merged: pull.merged, conflicts: pull.conflicts };
}

/** Full bidirectional sync: pull, rehydrate, then push modules with newer local edits. */
export async function syncAndApplyUserData(
  supabase: SupabaseClient,
  userId: string
): Promise<AppliedSyncResult> {
  const result: SyncResult = await syncUserData(supabase, userId);
  if (result.merged || result.pushed.length > 0) {
    const modules = [...new Set([...result.pulled, ...result.pushed])];
    await rehydratePersistedStores(modules);
  }
  return result;
}