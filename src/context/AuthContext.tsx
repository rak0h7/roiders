"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  pullUserData,
  resolveSyncConflict,
  syncUserData,
  type CloudModule,
  type SyncConflict,
} from "@/lib/cloudSync";
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
  const [usernamesEnabled, setUsernamesEnabled] = useState(true);
  const [loading, setLoading] = useState(configured);
  const [profileLoading, setProfileLoading] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulledForUser = useRef<string | null>(null);
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
        setUsernamesEnabled(true);
        setProfileLoading(false);
        return;
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
      setUsernamesEnabled(resolved.usernames_enabled);
      setProfileLoading(false);
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
    setSyncStatus((s) => ({ ...s, syncing: true, lastError: null }));
    try {
      const result = await syncUserData(supabase, user.id);
      await rehydratePersistedStores();
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
  }, [supabase, user, siteSettings.cloud_sync_enabled]);

  const resolveConflict = useCallback(
    async (module: CloudModule, choice: "local" | "remote") => {
      if (!supabase || !user) return { error: null };
      try {
        await resolveSyncConflict(supabase, user.id, module, choice);
        if (choice === "remote") await rehydratePersistedStores();
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
      setLoading(false);
    };

    void bootstrap();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      await refreshProfile(nextUser);

      if (!nextUser) {
        pulledForUser.current = null;
        setSyncConflicts([]);
        return;
      }

      if (pulledForUser.current === nextUser.id) return;
      pulledForUser.current = nextUser.id;

      if (siteSettings.cloud_sync_enabled) {
        try {
          const { pulled, merged, conflicts } = await pullUserData(supabase, nextUser.id);
          if (merged) await rehydratePersistedStores();
          setSyncConflicts(conflicts);
          setSyncStatus((s) => ({
            ...s,
            lastSyncAt: merged ? new Date().toISOString() : s.lastSyncAt,
            lastPulled: pulled,
          }));
        } catch {
          /* local-only fallback */
        }
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [supabase, refreshProfile, siteSettings.cloud_sync_enabled]);

  useEffect(() => {
    if (syncTimer.current) clearInterval(syncTimer.current);
    if (!user || !supabase || !siteSettings.cloud_sync_enabled) return;

    syncTimer.current = setInterval(() => {
      void syncUserData(supabase, user.id).then(async (result) => {
        if (result.merged) await rehydratePersistedStores();
        setSyncConflicts(result.conflicts);
      });
    }, 45_000);

    return () => {
      if (syncTimer.current) clearInterval(syncTimer.current);
    };
  }, [user, supabase, siteSettings.cloud_sync_enabled]);

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

      await supabase.auth.getSession();
      return { error: null };
    },
    [supabase]
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
    if (user && siteSettings.cloud_sync_enabled) await syncUserData(supabase, user.id);
    await supabase.auth.signOut();
    setUser(null);
    setUsernameState(null);
    setDisplayNameState(null);
    setIsAdmin(false);
    window.location.href = "/auth/login";
  }, [supabase, user, siteSettings.cloud_sync_enabled]);

  return (
    <AuthContext.Provider
      value={{
        configured,
        user,
        username,
        accountName,
        needsUsername,
        isAdmin,
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