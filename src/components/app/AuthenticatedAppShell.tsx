"use client";

import { AppSectionGate } from "@/components/app/AppSectionGate";
import { AppShell } from "@/components/shell/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { HomeScreenPromptProvider } from "@/context/HomeScreenPromptContext";

/** Shared authenticated shell for in-app routes and signed-in article pages. */
export function AuthenticatedAppShell() {
  return (
    <AuthGuard>
      <AppSectionGate>
        <HomeScreenPromptProvider>
          <AppShell />
        </HomeScreenPromptProvider>
      </AppSectionGate>
    </AuthGuard>
  );
}