import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import GanttChart from '../components/charts/GanttChart'
import PKChart from '../components/charts/PKChart'
import {
  getCurrentWeek,
  getDaysElapsed,
  formatDateTime,
  cycleWeeklyTotal,
  INJECTION_SITES,
} from '../lib/cycle-utils'
import {
  calculateMultiCompoundPK,
  generateDoseDays,
  generateDoseDaysFromLogs,
  weeklyDoseMg,
  frequencyLabel,
} from '../lib/pk-engine'
import { format } from 'date-fns'
import { findMissedDoses } from '../lib/dose-schedule'
import MissedDosesPanel from '../components/doses/MissedDosesPanel'
import DoseLogRow from '../components/ui/DoseLogRow'

const TABS = ['Overview', 'Log Dose', 'Timeline', 'PK Levels']

export default function CycleDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('Overview')
  const [logForm, setLogForm] = useState({
    cycle_compound_id: '',
    logged_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    dose_mg: '',
    injection_site: '',
    notes: '',
  })

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

  const { data: doseLogs = [] } = useQuery({
    queryKey: ['dose-logs', id],
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
    enabled: cycleCompounds.length > 0,
  })

  const statusMutation = useMutation({
    mutationFn: async (status) => {
      const { error } = await supabase.from('cycles').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cycle', id] }),
  })

  const logMutation = useMutation({
    mutationFn: async () => {
      const cc = cycleCompounds.find((c) => c.id === logForm.cycle_compound_id)
      const { error } = await supabase.from('dose_logs').insert({
        user_id: user.id,
        cycle_compound_id: logForm.cycle_compound_id,
        logged_at: new Date(logForm.logged_at).toISOString(),
        dose_mg: Number(logForm.dose_mg) || cc?.dose_mg,
        injection_site: logForm.injection_site || null,
        notes: logForm.notes || null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dose-logs', id] })
      setLogForm((f) => ({ ...f, notes: '' }))
    },
  })

  if (isLoading) return <p className="text-text-secondary">Loading...</p>
  if (!cycle) return <p className="text-danger">Cycle not found</p>

  const durationDays = (cycle.duration_wk ?? 0) * 7
  const totalMg = doseLogs.reduce((s, l) => s + (Number(l.dose_mg) || 0), 0)

  const pkData = calculateMultiCompoundPK(
    cycleCompounds.map((cc) => {
      const logs = doseLogs.filter((l) => l.cycle_compound_id === cc.id)
      const doseDays = logs.length
        ? generateDoseDaysFromLogs(logs, cycle.start_date)
        : generateDoseDays(cc, durationDays)
      return { compound: cc.compounds, cycleCompound: cc, doseDays }
    }),
    durationDays
  )

  const missedDoses = findMissedDoses(cycle, cycleCompounds, doseLogs)

  const handleSelectCompound = (ccId, preset = {}) => {
    const cc = cycleCompounds.find((c) => c.id === ccId)
    setLogForm((f) => ({
      ...f,
      cycle_compound_id: ccId,
      dose_mg: preset.doseMg ?? cc?.dose_mg ?? '',
      logged_at: preset.scheduledAt
        ? format(preset.scheduledAt, "yyyy-MM-dd'T'HH:mm")
        : f.logged_at,
    }))
  }

  const handleLogMissedDose = (dose) => {
    setTab('Log Dose')
    handleSelectCompound(dose.cycleCompoundId, {
      doseMg: dose.doseMg,
      scheduledAt: dose.scheduledAt,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-2xl font-bold">{cycle.name}</h1>
            <Badge variant={cycle.status === 'active' ? 'accent' : 'default'}>{cycle.status}</Badge>
          </div>
          <p className="text-sm text-text-secondary font-mono">
            {cycle.start_date} · {cycle.duration_wk} weeks
          </p>
        </div>
        <div className="flex gap-2">
          {cycle.status === 'planned' && (
            <Button variant="secondary" onClick={() => statusMutation.mutate('active')}>Start cycle</Button>
          )}
          {cycle.status === 'active' && (
            <Button variant="secondary" onClick={() => statusMutation.mutate('complete')}>Mark complete</Button>
          )}
        </div>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-none">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors whitespace-nowrap shrink-0 ${
              tab === t ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            {t}
            {t === 'Log Dose' && missedDoses.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-mono bg-warning/20 text-warning rounded-sm">
                {missedDoses.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <StatCard label="Week" value={getCurrentWeek(cycle)} />
            <StatCard label="Days elapsed" value={getDaysElapsed(cycle)} />
            <StatCard label="Total mg logged" value={totalMg} unit="mg" accent />
          </div>

          {missedDoses.length > 0 && (
            <MissedDosesPanel missedDoses={missedDoses} onLogDose={handleLogMissedDose} />
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
                {cycleCompounds.map((cc) => (
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
              Total weekly: {cycleWeeklyTotal(cycleCompounds)} mg
            </p>
          </div>

          <GanttChart cycle={cycle} cycleCompounds={cycleCompounds} doseLogs={doseLogs} />
        </>
      )}

      {tab === 'Log Dose' && (
        <div className="space-y-4">
          <MissedDosesPanel missedDoses={missedDoses} onLogDose={handleLogMissedDose} />

          <div className="grid lg:grid-cols-2 gap-6">
          <form
            onSubmit={(e) => { e.preventDefault(); logMutation.mutate() }}
            className="bg-surface border border-border rounded-md p-4 space-y-4"
          >
            <h2 className="font-display font-semibold">Quick log</h2>
            <div>
              <label className="field-label">Compound</label>
              <select
                value={logForm.cycle_compound_id}
                onChange={(e) => handleSelectCompound(e.target.value)}
                className="field-input mt-1"
                required
              >
                <option value="">Select...</option>
                {cycleCompounds.map((cc) => (
                  <option key={cc.id} value={cc.id}>{cc.compounds?.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Date & time</label>
              <input
                type="datetime-local"
                value={logForm.logged_at}
                onChange={(e) => setLogForm((f) => ({ ...f, logged_at: e.target.value }))}
                className="field-input mt-1 font-mono"
                required
              />
            </div>
            <div>
              <label className="field-label">Dose (mg)</label>
              <input
                type="number"
                value={logForm.dose_mg}
                onChange={(e) => setLogForm((f) => ({ ...f, dose_mg: e.target.value }))}
                className="field-input mt-1 font-mono"
              />
            </div>
            <div>
              <label className="field-label">Injection site</label>
              <select
                value={logForm.injection_site}
                onChange={(e) => setLogForm((f) => ({ ...f, injection_site: e.target.value }))}
                className="field-input mt-1"
              >
                <option value="">—</option>
                {INJECTION_SITES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Notes</label>
              <input
                value={logForm.notes}
                onChange={(e) => setLogForm((f) => ({ ...f, notes: e.target.value }))}
                className="field-input mt-1"
              />
            </div>
            <Button type="submit" disabled={logMutation.isPending}>Log dose</Button>
          </form>

          <div className="bg-surface border border-border rounded-md p-4">
            <h2 className="font-display font-semibold mb-3">Recent logs</h2>
            {doseLogs.length === 0 ? (
              <p className="text-sm text-text-muted">No doses logged yet.</p>
            ) : (
              <div className="space-y-2">
                {doseLogs.map((d) => (
                  <DoseLogRow key={d.id} dose={d} />
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      )}

      {tab === 'Timeline' && (
        <GanttChart cycle={cycle} cycleCompounds={cycleCompounds} doseLogs={doseLogs} />
      )}

      {tab === 'PK Levels' && (
        <PKChart curves={pkData.curves} combined={pkData.combined} height={400} />
      )}
    </div>
  )
}