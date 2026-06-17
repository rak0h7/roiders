import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import GanttChart from '../components/charts/GanttChart'
import { weeklyDoseMg, frequencyLabel } from '../lib/pk-engine'
import { cycleWeeklyTotal } from '../lib/cycle-utils'
import { addWeeks, format } from 'date-fns'

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'eod', label: 'EOD' },
  { value: 'mwf', label: 'MWF' },
  { value: 'custom', label: 'Custom' },
]

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function emptyCompound() {
  return {
    compound_id: '',
    compound: null,
    dose_mg: '',
    frequency: 'mwf',
    custom_days: [1, 3, 5],
    start_week: 1,
    end_week: null,
  }
}

export default function NewCycle() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [durationWk, setDurationWk] = useState(12)
  const [notes, setNotes] = useState('')
  const [compounds, setCompounds] = useState([emptyCompound()])
  const [search, setSearch] = useState('')
  const [activeSearchIdx, setActiveSearchIdx] = useState(null)
  const [error, setError] = useState('')

  const { data: allCompounds = [] } = useQuery({
    queryKey: ['compounds'],
    queryFn: async () => {
      const { data, error: err } = await supabase.from('compounds').select('*').order('name')
      if (err) throw err
      return data
    },
  })

  const filtered = search
    ? allCompounds.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : allCompounds

  const previewCycle = {
    name,
    start_date: startDate,
    duration_wk: durationWk,
    status: 'planned',
  }

  const previewCompounds = compounds
    .filter((c) => c.compound_id)
    .map((c, i) => ({
      id: `preview-${i}`,
      compound_id: c.compound_id,
      dose_mg: Number(c.dose_mg),
      frequency: c.frequency,
      custom_days: c.custom_days,
      start_week: c.start_week,
      end_week: c.end_week,
      compounds: c.compound,
    }))

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: cycle, error: cycleErr } = await supabase
        .from('cycles')
        .insert({
          user_id: user.id,
          name,
          start_date: startDate,
          duration_wk: durationWk,
          status: 'planned',
          notes: notes || null,
        })
        .select()
        .single()
      if (cycleErr) throw cycleErr

      const rows = compounds
        .filter((c) => c.compound_id)
        .map((c) => ({
          cycle_id: cycle.id,
          compound_id: c.compound_id,
          dose_mg: Number(c.dose_mg),
          frequency: c.frequency,
          custom_days: c.frequency === 'custom' ? c.custom_days : null,
          start_week: c.start_week || 1,
          end_week: c.end_week || null,
        }))

      if (rows.length) {
        const { error: ccErr } = await supabase.from('cycle_compounds').insert(rows)
        if (ccErr) throw ccErr
      }

      return cycle
    },
    onSuccess: (cycle) => {
      queryClient.invalidateQueries({ queryKey: ['cycles'] })
      navigate(`/cycles/${cycle.id}`)
    },
    onError: (err) => setError(err.message),
  })

  const selectCompound = (idx, compound) => {
    setCompounds((prev) => {
      const next = [...prev]
      next[idx] = {
        ...next[idx],
        compound_id: compound.id,
        compound,
        dose_mg: compound.default_dose_mg,
        frequency: compound.is_oral ? 'daily' : 'mwf',
      }
      return next
    })
    setSearch('')
    setActiveSearchIdx(null)
  }

  const endDate = startDate ? addWeeks(new Date(startDate), durationWk) : null

  return (
    <div className="max-w-6xl">
      <h1 className="font-display text-2xl font-bold mb-6">New Cycle</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-md p-4 space-y-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Cycle name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Summer bulk 2026"
                className="w-full bg-bg border border-border rounded-sm px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Start date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-bg border border-border rounded-sm px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Duration (weeks)</label>
                <input
                  type="number"
                  min={4}
                  max={52}
                  value={durationWk}
                  onChange={(e) => setDurationWk(Number(e.target.value))}
                  className="w-full bg-bg border border-border rounded-sm px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-bg border border-border rounded-sm px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-md p-4">
            <h2 className="font-display font-semibold mb-4">Compounds</h2>
            <div className="space-y-4">
              {compounds.map((row, idx) => (
                <div key={idx} className="border border-border rounded-md p-3 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 relative">
                      {row.compound ? (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.compound.color_hex }} />
                          <span className="text-sm font-medium">{row.compound.name}</span>
                          <button
                            type="button"
                            onClick={() => setCompounds((p) => { const n = [...p]; n[idx] = emptyCompound(); return n })}
                            className="text-text-muted hover:text-danger text-xs ml-auto"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <>
                          <input
                            value={activeSearchIdx === idx ? search : ''}
                            onChange={(e) => { setSearch(e.target.value); setActiveSearchIdx(idx) }}
                            onFocus={() => setActiveSearchIdx(idx)}
                            placeholder="Search compounds..."
                            className="w-full bg-bg border border-border rounded-sm px-3 py-2 text-sm"
                          />
                          {activeSearchIdx === idx && filtered.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full bg-surface border border-border rounded-sm shadow-lg max-h-40 overflow-y-auto">
                              {filtered.slice(0, 8).map((c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => selectCompound(idx, c)}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-bg flex items-center gap-2"
                                >
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color_hex }} />
                                  {c.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {compounds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setCompounds((p) => p.filter((_, i) => i !== idx))}
                        className="text-text-muted hover:text-danger px-2"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {row.compound_id && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] text-text-muted uppercase">Dose (mg)</label>
                        <input
                          type="number"
                          value={row.dose_mg}
                          onChange={(e) => setCompounds((p) => { const n = [...p]; n[idx].dose_mg = e.target.value; return n })}
                          className="w-full bg-bg border border-border rounded-sm px-2 py-1.5 text-sm font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-text-muted uppercase">Frequency</label>
                        <select
                          value={row.frequency}
                          onChange={(e) => setCompounds((p) => { const n = [...p]; n[idx].frequency = e.target.value; return n })}
                          className="w-full bg-bg border border-border rounded-sm px-2 py-1.5 text-sm"
                        >
                          {FREQUENCIES.map((f) => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-text-muted uppercase">Start wk</label>
                        <input
                          type="number"
                          min={1}
                          value={row.start_week}
                          onChange={(e) => setCompounds((p) => { const n = [...p]; n[idx].start_week = Number(e.target.value); return n })}
                          className="w-full bg-bg border border-border rounded-sm px-2 py-1.5 text-sm font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-text-muted uppercase">Weekly mg</label>
                        <p className="font-mono text-sm py-1.5 text-accent">
                          {weeklyDoseMg(Number(row.dose_mg), row.frequency, row.custom_days)}
                        </p>
                      </div>
                    </div>
                  )}

                  {row.frequency === 'custom' && (
                    <div className="flex gap-1 flex-wrap">
                      {DAY_LABELS.map((label, day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setCompounds((p) => {
                            const n = [...p]
                            const days = n[idx].custom_days ?? []
                            n[idx].custom_days = days.includes(day)
                              ? days.filter((d) => d !== day)
                              : [...days, day].sort()
                            return n
                          })}
                          className={`px-2 py-1 text-xs font-mono rounded-sm border ${
                            row.custom_days?.includes(day)
                              ? 'bg-accent/20 border-accent text-accent'
                              : 'border-border text-text-muted'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => setCompounds((p) => [...p, emptyCompound()])}
            >
              + Add another compound
            </Button>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!name || saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Saving...' : 'Save cycle'}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-md p-4 sticky top-4">
            <h2 className="font-display font-semibold mb-3">Preview</h2>
            <p className="text-lg font-medium">{name || 'Untitled cycle'}</p>
            <p className="text-sm text-text-secondary font-mono mt-1">
              {durationWk} weeks · {startDate && endDate ? `${format(new Date(startDate), 'dd MMM')} – ${format(endDate, 'dd MMM yyyy')}` : '—'}
            </p>
            <p className="font-mono text-accent mt-2">{cycleWeeklyTotal(previewCompounds)} mg/wk total</p>

            <div className="mt-4 space-y-2">
              {previewCompounds.map((cc) => (
                <div key={cc.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cc.compounds?.color_hex }} />
                    <span>{cc.compounds?.name}</span>
                  </div>
                  <span className="font-mono text-text-muted">
                    {weeklyDoseMg(cc.dose_mg, cc.frequency, cc.custom_days)}mg · {frequencyLabel(cc.frequency)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <GanttChart cycle={previewCycle} cycleCompounds={previewCompounds} compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}