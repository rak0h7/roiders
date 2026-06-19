"use client";

import {
  ACCOUNT_SCOPED_STORAGE_KEYS,
  ACTIVE_USER_STORAGE_KEY,
} from "@/lib/cloudSync";
import { rehydratePersistedStores } from "@/lib/storeRehydrate";

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

  for (const key of ACCOUNT_SCOPED_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
}

async function clearAndRehydrate(): Promise<void> {
  clearAccountLocalData();
  await rehydratePersistedStores();
}

/** Drop persisted module data when the signed-in account changes on this device. */
export async function ensureAccountStorageScope(userId: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  if (getActiveAccountUserId() === userId) return false;

  clearAccountLocalData();
  setActiveAccountUserId(userId);
  await rehydratePersistedStores();
  return true;
}

export async function resetAccountLocalState(): Promise<void> {
  await clearAndRehydrate();
}