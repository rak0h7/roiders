"use client";

import { Sliders } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useGymStore } from "@/store/gymStore";
import { SegmentButton } from "@/components/ui/ModuleTabButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function InterfaceSettings() {
  const { defaultRestSeconds, weightUnit, setDefaultRestSeconds, setWeightUnit } = useGymStore();

  return (
    <div className={cn(ui.card, ui.cardPad, "space-y-6")}>
      <div className="flex items-start gap-3">
        <div className="flex h-[var(--control-height)] w-[var(--control-height)] shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--intel)]/30 bg-[var(--intel-dim)]">
          <AppIcon icon={Sliders} className="text-[var(--intel)]" />
        </div>
        <div>
          <h3 className={ui.sectionTitle}>Module defaults</h3>
          <p className={ui.sectionSub}>Per-module preferences that persist across sessions.</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <p className={cn(ui.overline, "mb-3")}>Training</p>
          <div className="space-y-4">
            <div className={ui.rowBetween}>
              <div>
                <p className="text-sm text-[var(--foreground)]">Weight unit</p>
                <p className={ui.sectionSub}>Display unit for lifts and volume</p>
              </div>
              <div className="flex gap-2">
                {(["lb", "kg"] as const).map((unit) => (
                  <SegmentButton
                    key={unit}
                    active={weightUnit === unit}
                    onClick={() => setWeightUnit(unit)}
                    accent="protocol"
                  >
                    {unit}
                  </SegmentButton>
                ))}
              </div>
            </div>
            <div>
              <div className={ui.rowBetween}>
                <span className="text-sm text-[var(--foreground)]">Default rest timer</span>
                <span className="font-mono text-xs text-[var(--muted)]">{defaultRestSeconds}s</span>
              </div>
              <input
                type="range"
                min={30}
                max={300}
                step={15}
                value={defaultRestSeconds}
                onChange={(e) => setDefaultRestSeconds(Number(e.target.value))}
                className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--bg-hover)] accent-[var(--protocol)]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}