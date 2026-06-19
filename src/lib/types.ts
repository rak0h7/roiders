export type MarkerCategory =
  | "hormonal"
  | "cbc"
  | "cardiovascular"
  | "liver"
  | "kidney"
  | "electrolytes"
  | "metabolic"
  | "thyroid"
  | "muscle"
  | "nutrients"
  | "immune";

export type RangeMode = "lab" | "optimized";

export type Severity = "normal" | "yellow" | "high" | "low" | "stop";

export interface MarkerRange {
  labMin?: number;
  labMax?: number;
  optimalMin?: number;
  optimalMax?: number;
  cautionMin?: number;
  cautionMax?: number;
  strictThreshold?: number;
  upperOnly?: boolean;
  lowerOnly?: boolean;
}

export interface MarkerDefinition {
  id: string;
  name: string;
  category: MarkerCategory;
  defaultUnit: string;
  units: string[];
  aliases: string[];
  range: MarkerRange;
}

export interface MarkerValue {
  markerId: string;
  value: number;
  unit: string;
  sourceValue?: number;
  sourceUnit?: string;
  converted?: boolean;
}

export interface ExtractedMarker extends MarkerValue {
  id: string;
  name: string;
  date?: string;
  labStatus: "lab-normal" | "high" | "low";
  selected: boolean;
  isHistorical?: boolean;
  needsReview?: boolean;
}

export type ReviewFlagSource = "lab" | "cycle" | "stack";

export interface ReviewFlag {
  markerId: string;
  name: string;
  value?: number;
  unit?: string;
  sourceValue?: number;
  sourceUnit?: string;
  date: string;
  severity: Severity;
  labRange?: string;
  optimalRange?: string;
  cautionRange?: string;
  strictThreshold?: number;
  deviation: string;
  noDosing: boolean;
  source?: ReviewFlagSource;
  relatedCompounds?: string[];
  recommendation?: string;
}

export interface CategoryScore {
  category: MarkerCategory;
  label: string;
  score: number | null;
  status: string;
  assessed: number;
  total: number;
  tags: { label: string; type: "stop" | "caut" | "easy" | "step" }[];
}

export interface BloodworkReport {
  id: string;
  name: string;
  date: string;
  createdAt: string;
  values: MarkerValue[];
  source?: string;
}

export type MainTab = "log" | "history" | "insights";
export type LogView = "landing" | "entry" | "extraction" | "flags";
export type SecondaryTab = "cheat-sheet" | "debug" | null;

export interface AppState {
  mainTab: MainTab;
  logView: LogView;
  secondaryTab: SecondaryTab;
  rangeMode: RangeMode;
  currentValues: Record<string, MarkerValue>;
  extractedMarkers: ExtractedMarker[];
  extractionFileName: string;
  reports: BloodworkReport[];
  activeReportId: string | null;
  compareReportIds: [string | null, string | null];
  showComparison: boolean;
}