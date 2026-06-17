import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Badge from '../components/ui/Badge'
import { formatDate, cycleWeeklyTotal } from '../lib/cycle-utils'

export default function CycleLog() {
  const { user } = useAuth()

  const { data: completed = [], isLoading } = useQuery({
    queryKey: ['cycle-log', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cycles')
        .select('*, cycle_compounds(dose_mg, frequency, custom_days)')
        .eq('user_id', user.id)
        .eq('status', 'complete')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-2">Cycle Log</h1>
      <p className="text-sm text-text-secondary mb-6">
        Completed cycles — what you actually ran, including any compounds added mid-cycle.
      </p>

      {isLoading && <p className="text-text-secondary">Loading...</p>}

      {!isLoading && completed.length === 0 && (
        <div className="bg-surface border border-border rounded-md p-8 text-center">
          <p className="text-text-muted">No completed cycles yet. Finish an active cycle from the Dashboard.</p>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {completed.map((cycle) => (
          <Link
            key={cycle.id}
            to={`/log/${cycle.id}`}
            className="bg-surface border border-border rounded-md p-4 hover:border-accent/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <h2 className="font-display font-semibold">{cycle.name}</h2>
              <Badge variant="success">complete</Badge>
            </div>
            <div className="space-y-1 text-sm text-text-secondary">
              <p>{formatDate(cycle.start_date)} · {cycle.duration_wk} weeks</p>
              <p className="font-mono">
                {cycle.cycle_compounds?.length ?? 0} compounds · {cycleWeeklyTotal(cycle.cycle_compounds)} mg/wk
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}