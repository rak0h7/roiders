import { generateDoseDays } from './pk-engine'

const DEFAULT_DOSE_HOUR = 9
const MISSED_WINDOW_HOURS = 12

export function generateScheduledDoseTimes(cycle, cycleCompound) {
  if (!cycle?.start_date) return []

  const durationDays = (cycle.duration_wk ?? 0) * 7
  const doseDays = generateDoseDays(cycleCompound, durationDays)
  const cycleStart = new Date(cycle.start_date)
  cycleStart.setHours(DEFAULT_DOSE_HOUR, 0, 0, 0)

  return doseDays.map(({ day, dose }) => {
    const scheduledAt = new Date(cycleStart)
    scheduledAt.setDate(scheduledAt.getDate() + day)
    return {
      cycleCompoundId: cycleCompound.id,
      compound: cycleCompound.compounds,
      scheduledAt,
      doseMg: dose,
      day,
    }
  })
}

export function findMissedDoses(cycle, cycleCompounds = [], doseLogs = [], windowHours = MISSED_WINDOW_HOURS) {
  if (!cycle?.start_date || cycle.status !== 'active') return []

  const now = Date.now()
  const windowMs = windowHours * 60 * 60 * 1000
  const missed = []

  for (const cc of cycleCompounds) {
    const scheduled = generateScheduledDoseTimes(cycle, cc)
    const logs = doseLogs.filter((l) => l.cycle_compound_id === cc.id)

    for (const dose of scheduled) {
      const deadline = dose.scheduledAt.getTime() + windowMs
      if (deadline >= now) continue

      const hasLog = logs.some((log) => {
        const logTime = new Date(log.logged_at).getTime()
        return Math.abs(logTime - dose.scheduledAt.getTime()) <= windowMs
      })

      if (!hasLog) {
        missed.push({
          ...dose,
          compoundName: cc.compounds?.name,
          compoundColor: cc.compounds?.color_hex,
        })
      }
    }
  }

  return missed.sort((a, b) => b.scheduledAt - a.scheduledAt)
}