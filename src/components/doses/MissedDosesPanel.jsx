import Badge from '../ui/Badge'
import { formatDateTime } from '../../lib/cycle-utils'

export default function MissedDosesPanel({ missedDoses = [], onLogDose, className = '' }) {
  if (!missedDoses.length) return null

  return (
    <div className={`bg-warning/5 border border-warning/30 rounded-md p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="warning">{missedDoses.length} missed</Badge>
        <h3 className="font-display text-sm font-semibold">Scheduled doses without a log (±12h)</h3>
      </div>
      <div className="space-y-2">
        {missedDoses.slice(0, 8).map((dose) => (
          <div
            key={`${dose.cycleCompoundId}-${dose.scheduledAt.toISOString()}`}
            className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm border-b border-border/40 pb-2 last:border-0 last:pb-0"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: dose.compoundColor ?? '#F59E0B' }}
            />
            <span className="font-medium min-w-0 truncate flex-1">{dose.compoundName}</span>
            <span className="font-mono text-text-secondary text-xs sm:text-sm">
              {formatDateTime(dose.scheduledAt)}
            </span>
            <span className="font-mono text-warning">{dose.doseMg}mg</span>
            {onLogDose && (
              <button
                type="button"
                onClick={() => onLogDose(dose)}
                className="text-xs text-accent hover:underline"
              >
                Log now
              </button>
            )}
          </div>
        ))}
        {missedDoses.length > 8 && (
          <p className="text-xs text-text-muted">+ {missedDoses.length - 8} more missed doses</p>
        )}
      </div>
    </div>
  )
}