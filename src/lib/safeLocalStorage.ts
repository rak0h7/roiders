export const STORAGE_QUOTA_EVENT = "roiders:storage-quota";

export function safeSetLocalStorage(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    window.dispatchEvent(new CustomEvent(STORAGE_QUOTA_EVENT));
    return false;
  }
}