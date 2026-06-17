import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import CompoundRow from '../components/cycles/CompoundRow'
import StackPreview from '../components/cycles/StackPreview'
import { STACK_TEMPLATES, applyTemplate } from '../lib/stack-templates'
import { emptyCompoundRow } from '../lib/cycle-utils'
import { createCycle, activateCycle } from '../lib/cycle-mutations'

const STEPS = ['Template', 'Details', 'Stack', 'Review']

export default function NewCycle() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [step, setStep] = useState(0)
  const [templateId, setTemplateId] = useState('scratch')
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [durationWk, setDurationWk] = useState(12)
  const [notes, setNotes] = useState('')
  const [compounds, setCompounds] = useState([emptyCompoundRow()])
  const [search, setSearch] = useState('')
  const [activeSearchIdx, setActiveSearchIdx] = useState(null)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()

  const { data: allCompounds = [] } = useQuery({
    queryKey: ['compounds'],
    queryFn: async () => {
      const { data, error: err } = await supabase.from('compounds').select('*').order('name')
      if (err) throw err
      return data
    },
  })

  const applyTemplateChoice = (id) => {
    setTemplateId(id)
    const template = STACK_TEMPLATES.find((t) => t.id === id)
    if (!template || id === 'scratch') return
    const applied = applyTemplate(template, allCompounds)
    setDurationWk(applied.duration_wk)
    setCompounds(applied.compounds)
    setName((n) => n || template.name)
    setStep(1)
  }

  useEffect(() => {
    const t = searchParams.get('template')
    if (t && allCompounds.length && templateId === 'scratch') applyTemplateChoice(t)
  }, [searchParams, allCompounds.length])

  const updateCompound = (index, row) => {
    setCompounds((prev) => { const n = [...prev]; n[index] = row; return n })
  }

  const saveMutation = useMutation({
    mutationFn: async (andActivate) => {
      const cycle = await createCycle(supabase, user.id, { name, startDate, durationWk, notes, compounds })
      if (andActivate) await activateCycle(supabase, user.id, cycle.id)
      return { cycle, andActivate }
    },
    onSuccess: ({ cycle, andActivate }) => {
      queryClient.invalidateQueries({ queryKey: ['cycle-plans'] })
      queryClient.invalidateQueries({ queryKey: ['active-cycle'] })
      navigate(andActivate ? '/' : `/planner/${cycle.id}`)
    },
    onError: (err) => setError(err.message),
  })

  const canNext = () => {
    if (step === 1) return name.trim().length > 0
    if (step === 2) return compounds.some((c) => c.compound_id)
    return true
  }

  return (
    <div className="max-w-6xl">
      <Link to="/planner" className="text-xs text-text-secondary hover:text-accent">← Cycle Planner</Link>
      <h1 className="font-display text-2xl font-bold mt-2 mb-1">Build a stack</h1>
      <p className="text-sm text-text-secondary mb-6">Plan your compounds, pin schedule, and duration — like SteroidPlotter, but tied to your log.</p>

      {/* Step indicator */}
      <div className="flex gap-1 mb-8 overflow-x-auto scrollbar-none">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => i < step && setStep(i)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-sm shrink-0 ${
              i === step ? 'bg-accent/15 text-accent border border-accent/40' :
              i < step ? 'text-text-secondary hover:text-text' : 'text-text-muted'
            }`}
          >
            <span className="font-mono text-xs w-5 h-5 rounded-full border flex items-center justify-center">{i + 1}</span>
            {label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {step === 0 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {STACK_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => applyTemplateChoice(t.id)}
                  className={`text-left p-4 rounded-md border transition-colors ${
                    templateId === t.id ? 'border-accent bg-accent/10' : 'border-border bg-surface hover:border-accent/40'
                  }`}
                >
                  <p className="font-display font-semibold">{t.name}</p>
                  <p className="text-xs text-text-secondary mt-1">{t.description}</p>
                  {t.compounds.length > 0 && (
                    <p className="text-[10px] font-mono text-text-muted mt-2">{t.compounds.length} compounds · {t.duration_wk} wk</p>
                  )}
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="bg-surface border border-border rounded-md p-4 space-y-4">
              <div>
                <label className="field-label">Stack name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer bulk 2026" className="field-input mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Start date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="field-input mt-1 font-mono" />
                </div>
                <div>
                  <label className="field-label">Length (weeks)</label>
                  <input type="number" min={4} max={52} value={durationWk} onChange={(e) => setDurationWk(Number(e.target.value))} className="field-input mt-1 font-mono" />
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {[8, 12, 16, 20].map((w) => (
                      <button key={w} type="button" onClick={() => setDurationWk(w)} className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border ${durationWk === w ? 'border-accent text-accent' : 'border-border text-text-muted'}`}>
                        {w}wk
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="field-label">Notes (optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="field-input mt-1 resize-y" placeholder="Goals, ancillaries, bloodwork plan..." />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">Add compounds and set pin schedule. Orals default to daily; injectables to EOD or MWF.</p>
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
                  onChange={updateCompound}
                  onRemove={(i) => setCompounds((p) => p.filter((_, j) => j !== i))}
                  canRemove={compounds.length > 1}
                  maxWeeks={durationWk}
                />
              ))}
              <Button variant="secondary" onClick={() => setCompounds((p) => [...p, emptyCompoundRow()])}>
                + Add compound
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="bg-surface border border-border rounded-md p-4 space-y-4">
              <h2 className="font-display font-semibold">Ready to go?</h2>
              <p className="text-sm text-text-secondary">
                <strong className="text-text">Save as draft</strong> — tweak later in Cycle Planner.<br />
                <strong className="text-text">Start now</strong> — moves to Dashboard for dose logging today.
              </p>
              {error && <p className="text-sm text-danger">{error}</p>}
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => saveMutation.mutate(false)} disabled={saveMutation.isPending}>
                  Save as draft
                </Button>
                <Button onClick={() => saveMutation.mutate(true)} disabled={saveMutation.isPending || !compounds.some((c) => c.compound_id)}>
                  {saveMutation.isPending ? 'Saving...' : 'Start cycle now'}
                </Button>
              </div>
            </div>
          )}

          {step < 3 && (
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                Back
              </Button>
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
                Continue
              </Button>
            </div>
          )}
        </div>

        <StackPreview
          name={name}
          startDate={startDate}
          durationWk={durationWk}
          compounds={compounds}
          showPk={step >= 2}
        />
      </div>
    </div>
  )
}