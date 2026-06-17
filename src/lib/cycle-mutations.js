export async function activateCycle(supabase, userId, cycleId) {
  const { data: existingActive, error: fetchErr } = await supabase
    .from('cycles')
    .select('id')
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