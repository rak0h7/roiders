import Badge from '../ui/Badge'
import Button from '../ui/Button'

export default function TodaysPinsPanel({ todaysDoses = [], onLogDose }) {
  if (!todaysDoses.length) return null

  const pending = todaysDoses.filter((d) => !d.logged)
  const done = todaysDoses.filter((d) => d.logged)

  return (
    <div className="bg-surface border border-border rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-display font-semibold">Today&apos;s pins</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {done.length} logged · {pending.length} remaining
          </p>
        </div>
        {pending.length > 0 && <Badge variant="accent">{pending.length} due</Badge>}
      </div>

      <div className="space-y-2">
        {todaysDoses.map((dose) => (
          <div
            key={`${dose.cycleCompoundId}-${dose.scheduledAt.toISOString()}`}
            className={`flex items-center gap-3 p-3 rounded-md border ${
              dose.logged ? 'border-success/30 bg-success/5' : 'border-border bg-bg'
            }`}
          >
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: dose.compoundColor ?? '#2563FF' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{dose.compoundName}</p>
              <p className="text-xs font-mono text-text-secondary">{dose.doseMg}mg</p>
            </div>
            {dose.logged ? (
              <Badge variant="success">Logged</Badge>
            ) : (
              <Button variant="secondary" className="text-xs py-1.5 px-3" onClick={() => onLogDose?.(dose)}>
                Log
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}