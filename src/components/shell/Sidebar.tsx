"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Archive, Apple, BarChart2, Blocks, BookOpen, ChevronLeft, ClipboardList, Compass,
  Dumbbell, FlaskConical, History, Leaf, Library, Link2, Search, Settings2, Shield, Smartphone, Spline,
  Target, TrendingUp, UtensilsCrossed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useNavigation, type AppRoute, type NavItem } from "@/context/NavigationContext";
import { visibleNavItems } from "@/lib/navVisibility";
import { AddToHomeScreenModal } from "@/components/ui/AddToHomeScreenModal";
import { AppIcon } from "@/components/ui/AppIcon";
import { isMobileDevice } from "@/lib/device";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  compass: Compass,
  flask: FlaskConical,
  archive: Archive,
  chart: BarChart2,
  blocks: Blocks,
  book: BookOpen,
  waveform: Spline,
  sources: Link2,
  dumbbell: Dumbbell,
  clipboard: ClipboardList,
  history: History,
  trending: TrendingUp,
  library: Library,
  utensils: UtensilsCrossed,
  "search-food": Search,
  leaf: Leaf,
  target: Target,
  apple: Apple,
  sliders: Settings2,
};

const GROUPS: { id: NavItem["group"]; label: string }[] = [
  { id: "overview", label: "" },
  { id: "labs", label: "Labs" },
  { id: "protocol", label: "Gear" },
  { id: "training", label: "Training" },
  { id: "nutrition", label: "Nutrition" },
  { id: "misc", label: "Misc" },
];

const ACCENT_BAR: Record<NavItem["accent"], string> = {
  labs: "bg-[var(--accent)]",
  protocol: "bg-[var(--accent-soft)]",
  intel: "bg-[var(--accent-tertiary)]",
  neutral: "bg-[var(--muted)]",
};

const ACCENT_TEXT: Record<NavItem["accent"], string> = {
  labs: "text-[var(--accent)]",
  protocol: "text-[var(--accent-soft)]",
  intel: "text-[var(--accent-tertiary)]",
  neutral: "text-[var(--muted)]",
};

export function Sidebar() {
  const { route, setRoute, sidebarCollapsed, toggleSidebar } = useNavigation();
  const { isAdmin, isVendor } = useAuth();
  const { settings } = useSiteConfig();
  const navItems = visibleNavItems(settings);
  const siteInitial = settings.site_name.trim().charAt(0).toUpperCase() || "R";
  const [showMobile, setShowMobile] = useState(false);
  const [homeScreenOpen, setHomeScreenOpen] = useState(false);

  useEffect(() => {
    setShowMobile(isMobileDevice());
  }, []);

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 68 : 248 }}
      transition={{ type: "spring", stiffness: 380, damping: 36 }}
      className="glass fixed left-0 top-0 z-40 hidden h-screen flex-col border-r lg:flex"
    >
      <div className="flex h-[60px] items-center gap-3 px-4">
        <div
          className="relative flex h-[var(--control-height-sm)] w-[var(--control-height-sm)] shrink-0 items-center justify-center rounded-[var(--radius-md)]"
          style={{ background: "var(--gradient-primary)", boxShadow: "0 4px 16px var(--labs-glow)" }}
        >
          <span className="font-display text-sm font-bold text-white">{siteInitial}</span>
        </div>
        {!sidebarCollapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="font-display text-[15px] font-semibold text-gradient">{settings.site_name}</p>
            <p className="text-xs text-[var(--muted)]">{settings.site_tagline}</p>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-2">
        {GROUPS.map(({ id, label }) => {
          const items = navItems.filter((n) => n.group === id);
          if (!items.length) return null;
          return (
            <div key={id}>
              {!sidebarCollapsed && label && (
                <p className={cn(ui.overline, "mb-2 px-3 text-[var(--muted-2)]")}>{label}</p>
              )}
              <ul className="space-y-0.5">
                {id === "misc" && showMobile && (
                  <li>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setHomeScreenOpen(true)}
                      title={sidebarCollapsed ? "Add to Home Screen" : undefined}
                      className={cn(
                        ui.navItem,
                        "text-[var(--muted)] hover:bg-[var(--bg-hover)]/60 hover:text-[var(--foreground)]"
                      )}
                    >
                      <span className="text-[var(--muted-2)] group-hover:text-[var(--intel)]">
                        <AppIcon icon={Smartphone} size="sm" />
                      </span>
                      {!sidebarCollapsed && <span className="font-medium">Add to Home Screen</span>}
                    </motion.button>
                  </li>
                )}
                {items.map((item) => {
                  const active = route === item.id;
                  const Icon = ICONS[item.icon] ?? Compass;
                  return (
                    <li key={item.id}>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setRoute(item.id as AppRoute)}
                        title={sidebarCollapsed ? item.label : undefined}
                        className={cn(
                          ui.navItem,
                          active
                            ? "glass-panel text-[var(--foreground)]"
                            : "text-[var(--muted)] hover:bg-[var(--bg-hover)]/60 hover:text-[var(--foreground)]"
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="nav-accent"
                            className={cn("absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full", ACCENT_BAR[item.accent])}
                          />
                        )}
                        <span className={cn(active ? ACCENT_TEXT[item.accent] : "text-[var(--muted-2)] group-hover:" + ACCENT_TEXT[item.accent])}>
                          <AppIcon icon={Icon} size="sm" />
                        </span>
                        {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                      </motion.button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {(isAdmin || isVendor) && (
        <div className="border-t border-[var(--border)] px-3 py-2">
          <Link
            href="/admin"
            title={sidebarCollapsed ? (isAdmin ? "Site Admin" : "Vendor Portal") : undefined}
            className={cn(
              ui.navItem,
              isAdmin
                ? "text-[var(--labs)] hover:bg-[var(--labs-dim)]"
                : "text-[var(--protocol)] hover:bg-[var(--protocol-dim)]",
            )}
          >
            <AppIcon icon={Shield} size="sm" />
            {!sidebarCollapsed && (isAdmin ? "Site Admin" : "Vendor Portal")}
          </Link>
        </div>
      )}

      <div className="border-t border-[var(--border)] p-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className={cn(ui.btnGhost, "w-full justify-center text-xs")}
        >
          <span className={cn("inline-flex", sidebarCollapsed && "rotate-180")}>
            <AppIcon icon={ChevronLeft} size="sm" />
          </span>
          {!sidebarCollapsed && "Collapse"}
        </button>
      </div>

      <AddToHomeScreenModal open={homeScreenOpen} onClose={() => setHomeScreenOpen(false)} />
    </motion.aside>
  );
}