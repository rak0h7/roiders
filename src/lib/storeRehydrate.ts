"use client";

import { useCycleStore } from "@/store/cycleStore";
import { useGymStore } from "@/store/gymStore";
import { useNutritionStore } from "@/store/nutritionStore";

export const CLOUD_SYNC_EVENT = "roiders:cloud-sync";

export type CloudSyncEventDetail = { modules?: string[] };

export function dispatchCloudSyncEvent(detail?: CloudSyncEventDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<CloudSyncEventDetail>(CLOUD_SYNC_EVENT, { detail }));
}

export async function rehydratePersistedStores(modules: string[] = []): Promise<void> {
  const tasks = [
    useCycleStore.persist.rehydrate(),
    useGymStore.persist.rehydrate(),
    useNutritionStore.persist.rehydrate(),
  ];
  await Promise.all(tasks);
  dispatchCloudSyncEvent({ modules });
}

export function labsModuleChanged(detail?: CloudSyncEventDetail): boolean {
  const modules = detail?.modules;
  return !modules || modules.length === 0 || modules.includes("labs");
}