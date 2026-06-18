"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AppRoute } from "@/context/NavigationContext";
import {
  DEFAULT_SITE_SETTINGS,
  isModuleEnabled,
  isRouteEnabled,
  type PublicSiteSettings,
  type SiteModule,
} from "@/lib/siteSettings";

interface SiteConfigContextValue {
  settings: PublicSiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
  moduleEnabled: (module: SiteModule) => boolean;
  routeEnabled: (route: AppRoute) => boolean;
}

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null);

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PublicSiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/site/settings", { credentials: "same-origin" });
      const data = (await res.json()) as PublicSiteSettings;
      if (res.ok) setSettings({ ...DEFAULT_SITE_SETTINGS, ...data });
    } catch {
      /* keep defaults */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<SiteConfigContextValue>(
    () => ({
      settings,
      loading,
      refresh,
      moduleEnabled: (module) => isModuleEnabled(settings, module),
      routeEnabled: (route) => isRouteEnabled(settings, route),
    }),
    [settings, loading, refresh]
  );

  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfig() {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) throw new Error("useSiteConfig must be used within SiteConfigProvider");
  return ctx;
}