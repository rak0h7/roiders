"use client";

import { useState } from "react";
import { X, Trash2, BookOpen, Plus, TrendingUp } from "lucide-react";
import { useCycleStore } from "@/store/cycleStore";
import { getCompoundById } from "@/data/compounds";
import { getProfileForCompound } from "@/data/compoundProfiles";
import { FREQUENCY_OPTIONS } from "@/data/frequencies";
import type { CycleCompound, DosePhase } from "@/lib/cycleTypes";
import type { Compound } from "@/data/compounds";
import { formatDose } from "@/lib/cycleCalculations";
import { buildLinearRampPhases, mergeAdjacentPhases } from "@/lib/dosePhases";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";
import type { FrequencyPattern } from "@/data/frequencies";

function PhasePreview({
  totalWeeks,
  phases,
  color,
}: {
  totalWeeks: number;
  phases: DosePhase[];
  color: string;
}) {
  const maxDose = Math.max(...phases.map((p) => p.doseMg), 1);
  return (
    <div className="space-y-1.5">
      <p className={ui.label}>Dose schedule preview</p>
      <div className="relative h-10 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)]">
        {phases.map((phase, i) => {
          const left = ((phase.startWeek - 1) / totalWeeks) * 100;
          const width = ((phase.endWeek - phase.startWeek + 1) / totalWeeks) * 100;
          const heightPct = 30 + (phase.doseMg / maxDose) * 70;
          return (
            <div
              key={`${phase.startWeek}-${phase.endWeek}-${i}`}
              className="absolute bottom-0 rounded-t-[var(--radius-sm)]"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                height: `${heightPct}%`,
                background: color,
                opacity: 0.55 + (phase.doseMg / maxDose) * 0.45,
              }}
              title={`W${phase.startWeek}–${phase.endWeek}: ${phase.doseMg}`}
            />
          );
        })}
      </div>
      <p className="text-[10px] text-[var(--muted-2)]">
        {phases.length} phase{phases.length !== 1 ? "s" : ""} across {totalWeeks} weeks
      </p>
    </div>
  );
}

function ConfigureForm({
  entry,
  compound,
  totalWeeks,
  onSave,
  onRemove,
}: {
  entry: CycleCompound;
  compound: Compound;
  totalWeeks: number;
  onSave: (updates: Partial<CycleCompound>) => void;
  onRemove: () => void;
}) {
  const [frequency, setFrequency] = useState<FrequencyPattern>(entry.frequency);
  const [phases, setPhases] = useState<DosePhase[]>(
    (entry.dosePhases ?? [{ startWeek: entry.activeWeeks[0], endWeek: entry.activeWeeks[1], doseMg: entry.doseMg }]).map(
      (p) => ({ ...p }),
    ),
  );
  const [rampEndDose, setRampEndDose] = useState("");
  const [rampStepWeeks, setRampStepWeeks] = useState("4");

  const updatePhase = (index: number, patch: Partial<DosePhase>) => {
    setPhases((prev) =>
      mergeAdjacentPhases(
        prev.map((p, i) => (i === index ? { ...p, ...patch } : p)),
      ),
    );
  };

  const addPhase = () => {
    const last = phases[phases.length - 1];
    const start = last ? Math.min(totalWeeks, last.endWeek + 1) : 1;
    if (start > totalWeeks) return;
    setPhases((prev) =>
      mergeAdjacentPhases([
        ...prev,
        { startWeek: start, endWeek: totalWeeks, doseMg: last?.doseMg ?? entry.doseMg },
      ]),
    );
  };

  const removePhase = (index: number) => {
    if (phases.length <= 1) return;
    setPhases((prev) => prev.filter((_, i) => i !== index));
  };

  const applyLinearRamp = () => {
    const endDose = parseFloat(rampEndDose);
    const stepWeeks = parseInt(rampStepWeeks, 10);
    const start = phases[0]?.startWeek ?? 1;
    const end = phases[phases.length - 1]?.endWeek ?? totalWeeks;
    const startDose = phases[0]?.doseMg ?? entry.doseMg;
    if (isNaN(endDose) || endDose <= 0 || !(stepWeeks > 0)) return;
    setPhases(buildLinearRampPhases(start, end, startDose, endDose, stepWeeks));
  };

  const handleSave = () => {
    const normalized = mergeAdjacentPhases(
      phases
        .map((p) => ({
          startWeek: Math.max(1, Math.min(p.startWeek, totalWeeks)),
          endWeek: Math.max(1, Math.min(p.endWeek, totalWeeks)),
          doseMg: p.doseMg,
        }))
        .filter((p) => p.startWeek <= p.endWeek && p.doseMg > 0),
    );
    if (normalized.length === 0) return;
    onSave({ frequency, dosePhases: normalized });
  };

  return (
    <>
      <div className="max-h-[min(70vh,32rem)] space-y-4 overflow-y-auto pr-1">
        <div className="space-y-2">
          <label className={ui.label}>Frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as FrequencyPattern)}
            className={ui.input}
          >
            {FREQUENCY_OPTIONS.map((f) => (
              <option key={f.id} value={f.pattern}>
                {f.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-[var(--muted)]">{compound.dosageInfo}</p>
        </div>

        <div className="space-y-2">
          <div className={ui.rowBetween}>
            <label className={ui.label}>Dose phases</label>
            <button type="button" onClick={addPhase} className={cn(ui.btnGhost, "gap-1 text-xs")}>
              <Plus className="h-3.5 w-3.5" />
              Add phase
            </button>
          </div>
          <div className="space-y-2">
            {phases.map((phase, index) => (
              <div
                key={`phase-${index}`}
                className={cn(ui.cardInner, "grid grid-cols-2 gap-2 p-3 sm:grid-cols-4")}
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-medium uppercase text-[var(--muted)]">From</label>
                  <input
                    type="number"
                    min={1}
                    max={totalWeeks}
                    value={phase.startWeek}
                    onChange={(e) => updatePhase(index, { startWeek: parseInt(e.target.value, 10) || 1 })}
                    className={ui.input}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium uppercase text-[var(--muted)]">Until</label>
                  <input
                    type="number"
                    min={1}
                    max={totalWeeks}
                    value={phase.endWeek}
                    onChange={(e) => updatePhase(index, { endWeek: parseInt(e.target.value, 10) || totalWeeks })}
                    className={ui.input}
                  />
                </div>
                <div className="col-span-2 space-y-1 sm:col-span-1">
                  <label className="text-[10px] font-medium uppercase text-[var(--muted)]">
                    Dose ({compound.unit})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={phase.doseMg}
                    onChange={(e) => updatePhase(index, { doseMg: parseFloat(e.target.value) || 0 })}
                    className={ui.input}
                  />
                </div>
                <div className="col-span-2 flex items-end justify-end sm:col-span-1">
                  <button
                    type="button"
                    disabled={phases.length <= 1}
                    onClick={() => removePhase(index)}
                    className={cn(ui.btnIconSm, "disabled:opacity-30", ui.statDanger)}
                    title="Remove phase"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="col-span-2 text-[10px] text-[var(--muted-2)] sm:col-span-4">
                  W{phase.startWeek}–{phase.endWeek}: {formatDose(phase.doseMg, compound.unit)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className={cn(ui.cardInner, "space-y-3 p-3")}>
          <p className="text-xs font-semibold text-[var(--foreground)]">
            <TrendingUp className="mr-1 inline h-3.5 w-3.5 text-[var(--protocol)]" />
            Linear titration preset
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-medium uppercase text-[var(--muted)]">
                Target dose ({compound.unit})
              </label>
              <input
                type="number"
                step="any"
                placeholder={String(Math.round((phases[0]?.doseMg ?? entry.doseMg) * 1.5))}
                value={rampEndDose}
                onChange={(e) => setRampEndDose(e.target.value)}
                className={ui.input}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium uppercase text-[var(--muted)]">Step every (wk)</label>
              <input
                type="number"
                min={1}
                value={rampStepWeeks}
                onChange={(e) => setRampStepWeeks(e.target.value)}
                className={ui.input}
              />
            </div>
          </div>
          <button type="button" onClick={applyLinearRamp} className={cn(ui.btnSecondary, "w-full text-xs")}>
            Apply ramp to phases
          </button>
        </div>

        <PhasePreview totalWeeks={totalWeeks} phases={phases} color={compound.color} />
      </div>

      <div className="mt-6 flex items-center gap-2">
        <button onClick={handleSave} className={`flex-1 ${ui.btnProtocol}`}>
          Save
        </button>
        <button
          onClick={onRemove}
          className={cn(ui.btnSecondary, "gap-1.5 text-xs font-bold uppercase", ui.statDanger)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>
    </>
  );
}

export function CompoundConfigureModal() {
  const {
    configuringEntryId,
    setConfiguringEntryId,
    compounds,
    updateCompound,
    removeCompound,
    getEffectiveWeeks,
    openProfile,
  } = useCycleStore();

  const entry = compounds.find((c) => c.id === configuringEntryId);
  const compound = entry ? getCompoundById(entry.compoundId) : null;
  const profile = entry ? getProfileForCompound(entry.compoundId) : null;

  if (!configuringEntryId || !compound || !entry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-base)]/80 p-4 backdrop-blur-sm">
      <div className={`w-full max-w-lg ${ui.cardProtocol} ${ui.cardPad} shadow-2xl`}>
        <div className={`${ui.rowBetween} mb-5`}>
          <div>
            <p className={ui.label}>Configure</p>
            <h2 className="text-lg font-bold text-[var(--foreground)]">{compound.name}</h2>
          </div>
          <button onClick={() => setConfiguringEntryId(null)} className={ui.btnIcon}>
            <X className="h-5 w-5" />
          </button>
        </div>
        {profile && (
          <button
            type="button"
            onClick={() => openProfile(profile.id)}
            className={cn(ui.btnGhost, "mb-4 w-full gap-2 text-xs text-[var(--protocol)]")}
          >
            <BookOpen className="h-3.5 w-3.5" />
            View full compound profile
          </button>
        )}
        <ConfigureForm
          key={configuringEntryId}
          entry={entry}
          compound={compound}
          totalWeeks={getEffectiveWeeks()}
          onSave={(updates) => {
            updateCompound(configuringEntryId, updates);
            setConfiguringEntryId(null);
          }}
          onRemove={() => {
            removeCompound(configuringEntryId);
            setConfiguringEntryId(null);
          }}
        />
      </div>
    </div>
  );
}