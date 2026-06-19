"use client";

import { useEffect, useState } from "react";
import { resetAccountLocalState } from "@/lib/accountStorage";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    console.error("App error boundary:", error);
  }, [error]);

  const handleClearLocalData = async () => {
    setClearing(true);
    try {
      await resetAccountLocalState();
      reset();
    } finally {
      setClearing(false);
    }
  };

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
          onClick={() => void handleClearLocalData()}
          disabled={clearing}
          className={cn(ui.btnSecondary, "w-full")}
        >
          {clearing ? "Clearing…" : "Clear local data"}
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