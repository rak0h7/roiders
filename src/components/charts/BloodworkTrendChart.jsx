import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { format } from 'date-fns'

export default function BloodworkTrendChart({ data = [], refLow, refHigh, markerName }) {
  if (!data.length) {
    return (
      <div className="h-[240px] flex items-center justify-center text-text-muted text-sm border border-border rounded-md bg-surface">
        Select a marker with multiple readings to see trends
      </div>
    )
  }

  const chartData = data.map((d) => ({
    date: format(new Date(d.drawn_at), 'dd MMM yy'),
    value: d.value,
  }))

  return (
    <div className="bg-surface border border-border rounded-md p-4">
      <p className="text-sm font-display font-medium mb-3">{markerName}</p>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={chartData}>
          <CartesianGrid stroke="#1E2130" strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#3D4560" tick={{ fill: '#8892A4', fontSize: 11 }} />
          <YAxis stroke="#3D4560" tick={{ fill: '#8892A4', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
          {refLow != null && refHigh != null && (
            <ReferenceArea y1={refLow} y2={refHigh} fill="#22C55E" fillOpacity={0.08} />
          )}
          <Tooltip
            contentStyle={{ background: '#141418', border: '1px solid #1E2130', borderRadius: 4 }}
            formatter={(value) => [value, markerName]}
          />
          <Line type="monotone" dataKey="value" stroke="#2563FF" strokeWidth={2} dot={{ fill: '#2563FF', r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
      {refLow != null && refHigh != null && (
        <p className="text-xs text-text-muted mt-2 font-mono">
          Reference: {refLow} – {refHigh}
        </p>
      )}
    </div>
  )
}