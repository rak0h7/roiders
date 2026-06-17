import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import Button from '../ui/Button'
import { getCurrentWeek } from '../../lib/cycle-utils'

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'eod', label: 'EOD' },
  { value: 'mwf', label: 'MWF' },
]

export default function AddCompoundPanel({ cycleId, cycle, onSuccess }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [doseMg, setDoseMg] = useState('')
  const [frequency, setFrequency] = useState('mwf')
  const [startWeek, setStartWeek] = useState(() => getCurrentWeek(cycle) || 1)
  const [showDropdown, setShowDropdown] = useState(false)

  const { data: allCompounds = [] } = useQuery({
    queryKey: ['compounds'],
    queryFn: async () => {
      const { data, error } = await supabase.from('compounds').select('*').order('name')
      if (error) throw error
      return data
    },
  })

  const filtered = search
    ? allCompounds.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : allCompounds

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error('Select a compound')
      const { error } = await supabase.from('cycle_compounds').insert({
        cycle_id: cycleId,
        compound_id: selected.id,
        dose_mg: Number(doseMg) || selected.default_dose_mg,
        frequency: selected.is_oral ? 'daily' : frequency,
        start_week: startWeek,
        notes: 'Added during active cycle',
      })
      if (error) throw error
    },
    onSuccess: () => {
      setSelected(null)
      setSearch('')
      setDoseMg('')
      onSuccess?.()
    },
  })

  const pickCompound = (compound) => {
    setSelected(compound)
    setDoseMg(compound.default_dose_mg)
    setFrequency(compound.is_oral ? 'daily' : 'mwf')
    setSearch(compound.name)
    setShowDropdown(false)
  }

  return (
    <div className="bg-surface border border-border rounded-md p-4 space-y-4">
      <div>
        <h2 className="font-display font-semibold">Add compound</h2>
        <p className="text-xs text-text-secondary mt-1">Add compounds not in your original plan</p>
      </div>

      <div className="relative">
        <label className="field-label">Compound</label>
        {selected ? (
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selected.color_hex }} />
            <span className="text-sm flex-1">{selected.name}</span>
            <button type="button" onClick={() => { setSelected(null); setSearch('') }} className="text-xs text-text-muted hover:text-danger">Change</button>
          </div>
        ) : (
          <>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowDropdown(true) }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search compounds..."
              className="field-input mt-1"
            />
            {showDropdown && filtered.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-surface border border-border rounded-sm shadow-lg max-h-36 overflow-y-auto">
                {filtered.slice(0, 6).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => pickCompound(c)}
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

      {selected && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Dose (mg)</label>
              <input type="number" value={doseMg} onChange={(e) => setDoseMg(e.target.value)} className="field-input mt-1 font-mono" />
            </div>
            <div>
              <label className="field-label">Start week</label>
              <input type="number" min={1} max={cycle?.duration_wk ?? 52} value={startWeek} onChange={(e) => setStartWeek(Number(e.target.value))} className="field-input mt-1 font-mono" />
            </div>
          </div>
          {!selected.is_oral && (
            <div>
              <label className="field-label">Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="field-input mt-1">
                {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          )}
          <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending}>
            {addMutation.isPending ? 'Adding...' : 'Add to cycle'}
          </Button>
        </>
      )}
    </div>
  )
}