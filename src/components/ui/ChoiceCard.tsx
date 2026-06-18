"use client";

import type { LucideIcon } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { AppIcon } from "@/components/ui/AppIcon";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";

type ChoiceCardAccent = "labs" | "protocol" | "intel";

const ICON_ACCENT: Record<ChoiceCardAccent, string> = {
  labs: "bg-[var(--labs-dim)] text-[var(--labs)]",
  protocol: "bg-[var(--protocol-dim)] text-[var(--protocol)]",
  intel: "bg-[var(--intel-dim)] text-[var(--intel)]",
};

interface ChoiceCardProps {
  variant?: "default" | "glass" | "labs" | "protocol" | "intel";
  icon: LucideIcon;
  iconAccent?: ChoiceCardAccent;
  title: string;
  description: string;
  footer: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ChoiceCard({
  variant = "glass",
  icon,
  iconAccent = "labs",
  title,
  description,
  footer,
  onClick,
  className,
}: ChoiceCardProps) {
  return (
    <Panel
      variant={variant}
      hover={!!onClick}
      className={cn(ui.choiceCard, onClick && "cursor-pointer", className)}
      onClick={onClick}
    >
      <div className={cn(ui.choiceCardIcon, ICON_ACCENT[iconAccent])}>
        <AppIcon icon={icon} />
      </div>
      <h3 className="font-display text-base font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-[var(--muted)]">{description}</p>
      <div className={ui.choiceCardFooter}>{footer}</div>
    </Panel>
  );
}