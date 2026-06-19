"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className={cn(ui.card, ui.cardPad, "w-full max-w-md space-y-4 text-center")}>
        <h1 className={ui.pageTitle}>Something went wrong</h1>
        <p className={ui.pageSub}>
          The app hit an unexpected error. Clearing local data often fixes stale session or cache
          issues after switching accounts.
        </p>
        <button type="button" onClick={() => reset()} className={cn(ui.btnPrimary, "w-full")}>
          Try again
        </button>
        <button
          type="button"
          onClick={() => {
            window.location.href = "/auth/login";
          }}
          className={cn(ui.btnSecondary, "w-full")}
        >
          Sign in again
        </button>
      </div>
    </div>
  );
}