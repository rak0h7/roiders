import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import { supabase } from '../../lib/supabase'
import Button from '../ui/Button'
import { INJECTION_SITES } from '../../lib/cycle-utils'

const defaultForm = () => ({
  cycle_compound_id: '',
  logged_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  dose_mg: '',
  injection_site: '',
  notes: '',
})

export default function DoseLogForm({
  userId,
  cycleId,
  cycleCompounds = [],
  onSuccess,
  preset,
}) {
  const [form, setForm] = useState(() => ({
    ...defaultForm(),
    ...(preset?.cycle_compound_id ? { cycle_compound_id: preset.cycle_compound_id } : {}),
    ...(preset?.dose_mg != null ? { dose_mg: preset.dose_mg } : {}),
    ...(preset?.logged_at ? { logged_at: preset.logged_at } : {}),
  }))

  const logMutation = useMutation({
    mutationFn: async () => {
      const cc = cycleCompounds.find((c) => c.id === form.cycle_compound_id)
      const { error } = await supabase.from('dose_logs').insert({
        user_id: userId,
        cycle_compound_id: form.cycle_compound_id,
        logged_at: new Date(form.logged_at).toISOString(),
        dose_mg: Number(form.dose_mg) || cc?.dose_mg,
        injection_site: form.injection_site || null,
        notes: form.notes || null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      setForm((f) => ({ ...defaultForm(), cycle_compound_id: f.cycle_compound_id }))
      onSuccess?.()
    },
  })

  const handleSelectCompound = (ccId) => {
    const cc = cycleCompounds.find((c) => c.id === ccId)
    setForm((f) => ({
      ...f,
      cycle_compound_id: ccId,
      dose_mg: cc?.dose_mg ?? '',
    }))
  }

  if (!cycleCompounds.length) {
    return (
      <p className="text-sm text-text-muted">Add a compound to this cycle before logging doses.</p>
    )
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); logMutation.mutate() }}
      className="bg-surface border border-border rounded-md p-4 space-y-4"
    >
      <h2 className="font-display font-semibold">Log dose</h2>

      <div>
        <label className="field-label">Compound</label>
        <select
          value={form.cycle_compound_id}
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
          value={form.logged_at}
          onChange={(e) => setForm((f) => ({ ...f, logged_at: e.target.value }))}
          className="field-input mt-1 font-mono"
          required
        />
      </div>
      <div>
        <label className="field-label">Dose (mg)</label>
        <input
          type="number"
          value={form.dose_mg}
          onChange={(e) => setForm((f) => ({ ...f, dose_mg: e.target.value }))}
          className="field-input mt-1 font-mono"
        />
      </div>
      <div>
        <label className="field-label">Injection site</label>
        <select
          value={form.injection_site}
          onChange={(e) => setForm((f) => ({ ...f, injection_site: e.target.value }))}
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
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          className="field-input mt-1"
        />
      </div>
      <Button type="submit" disabled={logMutation.isPending}>
        {logMutation.isPending ? 'Logging...' : 'Log dose'}
      </Button>
    </form>
  )
}