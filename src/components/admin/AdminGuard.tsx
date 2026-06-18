"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { configured, user, isAdmin, isVendor, loading, profileLoading } = useAuth();
  const { settings } = useSiteConfig();
  const vendorAccessAllowed = settings.vendor_portal_enabled && isVendor;

  if (!configured) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className={cn(ui.card, ui.cardPad, "max-w-md text-center")}>
          <p className="text-sm text-[var(--muted)]">Supabase is not configured.</p>
        </div>
      </div>
    );
  }

  if (loading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className={ui.spinner} />
          <p className="text-sm text-[var(--muted)]">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  if (!user || (!isAdmin && !vendorAccessAllowed)) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className={cn(ui.card, ui.cardPad, "max-w-md text-center space-y-4")}>
          <h1 className={ui.pageTitle}>Access denied</h1>
          <p className={ui.pageSub}>This area is restricted to site admins and approved vendors.</p>
          <Link href="/" className={ui.btnSecondary}>
            Back to app
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}