import { NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { getCurrentWeek } from '../../lib/cycle-utils'
import Badge from '../ui/Badge'

const navSections = [
  {
    title: 'Tracker',
    items: [
      { to: '/', label: 'Dashboard', end: true },
      { to: '/cycles', label: 'My Cycles' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { to: '/bloodwork', label: 'Bloodwork' },
      { to: '/health', label: 'Health Log' },
      { to: '/calculators', label: 'Calculators' },
    ],
  },
  {
    title: 'Library',
    items: [{ to: '/library', label: 'Compounds A–Z' }],
  },
  {
    title: 'Account',
    items: [{ to: '/profile', label: 'Profile' }],
  },
]

function NavItem({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block px-3 py-2 text-sm rounded-sm transition-colors ${
          isActive
            ? 'bg-accent/10 text-accent border-l-2 border-accent'
            : 'text-text-secondary hover:text-text hover:bg-surface'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export default function Sidebar({ onNavigate }) {
  const { user } = useAuth()

  const { data: activeCycle } = useQuery({
    queryKey: ['active-cycle'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  return (
    <aside className="w-60 shrink-0 bg-surface border-r border-border flex flex-col h-full min-h-screen">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center font-display font-bold text-sm text-white">
            RC
          </div>
          <span className="font-display font-semibold tracking-tight">ROIDERS.CLUB</span>
        </div>
      </div>

      {activeCycle && (
        <div className="mx-3 mt-3 p-3 bg-bg border border-border rounded-md">
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Active cycle</p>
          <p className="text-sm font-medium truncate">{activeCycle.name}</p>
          <Badge variant="accent" className="mt-2">Week {getCurrentWeek(activeCycle)}</Badge>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-1 text-[10px] uppercase tracking-widest text-text-muted">{section.title}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <div key={item.to} onClick={onNavigate}>
                  <NavItem {...item} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}