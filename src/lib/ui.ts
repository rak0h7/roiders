/** Central design tokens — driven by CSS variables from theme engine */
export const ui = {
  glass: "glass-panel rounded-[var(--radius-lg)]",
  glassAccent: "glass-panel rounded-[var(--radius-lg)] glow-accent",

  card: "glass-panel rounded-[var(--radius-lg)]",
  cardHover: "transition duration-300 hover:border-[var(--border-strong)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]",
  cardLabs: "glass-panel rounded-[var(--radius-lg)] border-[var(--labs)]/25 bg-[var(--labs-dim)]",
  cardProtocol: "glass-panel rounded-[var(--radius-lg)] border-[var(--protocol)]/25 bg-[var(--protocol-dim)]",
  cardIntel: "glass-panel rounded-[var(--radius-lg)] border-[var(--intel)]/25 bg-[var(--intel-dim)]",
  cardInner: "rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)]/80",
  cardPad: "p-[calc(1.25rem*var(--space-unit))] sm:p-[calc(1.5rem*var(--space-unit))]",

  pageTitle: "font-display text-2xl font-semibold tracking-tight text-[var(--foreground)]",
  pageSub: "mt-1.5 text-sm leading-relaxed text-[var(--muted)]",
  sectionTitle: "text-sm font-semibold text-[var(--foreground)]",
  sectionSub: "text-xs leading-relaxed text-[var(--muted)]",
  label: "block text-xs font-medium text-[var(--muted)]",
  overline: "text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]",

  input:
    "h-[var(--control-height)] w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)]/90 px-3.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-2)] backdrop-blur-sm focus:border-[var(--accent)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition",
  inputCompact:
    "h-[var(--control-height-sm)] w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)]/90 px-3 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-2)] backdrop-blur-sm focus:border-[var(--accent)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition",
  selectCompact:
    "h-[var(--control-height-xs)] w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-surface)] px-2 text-xs text-[var(--muted)] focus:border-[var(--labs)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--labs)]/15",

  btnPrimary:
    "btn-hover inline-flex h-[var(--control-height)] items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-semibold text-white shadow-[0_4px_20px_var(--labs-glow)] active:scale-[0.98] [background:var(--gradient-primary)]",
  btnProtocol:
    "btn-hover inline-flex h-[var(--control-height)] items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--protocol)] px-5 text-sm font-semibold text-[var(--bg-base)] shadow-[0_4px_16px_var(--protocol-glow)] active:scale-[0.98]",
  btnProtocolSm:
    "btn-hover inline-flex h-[var(--control-height-xs)] items-center justify-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--protocol)] px-4 text-xs font-bold uppercase text-[var(--bg-base)] shadow-[0_2px_12px_var(--protocol-glow)] active:scale-[0.98]",
  btnSecondary:
    "btn-hover inline-flex h-[var(--control-height)] items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-strong)] glass px-4 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--bg-hover)]",
  btnGhost:
    "inline-flex h-[var(--control-height-sm)] items-center justify-center gap-1.5 rounded-[var(--radius-sm)] px-3 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--foreground)]",
  btnToolbar:
    "btn-hover inline-flex h-[var(--control-height-xs)] items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] glass px-3 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--bg-hover)]",
  btnIcon:
    "btn-hover inline-flex h-[var(--control-height-icon)] w-[var(--control-height-icon)] shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)] p-0 text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]",
  btnIconSm:
    "btn-hover inline-flex h-[var(--control-height-xs)] w-[var(--control-height-xs)] shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-surface)] p-0 text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]",
  btnIconMicro:
    "inline-flex h-[var(--control-height-micro)] w-[var(--control-height-micro)] shrink-0 items-center justify-center rounded-[var(--radius-sm)] p-0 text-[var(--muted)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--foreground)]",

  pillActive:
    "btn-hover inline-flex h-[var(--control-height-sm)] items-center justify-center rounded-full px-4 text-xs font-semibold text-white shadow-[0_2px_12px_var(--labs-glow)] [background:var(--gradient-primary)]",
  pillInactive:
    "btn-hover inline-flex h-[var(--control-height-sm)] items-center justify-center rounded-full border border-[var(--border)] glass px-4 text-xs font-medium text-[var(--muted)] hover:border-[var(--accent)]/30 hover:text-[var(--foreground)]",
  pillProtocolActive:
    "inline-flex h-[var(--control-height-sm)] items-center justify-center rounded-full bg-[var(--protocol)] px-4 text-xs font-semibold text-[var(--bg-base)] shadow-[0_2px_12px_var(--protocol-glow)]",
  tabInactive:
    "inline-flex h-[var(--control-height-sm)] shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-xs font-semibold text-[var(--muted)] transition hover:text-[var(--foreground)]",

  segment:
    "btn-hover inline-flex h-[var(--control-height-xs)] items-center justify-center rounded-[var(--radius-sm)] border px-3 text-xs font-medium capitalize transition",
  segmentActiveLabs: "border-[var(--labs)]/40 bg-[var(--labs-dim)] text-[var(--labs)]",
  segmentActiveProtocol: "border-[var(--protocol)]/40 bg-[var(--protocol-dim)] text-[var(--protocol)]",
  segmentInactive: "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]",

  chip:
    "inline-flex h-[var(--control-height-xs)] items-center rounded-full border px-3 text-[11px] font-semibold uppercase",
  tag: "inline-flex h-6 items-center rounded-full px-2.5 text-[10px] font-medium",

  navItem:
    "group relative flex w-full min-h-[var(--control-height)] items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm transition",
  navBar:
    "flex flex-wrap items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-1.5",
  navBarBtn:
    "inline-flex h-[var(--control-height-xs)] items-center justify-center rounded-[var(--radius-sm)] px-3 text-xs font-medium transition",
  navBarBtnActive: "bg-[var(--labs-dim)] text-[var(--labs)]",
  navBarBtnInactive: "text-[var(--muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--foreground)]",

  toggle:
    "relative h-6 w-11 shrink-0 rounded-full transition",
  toggleKnob: "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",

  icon: "app-icon shrink-0",
  iconSm: "app-icon app-icon--sm shrink-0",
  spinner:
    "h-[var(--control-height-xs)] w-[var(--control-height-xs)] animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--labs)]",

  rowBetween: "flex items-center justify-between gap-3",

  statAccent: "text-[var(--accent)]",
  statLabs: "text-[var(--labs)]",
  statProtocol: "text-[var(--protocol)]",
  statIntel: "text-[var(--intel)]",
  statSuccess: "text-[var(--success)]",
  statWarning: "text-[var(--warning)]",
  statDanger: "text-[var(--danger)]",
};