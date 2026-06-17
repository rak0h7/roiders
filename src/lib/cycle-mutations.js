import { MID_CYCLE_TAG } from './cycle-utils'

export async function activateCycle(supabase, userId, cycleId) {
  const { data: existingActive, error: fetchErr } = await supabase
    .from('cycles')
    .select('id, name')
    .eq('user_id', userId)
    .eq('status', 'active')

  if (fetchErr) throw fetchErr

  for (const cycle of existingActive ?? []) {
    if (cycle.id !== cycleId) {
      const { error } = await supabase.from('cycles').update({ status: 'complete' }).eq('id', cycle.id)
      if (error) throw error
    }
  }

  const { error } = await supabase.from('cycles').update({ status: 'active' }).eq('id', cycleId)
  if (error) throw error
}

export async function completeCycle(supabase, cycleId) {
  const { error } = await supabase.from('cycles').update({ status: 'complete' }).eq('id', cycleId)
  if (error) throw error
}

export async function deleteCycle(supabase, cycleId) {
  const { error } = await supabase.from('cycles').delete().eq('id', cycleId)
  if (error) throw error
}

function compoundRowsToDb(compounds, cycleId) {
  return compounds
    .filter((c) => c.compound_id)
    .map((c) => ({
      cycle_id: cycleId,
      compound_id: c.compound_id,
      dose_mg: Number(c.dose_mg),
      frequency: c.frequency,
      custom_days: c.frequency === 'custom' ? c.custom_days : null,
      start_week: c.start_week || 1,
      end_week: c.end_week || null,
      notes: c.notes || null,
    }))
}

export async function createCycle(supabase, userId, { name, startDate, durationWk, notes, compounds, status = 'planned' }) {
  const { data: cycle, error: cycleErr } = await supabase
    .from('cycles')
    .insert({
      user_id: userId,
      name,
      start_date: startDate,
      duration_wk: durationWk,
      status,
      notes: notes || null,
    })
    .select()
    .single()
  if (cycleErr) throw cycleErr

  const rows = compoundRowsToDb(compounds, cycle.id)
  if (rows.length) {
    const { error: ccErr } = await supabase.from('cycle_compounds').insert(rows)
    if (ccErr) throw ccErr
  }

  return cycle
}

export async function updatePlannedCycle(supabase, cycleId, { name, startDate, durationWk, notes, compounds }) {
  const { error: cycleErr } = await supabase
    .from('cycles')
    .update({
      name,
      start_date: startDate,
      duration_wk: durationWk,
      notes: notes || null,
    })
    .eq('id', cycleId)
  if (cycleErr) throw cycleErr

  await supabase.from('cycle_compounds').delete().eq('cycle_id', cycleId)

  const rows = compoundRowsToDb(compounds, cycleId)
  if (rows.length) {
    const { error: ccErr } = await supabase.from('cycle_compounds').insert(rows)
    if (ccErr) throw ccErr
  }
}

export function midCycleNote() {
  return MID_CYCLE_TAG
}