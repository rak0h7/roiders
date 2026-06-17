import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const compoundsDir = path.join(__dirname, '..', 'compounds')

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Set VITE_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

function parseCompoundFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)
  const slug = data.slug || path.basename(filePath, '.md')

  return {
    name: data.name,
    slug,
    type: data.type,
    half_life_days: data.half_life_days,
    half_life_label: data.half_life_label,
    detection_time: data.detection_time,
    color_hex: data.color_hex,
    default_dose_mg: data.default_dose_mg,
    is_oral: data.is_oral ?? false,
    notes: content.trim(),
  }
}

async function seed() {
  const files = fs.readdirSync(compoundsDir).filter((f) => f.endsWith('.md'))
  const compounds = files.map((f) => parseCompoundFile(path.join(compoundsDir, f)))

  console.log(`Seeding ${compounds.length} compounds...`)

  const { data, error } = await supabase
    .from('compounds')
    .upsert(compounds, { onConflict: 'slug' })
    .select()

  if (error) {
    console.error('Seed failed:', error.message)
    process.exit(1)
  }

  console.log(`Done. Upserted ${data.length} compounds.`)
}

seed()