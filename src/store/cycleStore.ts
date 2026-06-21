"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createCloudPersistStorage } from "@/lib/persistStorage";
import type { CompoundCategory } from "@/data/compounds";
import { getCompoundById } from "@/data/compounds";
import { DEFAULT_DOSES, inferDefaultDose } from "@/data/frequencies";
import type { CycleCompound } from "@/lib/cycleTypes";
import { format } from "date-fns";

export type { CycleCompound };

interface CycleState {
  weeks: number;
  customWeeks: string;
  startDate: string;
  compounds: CycleCompound[];
  compoundModalOpen: boolean;
  configuringEntryId: string | null;
  compoundCategory: CompoundCategory;
  compoundSearch: string;
  dashboardTab: string;
  view: "planner" | "dashboard" | "guides";
  selectedGuideId: string | null;
  profileModalId: string | null;

  setWeeks: (weeks: number) => void;
  setCustomWeeks: (val: string) => void;
  setStartDate: (date: string) => void;
  addAndConfigure: (compoundId: string) => void;
  updateCompound: (entryId: string, updates: Partial<CycleCompound>) => void;
  removeCompound: (entryId: string) => void;
  setCompoundModalOpen: (open: boolean) => void;
  setConfiguringEntryId: (id: string | null) => void;
  setCompoundCategory: (cat: CompoundCategory) => void;
  setCompoundSearch: (search: string) => void;
  setDashboardTab: (tab: string) => void;
  setView: (view: "planner" | "dashboard" | "guides") => void;
  setSelectedGuideId: (id: string | null) => void;
  setProfileModalId: (id: string | null) => void;
  openProfile: (profileId: string) => void;
  openGuidesAt: (profileId: string) => void;
  loadTemplate: (compounds: Omit<CycleCompound, "id">[], weeks?: number) => void;
  duplicateCompound: (entryId: string, overrides?: Partial<CycleCompound>) => void;
  clearCycle: () => void;
  getEffectiveWeeks: () => number;
}

function todayISO() {
  return format(new Date(), "yyyy-MM-dd");
}

function newEntryId(compoundId: string) {
  return `${compoundId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function ensureCompoundIds(compounds: CycleCompound[]): CycleCompound[] {
  return compounds.map((c, i) => ({
    ...c,
    id: c.id || `${c.compoundId}-${i}-w${c.activeWeeks[0]}-${c.activeWeeks[1]}`,
  }));
}

export function clampCompoundsToWeeks(
  compounds: CycleCompound[],
  effectiveWeeks: number
): CycleCompound[] {
  return compounds.map((c) => {
    const start = Math.min(c.activeWeeks[0], effectiveWeeks);
    const end = Math.min(c.activeWeeks[1], effectiveWeeks);
    if (start > end) {
      return { ...c, activeWeeks: [effectiveWeeks, effectiveWeeks] as [number, number] };
    }
    return { ...c, activeWeeks: [start, end] };
  });
}

function makeDefaultCompound(compoundId: string, totalWeeks: number): CycleCompound | null {
  const compound = getCompoundById(compoundId);
  if (!compound) return null;
  const defaults = DEFAULT_DOSES[compoundId] ?? inferDefaultDose(compound);
  return {
    id: newEntryId(compoundId),
    compoundId,
    doseMg: defaults.doseMg,
    frequency: defaults.frequency,
    activeWeeks: [1, totalWeeks],
    route: compound.route,
  };
}

export const useCycleStore = create<CycleState>()(
  persist(
    (set, get) => ({
      weeks: 12,
      customWeeks: "",
      startDate: todayISO(),
      compounds: [],
      compoundModalOpen: false,
      configuringEntryId: null,
      compoundCategory: "anabolics",
      compoundSearch: "",
      dashboardTab: "timeline",
      view: "planner",
      selectedGuideId: null,
      profileModalId: null,

      setWeeks: (weeks) =>
        set((state) => ({
          weeks,
          customWeeks: "",
          compounds: clampCompoundsToWeeks(state.compounds, weeks),
        })),
      setCustomWeeks: (val) =>
        set((state) => {
          const custom = parseInt(val, 10);
          if (!(custom > 0)) return { customWeeks: val };
          return {
            customWeeks: val,
            compounds: clampCompoundsToWeeks(state.compounds, custom),
          };
        }),
      setStartDate: (date) => set({ startDate: date }),
      addAndConfigure: (compoundId) => {
        const entry = makeDefaultCompound(compoundId, get().getEffectiveWeeks());
        if (!entry) return;
        set({
          compounds: [...get().compounds, entry],
          configuringEntryId: entry.id,
          compoundModalOpen: false,
        });
      },
      updateCompound: (entryId, updates) =>
        set({
          compounds: get().compounds.map((c) =>
            c.id === entryId ? { ...c, ...updates } : c
          ),
        }),
      removeCompound: (entryId) =>
        set({
          compounds: get().compounds.filter((c) => c.id !== entryId),
          configuringEntryId:
            get().configuringEntryId === entryId ? null : get().configuringEntryId,
        }),
      setCompoundModalOpen: (open) =>
        set({ compoundModalOpen: open, compoundSearch: open ? get().compoundSearch : "" }),
      setConfiguringEntryId: (id) => set({ configuringEntryId: id }),
      setCompoundCategory: (cat) => set({ compoundCategory: cat }),
      setCompoundSearch: (search) => set({ compoundSearch: search }),
      setDashboardTab: (tab) => set({ dashboardTab: tab }),
      setView: (view) => set({ view }),
      setSelectedGuideId: (id) => set({ selectedGuideId: id }),
      setProfileModalId: (id) => set({ profileModalId: id }),
      openProfile: (profileId) => set({ profileModalId: profileId }),
      openGuidesAt: (profileId) =>
        set({ view: "guides", selectedGuideId: profileId, profileModalId: null }),
      loadTemplate: (compounds, weeks) =>
        set({
          compounds: ensureCompoundIds(compounds as CycleCompound[]),
          weeks: weeks ?? get().weeks,
          customWeeks: "",
          configuringEntryId: null,
          compoundModalOpen: false,
        }),
      duplicateCompound: (entryId, overrides) => {
        const source = get().compounds.find((c) => c.id === entryId);
        if (!source) return;
        const totalWeeks = get().getEffectiveWeeks();
        const mid = Math.min(
          totalWeeks,
          Math.max(source.activeWeeks[0] + 1, Math.ceil((source.activeWeeks[0] + source.activeWeeks[1]) / 2)),
        );
        const entry: CycleCompound = {
          ...source,
          id: newEntryId(source.compoundId),
          activeWeeks: overrides?.activeWeeks ?? ([mid, source.activeWeeks[1]] as [number, number]),
          doseMg: overrides?.doseMg ?? source.doseMg,
          frequency: overrides?.frequency ?? source.frequency,
          route: overrides?.route ?? source.route,
          compoundId: overrides?.compoundId ?? source.compoundId,
        };
        set({
          compounds: [...get().compounds, entry],
          configuringEntryId: entry.id,
        });
      },
      clearCycle: () => set({ compounds: [], configuringEntryId: null }),
      getEffectiveWeeks: () => {
        const { weeks, customWeeks } = get();
        const custom = parseInt(customWeeks, 10);
        return custom > 0 ? custom : weeks;
      },
    }),
    {
      name: "cycle-planner-store-v2",
      storage: createJSONStorage(() => createCloudPersistStorage("cycle")),
      partialize: (state) => ({
        weeks: state.weeks,
        customWeeks: state.customWeeks,
        startDate: state.startDate,
        compounds: state.compounds,
        dashboardTab: state.dashboardTab,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<CycleState> | undefined;
        const compounds = ensureCompoundIds(p?.compounds ?? current.compounds);
        return {
          ...current,
          ...p,
          compounds,
          configuringEntryId: p?.configuringEntryId ?? null,
        };
      },
    }
  )
);