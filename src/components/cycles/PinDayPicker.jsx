import { DAY_LABELS } from '../../lib/cycle-utils'

export default function PinDayPicker({ selected = [], onChange, readOnly = false }) {
  return (
    <div className="flex gap-1">
      {DAY_LABELS.map((label, day) => {
        const active = selected.includes(day)
        return (
          <button
            key={day}
            type="button"
            disabled={readOnly}
            onClick={() => {
              if (readOnly) return
              onChange(active ? selected.filter((d) => d !== day) : [...selected, day].sort())
            }}
            className={`w-7 h-7 text-[10px] font-mono rounded-sm border transition-colors ${
              active
                ? 'bg-accent/25 border-accent text-accent'
                : 'border-border text-text-muted hover:border-text-muted'
            } ${readOnly ? 'cursor-default opacity-80' : ''}`}
            title={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}