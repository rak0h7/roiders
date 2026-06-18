"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { resolveSyncConflict, type CloudModule, type SyncConflict } from "@/lib/cloudSync";
import {
  pullAndApplyUserData,
  syncAndApplyUserData,
  type AppliedSyncResult,
} from "@/lib/userCloudSync";
import { rehydratePersistedStores } from "@/lib/storeRehydrate";
import { accountLabel } from "@/lib/accessKey.shared";
import { useSiteConfig } from "@/context/SiteConfigContext";
import {
  loadUserProfile,
  primeUsernamesSchema,
  resolveProfileGate,
  setUsernamesSchemaKnown,
} from "@/lib/profile";
import { formatUsername, normalizeUsername } from "@/lib/username";
import { canUserCloudSync, PREMIUM_SYNC_REQUIRED_MESSAGE } from "@/lib/cloudSyncAccess";

interface AuthResult {
  error: string | null;
  accessKey?: string;
}

interface AuthContextValue {
  configured: boolean;
  user: User | null;
  username: string | null;
  accountName: string | null;
  needsUsername: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  premiumSyncEnabled: boolean;
  canCloudSync: boolean;
  usernamesEnabled: boolean;
  profileLoading: boolean;
  loading: boolean;
  signIn: (accessKey: string) => Promise<AuthResult>;
  createAccount: () => Promise<AuthResult>;
  setUsername: (raw: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<{ error: string | null; pulled?: CloudModule[]; pushed?: CloudModule[] }>;
  syncStatus: {
    syncing: boolean;
    lastSyncAt: string | null;
    lastPulled: CloudModule[];
    lastPushed: CloudModule[];
    lastError: string | null;
  };
  syncConflicts: SyncConflict[];
  resolveConflict: (module: CloudModule, choice: "local" | "remote") => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { settings: siteSettings } = useSiteConfig();
  const configured = isSupabaseConfigured();
  const supabase = useMemo(() => (configured ? createClient() : null), [configured]);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsernameState] = useState<string | null>(null);
  const [displayName, setDisplayNameState] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVendor, setIsVendor] = useState(false);
  const [premiumSyncEnabled, setPremiumSyncEnabled] = useState(false);
  const [usernamesEnabled, setUsernamesEnabled] = useState(true);
  const canCloudSync = useMemo(
    () => canUserCloudSync(siteSettings.cloud_sync_enabled, { premium_sync_enabled: premiumSyncEnabled }),
    [siteSettings.cloud_sync_enabled, premiumSyncEnabled],
  );
  const [loading, setLoading] = useState(configured);
  const [profileLoading, setProfileLoading] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pullState = useRef<{
    userId: string | null;
    promise: Promise<AppliedSyncResult | null> | null;
  }>({ userId: null, promise: null });
  const [syncStatus, setSyncStatus] = useState<AuthContextValue["syncStatus"]>({
    syncing: false,
    lastSyncAt: null,
    lastPulled: [],
    lastPushed: [],
    lastError: null,
  });
  const [syncConflicts, setSyncConflicts] = useState<SyncConflict[]>([]);

  const refreshProfile = useCallback(
    async (nextUser: User | null) => {
      if (!supabase || !nextUser) {
        setUsernameState(null);
        setDisplayNameState(null);
        setIsAdmin(false);
        setIsVendor(false);
        setPremiumSyncEnabled(false);
        setUsernamesEnabled(true);
        setProfileLoading(false);
        return null;
      }

      setProfileLoading(true);
      const profile = await loadUserProfile(supabase, nextUser.id);
      const metaFingerprint = nextUser.user_metadata?.key_fingerprint as string | undefined;
      const resolved =
        !profile.is_admin && metaFingerprint
          ? { ...resolveProfileGate({ ...profile, key_fingerprint: metaFingerprint }), usernames_enabled: profile.usernames_enabled }
          : profile;
      setUsernameState(resolved.username);
      setDisplayNameState(resolved.display_name);
      setIsAdmin(resolved.is_admin);
      setIsVendor(resolved.is_vendor);
      setPremiumSyncEnabled(resolved.premium_sync_enabled);
      setUsernamesEnabled(resolved.usernames_enabled);
      setProfileLoading(false);
      return resolved;
    },
    [supabase]
  );

  const accountName = useMemo(() => {
    if (displayName) return displayName;
    if (username) return formatUsername(username);
    if (!user) return null;
    const fingerprint = user.user_metadata?.key_fingerprint as string | undefined;
    if (fingerprint) return accountLabel(fingerprint);
    return "Account";
  }, [user, username, displayName]);

  const needsUsername = Boolean(user && !profileLoading && usernamesEnabled && !username);

  const syncNow = useCallback(async () => {
    if (!supabase || !user) return { error: null };
    if (!siteSettings.cloud_sync_enabled) {
      return { error: "Cloud sync is disabled by the site administrator" };
    }
    if (!premiumSyncEnabled) {
      return { error: PREMIUM_SYNC_REQUIRED_MESSAGE };
    }
    setSyncStatus((s) => ({ ...s, syncing: true, lastError: null }));
    try {
      const result = await syncAndApplyUserData(supabase, user.id);
      const at = new Date().toISOString();
      setSyncConflicts(result.conflicts);
      setSyncStatus({
        syncing: false,
        lastSyncAt: at,
        lastPulled: result.pulled,
        lastPushed: result.pushed,
        lastError: null,
      });
      return { error: null, pulled: result.pulled, pushed: result.pushed };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Sync failed";
      setSyncStatus((s) => ({ ...s, syncing: false, lastError: msg }));
      return { error: msg };
    }
  }, [supabase, user, siteSettings.cloud_sync_enabled, premiumSyncEnabled]);

  const resolveConflict = useCallback(
    async (module: CloudModule, choice: "local" | "remote") => {
      if (!supabase || !user) return { error: null };
      try {
        await resolveSyncConflict(supabase, user.id, module, choice);
        if (choice === "remote") await rehydratePersistedStores([module]);
        setSyncConflicts((list) => list.filter((c) => c.module !== module));
        return { error: null };
      } catch (e) {
        return { error: e instanceof Error ? e.message : "Could not resolve conflict" };
      }
    },
    [supabase, user]
  );

  useEffect(() => {
    if (!supabase) return;

    const applyPullResult = (result: AppliedSyncResult) => {
      setSyncConflicts(result.conflicts);
      setSyncStatus((s) => ({
        ...s,
        lastSyncAt: result.merged ? new Date().toISOString() : s.lastSyncAt,
        lastPulled: result.pulled,
      }));
    };

    const pullOnce = async (userId: string): Promise<AppliedSyncResult | null> => {
      if (!canCloudSync) return null;

      if (pullState.current.userId === userId && pullState.current.promise) {
        return pullState.current.promise;
      }
      if (pullState.current.userId === userId && !pullState.current.promise) {
        return null;
      }

      pullState.current.userId = userId;
      pullState.current.promise = pullAndApplyUserData(supabase, userId)
        .then((result) => {
          pullState.current.promise = null;
          return result;
        })
        .catch((error) => {
          pullState.current.promise = null;
          pullState.current.userId = null;
          throw error;
        });

      return pullState.current.promise;
    };

    const schemaPromise = fetch("/api/profile/schema", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((data: { usernames_enabled?: boolean }) =>
        typeof data.usernames_enabled === "boolean" ? data.usernames_enabled : true
      )
      .catch(() => true);

    primeUsernamesSchema(schemaPromise);

    const bootstrap = async () => {
      const enabled = await schemaPromise;
      setUsernamesSchemaKnown(enabled);
      setUsernamesEnabled(enabled);

      const { data } = await supabase.auth.getSession();
      const nextUser = data.session?.user ?? null;
      setUser(nextUser);
      await refreshProfile(nextUser);

      if (nextUser) {
        try {
          const result = await pullOnce(nextUser.id);
          if (result) applyPullResult(result);
        } catch {
          /* local-only fallback */
        }
      }

      setLoading(false);
    };

    void bootstrap();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      await refreshProfile(nextUser);

      if (!nextUser) {
        pullState.current = { userId: null, promise: null };
        setSyncConflicts([]);
        return;
      }

      try {
        const result = await pullOnce(nextUser.id);
        if (result) applyPullResult(result);
      } catch {
        /* local-only fallback */
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [supabase, refreshProfile, canCloudSync]);

  useEffect(() => {
    if (syncTimer.current) clearInterval(syncTimer.current);
    if (!user || !supabase || !canCloudSync) return;

    syncTimer.current = setInterval(() => {
      void syncAndApplyUserData(supabase, user.id)
        .then((result) => {
          setSyncConflicts(result.conflicts);
          setSyncStatus((s) => ({
            ...s,
            lastSyncAt: new Date().toISOString(),
            lastPulled: result.pulled,
            lastPushed: result.pushed,
            lastError: null,
          }));
        })
        .catch((error) => {
          const msg = error instanceof Error ? error.message : "Background sync failed";
          setSyncStatus((s) => ({ ...s, lastError: msg }));
        });
    }, 45_000);

    return () => {
      if (syncTimer.current) clearInterval(syncTimer.current);
    };
  }, [user, supabase, canCloudSync]);

  const signIn = useCallback(
    async (accessKey: string) => {
      if (!supabase) return { error: "Auth is not configured" };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessKey }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) return { error: data.error ?? "Sign in failed" };

      const { data: sessionData } = await supabase.auth.getSession();
      const nextUser = sessionData.session?.user ?? null;
      setUser(nextUser);

      if (nextUser) {
        pullState.current = { userId: null, promise: null };
        const profile = await refreshProfile(nextUser);
        if (profile && canUserCloudSync(siteSettings.cloud_sync_enabled, profile)) {
          try {
            const result = await pullAndApplyUserData(supabase, nextUser.id);
            pullState.current.userId = nextUser.id;
            setSyncConflicts(result.conflicts);
            setSyncStatus({
              syncing: false,
              lastSyncAt: new Date().toISOString(),
              lastPulled: result.pulled,
              lastPushed: [],
              lastError: null,
            });
          } catch (e) {
            const msg = e instanceof Error ? e.message : "Sync failed";
            setSyncStatus((s) => ({ ...s, syncing: false, lastError: msg }));
          }
        }
      }

      return { error: null };
    },
    [supabase, refreshProfile, siteSettings.cloud_sync_enabled],
  );

  const createAccount = useCallback(async () => {
    if (!supabase) return { error: "Auth is not configured" };

    const res = await fetch("/api/auth/register", { method: "POST", credentials: "same-origin" });
    const data = (await res.json()) as { accessKey?: string; error?: string };

    if (!res.ok) return { error: data.error ?? "Account creation failed" };

    return { error: null, accessKey: data.accessKey };
  }, [supabase]);

  const setUsername = useCallback(
    async (raw: string) => {
      const value = normalizeUsername(raw);
      const res = await fetch("/api/profile/username", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: value }),
      });
      const data = (await res.json()) as { username?: string; error?: string };
      if (!res.ok) return { error: data.error ?? "Could not save username" };

      setUsernameState(data.username ?? value);
      if (user) await refreshProfile(user);
      return { error: null };
    },
    [refreshProfile, user]
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    if (user && canCloudSync) await syncAndApplyUserData(supabase, user.id);
    await supabase.auth.signOut();
    setUser(null);
    setUsernameState(null);
    setDisplayNameState(null);
    setIsAdmin(false);
    setIsVendor(false);
    setPremiumSyncEnabled(false);
    window.location.href = "/auth/login";
  }, [supabase, user, canCloudSync]);

  return (
    <AuthContext.Provider
      value={{
        configured,
        user,
        username,
        accountName,
        needsUsername,
        isAdmin,
        isVendor,
        premiumSyncEnabled,
        canCloudSync,
        usernamesEnabled,
        profileLoading,
        loading,
        signIn,
        createAccount,
        setUsername,
        signOut,
        syncNow,
        syncStatus,
        syncConflicts,
        resolveConflict,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}