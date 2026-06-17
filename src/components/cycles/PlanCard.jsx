import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { formatDate, cycleWeeklyTotal } from '../../lib/cycle-utils'

export default function PlanCard({ cycle, compounds = [], onActivate, activating }) {
  const weekly = cycleWeeklyTotal(cycle.cycle_compounds ?? compounds)

  return (
    <div className="bg-surface border border-border rounded-md p-4 hover:border-accent/30 transition-colors group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <Link to={`/planner/${cycle.id}`} className="min-w-0 flex-1">
          <h2 className="font-display font-semibold group-hover:text-accent transition-colors truncate">{cycle.name}</h2>
        </Link>
        <Badge>draft</Badge>
      </div>

      {(cycle.cycle_compounds?.length > 0) && (
        <div className="flex gap-1 mb-3 flex-wrap">
          {cycle.cycle_compounds.slice(0, 6).map((cc, i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: cc.compounds?.color_hex ?? '#2563FF' }}
              title={cc.compounds?.name}
            />
          ))}
          {cycle.cycle_compounds.length > 6 && (
            <span className="text-[10px] text-text-muted">+{cycle.cycle_compounds.length - 6}</span>
          )}
        </div>
      )}

      <div className="space-y-1 text-sm text-text-secondary mb-4">
        <p>{formatDate(cycle.start_date)} · {cycle.duration_wk} weeks</p>
        <p className="font-mono text-accent">{weekly} mg/wk · {cycle.cycle_compounds?.length ?? 0} compounds</p>
      </div>

      <div className="flex gap-2">
        <Link to={`/planner/${cycle.id}`} className="flex-1">
          <Button variant="secondary" className="w-full text-xs">Edit plan</Button>
        </Link>
        <Button
          className="flex-1 text-xs"
          onClick={(e) => { e.preventDefault(); onActivate?.(cycle.id) }}
          disabled={activating}
        >
          {activating ? 'Starting...' : 'Start'}
        </Button>
      </div>
    </div>
  )
}