"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CycleTabNav } from "@/components/CycleTabNav";
import { CycleSourcesView } from "@/components/planner/CycleSourcesView";
import { PremiumFeatureModal } from "@/components/ui/PremiumFeatureModal";
import { useAuth } from "@/context/AuthContext";
import { useNavigation } from "@/context/NavigationContext";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { Panel } from "@/components/ui/Panel";
import { ui } from "@/lib/ui";

export function CycleSourcesShell() {
  const { premiumSyncEnabled } = useAuth();
  const { settings } = useSiteConfig();
  const { setRoute } = useNavigation();
  const sourcesAvailable = settings.premium_sources_enabled;
  const hasAccess = sourcesAvailable && premiumSyncEnabled;
  const [showPremiumModal, setShowPremiumModal] = useState(!hasAccess);

  return (
    <div>
      <CycleTabNav />
      {!sourcesAvailable ? (
        <Panel className={cn(ui.cardPad, "text-sm text-[var(--muted)]")}>
          The sources directory is disabled site-wide. Contact the site owner if you need access.
        </Panel>
      ) : null}
      {hasAccess ? <CycleSourcesView /> : null}
      <PremiumFeatureModal
        open={showPremiumModal && !hasAccess && sourcesAvailable}
        onClose={() => {
          setShowPremiumModal(false);
          setRoute("cycle-planner");
        }}
        feature="Sources"
      />
    </div>
  );
}