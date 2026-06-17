/** Common stack starting points — inspired by typical AAS tracker presets */

export const STACK_TEMPLATES = [
  {
    id: 'scratch',
    name: 'Blank stack',
    description: 'Start from scratch',
    duration_wk: 12,
    compounds: [],
  },
  {
    id: 'trt',
    name: 'TRT',
    description: 'Test-only cruise / TRT',
    duration_wk: 52,
    compounds: [
      { slug: 'testosterone-cypionate', dose_mg: 150, frequency: 'eod', start_week: 1 },
    ],
  },
  {
    id: 'bulk',
    name: 'Classic bulk',
    description: 'Test E + Deca — 16 weeks',
    duration_wk: 16,
    compounds: [
      { slug: 'testosterone-enanthate', dose_mg: 500, frequency: 'eod', start_week: 1 },
      { slug: 'nandrolone-decanoate', dose_mg: 200, frequency: 'mwf', start_week: 1 },
    ],
  },
  {
    id: 'cut',
    name: 'Cut / recomp',
    description: 'Test P + Mast + Var finisher',
    duration_wk: 12,
    compounds: [
      { slug: 'testosterone-propionate', dose_mg: 100, frequency: 'eod', start_week: 1 },
      { slug: 'drostanolone-propionate', dose_mg: 100, frequency: 'eod', start_week: 1 },
      { slug: 'oxandrolone', dose_mg: 50, frequency: 'daily', start_week: 9, end_week: 12 },
    ],
  },
  {
    id: 'cruise',
    name: 'Blast & cruise',
    description: '12-week blast then cruise dose',
    duration_wk: 20,
    compounds: [
      { slug: 'testosterone-enanthate', dose_mg: 500, frequency: 'eod', start_week: 1, end_week: 12 },
      { slug: 'testosterone-cypionate', dose_mg: 150, frequency: 'eod', start_week: 13 },
    ],
  },
]

export function applyTemplate(template, allCompounds) {
  const compoundRows = template.compounds.map((t) => {
    const compound = allCompounds.find((c) => c.slug === t.slug)
    if (!compound) return null
    return {
      compound_id: compound.id,
      compound,
      dose_mg: t.dose_mg ?? compound.default_dose_mg,
      frequency: t.frequency ?? (compound.is_oral ? 'daily' : 'mwf'),
      custom_days: t.custom_days ?? [1, 3, 5],
      start_week: t.start_week ?? 1,
      end_week: t.end_week ?? null,
    }
  }).filter(Boolean)

  return {
    duration_wk: template.duration_wk,
    compounds: compoundRows.length ? compoundRows : [{ compound_id: '', compound: null, dose_mg: '', frequency: 'mwf', custom_days: [1, 3, 5], start_week: 1, end_week: null }],
  }
}