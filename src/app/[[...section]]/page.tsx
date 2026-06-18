"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LandingPage } from "@/components/landing/LandingPage";
import { useAuth } from "@/context/AuthContext";

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
  const isHome = pathname === "/";

  if (isHome) {
    if (!configured) return <LandingPage />;
    if (loading) return <SessionLoader />;
    if (!user) return <LandingPage />;
  }

  return (
    <AuthGuard>
      <AppShell />
    </AuthGuard>
  );
}