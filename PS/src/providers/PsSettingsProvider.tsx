"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { RangeMode } from "@/lib/types";
import {
  DEFAULT_THEME,
  applyThemeToDocument,
  normalizeTheme,
  type ThemeConfig,
  type ThemePresetId,
  presetToTheme,
  THEME_PRESETS,
} from "@/lib/themes";
import { PS_SETTINGS_KEY, readJson, writeJson } from "@ps/lib/psStorage";

export interface AppSettings {
  defaultRangeMode: RangeMode;
  reducedMotion: boolean;
  compactSidebar: boolean;
  theme: ThemeConfig;
}

const DEFAULTS: AppSettings = {
  defaultRangeMode: "optimized",
  reducedMotion: false,
  compactSidebar: false,
  theme: DEFAULT_THEME,
};

interface SettingsContextValue extends AppSettings {
  updateSettings: (patch: Partial<AppSettings>) => void;
  updateTheme: (patch: Partial<ThemeConfig>) => void;
  applyPreset: (presetId: ThemePresetId) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function mergeSettings(raw: Partial<AppSettings>): AppSettings {
  return {
    ...DEFAULTS,
    ...raw,
    theme: normalizeTheme(raw.theme),
  };
}

function readStoredSettings(): AppSettings {
  return mergeSettings(readJson<Partial<AppSettings>>(PS_SETTINGS_KEY) ?? {});
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(readStoredSettings);

  useEffect(() => {
    applyThemeToDocument(settings.theme);
  }, [settings.theme]);

  const persist = useCallback((next: AppSettings) => {
    setSettings(next);
    writeJson(PS_SETTINGS_KEY, next);
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => persist(mergeSettings({ ...settings, ...patch })),
    [settings, persist],
  );

  const updateTheme = useCallback(
    (patch: Partial<ThemeConfig>) => {
      const isColorEdit =
        "accentPrimary" in patch ||
        "accentSecondary" in patch ||
        "accentTertiary" in patch ||
        "customSwatches" in patch ||
        "baseColor" in patch ||
        "surfaceColor" in patch ||
        "elevatedColor" in patch;
      persist({
        ...settings,
        theme: normalizeTheme({
          ...settings.theme,
          ...patch,
          preset: patch.preset ?? (isColorEdit ? "custom" : settings.theme.preset),
        }),
      });
    },
    [settings, persist],
  );

  const applyPreset = useCallback(
    (presetId: ThemePresetId) => {
      const preset = THEME_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;
      persist({
        ...settings,
        theme: normalizeTheme(presetToTheme(preset)),
      });
    },
    [settings, persist],
  );

  const resetSettings = useCallback(() => {
    persist(DEFAULTS);
    applyThemeToDocument(DEFAULT_THEME);
  }, [persist]);

  return (
    <SettingsContext.Provider
      value={{ ...settings, updateSettings, updateTheme, applyPreset, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}