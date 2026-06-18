/** Fingerprint of the sole site admin access key (not the key itself). */
export function getAdminFingerprint(): string | null {
  const value =
    process.env.ADMIN_FINGERPRINT ?? process.env.NEXT_PUBLIC_ADMIN_FINGERPRINT ?? null;
  return value?.trim() || null;
}

export function isAdminFingerprint(fingerprint: string | null | undefined): boolean {
  const adminFp = getAdminFingerprint();
  return Boolean(adminFp && fingerprint && fingerprint === adminFp);
}