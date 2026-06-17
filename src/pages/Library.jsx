import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Badge from '../components/ui/Badge'

const TYPES = ['all', 'base', '19nor', 'dht', 'oral', 'ai', 'sarm', 'peptide']

export default function Library() {
  const [filter, setFilter] = useState('all')

  const { data: compounds = [], isLoading } = useQuery({
    queryKey: ['compounds'],
    queryFn: async () => {
      const { data, error } = await supabase.from('compounds').select('*').order('name')
      if (error) throw error
      return data
    },
  })

  const filtered = filter === 'all' ? compounds : compounds.filter((c) => c.type === filter)

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Compound Library</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1 text-xs font-mono uppercase rounded-sm border transition-colors ${
              filter === t ? 'bg-accent/10 border-accent text-accent' : 'border-border text-text-secondary hover:text-text'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-text-secondary">Loading...</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((c) => (
          <Link
            key={c.id}
            to={`/library/${c.slug}`}
            className="bg-surface border border-border rounded-md p-4 hover:border-accent/40 transition-colors"
          >
            <div className="flex items-start gap-2 mb-2">
              <span className="w-3 h-3 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: c.color_hex }} />
              <h2 className="font-display font-semibold text-sm">{c.name}</h2>
            </div>
            <div className="flex gap-2 mb-2">
              <Badge>{c.type}</Badge>
              {c.is_oral && <Badge variant="warning">oral</Badge>}
            </div>
            <p className="text-xs font-mono text-text-secondary">HL: {c.half_life_label}</p>
            <p className="text-xs text-text-muted mt-1">Detection: {c.detection_time}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}