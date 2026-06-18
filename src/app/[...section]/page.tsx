"use client";

import { AppShell } from "@/components/shell/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { HomeScreenPromptProvider } from "@/context/HomeScreenPromptContext";

/** Authenticated app routes (e.g. /labs/log, /settings). Home `/` is handled by app/page.tsx. */
export default function AppSectionPage() {
  return (
    <AuthGuard>
      <HomeScreenPromptProvider>
        <AppShell />
      </HomeScreenPromptProvider>
    </AuthGuard>
  );
}