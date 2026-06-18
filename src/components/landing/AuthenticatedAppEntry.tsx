"use client";

import { AppShell } from "@/components/shell/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { HomeScreenPromptProvider } from "@/context/HomeScreenPromptContext";

export function AuthenticatedAppEntry() {
  return (
    <AuthGuard>
      <HomeScreenPromptProvider>
        <AppShell />
      </HomeScreenPromptProvider>
    </AuthGuard>
  );
}