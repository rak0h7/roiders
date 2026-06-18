/** True on phones/tablets — used for mobile-only UI (e.g. Add to Home Screen). */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent || "";
  const mobileUa = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const touchTablet = navigator.maxTouchPoints > 1 && window.innerWidth < 1024;

  return mobileUa || touchTablet;
}

export type MobilePlatform = "ios" | "android" | "other";

export function getMobilePlatform(): MobilePlatform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

/** Already launched from home screen / installed PWA. */
export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}