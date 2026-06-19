"use client";

import { LOCAL_STORAGE_KEYS } from "@/lib/cloudSync";
import { rehydratePersistedStores } from "@/lib/storeRehydrate";

const ACTIVE_USER_STORAGE_KEY = "roiders-club-active-user-id";
const SYNC_META_KEY = "roiders-club-sync-meta";
const LEGACY_LABS_STORAGE_KEY = "bloodwork-logger-reports";

export function getActiveAccountUserId(): string | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
  return value?.trim() || null;
}

export function setActiveAccountUserId(userId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_USER_STORAGE_KEY, userId);
}

export function clearAccountLocalData(): void {
  if (typeof window === "undefined") return;

  for (const key of Object.values(LOCAL_STORAGE_KEYS)) {
    localStorage.removeItem(key);
  }

  localStorage.removeItem(SYNC_META_KEY);
  localStorage.removeItem(LEGACY_LABS_STORAGE_KEY);
  localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
}

/** Drop persisted module data when the signed-in account changes on this device. */
export async function ensureAccountStorageScope(userId: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const previousUserId = getActiveAccountUserId();
  if (previousUserId === userId) return false;

  clearAccountLocalData();
  setActiveAccountUserId(userId);
  await rehydratePersistedStores();
  return true;
}

export async function resetAccountLocalState(): Promise<void> {
  clearAccountLocalData();
  await rehydratePersistedStores();
}