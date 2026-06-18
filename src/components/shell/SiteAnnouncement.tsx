"use client";

import { useSyncExternalStore, useState } from "react";
import { ExternalLink, Megaphone, X } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "roiders-announcement-dismissed";

const LEVEL_STYLES = {
  info: "border-[var(--intel)]/30 bg-[var(--intel-dim)] text-[var(--intel)]",
  warning: "border-[var(--warning)]/30 bg-[var(--warning)]/10 text-[var(--warning)]",
  danger: "border-[var(--danger)]/30 bg-[var(--danger)]/10 text-[var(--danger)]",
} as const;

function useClientMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

type SiteAnnouncementProps = {
  audience?: "signed-in" | "guest";
};

export function SiteAnnouncement({ audience = "signed-in" }: SiteAnnouncementProps) {
  const { settings } = useSiteConfig();
  const mounted = useClientMounted();
  const guestOk = audience === "guest" && settings.announcement_guest_visible;
  const enabled =
    settings.announcement_enabled &&
    settings.announcement_message.trim().length > 0 &&
    (audience === "signed-in" || guestOk);
  const token = enabled ? `${settings.updated_at}:${settings.announcement_message}` : "";
  const [manualDismiss, setManualDismiss] = useState(false);

  const storedDismissed = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      return () => window.removeEventListener("storage", onStoreChange);
    },
    () => localStorage.getItem(DISMISS_KEY) === token,
    () => true,
  );

  const dismissed = !enabled || manualDismiss || storedDismissed;

  if (!mounted || dismissed) return null;

  const link = settings.announcement_link?.trim();

  return (
    <div
      className={cn(
        "flex items-start gap-3 border-b px-4 py-2.5 text-sm",
        LEVEL_STYLES[settings.announcement_level]
      )}
    >
      <Megaphone className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1 leading-relaxed">
        <p>{settings.announcement_message}</p>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium underline underline-offset-2"
          >
            Learn more
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, token);
          setManualDismiss(true);
        }}
        className="shrink-0 rounded p-1 opacity-70 transition hover:opacity-100"
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}