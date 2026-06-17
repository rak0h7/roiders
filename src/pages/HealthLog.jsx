import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import StatCard from '../components/ui/StatCard'
import { format } from 'date-fns'

const emptyForm = () => ({
  logged_at: format(new Date(), 'yyyy-MM-dd'),
  weight_kg: '',
  bp_systolic: '',
  bp_diastolic: '',
  resting_hr: '',
  mood: '',
  libido: '',
  sleep_hr: '',
  notes: '',
})

function ScaleSelect({ value, onChange, label }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field-input mt-1">
        <option value="">—</option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  )
}

export default function HealthLog() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm())

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['health-logs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('health_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('health_logs').insert({
        user_id: user.id,
        logged_at: form.logged_at,
        weight_kg: form.weight_kg !== '' ? Number(form.weight_kg) : null,
        bp_systolic: form.bp_systolic !== '' ? Number(form.bp_systolic) : null,
        bp_diastolic: form.bp_diastolic !== '' ? Number(form.bp_diastolic) : null,
        resting_hr: form.resting_hr !== '' ? Number(form.resting_hr) : null,
        mood: form.mood !== '' ? Number(form.mood) : null,
        libido: form.libido !== '' ? Number(form.libido) : null,
        sleep_hr: form.sleep_hr !== '' ? Number(form.sleep_hr) : null,
        notes: form.notes || null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-logs'] })
      setForm(emptyForm())
      setShowForm(false)
    },
  })

  const latest = logs[0]

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Health Log</h1>
          <p className="text-sm text-text-secondary mt-1">Weight, vitals, mood, and sleep — independent of cycles</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New entry'}
        </Button>
      </div>

      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Latest weight" value={latest.weight_kg ?? '—'} unit={latest.weight_kg ? 'kg' : ''} />
          <StatCard
            label="Blood pressure"
            value={latest.bp_systolic && latest.bp_diastolic ? `${latest.bp_systolic}/${latest.bp_diastolic}` : '—'}
          />
          <StatCard label="Mood" value={latest.mood ?? '—'} unit="/5" />
          <StatCard label="Sleep" value={latest.sleep_hr ?? '—'} unit={latest.sleep_hr ? 'hr' : ''} />
        </div>
      )}

      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); saveMutation.mutate() }}
          className="bg-surface border border-border rounded-md p-4 space-y-4"
        >
          <h2 className="font-display font-semibold">New health entry</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Date</label>
              <input
                type="date"
                value={form.logged_at}
                onChange={(e) => setForm((f) => ({ ...f, logged_at: e.target.value }))}
                className="field-input mt-1 font-mono"
                required
              />
            </div>
            <div>
              <label className="field-label">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={form.weight_kg}
                onChange={(e) => setForm((f) => ({ ...f, weight_kg: e.target.value }))}
                className="field-input mt-1 font-mono"
              />
            </div>
            <div>
              <label className="field-label">BP systolic</label>
              <input
                type="number"
                value={form.bp_systolic}
                onChange={(e) => setForm((f) => ({ ...f, bp_systolic: e.target.value }))}
                className="field-input mt-1 font-mono"
              />
            </div>
            <div>
              <label className="field-label">BP diastolic</label>
              <input
                type="number"
                value={form.bp_diastolic}
                onChange={(e) => setForm((f) => ({ ...f, bp_diastolic: e.target.value }))}
                className="field-input mt-1 font-mono"
              />
            </div>
            <div>
              <label className="field-label">Resting HR</label>
              <input
                type="number"
                value={form.resting_hr}
                onChange={(e) => setForm((f) => ({ ...f, resting_hr: e.target.value }))}
                className="field-input mt-1 font-mono"
              />
            </div>
            <div>
              <label className="field-label">Sleep (hours)</label>
              <input
                type="number"
                step="0.5"
                value={form.sleep_hr}
                onChange={(e) => setForm((f) => ({ ...f, sleep_hr: e.target.value }))}
                className="field-input mt-1 font-mono"
              />
            </div>
            <ScaleSelect label="Mood (1–5)" value={form.mood} onChange={(v) => setForm((f) => ({ ...f, mood: v }))} />
            <ScaleSelect label="Libido (1–5)" value={form.libido} onChange={(v) => setForm((f) => ({ ...f, libido: v }))} />
          </div>
          <div>
            <label className="field-label">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="field-input mt-1 resize-y"
            />
          </div>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : 'Save entry'}
          </Button>
        </form>
      )}

      <div className="bg-surface border border-border rounded-md overflow-x-auto">
        {isLoading ? (
          <p className="p-4 text-text-secondary">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="p-8 text-center text-text-muted">No health entries yet.</p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-text-muted">
                <th className="p-3">Date</th>
                <th className="p-3 font-mono">Weight</th>
                <th className="p-3 font-mono">BP</th>
                <th className="p-3 font-mono">HR</th>
                <th className="p-3 font-mono">Mood</th>
                <th className="p-3 font-mono">Libido</th>
                <th className="p-3 font-mono">Sleep</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border/50 hover:bg-bg/50">
                  <td className="p-3 font-mono whitespace-nowrap">{log.logged_at}</td>
                  <td className="p-3 font-mono">{log.weight_kg != null ? `${log.weight_kg} kg` : '—'}</td>
                  <td className="p-3 font-mono">
                    {log.bp_systolic && log.bp_diastolic ? `${log.bp_systolic}/${log.bp_diastolic}` : '—'}
                  </td>
                  <td className="p-3 font-mono">{log.resting_hr ?? '—'}</td>
                  <td className="p-3 font-mono">{log.mood ?? '—'}</td>
                  <td className="p-3 font-mono">{log.libido ?? '—'}</td>
                  <td className="p-3 font-mono">{log.sleep_hr != null ? `${log.sleep_hr}h` : '—'}</td>
                  <td className="p-3 text-text-secondary max-w-[200px] truncate">{log.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}