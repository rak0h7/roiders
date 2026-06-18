import type { StateStorage } from "zustand/middleware";
import { LOCAL_STORAGE_KEYS, touchLocalModule, type CloudModule } from "./cloudSync";

/** Zustand persist adapter that timestamps local writes for cloud sync. */
export function createCloudPersistStorage(module: CloudModule): StateStorage {
  const key = LOCAL_STORAGE_KEYS[module];
  return {
    getItem: (name) => localStorage.getItem(name),
    setItem: (name, value) => {
      localStorage.setItem(name, value);
      if (name === key) touchLocalModule(module);
    },
    removeItem: (name) => localStorage.removeItem(name),
  };
}