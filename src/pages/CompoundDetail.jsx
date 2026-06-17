import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

function renderMarkdown(notes) {
  if (!notes) return null
  return notes.split('\n\n').map((block, i) => {
    if (block.startsWith('## ')) {
      return <h2 key={i}>{block.replace('## ', '')}</h2>
    }
    if (block.startsWith('- ')) {
      const items = block.split('\n').filter((l) => l.startsWith('- '))
      return (
        <ul key={i}>
          {items.map((item, j) => <li key={j}>{item.replace('- ', '')}</li>)}
        </ul>
      )
    }
    return <p key={i}>{block}</p>
  })
}

export default function CompoundDetail() {
  const { slug } = useParams()

  const { data: compound, isLoading } = useQuery({
    queryKey: ['compound', slug],
    queryFn: async () => {
      const { data, error } = await supabase.from('compounds').select('*').eq('slug', slug).single()
      if (error) throw error
      return data
    },
    enabled: !!slug,
  })

  if (isLoading) return <p className="text-text-secondary">Loading...</p>
  if (!compound) return <p className="text-danger">Compound not found</p>

  const fields = [
    ['Type', compound.type],
    ['Half-life', compound.half_life_label],
    ['Half-life (days)', compound.half_life_days],
    ['Detection time', compound.detection_time],
    ['Default dose', `${compound.default_dose_mg} mg`],
    ['Oral', compound.is_oral ? 'Yes' : 'No'],
  ]

  return (
    <div className="max-w-3xl">
      <Link to="/library"><Button variant="ghost">← Library</Button></Link>

      <div className="flex items-center gap-3 mt-4 mb-6">
        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: compound.color_hex }} />
        <h1 className="font-display text-2xl font-bold">{compound.name}</h1>
        <Badge>{compound.type}</Badge>
      </div>

      <div className="bg-surface border border-border rounded-md overflow-hidden mb-6">
        <table className="w-full text-sm">
          <tbody>
            {fields.map(([label, value]) => (
              <tr key={label} className="border-b border-border/50">
                <td className="p-3 text-text-secondary w-40">{label}</td>
                <td className="p-3 font-mono">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="prose-compound">
        {renderMarkdown(compound.notes)}
      </div>
    </div>
  )
}