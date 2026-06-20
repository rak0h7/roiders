"use client";

import { AuthenticatedAppShell } from "@/components/app/AuthenticatedAppShell";

/** Authenticated app routes (e.g. /labs/log, /settings). Home `/` is handled by app/page.tsx. */
export default function AppSectionPage() {
  return <AuthenticatedAppShell />;
}