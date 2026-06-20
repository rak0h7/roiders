"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CLOUD_SYNC_EVENT, labsModuleChanged, type CloudSyncEventDetail } from "@/lib/storeRehydrate";
import { annotateExtractedHistorical, parseCSV, parseLabText } from "@/lib/parser";
import { extractTextFromImages } from "@/lib/ocr";
import { isLabCsv, isLabImage, isLabPdf, normalizeLabUpload } from "@/lib/labUpload";
import { extractTextFromPDF } from "@/lib/pdf";
import { buildMergedReviewFlags } from "@/lib/cycleLabFlags";
import { useCycleStore } from "@/store/cycleStore";
import { calculateCategoryScores, calculateOverallScore } from "@/lib/scoring";
import {
  generateId,
  hasUnsavedLabEdits,
  hydrateLabsState,
  loadReports,
  reportToValuesRecord,
  saveReports,
} from "@/lib/storage";
import type {
  AppState,
  BloodworkReport,
  MainTab,
  MarkerValue,
  SecondaryTab,
} from "@/lib/types";

interface AppContextValue extends AppState {
  setMainTab: (tab: MainTab) => void;
  setLogView: (view: AppState["logView"]) => void;
  setSecondaryTab: (tab: SecondaryTab) => void;
  setMarkerValue: (markerId: string, value: number | null, unit: string) => void;
  setCurrentValues: (values: Record<string, MarkerValue>) => void;
  parseAndExtract: (text: string, fileName?: string) => void;
  handleFileUpload: (input: File | File[]) => Promise<void>;
  toggleExtracted: (id: string) => void;
  selectAllCurrent: () => void;
  selectAbnormalOnly: () => void;
  selectConvertedOnly: () => void;
  deselectAll: () => void;
  applySelected: () => void;
  saveReport: (name?: string) => void;
  loadReport: (id: string) => void;
  startNewLabPanel: () => void;
  deleteReport: (id: string) => void;
  resetAll: () => void;
  setCompareReports: (a: string | null, b: string | null) => void;
  setShowComparison: (show: boolean) => void;
  reviewFlags: ReturnType<typeof buildMergedReviewFlags>;
  categoryScores: ReturnType<typeof calculateCategoryScores>;
  overallScore: ReturnType<typeof calculateOverallScore>;
  activeReport: BloodworkReport | null;
}

const AppContext = createContext<AppContextValue | null>(null);

const initialState: AppState = {
  mainTab: "log",
  logView: "landing",
  secondaryTab: null,
  currentValues: {},
  extractedMarkers: [],
  extractionFileName: "",
  reports: [],
  activeReportId: null,
  compareReportIds: [null, null],
  showComparison: false,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const compounds = useCycleStore((s) => s.compounds);
  const [state, setState] = useState<AppState>(() => {
    const reports = loadReports();
    const hydrated = hydrateLabsState(reports, null);
    return {
      ...initialState,
      reports,
      currentValues: hydrated.currentValues,
      activeReportId: hydrated.activeReportId,
    };
  });

  useEffect(() => {
    const reload = (event: Event) => {
      const detail = (event as CustomEvent<CloudSyncEventDetail>).detail;
      if (!labsModuleChanged(detail)) return;

      setState((s) => {
        const reports = loadReports();
        const activeStillExists = s.activeReportId
          ? reports.some((r) => r.id === s.activeReportId)
          : reports.length === 0;

        if (s.activeReportId && activeStillExists && hasUnsavedLabEdits(s.currentValues, reports, s.activeReportId)) {
          return { ...s, reports };
        }

        const hydrated = hydrateLabsState(reports, activeStillExists ? s.activeReportId : null);
        return { ...s, reports, ...hydrated };
      });
    };
    window.addEventListener(CLOUD_SYNC_EVENT, reload);
    return () => window.removeEventListener(CLOUD_SYNC_EVENT, reload);
  }, []);

  const setMainTab = useCallback((tab: MainTab) => {
    setState((s) => ({ ...s, mainTab: tab, showComparison: false }));
  }, []);

  const setLogView = useCallback((view: AppState["logView"]) => {
    setState((s) => ({ ...s, logView: view }));
  }, []);

  const setSecondaryTab = useCallback((tab: SecondaryTab) => {
    setState((s) => ({ ...s, secondaryTab: tab }));
  }, []);

  const setMarkerValue = useCallback((markerId: string, value: number | null, unit: string) => {
    setState((s) => {
      const next = { ...s.currentValues };
      if (value === null || isNaN(value)) {
        delete next[markerId];
      } else {
        next[markerId] = { markerId, value, unit };
      }
      return { ...s, currentValues: next };
    });
  }, []);

  const setCurrentValues = useCallback((values: Record<string, MarkerValue>) => {
    setState((s) => ({ ...s, currentValues: values }));
  }, []);

  const parseAndExtract = useCallback((text: string, fileName = "Pasted Results") => {
    setState((s) => {
      const extracted = annotateExtractedHistorical(parseLabText(text), s.currentValues);
      return {
        ...s,
        extractedMarkers: extracted,
        extractionFileName: fileName,
        logView: "extraction",
        mainTab: "log",
      };
    });
  }, []);

  const handleFileUpload = useCallback(async (input: File | File[]) => {
    const files = normalizeLabUpload(input);
    const file = files[0];
    if (!file) return;

    let text = "";
    let fileName = file.name;

    if (files.length > 1 && files.every(isLabImage)) {
      text = await extractTextFromImages(files);
      fileName = `${files.length} photos`;
    } else if (isLabImage(file)) {
      text = await extractTextFromImages([file]);
    } else if (isLabPdf(file)) {
      text = await extractTextFromPDF(file);
    } else if (isLabCsv(file)) {
      text = await file.text();
      setState((s) => ({
        ...s,
        extractedMarkers: annotateExtractedHistorical(parseCSV(text), s.currentValues),
        extractionFileName: fileName,
        logView: "extraction",
        mainTab: "log",
      }));
      return;
    } else {
      text = await file.text();
    }

    setState((s) => ({
      ...s,
      extractedMarkers: annotateExtractedHistorical(parseLabText(text), s.currentValues),
      extractionFileName: fileName,
      logView: "extraction",
      mainTab: "log",
    }));
  }, []);

  const toggleExtracted = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      extractedMarkers: s.extractedMarkers.map((m) =>
        m.id === id ? { ...m, selected: !m.selected } : m
      ),
    }));
  }, []);

  const selectAllCurrent = useCallback(() => {
    setState((s) => ({
      ...s,
      extractedMarkers: s.extractedMarkers.map((m) => ({ ...m, selected: !m.isHistorical })),
    }));
  }, []);

  const selectAbnormalOnly = useCallback(() => {
    setState((s) => ({
      ...s,
      extractedMarkers: s.extractedMarkers.map((m) => ({
        ...m,
        selected: m.labStatus !== "in-range",
      })),
    }));
  }, []);

  const selectConvertedOnly = useCallback(() => {
    setState((s) => ({
      ...s,
      extractedMarkers: s.extractedMarkers.map((m) => ({
        ...m,
        selected: !!m.converted,
      })),
    }));
  }, []);

  const deselectAll = useCallback(() => {
    setState((s) => ({
      ...s,
      extractedMarkers: s.extractedMarkers.map((m) => ({ ...m, selected: false })),
    }));
  }, []);

  const applySelected = useCallback(() => {
    setState((s) => {
      const next = { ...s.currentValues };
      for (const m of s.extractedMarkers) {
        if (m.selected) {
          next[m.markerId] = {
            markerId: m.markerId,
            value: m.value,
            unit: m.unit,
            sourceValue: m.sourceValue,
            sourceUnit: m.sourceUnit,
            converted: m.converted,
          };
        }
      }
      return { ...s, currentValues: next, logView: "flags" };
    });
  }, []);

  const saveReport = useCallback((name?: string) => {
    setState((s) => {
      const values = Object.values(s.currentValues);
      if (values.length === 0) return s;

      const existing = s.activeReportId
        ? s.reports.find((r) => r.id === s.activeReportId)
        : undefined;

      let report: BloodworkReport;
      let reports: BloodworkReport[];

      if (existing) {
        report = {
          ...existing,
          name: name || existing.name,
          values,
          source: s.extractionFileName || existing.source,
        };
        reports = s.reports.map((r) => (r.id === existing.id ? report : r));
      } else {
        report = {
          id: generateId(),
          name: name || s.extractionFileName || `Report ${s.reports.length + 1}`,
          date: new Date().toLocaleDateString("en-GB"),
          createdAt: new Date().toISOString(),
          values,
          source: s.extractionFileName,
        };
        reports = [report, ...s.reports];
      }

      saveReports(reports);
      return { ...s, reports, activeReportId: report.id };
    });
  }, []);

  const startNewLabPanel = useCallback(() => {
    setState((s) => ({
      ...s,
      currentValues: {},
      activeReportId: null,
      logView: "entry",
      mainTab: "log",
    }));
  }, []);

  const loadReport = useCallback((id: string) => {
    setState((s) => {
      const report = s.reports.find((r) => r.id === id);
      if (!report) return s;
      return {
        ...s,
        currentValues: reportToValuesRecord(report),
        activeReportId: id,
        mainTab: "insights",
      };
    });
  }, []);

  const deleteReport = useCallback((id: string) => {
    setState((s) => {
      const reports = s.reports.filter((r) => r.id !== id);
      saveReports(reports);
      const nextActiveId = s.activeReportId === id ? null : s.activeReportId;
      const hydrated = hydrateLabsState(reports, nextActiveId);
      return { ...s, reports, ...hydrated };
    });
  }, []);

  const resetAll = useCallback(() => {
    const reports = loadReports();
    const hydrated = hydrateLabsState(reports, null);
    setState({
      ...initialState,
      reports,
      currentValues: hydrated.currentValues,
      activeReportId: hydrated.activeReportId,
    });
  }, []);

  const setCompareReports = useCallback((a: string | null, b: string | null) => {
    setState((s) => ({ ...s, compareReportIds: [a, b] }));
  }, []);

  const setShowComparison = useCallback((show: boolean) => {
    setState((s) => ({ ...s, showComparison: show }));
  }, []);

  const reviewFlags = useMemo(() => {
    const active = state.reports.find((r) => r.id === state.activeReportId);
    const panelDate = active?.date ?? new Date().toLocaleDateString("en-GB");
    return buildMergedReviewFlags(
      Object.values(state.currentValues),
      panelDate,
      compounds,
      state.currentValues
    );
  }, [state.currentValues, state.reports, state.activeReportId, compounds]);

  const categoryScores = useMemo(
    () => calculateCategoryScores(state.currentValues),
    [state.currentValues]
  );

  const overallScore = useMemo(
    () => calculateOverallScore(categoryScores),
    [categoryScores]
  );

  const activeReport = useMemo(
    () => state.reports.find((r) => r.id === state.activeReportId) ?? null,
    [state.reports, state.activeReportId]
  );

  const value: AppContextValue = {
    ...state,
    setMainTab,
    setLogView,
    setSecondaryTab,
    setMarkerValue,
    setCurrentValues,
    parseAndExtract,
    handleFileUpload,
    toggleExtracted,
    selectAllCurrent,
    selectAbnormalOnly,
    selectConvertedOnly,
    deselectAll,
    applySelected,
    saveReport,
    loadReport,
    startNewLabPanel,
    deleteReport,
    resetAll,
    setCompareReports,
    setShowComparison,
    reviewFlags,
    categoryScores,
    overallScore,
    activeReport,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}