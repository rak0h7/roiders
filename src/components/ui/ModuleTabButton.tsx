"use client";

import { TabNav } from "@/components/ui/TabNav";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function ModuleTabBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabNav>
      <nav className={cn("glass inline-flex shrink-0 gap-1 rounded-full p-1", className)}>{children}</nav>
    </TabNav>
  );
}

export function ModuleTabButton({
  active,
  disabled,
  onClick,
  children,
  accent = "protocol",
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  accent?: "protocol" | "labs";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        active
          ? accent === "labs"
            ? ui.pillActive
            : ui.pillProtocolActive
          : ui.tabInactive,
        disabled && "cursor-not-allowed opacity-35"
      )}
    >
      {children}
    </button>
  );
}

export function SegmentButton({
  active,
  onClick,
  children,
  accent = "labs",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  accent?: "labs" | "protocol";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        ui.segment,
        active
          ? accent === "protocol"
            ? ui.segmentActiveProtocol
            : ui.segmentActiveLabs
          : ui.segmentInactive
      )}
    >
      {children}
    </button>
  );
}