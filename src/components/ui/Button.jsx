export default function Button({
  children,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}) {
  const variants = {
    primary: 'bg-accent hover:bg-accent/90 text-white border-accent',
    secondary: 'bg-surface hover:bg-border/40 text-text border-border',
    danger: 'bg-danger/10 hover:bg-danger/20 text-danger border-danger/30',
    ghost: 'bg-transparent hover:bg-surface text-text-secondary border-transparent',
  }

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}