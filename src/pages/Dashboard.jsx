import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import StatCard from '../components/ui/StatCard'
import GanttChart from '../components/charts/GanttChart'
import PKChart from '../components/charts/PKChart'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import DoseLogForm from '../components/cycles/DoseLogForm'
import AddCompoundPanel from '../components/cycles/AddCompoundPanel'
import MissedDosesPanel from '../components/doses/MissedDosesPanel'
import DoseLogRow from '../components/ui/DoseLogRow'
import {
  getCurrentWeek,
  getDaysElapsed,
  cycleWeeklyTotal,
} from '../lib/cycle-utils'
import {
  calculateMultiCompoundPK,
  generateDoseDaysFromLogs,
  weeklyDoseMg,
  frequencyLabel,
} from '../lib/pk-engine'
import { findMissedDoses } from '../lib/dose-schedule'
import { completeCycle } from '../lib/cycle-mutations'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [dosePreset, setDosePreset] = useState(null)
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)

  const invalidateActive = () => {
    queryClient.invalidateQueries({ queryKey: ['active-cycle'] })
    queryClient.invalidateQueries({ queryKey: ['cycle-compounds'] })
    queryClient.invalidateQueries({ queryKey: ['cycle-dose-logs'] })
    queryClient.invalidateQueries({ queryKey: ['recent-doses'] })
  }

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

  const { data: doseLogs = [] } = useQuery({
    queryKey: ['cycle-dose-logs', activeCycle?.id],
    queryFn: async () => {
      const ccIds = cycleCompounds.map((cc) => cc.id)
      if (!ccIds.length) return []
      const { data, error } = await supabase
        .from('dose_logs')
        .select('*, cycle_compounds(*, compounds(name, color_hex))')
        .in('cycle_compound_id', ccIds)
        .order('logged_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!activeCycle?.id && cycleCompounds.length > 0,
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

  const completeMutation = useMutation({
    mutationFn: () => completeCycle(supabase, activeCycle.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-cycle'] })
      queryClient.invalidateQueries({ queryKey: ['cycle-log'] })
      navigate(`/log/${activeCycle.id}`)
    },
  })

  const durationDays = (activeCycle?.duration_wk ?? 0) * 7
  const pkData = activeCycle && cycleCompounds.length
    ? calculateMultiCompoundPK(
        cycleCompounds.map((cc) => {
          const logs = doseLogs.filter((l) => l.cycle_compound_id === cc.id)
          const doseDays = logs.length
            ? generateDoseDaysFromLogs(logs, activeCycle.start_date)
            : null
          return { compound: cc.compounds, cycleCompound: cc, doseDays }
        }),
        durationDays
      )
    : { curves: [], combined: [] }

  const flaggedCount = latestPanel?.bloodwork_markers?.filter((m) => m.flagged).length ?? 0
  const missedDoses = findMissedDoses(activeCycle, cycleCompounds, doseLogs)

  const handleLogMissedDose = (dose) => {
    setDosePreset({
      cycle_compound_id: dose.cycleCompoundId,
      dose_mg: dose.doseMg,
      logged_at: format(dose.scheduledAt, "yyyy-MM-dd'T'HH:mm"),
    })
    document.getElementById('dose-log-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (!activeCycle) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-text-secondary mb-6">
          No active cycle. Plan a stack in Cycle Planner, then activate it to start tracking here.
        </p>
        <div className="flex gap-3">
          <Link to="/planner/new"><Button>+ New plan</Button></Link>
          <Link to="/planner"><Button variant="secondary">Cycle Planner</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Active cycle</p>
          <h1 className="font-display text-2xl font-bold">{activeCycle.name}</h1>
          <p className="text-text-secondary text-sm mt-1 font-mono">
            Week {getCurrentWeek(activeCycle)} of {activeCycle.duration_wk} · {getDaysElapsed(activeCycle)} days in
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/planner/${activeCycle.id}`}>
            <Button variant="ghost" className="text-xs">View original plan</Button>
          </Link>
          {!showCompleteConfirm ? (
            <Button variant="secondary" onClick={() => setShowCompleteConfirm(true)}>Complete cycle</Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary">Move to Cycle Log?</span>
              <Button variant="danger" onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending}>
                Confirm
              </Button>
              <Button variant="ghost" onClick={() => setShowCompleteConfirm(false)}>Cancel</Button>
            </div>
          )}
        </div>
      </div>

      <MissedDosesPanel missedDoses={missedDoses} onLogDose={handleLogMissedDose} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Cycle week" value={getCurrentWeek(activeCycle)} />
        <StatCard label="Weekly dose" value={cycleWeeklyTotal(cycleCompounds)} unit="mg" accent />
        <StatCard
          label="Days since bloodwork"
          value={latestPanel ? getDaysElapsed({ start_date: latestPanel.drawn_at }) : '—'}
        />
        <StatCard label="Compounds" value={cycleCompounds.length} />
      </div>

      <div id="dose-log-section" className="grid lg:grid-cols-2 gap-4">
        <DoseLogForm
          key={dosePreset ? `${dosePreset.cycle_compound_id}-${dosePreset.logged_at}` : 'default'}
          userId={user.id}
          cycleId={activeCycle.id}
          cycleCompounds={cycleCompounds}
          preset={dosePreset}
          onSuccess={() => { setDosePreset(null); invalidateActive() }}
        />
        <AddCompoundPanel
          cycleId={activeCycle.id}
          cycle={activeCycle}
          onSuccess={invalidateActive}
        />
      </div>

      {cycleCompounds.length > 0 && (
        <div className="bg-surface border border-border rounded-md p-4 overflow-x-auto">
          <h2 className="font-display text-sm font-semibold mb-3 uppercase tracking-wider text-text-secondary">Current stack</h2>
          <table className="w-full text-sm min-w-[400px]">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase text-text-muted">
                <th className="pb-2">Compound</th>
                <th className="pb-2">Dose</th>
                <th className="pb-2">Freq</th>
                <th className="pb-2 font-mono">mg/wk</th>
              </tr>
            </thead>
            <tbody>
              {cycleCompounds.map((cc) => (
                <tr key={cc.id} className="border-b border-border/40">
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cc.compounds?.color_hex }} />
                      <span className="truncate">{cc.compounds?.name}</span>
                      {cc.notes?.includes('Added during') && <Badge variant="warning">new</Badge>}
                    </div>
                  </td>
                  <td className="py-2 font-mono">{cc.dose_mg}mg</td>
                  <td className="py-2"><Badge>{frequencyLabel(cc.frequency)}</Badge></td>
                  <td className="py-2 font-mono text-accent">{weeklyDoseMg(cc.dose_mg, cc.frequency, cc.custom_days)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
          {doseLogs.length === 0 ? (
            <p className="text-sm text-text-muted">No doses logged yet — use the form above.</p>
          ) : (
            <div className="space-y-2">
              {doseLogs.slice(0, 8).map((d) => (
                <DoseLogRow key={d.id} dose={d} />
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