"use client";

import { useMemo } from "react";
import { Copy, Pencil, Plus, TrendingUp, Trash2 } from "lucide-react";
import { useCycleStore } from "@/store/cycleStore";
import { getCompoundById } from "@/data/compounds";
import { frequencyLabel } from "@/data/frequencies";
import { entryLabel, formatDoseRange, formatWeeklyDose } from "@/lib/cycleCalculations";
import { AppIcon } from "@/components/ui/AppIcon";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

export function ActiveStack() {
  const {
    compounds,
    setCompoundModalOpen,
    setConfiguringEntryId,
    removeCompound,
    duplicateCompound,
    splitDosePhase,
    getEffectiveWeeks,
    clearCycle,
  } = useCycleStore();

  const duplicateCompoundIds = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of compounds) {
      counts.set(c.compoundId, (counts.get(c.compoundId) ?? 0) + 1);
    }
    return new Set([...counts.entries()].filter(([, n]) => n > 1).map(([id]) => id));
  }, [compounds]);

  const totalWeeks = getEffectiveWeeks();

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
            const hasDuplicate = duplicateCompoundIds.has(cc.compoundId);
            const phaseCount = cc.dosePhases?.length ?? 1;
            const titrationWeek = Math.min(
              totalWeeks,
              Math.max(cc.activeWeeks[0] + 1, Math.ceil((cc.activeWeeks[0] + cc.activeWeeks[1]) / 2)),
            );
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
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                    {hasDuplicate ? entryLabel(cc) : compound.name}
                    {phaseCount > 1 ? (
                      <span className="ml-1.5 text-[10px] font-medium text-[var(--protocol)]">
                        {phaseCount} phases
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {formatDoseRange(cc, compound.unit)} • {frequencyLabel(cc.frequency)} • {formatWeeklyDose(cc)} • Wk {cc.activeWeeks[0]}–{cc.activeWeeks[1]}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    title="Add titration step"
                    onClick={() => {
                      splitDosePhase(
                        cc.id,
                        titrationWeek,
                        Math.round(cc.doseMg * 1.5 * 10) / 10,
                      );
                    }}
                    className={ui.btnIconSm}
                  >
                    <AppIcon icon={TrendingUp} size="sm" />
                  </button>
                  <button
                    type="button"
                    title="Duplicate entry"
                    onClick={() => duplicateCompound(cc.id)}
                    className={ui.btnIconSm}
                  >
                    <AppIcon icon={Copy} size="sm" />
                  </button>
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