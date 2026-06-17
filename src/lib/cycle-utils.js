import { differenceInDays, addWeeks, format } from 'date-fns'
import { weeklyDoseMg } from './pk-engine'

export const MID_CYCLE_TAG = 'added_mid_cycle'

export function isMidCycleCompound(cc) {
  return cc?.notes?.includes(MID_CYCLE_TAG) || cc?.notes?.includes('Added during')
}

export function getCycleDurationDays(cycle) {
  return (cycle?.duration_wk ?? 0) * 7
}

export function getCycleEndDate(cycle) {
  if (!cycle?.start_date || !cycle?.duration_wk) return null
  return addWeeks(new Date(cycle.start_date), cycle.duration_wk)
}

export function getCurrentWeek(cycle) {
  if (!cycle?.start_date) return 1
  const days = differenceInDays(new Date(), new Date(cycle.start_date))
  if (days < 0) return 0
  return Math.min(Math.floor(days / 7) + 1, cycle.duration_wk ?? 1)
}

export function getDaysElapsed(cycle) {
  if (!cycle?.start_date) return 0
  return Math.max(0, differenceInDays(new Date(), new Date(cycle.start_date)))
}

export function formatDate(date) {
  if (!date) return '—'
  return format(new Date(date), 'dd MMM yyyy')
}

export function formatDateTime(date) {
  if (!date) return '—'
  return format(new Date(date), 'dd MMM yyyy HH:mm')
}

export function cycleWeeklyTotal(cycleCompounds = []) {
  return cycleCompounds.reduce((sum, cc) => {
    return sum + weeklyDoseMg(cc.dose_mg, cc.frequency, cc.custom_days)
  }, 0)
}

export function statusColor(status) {
  const colors = {
    planned: 'text-text-secondary border-border',
    active: 'text-accent border-accent/40 bg-accent/10',
    complete: 'text-success border-success/40 bg-success/10',
  }
  return colors[status] ?? colors.planned
}

export const INJECTION_SITES = [
  { value: 'glute_l', label: 'glute-L' },
  { value: 'glute_r', label: 'glute-R' },
  { value: 'quad_l', label: 'quad-L' },
  { value: 'quad_r', label: 'quad-R' },
  { value: 'delt_l', label: 'delt-L' },
  { value: 'delt_r', label: 'delt-R' },
]

export const COMMON_MARKERS = [
  { marker: 'Haematocrit', unit: '%', ref_low: 38, ref_high: 50 },
  { marker: 'RBC', unit: 'x10^12/L', ref_low: 4.5, ref_high: 5.9 },
  { marker: 'ALT', unit: 'U/L', ref_low: 7, ref_high: 56 },
  { marker: 'AST', unit: 'U/L', ref_low: 10, ref_high: 40 },
  { marker: 'Total Testosterone', unit: 'ng/dL', ref_low: 300, ref_high: 1000 },
  { marker: 'Free Testosterone', unit: 'pg/mL', ref_low: 9, ref_high: 30 },
  { marker: 'Estradiol', unit: 'pg/mL', ref_low: 10, ref_high: 40 },
  { marker: 'LH', unit: 'mIU/mL', ref_low: 1.7, ref_high: 8.6 },
  { marker: 'FSH', unit: 'mIU/mL', ref_low: 1.5, ref_high: 12.4 },
  { marker: 'SHBG', unit: 'nmol/L', ref_low: 16, ref_high: 55 },
  { marker: 'PSA', unit: 'ng/mL', ref_low: 0, ref_high: 4 },
  { marker: 'Total Cholesterol', unit: 'mg/dL', ref_low: 0, ref_high: 200 },
  { marker: 'HDL', unit: 'mg/dL', ref_low: 40, ref_high: 100 },
  { marker: 'LDL', unit: 'mg/dL', ref_low: 0, ref_high: 100 },
  { marker: 'Triglycerides', unit: 'mg/dL', ref_low: 0, ref_high: 150 },
]

export const FREQUENCIES = [
  { value: 'daily', label: 'Daily', short: 'ED' },
  { value: 'eod', label: 'EOD', short: 'EOD' },
  { value: 'mwf', label: 'Mon / Wed / Fri', short: 'MWF' },
  { value: 'custom', label: 'Custom days', short: 'CUSTOM' },
]

export const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
export const DAY_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function emptyCompoundRow() {
  return {
    compound_id: '',
    compound: null,
    dose_mg: '',
    frequency: 'mwf',
    custom_days: [1, 3, 5],
    start_week: 1,
    end_week: null,
  }
}