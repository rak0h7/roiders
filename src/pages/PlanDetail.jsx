import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import GanttChart from '../components/charts/GanttChart'
import { cycleWeeklyTotal } from '../lib/cycle-utils'
import { weeklyDoseMg, frequencyLabel } from '../lib/pk-engine'
import { activateCycle } from '../lib/cycle-mutations'

export default function PlanDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: cycle, isLoading } = useQuery({
    queryKey: ['cycle', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('cycles').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
  })

  const { data: cycleCompounds = [] } = useQuery({
    queryKey: ['cycle-compounds', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cycle_compounds')
        .select('*, compounds(*)')
        .eq('cycle_id', id)
      if (error) throw error
      return data
    },
    enabled: !!id,
  })

  const activateMutation = useMutation({
    mutationFn: () => activateCycle(supabase, user.id, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-cycle'] })
      queryClient.invalidateQueries({ queryKey: ['cycle-plans'] })
      queryClient.invalidateQueries({ queryKey: ['cycle-log'] })
      navigate('/')
    },
  })

  if (isLoading) return <p className="text-text-secondary">Loading...</p>
  if (!cycle) return <p className="text-danger">Plan not found</p>

  if (cycle.status === 'complete') {
    navigate(`/log/${id}`, { replace: true })
    return null
  }

  const plannedCompounds = cycle.status === 'active'
    ? cycleCompounds.filter((cc) => !cc.notes?.includes('Added during'))
    : cycleCompounds
  const addedCompounds = cycle.status === 'active'
    ? cycleCompounds.filter((cc) => cc.notes?.includes('Added during'))
    : []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/planner" className="text-xs text-text-secondary hover:text-accent">← Cycle Planner</Link>
          <div className="flex items-center gap-2 mt-2 mb-1">
            <h1 className="font-display text-2xl font-bold">{cycle.name}</h1>
            <Badge variant={cycle.status === 'active' ? 'accent' : 'default'}>{cycle.status}</Badge>
          </div>
          <p className="text-sm text-text-secondary font-mono">
            {cycle.start_date} · {cycle.duration_wk} weeks
          </p>
        </div>
        {cycle.status === 'planned' ? (
          <Button onClick={() => activateMutation.mutate()} disabled={activateMutation.isPending}>
            {activateMutation.isPending ? 'Activating...' : 'Activate cycle'}
          </Button>
        ) : (
          <Link to="/"><Button variant="secondary">Go to Dashboard</Button></Link>
        )}
      </div>

      {cycle.status === 'planned' ? (
        <p className="text-sm text-text-secondary bg-surface border border-border rounded-md p-3">
          This is your planned stack. Activate when you&apos;re ready to start — tracking and dose logging happen on the Dashboard.
        </p>
      ) : (
        <p className="text-sm text-accent bg-accent/10 border border-accent/30 rounded-md p-3">
          This cycle is active. Dose logging and mid-cycle changes are on the Dashboard.
        </p>
      )}

      <div className="bg-surface border border-border rounded-md overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-text-muted">
              <th className="p-3">Compound</th>
              <th className="p-3">Dose</th>
              <th className="p-3">Frequency</th>
              <th className="p-3 font-mono">Weekly mg</th>
            </tr>
          </thead>
          <tbody>
            {plannedCompounds.map((cc) => (
              <tr key={cc.id} className="border-b border-border/50">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cc.compounds?.color_hex }} />
                    <span className="truncate">{cc.compounds?.name}</span>
                  </div>
                </td>
                <td className="p-3 font-mono">{cc.dose_mg}mg</td>
                <td className="p-3"><Badge>{frequencyLabel(cc.frequency)}</Badge></td>
                <td className="p-3 font-mono text-accent">{weeklyDoseMg(cc.dose_mg, cc.frequency, cc.custom_days)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="p-3 text-sm font-mono text-text-secondary border-t border-border">
          Total weekly: {cycleWeeklyTotal(plannedCompounds)} mg
        </p>
      </div>

      {addedCompounds.length > 0 && (
        <div className="bg-surface border border-border rounded-md p-4">
          <h2 className="font-display text-sm font-semibold mb-2 text-text-secondary">Added during active cycle</h2>
          <p className="text-xs text-text-muted mb-3">These weren&apos;t in the original plan — see Dashboard for full stack.</p>
          <ul className="space-y-1 text-sm">
            {addedCompounds.map((cc) => (
              <li key={cc.id} className="flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cc.compounds?.color_hex }} />
                {cc.compounds?.name} — {cc.dose_mg}mg
              </li>
            ))}
          </ul>
        </div>
      )}

      <GanttChart cycle={{ ...cycle, status: 'planned' }} cycleCompounds={plannedCompounds} doseLogs={[]} />
    </div>
  )
}