/** True on phones/tablets — used for mobile-only UI (e.g. Add to Home Screen). */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent || "";
  const mobileUa = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const touchTablet = navigator.maxTouchPoints > 1 && window.innerWidth < 1024;

  return mobileUa || touchTablet;
}