"use client";

import Link from "next/link";
import { ExternalLink, Wrench } from "lucide-react";
import { Background } from "@/components/Background";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export default function MaintenancePage() {
  const { settings } = useSiteConfig();
  const supportUrl = settings.support_url?.trim();

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className={cn(ui.card, ui.cardPad, "max-w-md text-center")}>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] border border-[var(--warning)]/30 bg-[var(--warning)]/10">
            <Wrench className="h-6 w-6 text-[var(--warning)]" />
          </div>
          <h1 className="font-display text-2xl font-bold text-gradient">{settings.site_name}</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            {settings.maintenance_message}
          </p>
          <Link href="/auth/login" className={cn(ui.btnSecondary, "mt-6 w-full")}>
            Sign in
          </Link>
          {supportUrl && (
            <a
              href={supportUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(ui.btnGhost, "mt-3 w-full justify-center text-sm")}
            >
              Contact support
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}