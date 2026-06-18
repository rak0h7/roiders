import { isAdminFingerprint } from "@/lib/adminFingerprint";

export const OWNER_USERNAME = "admin";
export const OWNER_DISPLAY_NAME = "Admin";

export type UserProfileGate = {
  username: string | null;
  display_name: string | null;
  is_admin: boolean;
  key_fingerprint: string | null;
  usernames_enabled: boolean;
};

export function isMissingColumnError(message: string | undefined) {
  return Boolean(message?.includes("does not exist"));
}

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

  return {
    username,
    display_name,
    is_admin: Boolean(row?.is_admin) || isSiteAdmin,
    key_fingerprint,
    usernames_enabled: true,
  };
}

function profileGateWithoutUsernames(row: Record<string, unknown> | null | undefined): UserProfileGate {
  return { ...resolveProfileGate(row), usernames_enabled: false };
}

let usernamesSchemaEnabled: boolean | null = null;
let usernamesSchemaPromise: Promise<boolean> | null = null;

export function setUsernamesSchemaKnown(enabled: boolean) {
  usernamesSchemaEnabled = enabled;
}

export function primeUsernamesSchema(promise: Promise<boolean>) {
  usernamesSchemaPromise = promise.then((enabled) => {
    usernamesSchemaEnabled = enabled;
    return enabled;
  });
}

async function probeUsernamesSchema(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<boolean> {
  if (usernamesSchemaEnabled !== null) return usernamesSchemaEnabled;
  if (usernamesSchemaPromise) return usernamesSchemaPromise;

  const probe = await supabase.from("profiles").select("username").limit(0);
  usernamesSchemaEnabled = !isMissingColumnError(probe.error?.message);
  return usernamesSchemaEnabled;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadUserProfile(supabase: any, userId: string): Promise<UserProfileGate> {
  const enabled = await probeUsernamesSchema(supabase);

  if (!enabled) {
    const fallback = await supabase
      .from("profiles")
      .select("display_name, key_fingerprint")
      .eq("id", userId)
      .maybeSingle();

    if (fallback.error) return profileGateWithoutUsernames(null);
    return profileGateWithoutUsernames(fallback.data);
  }

  const full = await supabase
    .from("profiles")
    .select("username, display_name, is_admin, key_fingerprint")
    .eq("id", userId)
    .maybeSingle();

  if (full.error && !isMissingColumnError(full.error.message)) {
    return resolveProfileGate(null);
  }

  return resolveProfileGate(full.data ?? null);
}