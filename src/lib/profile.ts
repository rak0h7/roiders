import { isAdminFingerprint } from "@/lib/adminFingerprint";

export const OWNER_USERNAME = "admin";
export const OWNER_DISPLAY_NAME = "Admin";

export type UserProfileGate = {
  username: string | null;
  display_name: string | null;
  is_admin: boolean;
  is_vendor: boolean;
  premium_sync_enabled: boolean;
  key_fingerprint: string | null;
};

export function resolveProfileGate(row: Record<string, unknown> | null | undefined): UserProfileGate {
  const key_fingerprint = typeof row?.key_fingerprint === "string" ? row.key_fingerprint : null;
  const isSiteAdmin = isAdminFingerprint(key_fingerprint);

  const username =
    typeof row?.username === "string" ? row.username : isSiteAdmin ? OWNER_USERNAME : null;
  const display_name =
    typeof row?.display_name === "string"
      ? row.display_name
      : isSiteAdmin
        ? OWNER_DISPLAY_NAME
        : null;

  const is_admin = Boolean(row?.is_admin) || isSiteAdmin;

  return {
    username,
    display_name,
    is_admin,
    is_vendor: Boolean(row?.is_vendor),
    premium_sync_enabled: Boolean(row?.premium_sync_enabled) || isSiteAdmin,
    key_fingerprint,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadUserProfile(supabase: any, userId: string): Promise<UserProfileGate> {
  const { data, error } = await supabase
    .from("profiles")
    .select("username, display_name, is_admin, is_vendor, premium_sync_enabled, key_fingerprint")
    .eq("id", userId)
    .maybeSingle();

  if (error) return resolveProfileGate(null);
  return resolveProfileGate(data ?? null);
}