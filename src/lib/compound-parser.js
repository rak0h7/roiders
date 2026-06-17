import matter from 'gray-matter'

export function parseCompoundFile(content, filename = '') {
  const { data, content: body } = matter(content)
  const slug = data.slug || filename.replace(/\.md$/, '')

  return {
    name: data.name,
    slug,
    type: data.type,
    half_life_days: Number(data.half_life_days),
    half_life_label: data.half_life_label,
    detection_time: data.detection_time,
    color_hex: data.color_hex,
    default_dose_mg: Number(data.default_dose_mg),
    is_oral: Boolean(data.is_oral),
    notes: body.trim(),
  }
}