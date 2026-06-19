"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function ToolbarGroup({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className={ui.overline}>{label}</span>
      {children}
    </div>
  );
}