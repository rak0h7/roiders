import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'

export default function Profile() {
  const { user, signOut } = useAuth()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({})
  const [saved, setSaved] = useState(false)

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  useEffect(() => {
    if (profile) setForm(profile)
  }, [profile])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('profiles').update({
        username: form.username || null,
        dob: form.dob || null,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
        height_cm: form.height_cm ? Number(form.height_cm) : null,
        experience: form.experience || null,
        units: form.units || 'metric',
        bloodwork_ref_set: form.bloodwork_ref_set || 'uk',
      }).eq('id', user.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  const exportData = async () => {
    const [cyclesRes, panelsRes] = await Promise.all([
      supabase.from('cycles').select('*, cycle_compounds(*), dose_logs(*)').eq('user_id', user.id),
      supabase.from('bloodwork_panels').select('*, bloodwork_markers(*)').eq('user_id', user.id),
    ])

    const blob = new Blob([JSON.stringify({ cycles: cyclesRes.data, bloodwork: panelsRes.data }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'roiders-club-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const deleteAccount = async () => {
    if (!confirm('Delete your account and all data? This cannot be undone.')) return
    await signOut()
    alert('Contact support or use Supabase dashboard to fully delete auth user.')
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-display text-2xl font-bold">Profile & Settings</h1>

      <div className="bg-surface border border-border rounded-md p-4 space-y-4">
        <div>
          <label className="text-xs text-text-secondary">Email</label>
          <p className="font-mono text-sm mt-1">{user?.email}</p>
        </div>
        <div>
          <label className="text-xs text-text-secondary">Username</label>
          <input value={form.username ?? ''} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            className="w-full mt-1 bg-bg border border-border rounded-sm px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-secondary">Date of birth</label>
            <input type="date" value={form.dob ?? ''} onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
              className="w-full mt-1 bg-bg border border-border rounded-sm px-3 py-2 text-sm font-mono" />
          </div>
          <div>
            <label className="text-xs text-text-secondary">Experience</label>
            <select value={form.experience ?? ''} onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
              className="w-full mt-1 bg-bg border border-border rounded-sm px-3 py-2 text-sm">
              <option value="">—</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-secondary">Weight (kg)</label>
            <input type="number" value={form.weight_kg ?? ''} onChange={(e) => setForm((f) => ({ ...f, weight_kg: e.target.value }))}
              className="w-full mt-1 bg-bg border border-border rounded-sm px-3 py-2 text-sm font-mono" />
          </div>
          <div>
            <label className="text-xs text-text-secondary">Height (cm)</label>
            <input type="number" value={form.height_cm ?? ''} onChange={(e) => setForm((f) => ({ ...f, height_cm: e.target.value }))}
              className="w-full mt-1 bg-bg border border-border rounded-sm px-3 py-2 text-sm font-mono" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-secondary">Units</label>
            <select value={form.units ?? 'metric'} onChange={(e) => setForm((f) => ({ ...f, units: e.target.value }))}
              className="w-full mt-1 bg-bg border border-border rounded-sm px-3 py-2 text-sm">
              <option value="metric">Metric</option>
              <option value="imperial">Imperial</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-text-secondary">Bloodwork reference set</label>
            <select value={form.bloodwork_ref_set ?? 'uk'} onChange={(e) => setForm((f) => ({ ...f, bloodwork_ref_set: e.target.value }))}
              className="w-full mt-1 bg-bg border border-border rounded-sm px-3 py-2 text-sm">
              <option value="uk">UK</option>
              <option value="us">US</option>
              <option value="eu">EU</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : 'Save profile'}
          </Button>
          {saved && <span className="text-sm text-success self-center">Saved</span>}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-md p-4 space-y-3">
        <h2 className="font-display font-semibold">Data</h2>
        <Button variant="secondary" onClick={exportData}>Export data (JSON)</Button>
        <Button variant="danger" onClick={deleteAccount}>Delete account</Button>
        <Button variant="ghost" onClick={signOut}>Sign out</Button>
      </div>
    </div>
  )
}