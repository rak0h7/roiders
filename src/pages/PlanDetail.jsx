import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import CompoundRow from '../components/cycles/CompoundRow'
import StackPreview from '../components/cycles/StackPreview'
import { emptyCompoundRow, isMidCycleCompound } from '../lib/cycle-utils'
import { activateCycle, updatePlannedCycle, deleteCycle } from '../lib/cycle-mutations'

export default function PlanDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [durationWk, setDurationWk] = useState(12)
  const [notes, setNotes] = useState('')
  const [compounds, setCompounds] = useState([emptyCompoundRow()])
  const [search, setSearch] = useState('')
  const [activeSearchIdx, setActiveSearchIdx] = useState(null)

  const { data: cycle, isLoading } = useQuery({
    queryKey: ['cycle', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('cycles').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
  })

  const { data: allCompounds = [] } = useQuery({
    queryKey: ['compounds'],
    queryFn: async () => {
      const { data, error } = await supabase.from('compounds').select('*').order('name')
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

  const plannedOnly = cycleCompounds.filter((cc) => !isMidCycleCompound(cc))
  const addedMid = cycleCompounds.filter((cc) => isMidCycleCompound(cc))

  useEffect(() => {
    if (!cycle || editing) return
    setName(cycle.name)
    setStartDate(cycle.start_date ?? '')
    setDurationWk(cycle.duration_wk ?? 12)
    setNotes(cycle.notes ?? '')
    if (plannedOnly.length) {
      setCompounds(plannedOnly.map((cc) => ({
        compound_id: cc.compound_id,
        compound: cc.compounds,
        dose_mg: cc.dose_mg,
        frequency: cc.frequency,
        custom_days: cc.custom_days ?? [1, 3, 5],
        start_week: cc.start_week ?? 1,
        end_week: cc.end_week,
      })))
    }
  }, [cycle, plannedOnly.length, editing])

  const activateMutation = useMutation({
    mutationFn: () => activateCycle(supabase, user.id, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-cycle'] })
      queryClient.invalidateQueries({ queryKey: ['cycle-plans'] })
      navigate('/')
    },
  })

  const saveMutation = useMutation({
    mutationFn: () => updatePlannedCycle(supabase, id, { name, startDate, durationWk, notes, compounds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle', id] })
      queryClient.invalidateQueries({ queryKey: ['cycle-compounds', id] })
      queryClient.invalidateQueries({ queryKey: ['cycle-plans'] })
      setEditing(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteCycle(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle-plans'] })
      navigate('/planner')
    },
  })

  if (isLoading) return <p className="text-text-secondary">Loading...</p>
  if (!cycle) return <p className="text-danger">Plan not found</p>

  if (cycle.status === 'complete') {
    navigate(`/log/${id}`, { replace: true })
    return null
  }

  const isActive = cycle.status === 'active'
  const isPlanned = cycle.status === 'planned'

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/planner" className="text-xs text-text-secondary hover:text-accent">← Cycle Planner</Link>
          <div className="flex items-center gap-2 mt-2 mb-1">
            <h1 className="font-display text-2xl font-bold">{editing ? 'Edit plan' : cycle.name}</h1>
            <Badge variant={isActive ? 'accent' : 'default'}>{isActive ? 'active' : 'draft'}</Badge>
          </div>
          {!editing && (
            <p className="text-sm text-text-secondary font-mono">{cycle.start_date} · {cycle.duration_wk} weeks</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {isPlanned && !editing && (
            <>
              <Button variant="secondary" onClick={() => setEditing(true)}>Edit</Button>
              <Button variant="danger" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>Delete</Button>
              <Button onClick={() => activateMutation.mutate()} disabled={activateMutation.isPending}>
                {activateMutation.isPending ? 'Starting...' : 'Start cycle'}
              </Button>
            </>
          )}
          {isActive && <Link to="/"><Button variant="secondary">Dashboard</Button></Link>}
          {editing && (
            <>
              <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>Save</Button>
            </>
          )}
        </div>
      </div>

      {isActive && !editing && (
        <p className="text-sm text-accent bg-accent/10 border border-accent/30 rounded-md p-3">
          This stack is live. Log doses on the Dashboard — you can still add compounds there mid-cycle.
        </p>
      )}

      {editing ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-surface border border-border rounded-md p-4 space-y-4">
              <input value={name} onChange={(e) => setName(e.target.value)} className="field-input" placeholder="Stack name" />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="field-input font-mono" />
                <input type="number" min={4} max={52} value={durationWk} onChange={(e) => setDurationWk(Number(e.target.value))} className="field-input font-mono" />
              </div>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="field-input resize-y" placeholder="Notes" />
            </div>
            {compounds.map((row, idx) => (
              <CompoundRow
                key={idx}
                row={row}
                index={idx}
                allCompounds={allCompounds}
                search={search}
                onSearchChange={setSearch}
                isSearchOpen={activeSearchIdx}
                onSearchOpen={setActiveSearchIdx}
                onChange={(i, r) => setCompounds((p) => { const n = [...p]; n[i] = r; return n })}
                onRemove={(i) => setCompounds((p) => p.filter((_, j) => j !== i))}
                maxWeeks={durationWk}
              />
            ))}
            <Button variant="secondary" onClick={() => setCompounds((p) => [...p, emptyCompoundRow()])}>+ Add compound</Button>
          </div>
          <StackPreview name={name} startDate={startDate} durationWk={durationWk} compounds={compounds} showPk />
        </div>
      ) : (
        <>
          {addedMid.length > 0 && (
            <div className="bg-surface border border-border rounded-md p-4">
              <h2 className="font-display text-sm font-semibold mb-2">Added mid-cycle</h2>
              <ul className="space-y-1 text-sm font-mono">
                {addedMid.map((cc) => (
                  <li key={cc.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cc.compounds?.color_hex }} />
                    {cc.compounds?.name} — {cc.dose_mg}mg
                  </li>
                ))}
              </ul>
            </div>
          )}
          <StackPreview
            name={cycle.name}
            startDate={cycle.start_date}
            durationWk={cycle.duration_wk}
            compounds={plannedOnly.map((cc) => ({
              compound_id: cc.compound_id,
              compound: cc.compounds,
              dose_mg: cc.dose_mg,
              frequency: cc.frequency,
              custom_days: cc.custom_days,
              start_week: cc.start_week,
              end_week: cc.end_week,
            }))}
            showPk
          />
        </>
      )}
    </div>
  )
}