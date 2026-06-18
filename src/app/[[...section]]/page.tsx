"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { HomeScreenPromptProvider } from "@/context/HomeScreenPromptContext";
import { LandingPage } from "@/components/landing/LandingPage";
import { useAuth } from "@/context/AuthContext";
import { useSiteConfig } from "@/context/SiteConfigContext";

function SessionLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        className="h-[var(--control-height-xs)] w-[var(--control-height-xs)] animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--labs)]"
        aria-hidden
      />
    </div>
  );
}

export default function AppPage() {
  const pathname = usePathname();
  const { configured, user, loading } = useAuth();
  const { settings, loading: siteLoading } = useSiteConfig();
  const isHome = pathname === "/";

  if (isHome) {
    if (!configured) return <LandingPage />;
    if (loading || siteLoading) return <SessionLoader />;
    if (!user) {
      if (!settings.public_landing_enabled) {
        if (typeof window !== "undefined") window.location.replace("/auth/login");
        return <SessionLoader />;
      }
      return <LandingPage />;
    }
  }

  return (
    <AuthGuard>
      <HomeScreenPromptProvider>
        <AppShell />
      </HomeScreenPromptProvider>
    </AuthGuard>
  );
}