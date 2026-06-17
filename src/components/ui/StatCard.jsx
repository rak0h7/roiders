export default function StatCard({ label, value, unit, accent }) {
  return (
    <div className="bg-surface border border-border rounded-md p-4">
      <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">{label}</p>
      <p className={`font-mono text-2xl font-semibold ${accent ? 'text-accent' : 'text-text'}`}>
        {value}
        {unit && <span className="text-sm text-text-secondary ml-1">{unit}</span>}
      </p>
    </div>
  )
}