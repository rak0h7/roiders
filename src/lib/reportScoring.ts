import type { CycleCompound } from "@/lib/cycleTypes";
import { buildMergedReviewFlags } from "@/lib/cycleLabFlags";
import { calculateCategoryScores, calculateOverallScore } from "@/lib/scoring";
import { reportToValuesRecord } from "@/lib/storage";
import type { BloodworkReport, MarkerValue, Severity } from "@/lib/types";

const CRITICAL_SEVERITIES: Severity[] = ["stop", "high"];

export type BloodworkReportSummary = {
  score: number;
  status: string;
  flagCount: number;
  criticalCount: number;
  markerCount: number;
};

export function reportValuesToMap(report: BloodworkReport): Record<string, MarkerValue> {
  return reportToValuesRecord(report);
}

export function scoreBloodworkReport(
  report: BloodworkReport,
  compounds: CycleCompound[] = [],
): BloodworkReportSummary {
  const valuesMap = reportValuesToMap(report);
  const categoryScores = calculateCategoryScores(valuesMap);
  const overall = calculateOverallScore(categoryScores);
  const flags = buildMergedReviewFlags(report.values, report.date, compounds, valuesMap);
  const criticalCount = flags.filter((f) => CRITICAL_SEVERITIES.includes(f.severity)).length;

  return {
    score: overall.score,
    status: overall.status,
    flagCount: flags.length,
    criticalCount,
    markerCount: report.values.length,
  };
}