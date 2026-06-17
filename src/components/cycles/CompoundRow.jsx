import { weeklyDoseMg, frequencyLabel } from '../../lib/pk-engine'
import { FREQUENCIES, emptyCompoundRow } from '../../lib/cycle-utils'
import PinDayPicker from './PinDayPicker'
import Badge from '../ui/Badge'

export default function CompoundRow({
  row,
  index,
  allCompounds = [],
  search,
  onSearchChange,
  isSearchOpen,
  onSearchOpen,
  onChange,
  onRemove,
  canRemove = true,
  maxWeeks = 52,
}) {
  const filtered = search
    ? allCompounds.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : allCompounds

  const selectCompound = (compound) => {
    onChange(index, {
      ...row,
      compound_id: compound.id,
      compound,
      dose_mg: compound.default_dose_mg,
      frequency: compound.is_oral ? 'daily' : row.frequency || 'mwf',
    })
    onSearchChange('')
    onSearchOpen(null)
  }

  const weekly = row.compound_id ? weeklyDoseMg(Number(row.dose_mg), row.frequency, row.custom_days) : 0

  return (
    <div className="bg-bg border border-border rounded-md p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {row.compound ? (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: row.compound.color_hex }} />
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{row.compound.name}</p>
                <p className="text-[10px] text-text-muted uppercase">{row.compound.type} · HL {row.compound.half_life_label}</p>
              </div>
              <button type="button" onClick={() => onChange(index, emptyCompoundRow())} className="text-xs text-text-muted hover:text-accent ml-auto shrink-0">
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                value={isSearchOpen === index ? search : ''}
                onChange={(e) => { onSearchChange(e.target.value); onSearchOpen(index) }}
                onFocus={() => onSearchOpen(index)}
                placeholder="Search compound library..."
                className="field-input"
              />
              {isSearchOpen === index && filtered.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-surface border border-border rounded-md shadow-xl max-h-48 overflow-y-auto">
                  {filtered.slice(0, 10).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectCompound(c)}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-bg flex items-center gap-2 border-b border-border/30 last:border-0"
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color_hex }} />
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="text-[10px] font-mono text-text-muted">{c.default_dose_mg}mg</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {canRemove && (
          <button type="button" onClick={() => onRemove(index)} className="text-text-muted hover:text-danger p-1 shrink-0" aria-label="Remove">
            ×
          </button>
        )}
      </div>

      {row.compound_id && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="field-label">Dose (mg)</label>
              <input
                type="number"
                value={row.dose_mg}
                onChange={(e) => onChange(index, { ...row, dose_mg: e.target.value })}
                className="field-input mt-1 font-mono"
              />
            </div>
            <div>
              <label className="field-label">Pin schedule</label>
              <select
                value={row.frequency}
                onChange={(e) => onChange(index, { ...row, frequency: e.target.value })}
                className="field-input mt-1"
                disabled={row.compound?.is_oral}
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Weeks</label>
              <div className="flex gap-1 mt-1">
                <input
                  type="number"
                  min={1}
                  max={maxWeeks}
                  value={row.start_week}
                  onChange={(e) => onChange(index, { ...row, start_week: Number(e.target.value) })}
                  className="field-input font-mono w-full"
                  title="Start week"
                  placeholder="Start"
                />
                <span className="text-text-muted self-center text-xs">–</span>
                <input
                  type="number"
                  min={row.start_week || 1}
                  max={maxWeeks}
                  value={row.end_week ?? ''}
                  onChange={(e) => onChange(index, { ...row, end_week: e.target.value ? Number(e.target.value) : null })}
                  className="field-input font-mono w-full"
                  placeholder="End"
                  title="End week (blank = full cycle)"
                />
              </div>
            </div>
            <div>
              <label className="field-label">Weekly total</label>
              <p className="font-mono text-lg text-accent mt-1">{weekly}<span className="text-xs text-text-secondary ml-1">mg</span></p>
            </div>
          </div>

          {row.frequency === 'custom' && (
            <div>
              <label className="field-label mb-1.5 block">Pin days</label>
              <PinDayPicker
                selected={row.custom_days ?? []}
                onChange={(days) => onChange(index, { ...row, custom_days: days })}
              />
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Badge>{frequencyLabel(row.frequency)}</Badge>
            <span className="text-[10px] text-text-muted font-mono">
              Wk {row.start_week}{row.end_week ? `–${row.end_week}` : `–${maxWeeks}`}
            </span>
          </div>
        </>
      )}
    </div>
  )
}