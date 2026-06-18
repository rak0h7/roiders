import { getMobilePlatform, isMobileDevice, isStandalonePwa } from "@/lib/device";

const PENDING_KEY = "roiders:homescreen-prompt-pending";

export function markHomeScreenPromptPending(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(PENDING_KEY, "1");
}

export function clearHomeScreenPromptPending(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(PENDING_KEY);
}

export function isHomeScreenPromptPending(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(PENDING_KEY) === "1";
}

/** Mobile browser, not already installed as PWA. */
export function canShowHomeScreenPrompt(): boolean {
  if (typeof window === "undefined") return false;
  return isMobileDevice() && !isStandalonePwa();
}

export function shouldAutoShowHomeScreenPrompt(): boolean {
  return canShowHomeScreenPrompt() && isHomeScreenPromptPending();
}

export type HomeScreenPlatform = ReturnType<typeof getMobilePlatform>;