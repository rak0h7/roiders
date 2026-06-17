import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import StatCard from '../components/ui/StatCard'
import GanttChart from '../components/charts/GanttChart'
import PKChart from '../components/charts/PKChart'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import {
  getCurrentWeek,
  getDaysElapsed,
  formatDateTime,
  cycleWeeklyTotal,
} from '../lib/cycle-utils'
import {
  calculateMultiCompoundPK,
  generateDoseDaysFromLogs,
} from '../lib/pk-engine'

export default function Dashboard() {
  const { user } = useAuth()

  const { data: activeCycle } = useQuery({
    queryKey: ['active-cycle'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const { data: cycleCompounds = [] } = useQuery({
    queryKey: ['cycle-compounds', activeCycle?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cycle_compounds')
        .select('*, compounds(*)')
        .eq('cycle_id', activeCycle.id)
      if (error) throw error
      return data
    },
    enabled: !!activeCycle?.id,
  })

  const { data: recentDoses = [] } = useQuery({
    queryKey: ['recent-doses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dose_logs')
        .select('*, cycle_compounds(*, compounds(name, color_hex))')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(5)
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const { data: latestPanel } = useQuery({
    queryKey: ['latest-panel', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bloodwork_panels')
        .select('*, bloodwork_markers(*)')
        .eq('user_id', user.id)
        .order('drawn_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const { data: doseLogs = [] } = useQuery({
    queryKey: ['cycle-dose-logs', activeCycle?.id],
    queryFn: async () => {
      const ccIds = cycleCompounds.map((cc) => cc.id)
      if (!ccIds.length) return []
      const { data, error } = await supabase
        .from('dose_logs')
        .select('*')
        .in('cycle_compound_id', ccIds)
      if (error) throw error
      return data
    },
    enabled: !!activeCycle?.id && cycleCompounds.length > 0,
  })

  const durationDays = (activeCycle?.duration_wk ?? 0) * 7
  const pkData = activeCycle && cycleCompounds.length
    ? calculateMultiCompoundPK(
        cycleCompounds.map((cc) => {
          const logs = doseLogs.filter((l) => l.cycle_compound_id === cc.id)
          const doseDays = logs.length
            ? generateDoseDaysFromLogs(logs, activeCycle.start_date)
            : null
          return {
            compound: cc.compounds,
            cycleCompound: cc,
            doseDays,
          }
        }),
        durationDays
      )
    : { curves: [], combined: [] }

  const flaggedCount = latestPanel?.bloodwork_markers?.filter((m) => m.flagged).length ?? 0

  if (!activeCycle) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-text-secondary mb-6">No active cycle. Create one to start tracking.</p>
        <Link to="/cycles/new"><Button>+ New Cycle</Button></Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{activeCycle.name}</h1>
          <p className="text-text-secondary text-sm mt-1">
            Week {getCurrentWeek(activeCycle)} of {activeCycle.duration_wk}
          </p>
        </div>
        <Link to={`/cycles/${activeCycle.id}`}><Button variant="secondary">View cycle</Button></Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Cycle week" value={getCurrentWeek(activeCycle)} />
        <StatCard label="Weekly dose" value={cycleWeeklyTotal(cycleCompounds)} unit="mg" accent />
        <StatCard
          label="Days since bloodwork"
          value={latestPanel ? getDaysElapsed({ start_date: latestPanel.drawn_at }) : '—'}
        />
        <StatCard label="Compounds" value={cycleCompounds.length} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <h2 className="font-display text-sm font-semibold mb-2 text-text-secondary uppercase tracking-wider">Timeline</h2>
          <GanttChart cycle={activeCycle} cycleCompounds={cycleCompounds} doseLogs={doseLogs} />
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold mb-2 text-text-secondary uppercase tracking-wider">PK Levels</h2>
          <PKChart curves={pkData.curves} combined={pkData.combined} height={220} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-md p-4">
          <h2 className="font-display text-sm font-semibold mb-3">Recent doses</h2>
          {recentDoses.length === 0 ? (
            <p className="text-sm text-text-muted">No doses logged yet.</p>
          ) : (
            <div className="space-y-2">
              {recentDoses.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-sm border-b border-border/50 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: d.cycle_compounds?.compounds?.color_hex }}
                    />
                    <span>{d.cycle_compounds?.compounds?.name}</span>
                  </div>
                  <span className="font-mono text-text-secondary">{formatDateTime(d.logged_at)}</span>
                  <span className="font-mono">{d.dose_mg}mg</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-md p-4">
          <h2 className="font-display text-sm font-semibold mb-3">Bloodwork flags</h2>
          {!latestPanel ? (
            <p className="text-sm text-text-muted">No bloodwork panels yet.</p>
          ) : (
            <>
              <p className="text-sm text-text-secondary mb-2">
                Latest panel: <span className="font-mono">{latestPanel.drawn_at}</span>
              </p>
              {flaggedCount > 0 ? (
                <Badge variant="danger">{flaggedCount} flagged marker{flaggedCount !== 1 ? 's' : ''}</Badge>
              ) : (
                <Badge variant="success">All markers in range</Badge>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}