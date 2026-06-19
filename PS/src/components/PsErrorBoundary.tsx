"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class PsErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("PS Content Maker error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full min-h-screen items-center justify-center p-6">
          <div className={cn(ui.card, ui.cardPad, "max-w-md space-y-3 text-center")}>
            <p className={ui.sectionTitle}>Something went wrong</p>
            <p className="text-sm text-[var(--muted)]">{this.state.error.message}</p>
            <button
              type="button"
              className={cn(ui.btnPrimary, "w-full justify-center")}
              onClick={() => {
                localStorage.removeItem("ps-maker-draft");
                localStorage.removeItem("ps-maker-settings");
                window.location.reload();
              }}
            >
              Clear saved data & reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}