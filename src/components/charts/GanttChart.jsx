import { getCurrentWeek } from '../../lib/cycle-utils'
import { frequencyLabel } from '../../lib/pk-engine'

export default function GanttChart({ cycle, cycleCompounds = [], doseLogs = [], compact = false }) {
  if (!cycle?.duration_wk) {
    return (
      <div className="p-6 text-center text-text-muted text-sm border border-border rounded-md bg-surface">
        Set cycle duration to see timeline
      </div>
    )
  }

  const weeks = cycle.duration_wk
  const currentWeek = cycle.status === 'active' ? getCurrentWeek(cycle) : null

  return (
    <div className={`bg-surface border border-border rounded-md ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex mb-3 text-[10px] font-mono text-text-muted uppercase tracking-wider">
        <div className="w-36 shrink-0">Compound</div>
        <div className="flex-1 flex">
          {Array.from({ length: weeks }, (_, i) => (
            <div
              key={i}
              className={`flex-1 text-center border-l border-border/50 py-1 ${
                currentWeek === i + 1 ? 'bg-accent/10 text-accent' : ''
              }`}
            >
              W{i + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {cycleCompounds.map((cc) => {
          const compound = cc.compounds ?? cc.compound
          const start = (cc.start_week || 1) - 1
          const end = (cc.end_week ?? weeks) - 1
          const widthPct = ((end - start + 1) / weeks) * 100
          const leftPct = (start / weeks) * 100
          const logs = doseLogs.filter((l) => l.cycle_compound_id === cc.id)

          return (
            <div key={cc.id} className="flex items-center gap-2">
              <div className="w-36 shrink-0 flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: compound?.color_hex ?? '#2563FF' }}
                />
                <span className="text-xs truncate">{compound?.name}</span>
              </div>
              <div className="flex-1 relative h-7 bg-bg rounded-sm border border-border/50">
                <div
                  className="absolute top-1 bottom-1 rounded-sm opacity-80"
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    backgroundColor: compound?.color_hex ?? '#2563FF',
                  }}
                />
                {logs.map((log) => {
                  const logDate = new Date(log.logged_at)
                  const startDate = new Date(cycle.start_date)
                  const dayOffset = Math.floor((logDate - startDate) / (86400000))
                  const weekPos = dayOffset / 7 / weeks
                  if (weekPos < 0 || weekPos > 1) return null
                  return (
                    <span
                      key={log.id}
                      className="absolute w-1.5 h-1.5 rounded-full bg-white top-1/2 -translate-y-1/2"
                      style={{ left: `calc(${weekPos * 100}% - 3px)` }}
                      title={`${log.dose_mg}mg`}
                    />
                  )
                })}
                {currentWeek && (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-accent z-10"
                    style={{ left: `${((currentWeek - 0.5) / weeks) * 100}%` }}
                  />
                )}
              </div>
              {!compact && (
                <span className="text-[10px] font-mono text-text-muted w-14 text-right">
                  {frequencyLabel(cc.frequency)}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}