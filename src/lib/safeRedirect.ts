/** Same-origin relative paths only — blocks open redirects via `next` query params. */
export function safeRedirectPath(next: string | null | undefined, fallback = "/"): string {
  if (!next) return fallback;

  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes(":") || trimmed.includes("\\")) return fallback;

  return trimmed;
}