"use client";

import { useCycleStore } from "@/store/cycleStore";
import { useGymStore } from "@/store/gymStore";
import { useNutritionStore } from "@/store/nutritionStore";

export const CLOUD_SYNC_EVENT = "roiders:cloud-sync";

export function dispatchCloudSyncEvent(detail?: { modules?: string[] }) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CLOUD_SYNC_EVENT, { detail }));
}

export async function rehydratePersistedStores(): Promise<void> {
  const tasks = [
    useCycleStore.persist.rehydrate(),
    useGymStore.persist.rehydrate(),
    useNutritionStore.persist.rehydrate(),
  ];
  await Promise.all(tasks);
  dispatchCloudSyncEvent();
}