export function isInvalidCredentialsError(message: string | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return lower.includes("invalid login credentials") || lower.includes("invalid credentials");
}