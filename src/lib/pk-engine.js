export function generateDoseDays(cycleCompound, durationDays) {
  const { frequency, custom_days, start_week, end_week, dose_mg } = cycleCompound
  const startDay = ((start_week || 1) - 1) * 7
  const endDay = end_week ? end_week * 7 : durationDays
  const days = []
  const freqMap = { daily: [0, 1, 2, 3, 4, 5, 6], eod: [0, 2, 4, 6], mwf: [1, 3, 5] }
  const weekDays = frequency === 'custom' ? custom_days : freqMap[frequency]

  if (!weekDays?.length) return days

  for (let d = startDay; d < endDay; d++) {
    if (weekDays.includes(d % 7)) {
      days.push({ day: d, dose: dose_mg })
    }
  }
  return days
}

export function generateDoseDaysFromLogs(doseLogs, cycleStartDate) {
  if (!cycleStartDate || !doseLogs?.length) return []

  const start = new Date(cycleStartDate)
  start.setHours(0, 0, 0, 0)

  return doseLogs.map((log) => {
    const logged = new Date(log.logged_at)
    const day = Math.floor((logged - start) / (1000 * 60 * 60 * 24))
    return { day: Math.max(0, day), dose: log.dose_mg }
  })
}

export function calculatePKCurve(compound, cycleCompound, durationDays, doseDaysOverride = null) {
  const halfLife = compound.half_life_days
  const tailDays = Math.ceil(halfLife * 5)
  const totalDays = durationDays + tailDays
  const doseDays = doseDaysOverride ?? generateDoseDays(cycleCompound, durationDays)
  const curve = []

  for (let t = 0; t <= totalDays; t++) {
    const level = doseDays.reduce((sum, { day, dose }) => {
      if (day > t) return sum
      return sum + dose * Math.pow(0.5, (t - day) / halfLife)
    }, 0)
    curve.push({ day: t, level: Math.round(level * 10) / 10 })
  }

  return curve
}

export function calculateMultiCompoundPK(compoundsWithData, durationDays) {
  const curves = compoundsWithData.map(({ compound, cycleCompound, doseDays }) => ({
    compound,
    curve: calculatePKCurve(compound, cycleCompound, durationDays, doseDays),
  }))

  const maxDay = Math.max(...curves.map((c) => c.curve[c.curve.length - 1]?.day ?? 0), 0)
  const combined = []

  for (let t = 0; t <= maxDay; t++) {
    const level = curves.reduce((sum, { curve }) => {
      const point = curve.find((p) => p.day === t)
      return sum + (point?.level ?? 0)
    }, 0)
    combined.push({ day: t, level: Math.round(level * 10) / 10 })
  }

  return { curves, combined }
}

export function weeklyDoseMg(doseMg, frequency, customDays = []) {
  const freqMap = { daily: 7, eod: 3.5, mwf: 3 }
  if (frequency === 'custom' && customDays?.length) {
    return Math.round(doseMg * customDays.length)
  }
  return Math.round(doseMg * (freqMap[frequency] ?? 0))
}

export function frequencyLabel(frequency) {
  const labels = { daily: 'DAILY', eod: 'EOD', mwf: 'MWF', custom: 'CUSTOM' }
  return labels[frequency] ?? frequency?.toUpperCase()
}