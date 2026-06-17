import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export default function PKChart({ curves = [], combined = [], height = 300 }) {
  if (!curves.length) {
    return (
      <div className="h-[200px] flex items-center justify-center text-text-muted text-sm border border-border rounded-md bg-surface">
        No PK data to display
      </div>
    )
  }

  const maxDay = Math.max(
    ...curves.flatMap((c) => c.curve.map((p) => p.day)),
    ...combined.map((p) => p.day),
    0
  )

  const data = Array.from({ length: maxDay + 1 }, (_, day) => {
    const point = { day }
    curves.forEach(({ compound, curve }) => {
      const match = curve.find((p) => p.day === day)
      point[compound.slug] = match?.level ?? null
    })
    const total = combined.find((p) => p.day === day)
    point.total = total?.level ?? null
    return point
  })

  return (
    <div className="bg-surface border border-border rounded-md p-4">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#1E2130" strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            stroke="#3D4560"
            tick={{ fill: '#8892A4', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            label={{ value: 'Days from cycle start', position: 'insideBottom', offset: -2, fill: '#8892A4', fontSize: 11 }}
          />
          <YAxis
            stroke="#3D4560"
            tick={{ fill: '#8892A4', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            label={{ value: 'Est. relative level', angle: -90, position: 'insideLeft', fill: '#8892A4', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ background: '#141418', border: '1px solid #1E2130', borderRadius: 4, fontSize: 12 }}
            labelStyle={{ color: '#8892A4', fontFamily: 'JetBrains Mono' }}
            formatter={(value) => [value, '']}
            labelFormatter={(day) => `Day ${day}`}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: '#8892A4' }} />
          {curves.map(({ compound }) => (
            <Area
              key={compound.slug}
              type="monotone"
              dataKey={compound.slug}
              name={compound.name}
              stroke={compound.color_hex}
              fill={compound.color_hex}
              fillOpacity={0.08}
              strokeWidth={2}
              dot={false}
            />
          ))}
          <Line type="monotone" dataKey="total" name="Combined" stroke="#F0F2F7" strokeWidth={2} strokeDasharray="4 4" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}