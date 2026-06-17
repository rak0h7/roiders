import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { calculatePKCurve } from '../lib/pk-engine'
import { weeklyDoseMg } from '../lib/pk-engine'
import { COMMON_MARKERS } from '../lib/cycle-utils'
import { differenceInDays } from 'date-fns'

const ESTER_WEIGHTS = {
  'Testosterone Enanthate': 0.72,
  'Testosterone Cypionate': 0.70,
  'Testosterone Propionate': 0.84,
  'Nandrolone Decanoate': 0.64,
  'Boldenone Undecylenate': 0.61,
}

export default function Calculators() {
  const [activeTab, setActiveTab] = useState('half-life')

  const { data: compounds = [] } = useQuery({
    queryKey: ['compounds'],
    queryFn: async () => {
      const { data, error } = await supabase.from('compounds').select('*').order('name')
      if (error) throw error
      return data
    },
  })

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Calculators</h1>

      <div className="flex gap-1 border-b border-border mb-6 flex-wrap">
        {[
          { id: 'half-life', label: 'Half-life decay' },
          { id: 'ester', label: 'Ester weight' },
          { id: 'weekly', label: 'Weekly dose' },
          { id: 'ref', label: 'Reference ranges' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${
              activeTab === t.id ? 'border-accent text-accent' : 'border-transparent text-text-secondary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'half-life' && <HalfLifeCalc compounds={compounds} />}
      {activeTab === 'ester' && <EsterCalc compounds={compounds} />}
      {activeTab === 'weekly' && <WeeklyDoseCalc />}
      {activeTab === 'ref' && <RefRangeLookup />}
    </div>
  )
}

function HalfLifeCalc({ compounds }) {
  const [compoundId, setCompoundId] = useState('')
  const [dose, setDose] = useState(250)
  const [lastInjection, setLastInjection] = useState(new Date().toISOString().slice(0, 10))

  const compound = compounds.find((c) => c.id === compoundId)
  const daysSince = lastInjection ? differenceInDays(new Date(), new Date(lastInjection)) : 0

  let level = null
  if (compound && daysSince >= 0) {
    const curve = calculatePKCurve(
      compound,
      { dose_mg: dose, frequency: 'daily', start_week: 1 },
      1
    )
    level = curve[daysSince]?.level ?? 0
  }

  return (
    <CalcCard title="Half-life decay calculator">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Compound">
          <select value={compoundId} onChange={(e) => setCompoundId(e.target.value)} className="calc-input">
            <option value="">Select...</option>
            {compounds.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Last dose (mg)">
          <input type="number" value={dose} onChange={(e) => setDose(Number(e.target.value))} className="calc-input font-mono" />
        </Field>
        <Field label="Last injection date">
          <input type="date" value={lastInjection} onChange={(e) => setLastInjection(e.target.value)} className="calc-input font-mono" />
        </Field>
      </div>
      {level !== null && (
        <p className="mt-4 font-mono text-accent text-lg">
          Est. relative level: {level} <span className="text-sm text-text-secondary">({daysSince} days since dose)</span>
        </p>
      )}
    </CalcCard>
  )
}

function EsterCalc({ compounds }) {
  const [compoundName, setCompoundName] = useState('')
  const [totalMg, setTotalMg] = useState(250)
  const factor = ESTER_WEIGHTS[compoundName] ?? 0.7
  const hormoneMg = Math.round(totalMg * factor * 10) / 10

  return (
    <CalcCard title="Ester weight calculator">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Compound">
          <select value={compoundName} onChange={(e) => setCompoundName(e.target.value)} className="calc-input">
            <option value="">Select...</option>
            {Object.keys(ESTER_WEIGHTS).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>
        <Field label="Total compound weight (mg)">
          <input type="number" value={totalMg} onChange={(e) => setTotalMg(Number(e.target.value))} className="calc-input font-mono" />
        </Field>
      </div>
      {compoundName && (
        <p className="mt-4 font-mono text-accent text-lg">
          Active hormone: ~{hormoneMg} mg <span className="text-sm text-text-secondary">({Math.round(factor * 100)}% of ester weight)</span>
        </p>
      )}
    </CalcCard>
  )
}

function WeeklyDoseCalc() {
  const [dose, setDose] = useState(250)
  const [frequency, setFrequency] = useState('mwf')
  const weekly = weeklyDoseMg(dose, frequency)

  return (
    <CalcCard title="Weekly dose calculator">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Dose per injection (mg)">
          <input type="number" value={dose} onChange={(e) => setDose(Number(e.target.value))} className="calc-input font-mono" />
        </Field>
        <Field label="Frequency">
          <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="calc-input">
            <option value="daily">Daily</option>
            <option value="eod">EOD</option>
            <option value="mwf">MWF</option>
          </select>
        </Field>
      </div>
      <p className="mt-4 font-mono text-accent text-lg">Weekly total: {weekly} mg</p>
    </CalcCard>
  )
}

function RefRangeLookup() {
  const [marker, setMarker] = useState('')
  const selected = COMMON_MARKERS.find((m) => m.marker === marker)

  return (
    <CalcCard title="Bloodwork reference range lookup">
      <Field label="Marker">
        <select value={marker} onChange={(e) => setMarker(e.target.value)} className="calc-input">
          <option value="">Select...</option>
          {COMMON_MARKERS.map((m) => <option key={m.marker} value={m.marker}>{m.marker}</option>)}
        </select>
      </Field>
      {selected && (
        <p className="mt-4 font-mono">
          Male reference: <span className="text-accent">{selected.ref_low} – {selected.ref_high} {selected.unit}</span>
        </p>
      )}
    </CalcCard>
  )
}

function CalcCard({ title, children }) {
  return (
    <div className="bg-surface border border-border rounded-md p-4 max-w-xl">
      <h2 className="font-display font-semibold mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-text-secondary">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  )
}