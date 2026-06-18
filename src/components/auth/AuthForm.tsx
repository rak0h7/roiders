"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { AccessKeyReveal } from "@/components/auth/AccessKeyReveal";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { signIn, createAccount, configured } = useAuth();
  const { settings, loading: siteSettingsLoading } = useSiteConfig();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [accessKey, setAccessKey] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const signupAllowed = settings.allow_public_signup;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const result = await signIn(accessKey);
    setBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    window.location.assign(next);
  };

  const handleCreate = async () => {
    setError(null);
    setBusy(true);

    const result = await createAccount();
    setBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.accessKey) {
      setNewKey(result.accessKey);
    }
  };

  if (!configured) {
    return (
      <div className={cn(ui.card, ui.cardPad, "text-center")}>
        <p className="text-sm text-[var(--muted)]">
          Supabase environment variables are not set. Copy{" "}
          <code className="rounded bg-[var(--bg-elevated)] px-1.5 py-0.5 text-xs">.env.example</code>{" "}
          to <code className="rounded bg-[var(--bg-elevated)] px-1.5 py-0.5 text-xs">.env.local</code>{" "}
          and add your project keys.
        </p>
      </div>
    );
  }

  if (mode === "signup" && newKey) {
    return (
      <AccessKeyReveal
        accessKey={newKey}
        onConfirm={() => {
          window.location.assign("/welcome");
        }}
      />
    );
  }

  if (mode === "signup") {
    if (siteSettingsLoading) {
      return (
        <div className={cn(ui.card, ui.cardPad, "flex flex-col items-center gap-3 py-10")}>
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--labs)]"
            aria-hidden
          />
          <p className="text-sm text-[var(--muted)]">Checking signup availability…</p>
        </div>
      );
    }

    if (!signupAllowed) {
      return (
        <div className={cn(ui.card, ui.cardPad, "space-y-4 text-center")}>
          <p className="text-sm text-[var(--muted)]">
            Public signup is disabled. Ask the site owner for an access key.
          </p>
          <Link href="/auth/login" className={cn(ui.btnSecondary, "w-full")}>
            Sign in with your key
          </Link>
        </div>
      );
    }

    return (
      <div className={cn(ui.card, ui.cardPad, "space-y-4")}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--labs)]/30 bg-[var(--labs-dim)]">
            <KeyRound className="h-5 w-5 text-[var(--labs)]" />
          </div>
          <div>
            <p className="text-sm text-[var(--foreground)]">
              Roiders Club uses a private access key instead of email. No inbox, no verification — just a
              key you keep safe.
            </p>
            <p className={`${ui.sectionSub} mt-2`}>
              You will receive one key. Store it in a password manager or offline backup.
            </p>
          </div>
        </div>

        {error && (
          <p className="rounded-[var(--radius-md)] border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={handleCreate}
          className={cn(ui.btnPrimary, "w-full")}
        >
          {busy ? "Generating…" : "Generate access key"}
        </button>

        <p className="text-center text-sm text-[var(--muted)]">
          Have a key?{" "}
          <Link href="/auth/login" className="text-[var(--labs)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin} className={cn(ui.card, ui.cardPad, "space-y-4")}>
      <div>
        <label className={ui.label} htmlFor="accessKey">
          Access key
        </label>
        <input
          id="accessKey"
          type="text"
          autoComplete="off"
          spellCheck={false}
          required
          placeholder="roiders_xxxx_xxxx_xxxx_xxxx"
          value={accessKey}
          onChange={(e) => setAccessKey(e.target.value)}
          className={cn(ui.input, "mt-1.5 font-mono text-sm")}
        />
        <p className="mt-1.5 text-[11px] text-[var(--muted)]">
          Paste the key you saved when you created your account.
        </p>
      </div>

      {error && (
        <p className="rounded-[var(--radius-md)] border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className={cn(ui.btnPrimary, "w-full")}>
        {busy ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-sm text-[var(--muted)]">
        New here?{" "}
        <Link href="/auth/signup" className="text-[var(--labs)] hover:underline">
          Create account
        </Link>
      </p>
    </form>
  );
}