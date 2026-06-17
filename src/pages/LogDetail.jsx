import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import GanttChart from '../components/charts/GanttChart'
import PKChart from '../components/charts/PKChart'
import DoseLogRow from '../components/ui/DoseLogRow'

import {
  calculateMultiCompoundPK,
  generateDoseDaysFromLogs,
  weeklyDoseMg,
  frequencyLabel,
} from '../lib/pk-engine'

const TABS = ['Overview', 'Dose history', 'Timeline', 'PK Levels']

export default function LogDetail() {
  const { id } = useParams()
  const [tab, setTab] = useState('Overview')

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

  if (isLoading) return <p className="text-text-secondary">Loading...</p>
  if (!cycle) return <p className="text-danger">Cycle not found</p>

  const durationDays = (cycle.duration_wk ?? 0) * 7
  const totalMg = doseLogs.reduce((s, l) => s + (Number(l.dose_mg) || 0), 0)

  const pkData = calculateMultiCompoundPK(
    cycleCompounds.map((cc) => {
      const logs = doseLogs.filter((l) => l.cycle_compound_id === cc.id)
      const doseDays = logs.length ? generateDoseDaysFromLogs(logs, cycle.start_date) : null
      return { compound: cc.compounds, cycleCompound: cc, doseDays }
    }),
    durationDays
  )

  return (
    <div className="space-y-6">
      <div>
        <Link to="/log" className="text-xs text-text-secondary hover:text-accent">← Cycle Log</Link>
        <div className="flex items-center gap-2 mt-2 mb-1">
          <h1 className="font-display text-2xl font-bold">{cycle.name}</h1>
          <Badge variant="success">complete</Badge>
        </div>
        <p className="text-sm text-text-secondary font-mono">{cycle.start_date} · {cycle.duration_wk} weeks</p>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto scrollbar-none">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px whitespace-nowrap shrink-0 ${
              tab === t ? 'border-accent text-accent' : 'border-transparent text-text-secondary'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <StatCard label="Duration" value={cycle.duration_wk} unit="weeks" />
            <StatCard label="Compounds" value={cycleCompounds.length} />
            <StatCard label="Total mg logged" value={totalMg} unit="mg" accent />
          </div>
          <div className="bg-surface border border-border rounded-md overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-border text-left text-[10px] uppercase text-text-muted">
                  <th className="p-3">Compound</th>
                  <th className="p-3">Dose</th>
                  <th className="p-3">Frequency</th>
                  <th className="p-3">Weekly mg</th>
                </tr>
              </thead>
              <tbody>
                {cycleCompounds.map((cc) => (
                  <tr key={cc.id} className="border-b border-border/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cc.compounds?.color_hex }} />
                        {cc.compounds?.name}
                        {cc.notes?.includes('Added during') && (
                          <Badge variant="warning" className="ml-1">added</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-mono">{cc.dose_mg}mg</td>
                    <td className="p-3"><Badge>{frequencyLabel(cc.frequency)}</Badge></td>
                    <td className="p-3 font-mono">{weeklyDoseMg(cc.dose_mg, cc.frequency, cc.custom_days)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'Dose history' && (
        <div className="bg-surface border border-border rounded-md p-4 space-y-2">
          {doseLogs.length === 0 ? (
            <p className="text-sm text-text-muted">No doses were logged.</p>
          ) : (
            doseLogs.map((d) => <DoseLogRow key={d.id} dose={d} />)
          )}
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