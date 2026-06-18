import type { UserProfileGate } from "@/lib/profile";

export const PREMIUM_SYNC_REQUIRED_MESSAGE =
  "Cloud sync is a premium feature. Request access from the site owner to enable it on your account.";

export function userHasPremiumSync(profile: Pick<UserProfileGate, "premium_sync_enabled">): boolean {
  return profile.premium_sync_enabled;
}

export function canUserCloudSync(
  siteCloudSyncEnabled: boolean,
  profile: Pick<UserProfileGate, "premium_sync_enabled">,
): boolean {
  return siteCloudSyncEnabled && userHasPremiumSync(profile);
}