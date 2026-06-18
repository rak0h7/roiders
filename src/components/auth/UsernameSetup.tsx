"use client";

import { useEffect, useState } from "react";
import { AtSign, Check, Loader2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { canShowHomeScreenPrompt, markHomeScreenPromptPending } from "@/lib/homeScreenPrompt";
import { normalizeUsername, validateUsername } from "@/lib/username";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function UsernameSetup() {
  const { setUsername, username } = useAuth();
  const [value, setValue] = useState(username ?? "");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  const normalized = normalizeUsername(value);
  const validationError = value ? validateUsername(value) : null;
  const displayedAvailable = !normalized || validationError ? null : available;

  useEffect(() => {
    if (!normalized || validationError) return;

    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await fetch(`/api/profile/username?q=${encodeURIComponent(normalized)}`, {
          credentials: "same-origin",
        });
        const data = await res.json();
        setAvailable(Boolean(data.available));
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [normalized, validationError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const result = await setUsername(value);
    setBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (canShowHomeScreenPrompt()) {
      markHomeScreenPromptPending();
    }

    window.location.assign("/");
  };

  return (
    <form onSubmit={handleSubmit} className={cn(ui.card, ui.cardPad, "space-y-5")}>
      <div>
        <h2 className={ui.sectionTitle}>Choose your username</h2>
        <p className={`${ui.sectionSub} mt-1`}>
          This is how you appear across Roiders Club — on your dashboard, in settings, and to admins.
          Your access key stays private.
        </p>
      </div>

      <div>
        <label className={ui.label} htmlFor="username">
          Username
        </label>
        <div className="relative mt-1.5">
          <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            id="username"
            type="text"
            autoComplete="username"
            autoCapitalize="off"
            spellCheck={false}
            required
            maxLength={20}
            placeholder="your_handle"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={cn(ui.input, "pl-9 font-mono")}
          />
        </div>
        <div className="mt-2 flex min-h-[1.25rem] items-center gap-2 text-xs">
          {checking && (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--muted)]" />
              <span className="text-[var(--muted)]">Checking availability…</span>
            </>
          )}
          {!checking && validationError && (
            <>
              <X className="h-3.5 w-3.5 text-[var(--danger)]" />
              <span className="text-[var(--danger)]">{validationError}</span>
            </>
          )}
          {!checking && !validationError && displayedAvailable === true && normalized && (
            <>
              <Check className="h-3.5 w-3.5 text-[var(--success)]" />
              <span className="text-[var(--success)]">@{normalized} is available</span>
            </>
          )}
          {!checking && !validationError && displayedAvailable === false && (
            <>
              <X className="h-3.5 w-3.5 text-[var(--danger)]" />
              <span className="text-[var(--danger)]">Already taken</span>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-[var(--radius-md)] border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || checking || Boolean(validationError) || !displayedAvailable}
        className={cn(ui.btnPrimary, "w-full disabled:opacity-50")}
      >
        {busy ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}