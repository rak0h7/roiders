"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCycleStore } from "@/store/cycleStore";
import { getCompoundById } from "@/data/compounds";
import { frequencyLabel } from "@/data/frequencies";
import { formatDose, formatWeeklyDose } from "@/lib/cycleCalculations";
import { AppIcon } from "@/components/ui/AppIcon";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function ActiveStack() {
  const {
    compounds,
    setCompoundModalOpen,
    setConfiguringEntryId,
    removeCompound,
    clearCycle,
  } = useCycleStore();

  return (
    <div className={`${ui.cardProtocol} ${ui.cardPad}`}>
      <div className={`${ui.rowBetween} mb-4 flex-wrap`}>
        <div>
          <h3 className={ui.sectionTitle}>Active Stack</h3>
          <p className={ui.sectionSub}>
            {compounds.length === 0
              ? "No compounds added yet"
              : `${compounds.length} compound${compounds.length !== 1 ? "s" : ""} configured`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {compounds.length > 0 && (
            <button type="button" onClick={clearCycle} className={cn(ui.btnToolbar, "uppercase", ui.statDanger)}>
              Clear All
            </button>
          )}
          <button type="button" onClick={() => setCompoundModalOpen(true)} className={cn(ui.btnProtocolSm, "rounded-full")}>
            <AppIcon icon={Plus} size="sm" />
            Add
          </button>
        </div>
      </div>

      {compounds.length === 0 ? (
        <div className="flex min-h-[5rem] items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)]">
          <p className="text-sm text-[var(--muted)]">Browse compounds or pick a template to build your cycle.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {compounds.map((cc) => {
            const compound = getCompoundById(cc.compoundId);
            if (!compound) return null;
            return (
              <div
                key={cc.id}
                className={cn(ui.cardInner, ui.cardHover, "flex items-center gap-3 p-3 hover:border-[var(--protocol)]/25")}
              >
                <div
                  className="h-[var(--control-height-sm)] w-1 shrink-0 self-stretch rounded-full"
                  style={{ background: compound.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">{compound.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {formatDose(cc.doseMg, compound.unit)} • {frequencyLabel(cc.frequency)} • {formatWeeklyDose(cc)} • Wk {cc.activeWeeks[0]}–{cc.activeWeeks[1]}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setConfiguringEntryId(cc.id)}
                    className={ui.btnIconSm}
                  >
                    <AppIcon icon={Pencil} size="sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCompound(cc.id)}
                    className={cn(ui.btnIconSm, "hover:text-[var(--danger)]")}
                  >
                    <AppIcon icon={Trash2} size="sm" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}