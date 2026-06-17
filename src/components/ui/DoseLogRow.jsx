import { formatDateTime } from '../../lib/cycle-utils'

export default function DoseLogRow({ dose }) {
  return (
    <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto_auto_auto] gap-x-3 gap-y-1 text-sm border-b border-border/50 pb-2 items-center">
      <span
        className="w-2 h-2 rounded-full shrink-0 row-span-2 sm:row-span-1"
        style={{ backgroundColor: dose.cycle_compounds?.compounds?.color_hex }}
      />
      <span className="font-medium truncate">{dose.cycle_compounds?.compounds?.name}</span>
      <span className="font-mono text-text-secondary text-xs sm:text-sm col-span-2 sm:col-span-1">
        {formatDateTime(dose.logged_at)}
      </span>
      <span className="font-mono sm:text-right">{dose.dose_mg}mg</span>
      {dose.injection_site && (
        <span className="text-[10px] font-mono text-text-muted hidden sm:inline">{dose.injection_site}</span>
      )}
    </div>
  )
}