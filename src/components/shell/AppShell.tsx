"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Background } from "@/components/Background";
import { CheatSheet } from "@/components/CheatSheet";
import { ComparisonView } from "@/components/ComparisonView";
import { CyclePlannerView } from "@/components/CyclePlannerView";
import { CycleTabNav } from "@/components/CycleTabNav";
import { CycleSourcesShell } from "@/components/CycleSourcesShell";
import { DebugPanel } from "@/components/DebugPanel";
import { LabsWorkspace } from "@/components/labs/LabsWorkspace";
import { LabsTabNav } from "@/components/labs/LabsTabNav";
import { UnifiedDashboard } from "@/components/home/UnifiedDashboard";
import { SettingsView } from "@/components/settings/SettingsView";
import { GymView } from "@/components/GymView";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useNavigation } from "@/context/NavigationContext";
import { articleSlugFromPathname } from "@/lib/appRoutes";
import { usePathname } from "next/navigation";
import { firstEnabledRoute } from "@/lib/navVisibility";
import { useApp } from "@/context/AppContext";
import { useSettings } from "@/context/SettingsContext";
import { CONTENT_WIDTH_CLASS } from "@/lib/themes";
import { useCycleStore } from "@/store/cycleStore";
import { useGymStore } from "@/store/gymStore";

import { ArticlesView } from "@/components/articles/ArticlesView";
import { EmptyState } from "@/components/ui/EmptyState";
import { Blocks } from "lucide-react";
import { ui } from "@/lib/ui";
import { Sidebar } from "./Sidebar";
import { SiteAnnouncement } from "./SiteAnnouncement";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";
import { CommandPalette } from "./CommandPalette";
import { cn } from "@/lib/utils";

function CyclePlannerShell() {
  return (
    <div>
      <CycleTabNav />
      <div className="mt-6">
        <CyclePlannerView />
      </div>
    </div>
  );
}

export function AppShell() {
  const pathname = usePathname();
  const articleSlug = articleSlugFromPathname(pathname);
  const { route, sidebarCollapsed, setRoute, setSidebarCollapsed } = useNavigation();
  const { settings, routeEnabled } = useSiteConfig();
  const { secondaryTab, setSecondaryTab, showComparison, logView, setMainTab } = useApp();
  const { reducedMotion, theme, compactSidebar } = useSettings();
  const pageTransitionDuration = reducedMotion
    ? 0
    : Math.max(0.08, 0.38 - (theme.pageTransitionSpeed / 100) * 0.3);
  const { setView, compounds } = useCycleStore();
  const { setGymView } = useGymStore();
  useEffect(() => {
    setSidebarCollapsed(compactSidebar);
  }, [compactSidebar, setSidebarCollapsed]);

  useEffect(() => {
    if (!routeEnabled(route)) {
      setRoute(firstEnabledRoute(settings));
    }
  }, [route, routeEnabled, settings, setRoute]);

  useEffect(() => {
    if (route === "bloodwork-log") setMainTab("log");
    if (route === "bloodwork-insights") setMainTab("insights");
    if (route === "cycle-planner") setView("planner");
    if (route === "cycle-guides") setView("guides");
    if (route === "cycle-dashboard") setView("dashboard");
    if (route === "gym-workout") setGymView("workout");
    if (route === "gym-routines") setGymView("routines");
    if (route === "gym-history") setGymView("history");
    if (route === "gym-progress") setGymView("progress");
    if (route === "gym-exercises") setGymView("exercises");
  }, [route, setMainTab, setView, setGymView]);

  const renderContent = () => {
    switch (route) {
      case "home":
        return <UnifiedDashboard />;
      case "bloodwork-log":
        return <LabsWorkspace mode="log" />;
      case "bloodwork-insights":
        return showComparison ? <ComparisonView /> : <LabsWorkspace mode="analysis" />;
      case "cycle-planner":
      case "cycle-guides":
        return <CyclePlannerShell />;
      case "cycle-sources":
        return <CycleSourcesShell />;
      case "cycle-dashboard":
        if (compounds.length === 0) {
          return (
            <EmptyState
              icon={Blocks}
              variant="protocol"
              title="No gear to simulate"
              description="Add compounds in the builder first to unlock calendar views, saturation curves, and risk analytics."
              action={
                <button onClick={() => setRoute("cycle-planner")} className={ui.btnProtocol}>
                  Open Builder
                </button>
              }
            />
          );
        }
        return <CyclePlannerShell />;
      case "gym-workout":
      case "gym-routines":
      case "gym-history":
      case "gym-progress":
      case "gym-exercises":
        return <GymView />;
      case "articles":
        return <ArticlesView />;
      case "settings":
        return <SettingsView />;
      default:
        return <UnifiedDashboard />;
    }
  };

  const showLabsTabs = route.startsWith("bloodwork");

  return (
    <div className="relative min-h-screen">
      <Background />
      <Sidebar />
      <div
        className={cn(
          "relative z-10 flex min-h-screen min-w-0 flex-col overflow-x-hidden transition-[padding] duration-300",
          sidebarCollapsed ? "lg:pl-[68px]" : "lg:pl-[248px]"
        )}
      >
        <TopBar />
        <SiteAnnouncement />
        <main className="app-main-with-mobile-nav flex-1 px-3 py-5 sm:px-6 sm:py-6 lg:pb-8">
          <div className={cn("mx-auto w-full min-w-0 max-w-full px-0", CONTENT_WIDTH_CLASS[theme.contentWidth])}>
            {showLabsTabs && <LabsTabNav />}
            <AnimatePresence mode="wait">
              <motion.div
                key={route + (articleSlug ? `-${articleSlug}` : "") + (logView) + (showComparison ? "-cmp" : "")}
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: pageTransitionDuration, ease: "easeOut" }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      <MobileNav />
      <CommandPalette />

      {secondaryTab === "cheat-sheet" && (
        <CheatSheet onClose={() => setSecondaryTab(null)} />
      )}
      {secondaryTab === "debug" && settings.debug_panel_enabled && (
        <DebugPanel onClose={() => setSecondaryTab(null)} />
      )}

    </div>
  );
}