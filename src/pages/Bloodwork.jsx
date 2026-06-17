import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import BloodworkTrendChart from '../components/charts/BloodworkTrendChart'
import { COMMON_MARKERS } from '../lib/cycle-utils'

function emptyMarker() {
  return { marker: '', value: '', unit: '', ref_low: '', ref_high: '' }
}

export default function Bloodwork() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [view, setView] = useState('list')
  const [selectedPanel, setSelectedPanel] = useState(null)
  const [trendMarker, setTrendMarker] = useState('')
  const [form, setForm] = useState({
    drawn_at: new Date().toISOString().slice(0, 10),
    lab_name: '',
    cycle_id: '',
    notes: '',
    markers: [emptyMarker()],
  })

  const { data: panels = [], isLoading } = useQuery({
    queryKey: ['bloodwork-panels', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bloodwork_panels')
        .select('*, bloodwork_markers(*)')
        .eq('user_id', user.id)
        .order('drawn_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const { data: cycles = [] } = useQuery({
    queryKey: ['cycles', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cycles')
        .select('id, name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: panel, error: panelErr } = await supabase
        .from('bloodwork_panels')
        .insert({
          user_id: user.id,
          drawn_at: form.drawn_at,
          lab_name: form.lab_name || null,
          cycle_id: form.cycle_id || null,
          notes: form.notes || null,
        })
        .select()
        .single()
      if (panelErr) throw panelErr

      const markers = form.markers
        .filter((m) => m.marker && m.value !== '')
        .map((m) => ({
          panel_id: panel.id,
          marker: m.marker,
          value: Number(m.value),
          unit: m.unit || null,
          ref_low: m.ref_low !== '' ? Number(m.ref_low) : null,
          ref_high: m.ref_high !== '' ? Number(m.ref_high) : null,
        }))

      if (markers.length) {
        const { error: mErr } = await supabase.from('bloodwork_markers').insert(markers)
        if (mErr) throw mErr
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloodwork-panels'] })
      setView('list')
      setForm({ drawn_at: new Date().toISOString().slice(0, 10), lab_name: '', cycle_id: '', notes: '', markers: [emptyMarker()] })
    },
  })

  const allMarkers = [...new Set(panels.flatMap((p) => p.bloodwork_markers?.map((m) => m.marker) ?? []))]
  const trendData = trendMarker
    ? panels
        .flatMap((p) =>
          (p.bloodwork_markers ?? [])
            .filter((m) => m.marker === trendMarker)
            .map((m) => ({ ...m, drawn_at: p.drawn_at }))
        )
        .sort((a, b) => new Date(a.drawn_at) - new Date(b.drawn_at))
    : []
  const trendRef = trendData[0]

  if (view === 'new') {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">New Panel</h1>
          <Button variant="ghost" onClick={() => setView('list')}>Cancel</Button>
        </div>

        <div className="bg-surface border border-border rounded-md p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-secondary">Date drawn</label>
              <input type="date" value={form.drawn_at} onChange={(e) => setForm((f) => ({ ...f, drawn_at: e.target.value }))}
                className="w-full mt-1 bg-bg border border-border rounded-sm px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label className="text-xs text-text-secondary">Lab name</label>
              <input value={form.lab_name} onChange={(e) => setForm((f) => ({ ...f, lab_name: e.target.value }))}
                className="w-full mt-1 bg-bg border border-border rounded-sm px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-text-secondary">Link to cycle (optional)</label>
            <select value={form.cycle_id} onChange={(e) => setForm((f) => ({ ...f, cycle_id: e.target.value }))}
              className="w-full mt-1 bg-bg border border-border rounded-sm px-3 py-2 text-sm">
              <option value="">None</option>
              {cycles.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display font-semibold">Markers</h2>
              <select
                className="text-xs bg-bg border border-border rounded-sm px-2 py-1"
                onChange={(e) => {
                  const preset = COMMON_MARKERS.find((m) => m.marker === e.target.value)
                  if (preset) setForm((f) => ({ ...f, markers: [...f.markers, { ...preset, value: '' }] }))
                  e.target.value = ''
                }}
                defaultValue=""
              >
                <option value="" disabled>Add common marker...</option>
                {COMMON_MARKERS.map((m) => <option key={m.marker} value={m.marker}>{m.marker}</option>)}
              </select>
            </div>
            {form.markers.map((m, idx) => (
              <div key={idx} className="grid grid-cols-5 gap-2 mb-2">
                <input placeholder="Marker" value={m.marker} onChange={(e) => {
                  const markers = [...form.markers]; markers[idx].marker = e.target.value; setForm((f) => ({ ...f, markers }))
                }} className="bg-bg border border-border rounded-sm px-2 py-1.5 text-sm" />
                <input placeholder="Value" type="number" value={m.value} onChange={(e) => {
                  const markers = [...form.markers]; markers[idx].value = e.target.value; setForm((f) => ({ ...f, markers }))
                }} className="bg-bg border border-border rounded-sm px-2 py-1.5 text-sm font-mono" />
                <input placeholder="Unit" value={m.unit} onChange={(e) => {
                  const markers = [...form.markers]; markers[idx].unit = e.target.value; setForm((f) => ({ ...f, markers }))
                }} className="bg-bg border border-border rounded-sm px-2 py-1.5 text-sm" />
                <input placeholder="Ref low" type="number" value={m.ref_low} onChange={(e) => {
                  const markers = [...form.markers]; markers[idx].ref_low = e.target.value; setForm((f) => ({ ...f, markers }))
                }} className="bg-bg border border-border rounded-sm px-2 py-1.5 text-sm font-mono" />
                <input placeholder="Ref high" type="number" value={m.ref_high} onChange={(e) => {
                  const markers = [...form.markers]; markers[idx].ref_high = e.target.value; setForm((f) => ({ ...f, markers }))
                }} className="bg-bg border border-border rounded-sm px-2 py-1.5 text-sm font-mono" />
              </div>
            ))}
            <Button variant="secondary" onClick={() => setForm((f) => ({ ...f, markers: [...f.markers, emptyMarker()] }))}>
              + Add marker
            </Button>
          </div>

          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : 'Save panel'}
          </Button>
        </div>
      </div>
    )
  }

  if (selectedPanel) {
    const flagged = selectedPanel.bloodwork_markers?.filter((m) => m.flagged).length ?? 0
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setSelectedPanel(null)}>← Back</Button>
        <h1 className="font-display text-2xl font-bold">Panel — {selectedPanel.drawn_at}</h1>
        {selectedPanel.lab_name && <p className="text-text-secondary">{selectedPanel.lab_name}</p>}
        {flagged > 0 && <Badge variant="danger">{flagged} flagged</Badge>}

        <div className="bg-surface border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase text-text-muted">
                <th className="p-3">Marker</th>
                <th className="p-3">Value</th>
                <th className="p-3">Reference</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {selectedPanel.bloodwork_markers?.map((m) => (
                <tr key={m.id} className={`border-b border-border/50 ${m.flagged ? 'border-l-2 border-l-danger' : ''}`}>
                  <td className="p-3">{m.marker}</td>
                  <td className={`p-3 font-mono ${m.flagged ? 'text-danger' : ''}`}>{m.value} {m.unit}</td>
                  <td className="p-3 font-mono text-text-secondary">{m.ref_low} – {m.ref_high}</td>
                  <td className="p-3">{m.flagged ? <Badge variant="danger">Flagged</Badge> : <Badge variant="success">OK</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Bloodwork</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setView(view === 'trends' ? 'list' : 'trends')}>
            {view === 'trends' ? 'Panel list' : 'Trends'}
          </Button>
          <Button onClick={() => setView('new')}>+ New Panel</Button>
        </div>
      </div>

      {view === 'trends' ? (
        <div className="space-y-4">
          <select
            value={trendMarker}
            onChange={(e) => setTrendMarker(e.target.value)}
            className="bg-surface border border-border rounded-sm px-3 py-2 text-sm"
          >
            <option value="">Select marker...</option>
            {allMarkers.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <BloodworkTrendChart
            data={trendData}
            refLow={trendRef?.ref_low}
            refHigh={trendRef?.ref_high}
            markerName={trendMarker}
          />
        </div>
      ) : (
        <>
          {isLoading && <p className="text-text-secondary">Loading...</p>}
          {!isLoading && panels.length === 0 && (
            <div className="bg-surface border border-border rounded-md p-8 text-center">
              <p className="text-text-secondary mb-4">No bloodwork panels yet.</p>
              <Button onClick={() => setView('new')}>+ New Panel</Button>
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {panels.map((panel) => {
              const flagged = panel.bloodwork_markers?.filter((m) => m.flagged).length ?? 0
              return (
                <button
                  key={panel.id}
                  onClick={() => setSelectedPanel(panel)}
                  className="text-left bg-surface border border-border rounded-md p-4 hover:border-accent/40 transition-colors"
                >
                  <p className="font-mono font-medium">{panel.drawn_at}</p>
                  {panel.lab_name && <p className="text-sm text-text-secondary mt-1">{panel.lab_name}</p>}
                  <div className="flex gap-2 mt-3">
                    <Badge>{panel.bloodwork_markers?.length ?? 0} markers</Badge>
                    {flagged > 0 && <Badge variant="danger">{flagged} flagged</Badge>}
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}