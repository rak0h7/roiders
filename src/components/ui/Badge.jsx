export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-surface border-border text-text-secondary',
    accent: 'bg-accent/10 border-accent/30 text-accent',
    danger: 'bg-danger/10 border-danger/30 text-danger',
    success: 'bg-success/10 border-success/30 text-success',
    warning: 'bg-warning/10 border-warning/30 text-warning',
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide border rounded-sm ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}