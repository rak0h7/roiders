import { addWeeks, format } from 'date-fns'
import GanttChart from '../charts/GanttChart'
import PKChart from '../charts/PKChart'
import { cycleWeeklyTotal } from '../../lib/cycle-utils'
import { weeklyDoseMg, frequencyLabel, calculateMultiCompoundPK } from '../../lib/pk-engine'

export default function StackPreview({ name, startDate, durationWk, compounds = [], showPk = false }) {
  const previewCycle = { name, start_date: startDate, duration_wk: durationWk, status: 'planned' }
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

  const endDate = startDate ? addWeeks(new Date(startDate), durationWk) : null
  const durationDays = durationWk * 7
  const pkData = showPk && previewCompounds.length
    ? calculateMultiCompoundPK(
        previewCompounds.map((cc) => ({
          compound: cc.compounds,
          cycleCompound: cc,
          doseDays: null,
        })),
        durationDays
      )
    : null

  return (
    <div className="bg-surface border border-border rounded-md p-4 space-y-4 sticky top-4">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-text-muted">Stack preview</p>
        <h2 className="font-display text-lg font-semibold mt-1">{name || 'Untitled stack'}</h2>
        <p className="text-sm text-text-secondary font-mono mt-1">
          {durationWk} wk
          {startDate && endDate && ` · ${format(new Date(startDate), 'dd MMM')} – ${format(endDate, 'dd MMM yyyy')}`}
        </p>
        <p className="font-mono text-2xl text-accent mt-2">
          {cycleWeeklyTotal(previewCompounds)}
          <span className="text-sm text-text-secondary ml-1">mg/wk</span>
        </p>
      </div>

      {previewCompounds.length > 0 ? (
        <div className="space-y-2">
          {previewCompounds.map((cc) => (
            <div key={cc.id} className="flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cc.compounds?.color_hex }} />
                <span className="truncate">{cc.compounds?.name}</span>
              </div>
              <span className="font-mono text-text-muted shrink-0">
                {weeklyDoseMg(cc.dose_mg, cc.frequency, cc.custom_days)}mg · {frequencyLabel(cc.frequency)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">Add compounds to see your stack.</p>
      )}

      {previewCompounds.length > 0 && (
        <>
          <GanttChart cycle={previewCycle} cycleCompounds={previewCompounds} doseLogs={[]} compact />
          {showPk && pkData && (
            <PKChart curves={pkData.curves} combined={pkData.combined} height={180} />
          )}
        </>
      )}
    </div>
  )
}