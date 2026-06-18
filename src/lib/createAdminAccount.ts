import { OWNER_DISPLAY_NAME, OWNER_USERNAME } from "@/lib/profile";
import { createAccessKeyAccount } from "@/lib/createAccessKeyAccount";
import { createAdminClient } from "@/lib/supabase/admin";

export type CreatedAdminAccount = {
  accessKey: string;
  userId: string;
  keyFingerprint: string;
};

export async function createAdminAccount(): Promise<CreatedAdminAccount> {
  const admin = createAdminClient();
  const created = await createAccessKeyAccount();

  // Demote every other account; this account is the sole admin.
  const demote = await admin.from("profiles").update({ is_admin: false }).neq("id", created.userId);
  if (demote.error && !demote.error.message.includes("does not exist")) {
    throw new Error(demote.error.message);
  }

  const promote = await admin
    .from("profiles")
    .update({
      is_admin: true,
      username: OWNER_USERNAME,
      display_name: OWNER_DISPLAY_NAME,
      updated_at: new Date().toISOString(),
    })
    .eq("id", created.userId);

  if (promote.error && !promote.error.message.includes("does not exist")) {
    await admin.auth.admin.deleteUser(created.userId);
    throw new Error(promote.error.message);
  }

  return {
    accessKey: created.accessKey,
    userId: created.userId,
    keyFingerprint: created.keyFingerprint,
  };
}