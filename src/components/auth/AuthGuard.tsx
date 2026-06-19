"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { configured, user, loading, rehydrateSession } = useAuth();
  const [retrying, setRetrying] = useState(false);
  const [stalled, setStalled] = useState(false);

  useEffect(() => {
    if (!configured || loading || user) {
      setStalled(false);
      return;
    }

    const timer = window.setTimeout(() => setStalled(true), 2500);
    return () => window.clearTimeout(timer);
  }, [configured, loading, user]);

  if (!configured) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className={cn(ui.card, ui.cardPad, "w-full max-w-md text-center")}>
          <h1 className={ui.pageTitle}>Authentication required</h1>
          <p className={`${ui.pageSub} mt-2`}>
            Add Supabase environment variables to enable sign-in. Copy{" "}
            <code className="rounded bg-[var(--bg-elevated)] px-1.5 py-0.5 text-xs">.env.example</code>{" "}
            to <code className="rounded bg-[var(--bg-elevated)] px-1.5 py-0.5 text-xs">.env.local</code>{" "}
            and set your project URL and anon key.
          </p>
        </div>
      </div>
    );
  }

  if (loading || (!user && !stalled)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className={ui.spinner} aria-hidden />
          <p className="text-sm text-[var(--muted)]">Checking session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className={cn(ui.card, ui.cardPad, "w-full max-w-md space-y-4 text-center")}>
          <h1 className={ui.pageTitle}>Restoring session</h1>
          <p className={ui.pageSub}>
            Your sign-in succeeded but the app has not loaded your session yet. Retry below or sign in
            again.
          </p>
          <button
            type="button"
            disabled={retrying}
            onClick={async () => {
              setRetrying(true);
              await rehydrateSession();
              setRetrying(false);
            }}
            className={cn(ui.btnPrimary, "w-full")}
          >
            {retrying ? "Retrying…" : "Retry session"}
          </button>
          <Link href="/auth/login" className={cn(ui.btnSecondary, "inline-flex w-full justify-center")}>
            Sign in again
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}