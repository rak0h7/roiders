"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppIconProps {
  icon: LucideIcon;
  className?: string;
  size?: "default" | "sm";
}

export function AppIcon({ icon: Icon, className, size = "default" }: AppIconProps) {
  return (
    <Icon
      className={cn("app-icon", size === "sm" && "app-icon--sm", className)}
      strokeWidth={1.75}
      aria-hidden
    />
  );
}