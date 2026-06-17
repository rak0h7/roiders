import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import PlanCard from '../components/cycles/PlanCard'
import { STACK_TEMPLATES } from '../lib/stack-templates'
import { activateCycle } from '../lib/cycle-mutations'

export default function CyclePlanner() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['cycle-plans', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cycles')
        .select('*, cycle_compounds(dose_mg, frequency, custom_days, compounds(name, color_hex))')
        .eq('user_id', user.id)
        .eq('status', 'planned')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const { data: activeCycle } = useQuery({
    queryKey: ['active-cycle'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cycles')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const activateMutation = useMutation({
    mutationFn: (cycleId) => activateCycle(supabase, user.id, cycleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle-plans'] })
      queryClient.invalidateQueries({ queryKey: ['active-cycle'] })
      navigate('/')
    },
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Cycle Planner</h1>
          <p className="text-sm text-text-secondary mt-1 max-w-xl">
            Design your stack and pin schedule. When you&apos;re ready, hit <strong className="text-text">Start</strong> — daily logging moves to the Dashboard.
          </p>
        </div>
        <Link to="/planner/new"><Button>+ Build stack</Button></Link>
      </div>

      {activeCycle && (
        <div className="bg-accent/10 border border-accent/30 rounded-md p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">
            <span className="text-accent font-medium">{activeCycle.name}</span> is running — log pins on the Dashboard.
          </p>
          <Link to="/"><Button variant="secondary" className="text-xs">Go to Dashboard</Button></Link>
        </div>
      )}

      <section>
        <h2 className="font-display text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Quick start templates</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STACK_TEMPLATES.filter((t) => t.id !== 'scratch').map((t) => (
            <Link
              key={t.id}
              to={`/planner/new?template=${t.id}`}
              className="bg-surface border border-border rounded-md p-3 hover:border-accent/40 transition-colors"
            >
              <p className="font-medium text-sm">{t.name}</p>
              <p className="text-xs text-text-muted mt-1">{t.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Draft plans</h2>
        {isLoading && <p className="text-text-secondary">Loading...</p>}
        {!isLoading && plans.length === 0 && (
          <div className="bg-surface border border-border rounded-md p-8 text-center">
            <p className="text-text-secondary mb-2">No drafts yet.</p>
            <p className="text-sm text-text-muted mb-4">Pick a template above or build from scratch.</p>
            <Link to="/planner/new"><Button>+ Build stack</Button></Link>
          </div>
        )}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((cycle) => (
            <PlanCard
              key={cycle.id}
              cycle={cycle}
              onActivate={(id) => activateMutation.mutate(id)}
              activating={activateMutation.isPending}
            />
          ))}
        </div>
      </section>
    </div>
  )
}