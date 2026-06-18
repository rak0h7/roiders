const USERNAME_RE = /^[a-z][a-z0-9_]{2,19}$/;

const RESERVED = new Set([
  "admin",
  "api",
  "auth",
  "help",
  "login",
  "logout",
  "null",
  "owner",
  "roiders",
  "root",
  "settings",
  "signup",
  "support",
  "system",
  "welcome",
]);

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/^@+/, "");
}

export function validateUsername(raw: string): string | null {
  const username = normalizeUsername(raw);
  if (!username) return "Username is required";
  if (username.length < 3) return "At least 3 characters";
  if (username.length > 20) return "Maximum 20 characters";
  if (!USERNAME_RE.test(username)) {
    return "Use lowercase letters, numbers, and underscores — start with a letter";
  }
  if (RESERVED.has(username)) return "This username is reserved";
  return null;
}

export function formatUsername(username: string | null | undefined): string | null {
  if (!username) return null;
  return `@${username}`;
}